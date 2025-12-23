/**
 * Security Email Templates
 *
 * Sent for security-related events like logins, password changes, etc.
 */

export type SecurityEventType =
  | 'new_login'
  | 'new_device'
  | 'password_changed'
  | 'email_changed'
  | 'large_withdrawal'
  | 'suspicious_activity';

export interface SecurityEmailData {
  userName?: string;
  eventType: SecurityEventType;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  timestamp: Date;
  amount?: string;
  currency?: string;
  appUrl: string;
}

function getSecurityTitle(type: SecurityEventType): string {
  switch (type) {
    case 'new_login':
      return 'New Login Detected';
    case 'new_device':
      return 'New Device Login';
    case 'password_changed':
      return 'Password Changed';
    case 'email_changed':
      return 'Email Address Changed';
    case 'large_withdrawal':
      return 'Large Withdrawal Alert';
    case 'suspicious_activity':
      return 'Suspicious Activity Detected';
  }
}

function getSecurityEmoji(type: SecurityEventType): string {
  switch (type) {
    case 'new_login':
      return '🔐';
    case 'new_device':
      return '📱';
    case 'password_changed':
      return '🔑';
    case 'email_changed':
      return '📧';
    case 'large_withdrawal':
      return '⚠️';
    case 'suspicious_activity':
      return '🚨';
  }
}

function isWarningEvent(type: SecurityEventType): boolean {
  return type === 'suspicious_activity' || type === 'large_withdrawal';
}

export function securityEmailHtml(data: SecurityEmailData): string {
  const title = getSecurityTitle(data.eventType);
  const emoji = getSecurityEmoji(data.eventType);
  const isWarning = isWarningEvent(data.eventType);
  const headerColor = isWarning ? '#ef4444' : '#00d974';

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
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    .header {
      background: ${headerColor};
      padding: 24px;
      text-align: center;
    }
    .header-emoji {
      font-size: 36px;
    }
    .header-title {
      color: ${isWarning ? '#fff' : '#000'};
      font-size: 20px;
      font-weight: 600;
      margin: 12px 0 0;
    }
    .content {
      padding: 32px;
    }
    p {
      margin: 0 0 16px;
      color: #4a4a4a;
    }
    .details {
      background: #f8f8f8;
      border-radius: 8px;
      padding: 16px;
      margin: 24px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      color: #666;
      font-size: 14px;
    }
    .detail-value {
      font-weight: 500;
      font-size: 14px;
    }
    .warning-box {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 16px;
      margin: 24px 0;
    }
    .warning-box p {
      color: #991b1b;
      margin: 0;
      font-size: 14px;
    }
    .cta {
      display: block;
      padding: 14px 24px;
      background: #1a1a1a;
      color: #fff;
      text-decoration: none;
      font-weight: 500;
      text-align: center;
      border-radius: 8px;
    }
    .footer {
      text-align: center;
      padding: 24px;
      font-size: 12px;
      color: #888;
      background: #f8f8f8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="header-emoji">${emoji}</div>
        <div class="header-title">${title}</div>
      </div>
      
      <div class="content">
        ${
          data.eventType === 'new_login'
            ? `
        <p>We detected a new login to your Stashtab account.</p>
        `
            : ''
        }
        
        ${
          data.eventType === 'new_device'
            ? `
        <p>Your account was accessed from a new device.</p>
        `
            : ''
        }
        
        ${
          data.eventType === 'password_changed'
            ? `
        <p>Your password was successfully changed.</p>
        `
            : ''
        }
        
        ${
          data.eventType === 'email_changed'
            ? `
        <p>The email address on your account was changed.</p>
        `
            : ''
        }
        
        ${
          data.eventType === 'large_withdrawal'
            ? `
        <p>A large withdrawal was initiated from your account.</p>
        `
            : ''
        }
        
        ${
          data.eventType === 'suspicious_activity'
            ? `
        <p>We detected unusual activity on your account.</p>
        `
            : ''
        }
        
        <div class="details">
          <div class="detail-row">
            <span class="detail-label">Time</span>
            <span class="detail-value">${data.timestamp.toLocaleDateString()} ${data.timestamp.toLocaleTimeString()}</span>
          </div>
          ${
            data.ipAddress
              ? `
          <div class="detail-row">
            <span class="detail-label">IP Address</span>
            <span class="detail-value">${data.ipAddress}</span>
          </div>
          `
              : ''
          }
          ${
            data.location
              ? `
          <div class="detail-row">
            <span class="detail-label">Location</span>
            <span class="detail-value">${data.location}</span>
          </div>
          `
              : ''
          }
          ${
            data.userAgent
              ? `
          <div class="detail-row">
            <span class="detail-label">Device</span>
            <span class="detail-value">${data.userAgent}</span>
          </div>
          `
              : ''
          }
          ${
            data.amount
              ? `
          <div class="detail-row">
            <span class="detail-label">Amount</span>
            <span class="detail-value">${data.amount} ${data.currency || 'USDC'}</span>
          </div>
          `
              : ''
          }
        </div>
        
        ${
          isWarning
            ? `
        <div class="warning-box">
          <p><strong>If this wasn't you:</strong> Please secure your account immediately by changing your password and reviewing your recent activity.</p>
        </div>
        `
            : ''
        }
        
        <a href="${data.appUrl}/settings" class="cta">
          Review Account Activity
        </a>
      </div>
      
      <div class="footer">
        <p>This is an automated security alert from Stashtab.</p>
        <p>If you didn't perform this action, please contact support immediately.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

export function securityEmailText(data: SecurityEmailData): string {
  const title = getSecurityTitle(data.eventType);
  const isWarning = isWarningEvent(data.eventType);

  return `
SECURITY ALERT: ${title}

Time: ${data.timestamp.toLocaleDateString()} ${data.timestamp.toLocaleTimeString()}
${data.ipAddress ? `IP Address: ${data.ipAddress}` : ''}
${data.location ? `Location: ${data.location}` : ''}
${data.amount ? `Amount: ${data.amount} ${data.currency || 'USDC'}` : ''}

${
  isWarning
    ? `
WARNING: If this wasn't you, please secure your account immediately.
`
    : ''
}

Review your account: ${data.appUrl}/settings

---
This is an automated security alert from Stashtab.
If you didn't perform this action, please contact support immediately.
`;
}
