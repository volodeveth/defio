import { getAddresses } from '@/constants/addresses';
import { PERMIT2_ABI, ERC20_ABI } from '@/constants/abis';
import { encodeAbiParameters, parseAbiParameters, keccak256, toHex } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { useState, useCallback } from 'react';

export interface PermitSingle {
  details: {
    token: string;
    amount: bigint;
    expiration: number;
    nonce: number;
  };
  spender: string;
  sigDeadline: number;
}

export interface PermitSignature {
  permitSingle: PermitSingle;
  signature: string;
}

// EIP-712 domain for Permit2
const PERMIT2_DOMAIN = {
  name: 'Permit2',
  chainId: 8453, // Base
  verifyingContract: getAddresses().PERMIT2 as `0x${string}`,
} as const;

// EIP-712 types for AllowanceTransfer
const PERMIT_TRANSFER_FROM_TYPES = {
  PermitTransferFrom: [
    { name: 'permitted', type: 'TokenPermissions' },
    { name: 'spender', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
  TokenPermissions: [
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint256' },
  ],
} as const;

export function usePermit2() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const addresses = getAddresses();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if token has allowance for Permit2
  const checkPermit2Allowance = useCallback(async (
    token: string,
    owner: string,
    amount: bigint
  ): Promise<{ hasAllowance: boolean; currentAllowance: bigint }> => {
    if (!publicClient) throw new Error('Public client not available');
    
    try {
      const allowance = await publicClient.readContract({
        address: token as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [owner as `0x${string}`, addresses.PERMIT2 as `0x${string}`]
      });

      return {
        hasAllowance: allowance >= amount,
        currentAllowance: allowance
      };
    } catch (err) {
      console.error('Failed to check Permit2 allowance:', err);
      return { hasAllowance: false, currentAllowance: 0n };
    }
  }, [publicClient, addresses.PERMIT2]);

  // Get nonce for Permit2
  const getPermit2Nonce = useCallback(async (
    token: string,
    owner: string
  ): Promise<number> => {
    if (!publicClient) throw new Error('Public client not available');

    try {
      const result = await publicClient.readContract({
        address: addresses.PERMIT2 as `0x${string}`,
        abi: PERMIT2_ABI,
        functionName: 'allowance',
        args: [
          owner as `0x${string}`,
          token as `0x${string}`,
          addresses.UNIVERSAL_ROUTER as `0x${string}`
        ]
      });

      return Number(result[2]); // nonce is the third element
    } catch (err) {
      console.error('Failed to get Permit2 nonce:', err);
      return 0;
    }
  }, [publicClient, addresses]);

  // Create a SignatureTransfer permit
  const createSignatureTransferPermit = useCallback(async (
    token: string,
    amount: bigint,
    spender: string,
    deadline: number = Math.floor(Date.now() / 1000) + 3600 // 1 hour
  ): Promise<PermitSignature> => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get nonce from Permit2 contract
      const nonce = await getPermit2Nonce(token, address);

      const permitSingle: PermitSingle = {
        details: {
          token,
          amount,
          expiration: deadline,
          nonce
        },
        spender,
        sigDeadline: deadline
      };

      // Create the message to sign
      const message = {
        permitted: {
          token: token as `0x${string}`,
          amount: amount
        },
        spender: spender as `0x${string}`,
        nonce: BigInt(nonce),
        deadline: BigInt(deadline)
      };

      // Sign the permit
      const signature = await walletClient.signTypedData({
        domain: PERMIT2_DOMAIN,
        types: PERMIT_TRANSFER_FROM_TYPES,
        primaryType: 'PermitTransferFrom',
        message
      });

      return {
        permitSingle,
        signature
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create permit';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, address, getPermit2Nonce]);

  // Approve token for Permit2 (fallback if user prefers traditional approval)
  const approveTokenForPermit2 = useCallback(async (
    token: string,
    amount: bigint = 2n ** 256n - 1n // Max allowance
  ) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const hash = await walletClient.writeContract({
        address: token as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [addresses.PERMIT2 as `0x${string}`, amount]
      });

      // Wait for transaction confirmation
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      return hash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Approval failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, address, publicClient, addresses.PERMIT2]);

  // Check if Permit2 setup is required for a token
  const requiresPermit2Setup = useCallback(async (
    token: string,
    amount: bigint
  ): Promise<{
    requiresSetup: boolean;
    requiresApproval: boolean;
    currentAllowance: bigint;
  }> => {
    if (!address) {
      return {
        requiresSetup: true,
        requiresApproval: true,
        currentAllowance: 0n
      };
    }

    const { hasAllowance, currentAllowance } = await checkPermit2Allowance(
      token,
      address,
      amount
    );

    return {
      requiresSetup: !hasAllowance,
      requiresApproval: !hasAllowance,
      currentAllowance
    };
  }, [address, checkPermit2Allowance]);

  // Get the permit message for user to review
  const getPermitPreview = useCallback((
    token: string,
    amount: bigint,
    spender: string,
    deadline: number
  ) => {
    return {
      token,
      amount: amount.toString(),
      spender,
      deadline: new Date(deadline * 1000).toISOString(),
      domain: PERMIT2_DOMAIN.verifyingContract
    };
  }, []);

  return {
    isLoading,
    error,
    checkPermit2Allowance,
    getPermit2Nonce,
    createSignatureTransferPermit,
    approveTokenForPermit2,
    requiresPermit2Setup,
    getPermitPreview
  };
}

// Utility functions
export function encodePermitTransfer(permit: PermitSignature): {
  permitSingle: any;
  signature: string;
} {
  return {
    permitSingle: [
      permit.permitSingle.details.token,
      permit.permitSingle.details.amount,
      permit.permitSingle.details.expiration,
      permit.permitSingle.details.nonce
    ],
    signature: permit.signature
  };
}

export function calculatePermitHash(permit: PermitSingle): string {
  const encoded = encodeAbiParameters(
    parseAbiParameters('address,uint256,uint256,uint256,address,uint256'),
    [
      permit.details.token as `0x${string}`,
      permit.details.amount,
      BigInt(permit.details.expiration),
      BigInt(permit.details.nonce),
      permit.spender as `0x${string}`,
      BigInt(permit.sigDeadline)
    ]
  );
  
  return keccak256(encoded);
}

// Constants for permit management
export const PERMIT_EXPIRY = {
  HOUR: 3600,
  DAY: 86400,
  WEEK: 604800,
  MONTH: 2592000
} as const;

export const MAX_UINT256 = 2n ** 256n - 1n;