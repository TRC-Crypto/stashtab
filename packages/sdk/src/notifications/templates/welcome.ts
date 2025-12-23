/**
 * Welcome Email Template
 *
 * Sent when a new user signs up for Stashtab.
 */

export interface WelcomeEmailData {
  userName?: string;
  safeAddress: string;
  appUrl: string;
}

export function welcomeEmailHtml(data: WelcomeEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Stashtab</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .card {
      background: #ffffff;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    .logo {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo-badge {
      display: inline-block;
      width: 48px;
      height: 48px;
      background: #00d974;
      border-radius: 12px;
      line-height: 48px;
      font-size: 24px;
      font-weight: bold;
      color: #000;
    }
    h1 {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 16px;
      text-align: center;
    }
    p {
      margin: 0 0 16px;
      color: #4a4a4a;
    }
    .address-box {
      background: #f8f8f8;
      border-radius: 8px;
      padding: 16px;
      font-family: monospace;
      font-size: 14px;
      word-break: break-all;
      margin: 24px 0;
    }
    .cta {
      display: block;
      width: 100%;
      padding: 16px 24px;
      background: #00d974;
      color: #000;
      text-decoration: none;
      font-weight: 600;
      text-align: center;
      border-radius: 8px;
      margin: 24px 0;
    }
    .footer {
      text-align: center;
      margin-top: 32px;
      font-size: 12px;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <span class="logo-badge">S</span>
      </div>
      
      <h1>Welcome to Stashtab${data.userName ? `, ${data.userName}` : ""}!</h1>
      
      <p>
        Your account is ready. You now have a secure smart wallet that earns yield automatically.
      </p>
      
      <p><strong>Your deposit address:</strong></p>
      <div class="address-box">
        ${data.safeAddress}
      </div>
      
      <p>
        Send USDC to this address and it will automatically start earning yield through Aave.
      </p>
      
      <a href="${data.appUrl}/dashboard" class="cta">
        Go to Dashboard
      </a>
      
      <p style="font-size: 14px; color: #666;">
        <strong>Getting started:</strong>
        <br>1. Copy your deposit address above
        <br>2. Send USDC from any exchange or wallet
        <br>3. Watch your balance grow with auto-yield
      </p>
    </div>
    
    <div class="footer">
      <p>Stashtab - DeFi made simple</p>
      <p>This is an automated message, please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;
}

export function welcomeEmailText(data: WelcomeEmailData): string {
  return `
Welcome to Stashtab${data.userName ? `, ${data.userName}` : ""}!

Your account is ready. You now have a secure smart wallet that earns yield automatically.

Your deposit address:
${data.safeAddress}

Send USDC to this address and it will automatically start earning yield through Aave.

Getting started:
1. Copy your deposit address above
2. Send USDC from any exchange or wallet
3. Watch your balance grow with auto-yield

Go to your dashboard: ${data.appUrl}/dashboard

---
Stashtab - DeFi made simple
This is an automated message, please do not reply.
`;
}

