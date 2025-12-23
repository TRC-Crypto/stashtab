/**
 * KYC Email Templates
 *
 * Sent for KYC verification status updates.
 */

export type KYCStatus = 'pending' | 'in_review' | 'approved' | 'declined' | 'expired';

export interface KYCEmailData {
  userName?: string;
  status: KYCStatus;
  reason?: string;
  appUrl: string;
}

function getKYCTitle(status: KYCStatus): string {
  switch (status) {
    case 'pending':
      return 'Identity Verification Started';
    case 'in_review':
      return 'Verification Under Review';
    case 'approved':
      return 'Identity Verified Successfully';
    case 'declined':
      return 'Verification Not Approved';
    case 'expired':
      return 'Verification Session Expired';
  }
}

function getKYCEmoji(status: KYCStatus): string {
  switch (status) {
    case 'pending':
      return '⏳';
    case 'in_review':
      return '🔍';
    case 'approved':
      return '✅';
    case 'declined':
      return '❌';
    case 'expired':
      return '⏰';
  }
}

function getKYCColor(status: KYCStatus): string {
  switch (status) {
    case 'pending':
    case 'in_review':
      return '#f59e0b'; // amber
    case 'approved':
      return '#00d974'; // green
    case 'declined':
      return '#ef4444'; // red
    case 'expired':
      return '#6b7280'; // gray
  }
}

function getKYCMessage(status: KYCStatus, reason?: string): string {
  switch (status) {
    case 'pending':
      return "We've received your verification request. Please complete the verification process to unlock all features.";
    case 'in_review':
      return 'Your documents are being reviewed. This usually takes just a few minutes.';
    case 'approved':
      return 'Your identity has been verified. You now have full access to all Stashtab features.';
    case 'declined':
      return reason
        ? `Your verification was not approved: ${reason}. Please try again with valid documents.`
        : 'Your verification was not approved. Please try again with valid documents.';
    case 'expired':
      return 'Your verification session has expired. Please start a new verification to continue.';
  }
}

export function kycStatusEmailHtml(data: KYCEmailData): string {
  const title = getKYCTitle(data.status);
  const emoji = getKYCEmoji(data.status);
  const color = getKYCColor(data.status);
  const message = getKYCMessage(data.status, data.reason);
  const showCTA =
    data.status === 'declined' || data.status === 'expired' || data.status === 'pending';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
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
      margin-bottom: 24px;
    }
    .logo-badge {
      display: inline-block;
      width: 40px;
      height: 40px;
      background: #00d974;
      border-radius: 10px;
      line-height: 40px;
      font-size: 20px;
      font-weight: bold;
      color: #000;
    }
    .status-icon {
      text-align: center;
      font-size: 48px;
      margin: 24px 0;
    }
    .status-badge {
      display: inline-block;
      padding: 8px 16px;
      background: ${color}20;
      color: ${color};
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
    }
    h1 {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 16px;
      text-align: center;
    }
    p {
      margin: 0 0 16px;
      color: #4a4a4a;
      text-align: center;
    }
    .cta {
      display: block;
      padding: 14px 24px;
      background: ${color};
      color: #fff;
      text-decoration: none;
      font-weight: 500;
      text-align: center;
      border-radius: 8px;
      margin: 24px 0 0;
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
      
      <div class="status-icon">${emoji}</div>
      
      <h1>${title}</h1>
      
      <p style="text-align: center; margin-bottom: 24px;">
        <span class="status-badge">${data.status.replace('_', ' ').toUpperCase()}</span>
      </p>
      
      <p>${message}</p>
      
      ${
        showCTA
          ? `
      <a href="${data.appUrl}/settings" class="cta" style="color: ${data.status === 'approved' ? '#000' : '#fff'};">
        ${data.status === 'pending' ? 'Continue Verification' : 'Start New Verification'}
      </a>
      `
          : ''
      }
    </div>
    
    <div class="footer">
      <p>Stashtab - DeFi made simple</p>
    </div>
  </div>
</body>
</html>
`;
}

export function kycStatusEmailText(data: KYCEmailData): string {
  const title = getKYCTitle(data.status);
  const message = getKYCMessage(data.status, data.reason);
  const showCTA =
    data.status === 'declined' || data.status === 'expired' || data.status === 'pending';

  return `
${title}

Status: ${data.status.replace('_', ' ').toUpperCase()}

${message}

${showCTA ? `${data.status === 'pending' ? 'Continue' : 'Start new'} verification: ${data.appUrl}/settings` : ''}

---
Stashtab - DeFi made simple
`;
}
