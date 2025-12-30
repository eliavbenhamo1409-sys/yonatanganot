import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

interface ReceiptData {
  receiptNumber: number;
  customerName: string;
  amount: number;
  date: string;
  description: string;
  paymentMethod: string;
  notes: string;
}

interface BusinessInfo {
  name: string;
  businessId: string;
  businessType: string;
  address?: string;
  phone?: string;
  email?: string;
  vatExempt?: boolean;
}

interface RequestBody {
  receipt: ReceiptData;
  businessInfo: BusinessInfo;
  currencySymbol?: string;
}

function getBusinessTypeHebrew(type: string): string {
  const types: Record<string, string> = {
    'osek_patur': 'עוסק פטור',
    'osek_morshe': 'עוסק מורשה',
    'company': 'חברה בע"מ',
  };
  return types[type] || 'עסק';
}

function formatAmount(num: number): string {
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function getTodayDate(): string {
  const d = new Date();
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

function generateReceiptHTML(data: RequestBody): string {
  const { receipt, businessInfo, currencySymbol = '₪' } = data;
  
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Heebo', Arial, sans-serif;
      direction: rtl;
      text-align: right;
      background: #ffffff;
      color: #333333;
      padding: 40px;
      font-size: 14px;
      line-height: 1.6;
    }
    
    .receipt-container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
    }
    
    .header {
      padding-bottom: 25px;
      border-bottom: 3px solid #1a365d;
      margin-bottom: 30px;
    }
    
    .business-name {
      font-size: 28px;
      font-weight: 700;
      color: #1a365d;
      margin-bottom: 10px;
    }
    
    .business-details {
      font-size: 12px;
      color: #666666;
      line-height: 1.8;
    }
    
    .receipt-title-box {
      background: linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%);
      color: #ffffff;
      text-align: center;
      padding: 20px;
      margin-bottom: 30px;
      border-radius: 8px;
    }
    
    .receipt-title {
      font-size: 26px;
      font-weight: 700;
      margin-bottom: 5px;
    }
    
    .receipt-number {
      font-size: 16px;
      opacity: 0.9;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eeeeee;
    }
    
    .info-item {
      text-align: right;
    }
    
    .info-label {
      font-size: 11px;
      color: #888888;
      margin-bottom: 3px;
    }
    
    .info-value {
      font-size: 14px;
      color: #333333;
      font-weight: 500;
    }
    
    .customer-box {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 25px;
      border-right: 4px solid #1a365d;
    }
    
    .customer-label {
      font-size: 11px;
      color: #888888;
      margin-bottom: 5px;
    }
    
    .customer-name {
      font-size: 20px;
      font-weight: 700;
      color: #1a365d;
    }
    
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
    }
    
    .details-table th {
      background: #1a365d;
      color: #ffffff;
      padding: 12px 15px;
      font-weight: 500;
      font-size: 12px;
      text-align: center;
    }
    
    .details-table td {
      padding: 15px;
      text-align: center;
      border-bottom: 1px solid #eeeeee;
      font-size: 13px;
    }
    
    .total-section {
      display: flex;
      justify-content: flex-start;
      margin-bottom: 30px;
    }
    
    .total-box {
      background: linear-gradient(135deg, #38a169 0%, #48bb78 100%);
      color: #ffffff;
      padding: 20px 40px;
      border-radius: 8px;
      text-align: center;
    }
    
    .total-label {
      font-size: 12px;
      opacity: 0.9;
      margin-bottom: 5px;
    }
    
    .total-amount {
      font-size: 28px;
      font-weight: 700;
    }
    
    .notes-box {
      background: #fff9e6;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 25px;
      border-right: 4px solid #f6ad55;
    }
    
    .notes-label {
      font-size: 11px;
      color: #888888;
      margin-bottom: 5px;
    }
    
    .notes-text {
      font-size: 13px;
      color: #666666;
    }
    
    .footer {
      border-top: 1px solid #dddddd;
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #888888;
    }
    
    .signature-box {
      text-align: left;
    }
    
    .signature-text {
      font-weight: 600;
      color: #1a365d;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="header">
      <div class="business-name">${businessInfo.name || 'שם העסק'}</div>
      <div class="business-details">
        ${getBusinessTypeHebrew(businessInfo.businessType)} | ח.פ/ע.מ: ${businessInfo.businessId || '000000000'}<br>
        ${businessInfo.address ? businessInfo.address + '<br>' : ''}
        ${businessInfo.phone ? 'טלפון: ' + businessInfo.phone + '<br>' : ''}
        ${businessInfo.email ? businessInfo.email : ''}
      </div>
    </div>
    
    <div class="receipt-title-box">
      <div class="receipt-title">קבלה</div>
      <div class="receipt-number">מספר: ${receipt.receiptNumber}</div>
    </div>
    
    <div class="info-row">
      <div class="info-item">
        <div class="info-label">תאריך</div>
        <div class="info-value">${receipt.date || getTodayDate()}</div>
      </div>
      <div class="info-item">
        <div class="info-label">מספר קבלה</div>
        <div class="info-value">${receipt.receiptNumber}</div>
      </div>
    </div>
    
    <div class="customer-box">
      <div class="customer-label">התקבל מאת</div>
      <div class="customer-name">${receipt.customerName || 'לקוח'}</div>
    </div>
    
    <table class="details-table">
      <thead>
        <tr>
          <th>פירוט</th>
          <th>תאריך</th>
          <th>אמצעי תשלום</th>
          <th>סכום</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${receipt.description || 'תשלום'}</td>
          <td>${receipt.date || getTodayDate()}</td>
          <td>${receipt.paymentMethod || '-'}</td>
          <td>${currencySymbol}${formatAmount(receipt.amount)}</td>
        </tr>
      </tbody>
    </table>
    
    <div class="total-section">
      <div class="total-box">
        <div class="total-label">סה״כ שולם</div>
        <div class="total-amount">${currencySymbol}${formatAmount(receipt.amount)}</div>
      </div>
    </div>
    
    ${receipt.notes ? `
    <div class="notes-box">
      <div class="notes-label">הערות</div>
      <div class="notes-text">${receipt.notes}</div>
    </div>
    ` : ''}
    
    <div class="footer">
      <div>
        <div>תאריך הפקה: ${getTodayDate()}</div>
        ${businessInfo.vatExempt ? '<div>פטור ממע״מ עפ״י סעיף 31 לחוק</div>' : ''}
      </div>
      <div class="signature-box">
        <div class="signature-text">מסמך ממוחשב - חתום דיגיטלית</div>
        <div>הופק על ידי קבליט</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  console.log('[PDF API] Starting PDF generation...');
  
  try {
    const body: RequestBody = await request.json();
    console.log('[PDF API] Generating for:', body.receipt.customerName);
    
    // Generate HTML
    const html = generateReceiptHTML(body);
    
    // Dynamic import for serverless
    let browser;
    let puppeteer;
    
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      // Serverless environment (Vercel)
      const chromium = (await import('@sparticuz/chromium-min')).default;
      puppeteer = await import('puppeteer-core');
      
      // Use pre-built chromium from official @Sparticuz releases
      const execPath = await chromium.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v131.0.0/chromium-v131.0.0-pack.tar'
      );
      console.log('[PDF API] Chromium path:', execPath);
      
      browser = await puppeteer.default.launch({
        args: chromium.args,
        defaultViewport: { width: 1200, height: 800 },
        executablePath: execPath,
        headless: true,
      });
    } else {
      // Local development
      puppeteer = await import('puppeteer-core');
      
      // Try common Chrome paths
      const chromePaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      ];
      
      let executablePath = '';
      for (const p of chromePaths) {
        try {
          const fs = await import('fs');
          if (fs.existsSync(p)) {
            executablePath = p;
            break;
          }
        } catch {
          continue;
        }
      }
      
      if (!executablePath) {
        throw new Error('Chrome not found. Please install Chrome.');
      }
      
      browser = await puppeteer.default.launch({
        executablePath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    
    const page = await browser.newPage();
    
    // Set content with UTF-8
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 30000,
    });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
    });
    
    await browser.close();
    
    console.log('[PDF API] PDF generated, size:', pdfBuffer.length);
    
    // Convert Uint8Array to Buffer for NextResponse
    const buffer = Buffer.from(pdfBuffer);
    
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt_${body.receipt.receiptNumber}.pdf"`,
      },
    });
    
  } catch (error) {
    console.error('[PDF API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'PDF generation failed' },
      { status: 500 }
    );
  }
}
