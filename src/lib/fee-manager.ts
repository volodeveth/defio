import { FEE_CONFIG } from '@/constants/addresses';
import { parseUnits, formatUnits } from 'viem';

export interface FeeStructure {
  platformFeeBps: number;
  referralFeeBps?: number;
  totalFeeBps: number;
  feeRecipient: string;
  referralRecipient?: string;
}

export interface FeeCalculation {
  originalAmount: bigint;
  platformFee: bigint;
  referralFee: bigint;
  totalFee: bigint;
  netAmount: bigint;
  feeUSD: number;
}

export class FeeManager {
  private platformFee: number = FEE_CONFIG.PLATFORM_FEE_BPS;
  private feeRecipient: string = FEE_CONFIG.FEE_RECIPIENT || '';
  
  // Set platform fee recipient (should be set during app initialization)
  setFeeRecipient(recipient: string): void {
    this.feeRecipient = recipient;
  }

  // Calculate fee breakdown for a swap
  calculateFees(
    amountIn: string,
    decimals: number = 18,
    tokenPriceUSD: number = 1,
    referralCode?: string
  ): FeeCalculation {
    const amount = parseUnits(amountIn, decimals);
    
    // Platform fee calculation
    const platformFee = (amount * BigInt(this.platformFee)) / 10000n;
    
    // Referral fee (if applicable) - 20% of platform fee goes to referrer
    const referralFee = referralCode ? (platformFee * 20n) / 100n : 0n;
    const actualPlatformFee = platformFee - referralFee;
    
    const totalFee = platformFee;
    const netAmount = amount - totalFee;
    
    // Convert to USD for display
    const feeUSD = parseFloat(formatUnits(totalFee, decimals)) * tokenPriceUSD;
    
    return {
      originalAmount: amount,
      platformFee: actualPlatformFee,
      referralFee,
      totalFee,
      netAmount,
      feeUSD
    };
  }

  // Get fee structure for a given referral code
  getFeeStructure(referralCode?: string): FeeStructure {
    const referralFeeBps = referralCode ? Math.floor(this.platformFee * 0.2) : 0;
    const platformFeeBps = this.platformFee - referralFeeBps;
    
    return {
      platformFeeBps,
      referralFeeBps,
      totalFeeBps: this.platformFee,
      feeRecipient: this.feeRecipient,
      referralRecipient: referralCode ? this.getReferralRecipient(referralCode) : undefined
    };
  }

  // Check if fee is economically viable
  isViableFee(feeUSD: number): boolean {
    return feeUSD >= FEE_CONFIG.MIN_FEE_USD;
  }

  // Get minimum swap amount to make fees viable
  getMinimumViableAmount(tokenPriceUSD: number, decimals: number = 18): string {
    const minFeeUSD = FEE_CONFIG.MIN_FEE_USD;
    const minAmountUSD = minFeeUSD / (this.platformFee / 10000);
    const minAmountTokens = minAmountUSD / tokenPriceUSD;
    
    // Add some buffer (10%) to account for price fluctuations
    const bufferedAmount = minAmountTokens * 1.1;
    
    return bufferedAmount.toFixed(decimals <= 6 ? 2 : 6);
  }

  // Apply discount for special conditions
  applyDiscount(
    feeStructure: FeeStructure,
    condition: 'vip' | 'high_volume' | 'first_time'
  ): FeeStructure {
    let discountMultiplier = 1;
    
    switch (condition) {
      case 'vip':
        discountMultiplier = 0; // Free for VIP users
        break;
      case 'high_volume':
        discountMultiplier = 0.5; // 50% discount for high volume
        break;
      case 'first_time':
        discountMultiplier = 0.5; // 50% discount for first-time users
        break;
    }
    
    return {
      ...feeStructure,
      platformFeeBps: Math.floor(feeStructure.platformFeeBps * discountMultiplier),
      totalFeeBps: Math.floor(feeStructure.totalFeeBps * discountMultiplier)
    };
  }

  // Generate fee summary for UI display
  getFeeSummary(calculation: FeeCalculation, tokenSymbol: string): {
    display: string;
    breakdown: string[];
    total: string;
  } {
    const feePercent = (this.platformFee / 100).toFixed(2);
    
    return {
      display: `${feePercent}% Platform Fee`,
      breakdown: [
        `Platform Fee: ${feePercent}%`,
        `Fee Amount: ${formatUnits(calculation.totalFee, 18)} ${tokenSymbol}`,
        `Fee Value: $${calculation.feeUSD.toFixed(2)}`
      ],
      total: `$${calculation.feeUSD.toFixed(2)}`
    };
  }

  // Get referral recipient address (this would typically query a database)
  private getReferralRecipient(referralCode: string): string {
    // In a real implementation, this would look up the referral code
    // and return the associated wallet address
    // For now, return a placeholder
    return '0x0000000000000000000000000000000000000000';
  }

  // Validate fee parameters
  validateFeeStructure(feeStructure: FeeStructure): boolean {
    const { totalFeeBps, feeRecipient } = feeStructure;
    
    // Fee should be reasonable (max 1%)
    if (totalFeeBps > 100) return false;
    
    // Fee recipient should be valid
    if (!feeRecipient || feeRecipient === '0x0000000000000000000000000000000000000000') {
      return false;
    }
    
    return true;
  }

  // Get current platform fee in basis points
  getPlatformFeeBps(): number {
    return this.platformFee;
  }

  // Update platform fee (admin only)
  setPlatformFeeBps(newFeeBps: number): void {
    if (newFeeBps < 0 || newFeeBps > 100) {
      throw new Error('Platform fee must be between 0 and 100 basis points (1%)');
    }
    this.platformFee = newFeeBps;
  }
}

// Singleton instance
export const feeManager = new FeeManager();

// Hook for using fee manager in React components
export function useFeeCalculation(
  amountIn: string,
  tokenPriceUSD: number,
  decimals: number = 18,
  referralCode?: string
) {
  if (!amountIn || parseFloat(amountIn) === 0) {
    return null;
  }

  return feeManager.calculateFees(amountIn, decimals, tokenPriceUSD, referralCode);
}

// Utility functions for fee display
export function formatFeeDisplay(feeBps: number): string {
  return `${(feeBps / 100).toFixed(2)}%`;
}

export function isHighImpactFee(feeUSD: number, swapAmountUSD: number): boolean {
  return feeUSD > swapAmountUSD * 0.01; // More than 1% of swap amount
}

// Revenue tracking (would integrate with analytics)
export interface RevenueMetrics {
  totalFees: number;
  platformFees: number;
  referralFees: number;
  transactionCount: number;
  averageFeePerTransaction: number;
}

export function trackFeeCollection(
  feeCalculation: FeeCalculation,
  tokenSymbol: string
): void {
  // In a real implementation, this would send data to analytics
  console.log('Fee collected:', {
    amount: formatUnits(feeCalculation.totalFee, 18),
    token: tokenSymbol,
    usdValue: feeCalculation.feeUSD,
    timestamp: Date.now()
  });
}