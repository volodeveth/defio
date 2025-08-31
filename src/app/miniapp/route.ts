import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const host = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const { searchParams } = new URL(req.url);
  
  // Handle frame interactions
  const buttonIndex = searchParams.get('buttonIndex');
  const action = searchParams.get('action') || 'swap';

  // Generate OG image URL
  const imageUrl = `${host}/api/og?action=${action}&buttonIndex=${buttonIndex}`;

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Defio - One-tap DeFi on Base</title>
    
    <!-- Farcaster Frame Meta Tags -->
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${imageUrl}" />
    <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
    
    <!-- Frame Buttons -->
    <meta property="fc:frame:button:1" content="💱 Get Quote" />
    <meta property="fc:frame:button:1:action" content="post" />
    <meta property="fc:frame:button:1:target" content="${host}/api/frame/quote" />
    
    <meta property="fc:frame:button:2" content="🔄 Swap Now" />
    <meta property="fc:frame:button:2:action" content="post" />
    <meta property="fc:frame:button:2:target" content="${host}/api/frame/swap" />
    
    <meta property="fc:frame:button:3" content="📊 Portfolio" />
    <meta property="fc:frame:button:3:action" content="post" />
    <meta property="fc:frame:button:3:target" content="${host}/api/frame/portfolio" />
    
    <meta property="fc:frame:button:4" content="🚀 Open App" />
    <meta property="fc:frame:button:4:action" content="link" />
    <meta property="fc:frame:button:4:target" content="${host}" />
    
    <!-- Post URL -->
    <meta property="fc:frame:post_url" content="${host}/api/frame/action" />
    
    <!-- Open Graph -->
    <meta property="og:title" content="Defio - One-tap DeFi on Base" />
    <meta property="og:description" content="Swap tokens, earn yield, and manage your portfolio directly from your social feed" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:url" content="${host}/miniapp" />
    <meta property="og:type" content="website" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Defio - One-tap DeFi on Base" />
    <meta name="twitter:description" content="Swap tokens, earn yield, and manage your portfolio directly from your social feed" />
    <meta name="twitter:image" content="${imageUrl}" />
    
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, #0A0B0D 0%, #111318 100%);
        color: #EDEFF3;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .container {
        max-width: 480px;
        margin: 0 auto;
        padding: 2rem;
        text-align: center;
      }
      
      .logo {
        width: 80px;
        height: 80px;
        border-radius: 20px;
        background: linear-gradient(135deg, #41E3FF 0%, #9B87F5 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        font-weight: bold;
        color: white;
        margin: 0 auto 1.5rem;
        box-shadow: 0 0 20px rgba(65, 227, 255, 0.3);
        position: relative;
      }
      
      .pulse-dot {
        position: absolute;
        top: -4px;
        right: -4px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #41E3FF;
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.1); }
        100% { opacity: 1; transform: scale(1); }
      }
      
      .title {
        font-size: 2rem;
        font-weight: bold;
        background: linear-gradient(135deg, #41E3FF 0%, #9B87F5 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.5rem;
      }
      
      .subtitle {
        font-size: 1rem;
        color: #A9B0BF;
        margin-bottom: 2rem;
      }
      
      .feature {
        background: rgba(17, 19, 24, 0.6);
        border: 1px solid rgba(31, 36, 48, 0.8);
        border-radius: 16px;
        padding: 1rem;
        margin-bottom: 1rem;
        backdrop-filter: blur(12px);
      }
      
      .feature-title {
        font-weight: 600;
        color: #EDEFF3;
        margin-bottom: 0.5rem;
      }
      
      .feature-desc {
        font-size: 0.875rem;
        color: #A9B0BF;
      }
      
      .cta {
        background: linear-gradient(135deg, #41E3FF 0%, #9B87F5 100%);
        color: white;
        padding: 1rem 2rem;
        border-radius: 12px;
        text-decoration: none;
        font-weight: 600;
        display: inline-block;
        margin-top: 1rem;
        transition: transform 0.2s;
      }
      
      .cta:hover {
        transform: translateY(-2px);
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">
        D
        <div class="pulse-dot"></div>
      </div>
      
      <h1 class="title">Defio</h1>
      <p class="subtitle">One-tap DeFi on Base</p>
      
      <div class="feature">
        <div class="feature-title">💱 Smart Swaps</div>
        <div class="feature-desc">Best rates across Aerodrome, Uniswap & more</div>
      </div>
      
      <div class="feature">
        <div class="feature-title">📊 Portfolio Tracking</div>
        <div class="feature-desc">Real-time balance & yield monitoring</div>
      </div>
      
      <div class="feature">
        <div class="feature-title">🔔 Smart Alerts</div>
        <div class="feature-desc">Health factor & opportunity notifications</div>
      </div>
      
      <div class="feature">
        <div class="feature-title">🤝 Social Trading</div>
        <div class="feature-desc">Copy successful trades from your feed</div>
      </div>
      
      <a href="${host}" class="cta">
        Open Defio App
      </a>
    </div>
  </body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { untrustedData } = body;
    
    // Handle frame button interactions
    const buttonIndex = untrustedData?.buttonIndex;
    const host = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    switch (buttonIndex) {
      case 1: // Get Quote
        return NextResponse.redirect(`${host}/api/frame/quote`);
      case 2: // Swap Now  
        return NextResponse.redirect(`${host}/api/frame/swap`);
      case 3: // Portfolio
        return NextResponse.redirect(`${host}/api/frame/portfolio`);
      case 4: // Open App
        return NextResponse.redirect(host);
      default:
        return NextResponse.redirect(host);
    }
  } catch (error) {
    console.error('Frame POST error:', error);
    return NextResponse.redirect(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
  }
}