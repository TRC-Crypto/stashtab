/**
 * Transaction Email Templates
 *
 * Sent when deposits, withdrawals, or transfers are completed.
 */

export type TransactionType = "deposit" | "withdrawal" | "send" | "receive";

export interface TransactionEmailData {
  userName?: string;
  type: TransactionType;
  amount: string;
  currency: string;
  txHash?: string;
  toAddress?: string;
  fromAddress?: string;
  timestamp: Date;
  appUrl: string;
  explorerUrl?: string;
}

function getTransactionTitle(type: TransactionType): string {
  switch (type) {
    case "deposit":
      return "Deposit Received";
    case "withdrawal":
      return "Withdrawal Complete";
    case "send":
      return "Transfer Sent";
    case "receive":
      return "Transfer Received";
  }
}

function getTransactionEmoji(type: TransactionType): string {
  switch (type) {
    case "deposit":
      return "📥";
    case "withdrawal":
      return "📤";
    case "send":
      return "➡️";
    case "receive":
      return "⬅️";
  }
}

export function transactionEmailHtml(data: TransactionEmailData): string {
  const title = getTransactionTitle(data.type);
  const emoji = getTransactionEmoji(data.type);
  const isIncoming = data.type === "deposit" || data.type === "receive";
  const amountColor = isIncoming ? "#00d974" : "#ff6b6b";
  const amountPrefix = isIncoming ? "+" : "-";

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
    .amount {
      text-align: center;
      font-size: 36px;
      font-weight: 700;
      color: ${amountColor};
      margin: 24px 0;
    }
    h1 {
      font-size: 20px;
      font-weight: 600;
      margin: 0;
      text-align: center;
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
      word-break: break-all;
      text-align: right;
      max-width: 60%;
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
      
      <h1>${emoji} ${title}</h1>
      
      <div class="amount">
        ${amountPrefix}${data.amount} ${data.currency}
      </div>
      
      <div class="details">
        <div class="detail-row">
          <span class="detail-label">Type</span>
          <span class="detail-value">${title}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date</span>
          <span class="detail-value">${data.timestamp.toLocaleDateString()} ${data.timestamp.toLocaleTimeString()}</span>
        </div>
        ${data.toAddress ? `
        <div class="detail-row">
          <span class="detail-label">To</span>
          <span class="detail-value">${data.toAddress.slice(0, 6)}...${data.toAddress.slice(-4)}</span>
        </div>
        ` : ""}
        ${data.fromAddress ? `
        <div class="detail-row">
          <span class="detail-label">From</span>
          <span class="detail-value">${data.fromAddress.slice(0, 6)}...${data.fromAddress.slice(-4)}</span>
        </div>
        ` : ""}
        ${data.txHash ? `
        <div class="detail-row">
          <span class="detail-label">Transaction</span>
          <span class="detail-value">
            <a href="${data.explorerUrl || `https://basescan.org/tx/${data.txHash}`}" style="color: #00d974;">
              ${data.txHash.slice(0, 6)}...${data.txHash.slice(-4)}
            </a>
          </span>
        </div>
        ` : ""}
      </div>
      
      <a href="${data.appUrl}/dashboard" class="cta">
        View Dashboard
      </a>
    </div>
    
    <div class="footer">
      <p>Stashtab - DeFi made simple</p>
    </div>
  </div>
</body>
</html>
`;
}

export function transactionEmailText(data: TransactionEmailData): string {
  const title = getTransactionTitle(data.type);
  const isIncoming = data.type === "deposit" || data.type === "receive";
  const amountPrefix = isIncoming ? "+" : "-";

  return `
${title}

Amount: ${amountPrefix}${data.amount} ${data.currency}
Date: ${data.timestamp.toLocaleDateString()} ${data.timestamp.toLocaleTimeString()}
${data.toAddress ? `To: ${data.toAddress}` : ""}
${data.fromAddress ? `From: ${data.fromAddress}` : ""}
${data.txHash ? `Transaction: ${data.explorerUrl || `https://basescan.org/tx/${data.txHash}`}` : ""}

View your dashboard: ${data.appUrl}/dashboard

---
Stashtab - DeFi made simple
`;
}

