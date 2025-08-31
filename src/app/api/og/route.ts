import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'swap';
  const buttonIndex = searchParams.get('buttonIndex') || '1';

  // Generate SVG image for the frame
  const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0A0B0D"/>
      <stop offset="100%" stop-color="#111318"/>
    </linearGradient>
    <linearGradient id="brand" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#41E3FF"/>
      <stop offset="100%" stop-color="#9B87F5"/>
    </linearGradient>
    <linearGradient id="card" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(17,19,24,0.8)"/>
      <stop offset="100%" stop-color="rgba(31,36,48,0.6)"/>
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  
  <!-- Subtle grid pattern -->
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(65,227,255,0.1)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#grid)" opacity="0.5"/>
  
  <!-- Glow effects -->
  <circle cx="200" cy="150" r="100" fill="url(#brand)" opacity="0.1" filter="blur(40px)"/>
  <circle cx="1000" cy="480" r="120" fill="url(#brand)" opacity="0.08" filter="blur(50px)"/>
  
  <!-- Logo -->
  <rect x="80" y="80" width="100" height="100" rx="24" fill="url(#brand)" filter="drop-shadow(0 0 20px rgba(65,227,255,0.4))"/>
  <text x="130" y="145" text-anchor="middle" fill="white" font-family="system-ui" font-size="48" font-weight="bold">D</text>
  
  <!-- Pulse dot -->
  <circle cx="165" cy="95" r="8" fill="#41E3FF">
    <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
  </circle>
  
  <!-- Title -->
  <text x="220" y="125" fill="url(#brand)" font-family="system-ui" font-size="48" font-weight="bold">Defio</text>
  <text x="220" y="160" fill="#A9B0BF" font-family="system-ui" font-size="24">One-tap DeFi on Base</text>
  
  <!-- Main Card -->
  <rect x="80" y="220" width="520" height="280" rx="24" fill="url(#card)" stroke="rgba(65,227,255,0.2)" stroke-width="1" filter="drop-shadow(0 8px 32px rgba(0,0,0,0.3))"/>
  
  <!-- Swap Interface Mock -->
  <text x="120" y="260" fill="#EDEFF3" font-family="system-ui" font-size="20" font-weight="600">Swap</text>
  <rect x="360" y="240" width="120" height="24" rx="12" fill="rgba(65,227,255,0.2)" stroke="rgba(65,227,255,0.3)" stroke-width="1"/>
  <text x="420" y="256" text-anchor="middle" fill="#41E3FF" font-family="system-ui" font-size="12" font-weight="600">Best Route</text>
  
  <!-- From Token -->
  <rect x="120" y="300" width="200" height="60" rx="16" fill="rgba(17,19,24,0.8)" stroke="rgba(31,36,48,1)" stroke-width="1"/>
  <circle cx="145" cy="330" r="16" fill="url(#brand)"/>
  <text x="155" y="336" text-anchor="middle" fill="white" font-family="system-ui" font-size="12" font-weight="bold">U</text>
  <text x="175" y="325" fill="#EDEFF3" font-family="system-ui" font-size="16" font-weight="600">USDC</text>
  <text x="175" y="340" fill="#A9B0BF" font-family="system-ui" font-size="12">USD Coin</text>
  <text x="300" y="335" text-anchor="end" fill="#EDEFF3" font-family="system-ui" font-size="18" font-weight="600">250.00</text>
  
  <!-- Swap Arrow -->
  <circle cx="420" cy="330" r="20" fill="rgba(17,19,24,0.9)" stroke="rgba(31,36,48,1)" stroke-width="1"/>
  <path d="M415 325 L425 330 L415 335 M410 330 L425 330" stroke="#A9B0BF" stroke-width="2" fill="none"/>
  
  <!-- To Token -->
  <rect x="120" y="380" width="200" height="60" rx="16" fill="rgba(17,19,24,0.8)" stroke="rgba(31,36,48,1)" stroke-width="1"/>
  <circle cx="145" cy="410" r="16" fill="url(#brand)"/>
  <text x="155" y="416" text-anchor="middle" fill="white" font-family="system-ui" font-size="12" font-weight="bold">E</text>
  <text x="175" y="405" fill="#EDEFF3" font-family="system-ui" font-size="16" font-weight="600">WETH</text>
  <text x="175" y="420" fill="#A9B0BF" font-family="system-ui" font-size="12">Wrapped Ether</text>
  <text x="300" y="415" text-anchor="end" fill="#EDEFF3" font-family="system-ui" font-size="18" font-weight="600">0.082900</text>
  
  <!-- Quote Details -->
  <rect x="340" y="300" width="240" height="140" rx="16" fill="rgba(17,19,24,0.6)" stroke="rgba(31,36,48,0.8)" stroke-width="1"/>
  <text x="360" y="325" fill="#A9B0BF" font-family="system-ui" font-size="14">Price</text>
  <text x="560" y="325" text-anchor="end" fill="#EDEFF3" font-family="system-ui" font-size="14">3000.00 USDC/ETH</text>
  
  <text x="360" y="350" fill="#A9B0BF" font-family="system-ui" font-size="14">Route</text>
  <text x="560" y="350" text-anchor="end" fill="#EDEFF3" font-family="system-ui" font-size="14">Aerodrome</text>
  
  <text x="360" y="375" fill="#A9B0BF" font-family="system-ui" font-size="14">Platform fee</text>
  <text x="560" y="375" text-anchor="end" fill="#EDEFF3" font-family="system-ui" font-size="14">$0.20</text>
  
  <text x="360" y="400" fill="#A9B0BF" font-family="system-ui" font-size="14">Min. received</text>
  <text x="560" y="400" text-anchor="end" fill="#EDEFF3" font-family="system-ui" font-size="14">0.082900 WETH</text>
  
  <!-- Stats Panel -->
  <rect x="650" y="220" width="460" height="280" rx="24" fill="url(#card)" stroke="rgba(155,135,245,0.2)" stroke-width="1" filter="drop-shadow(0 8px 32px rgba(0,0,0,0.3))"/>
  
  <text x="680" y="260" fill="#EDEFF3" font-family="system-ui" font-size="20" font-weight="600">Portfolio Overview</text>
  
  <!-- Portfolio Balance -->
  <text x="680" y="300" fill="#EDEFF3" font-family="system-ui" font-size="32" font-weight="bold">$3,735.30</text>
  <text x="680" y="325" fill="#22E6A6" font-family="system-ui" font-size="16">+$125.45 (+3.48%) 24h</text>
  
  <!-- Asset breakdown -->
  <rect x="680" y="350" width="200" height="60" rx="12" fill="rgba(65,227,255,0.1)" stroke="rgba(65,227,255,0.2)" stroke-width="1"/>
  <text x="700" y="370" fill="#EDEFF3" font-family="system-ui" font-size="14" font-weight="600">$1,245.10</text>
  <text x="700" y="385" fill="#A9B0BF" font-family="system-ui" font-size="12">USDC Balance</text>
  
  <rect x="900" y="350" width="200" height="60" rx="12" fill="rgba(155,135,245,0.1)" stroke="rgba(155,135,245,0.2)" stroke-width="1"/>
  <text x="920" y="370" fill="#EDEFF3" font-family="system-ui" font-size="14" font-weight="600">$2,490.20</text>
  <text x="920" y="385" fill="#A9B0BF" font-family="system-ui" font-size="12">WETH Balance</text>
  
  <!-- Alerts -->
  <rect x="680" y="430" width="420" height="50" rx="12" fill="rgba(255,176,32,0.1)" stroke="rgba(255,176,32,0.2)" stroke-width="1"/>
  <circle cx="700" cy="455" r="6" fill="#FFB020"/>
  <text x="720" y="460" fill="#EDEFF3" font-family="system-ui" font-size="14">Health factor dropped to 1.28 on Aave</text>
  
  <!-- Bottom CTA -->
  <text x="600" y="580" text-anchor="middle" fill="#A9B0BF" font-family="system-ui" font-size="18">Interact with the frame buttons below to get started</text>
</svg>
  `.trim();

  // Return SVG as image
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
}