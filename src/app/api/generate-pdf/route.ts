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
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700&display=swap" rel="stylesheet">
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
      color: #333;
      padding: 30px 40px;
      font-size: 12px;
      line-height: 1.5;
    }
    
    .receipt {
      max-width: 700px;
      margin: 0 auto;
    }
    
    /* Header - Two columns */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 2px solid #1a365d;
    }
    
    .customer-info {
      text-align: right;
    }
    
    .customer-label {
      font-size: 11px;
      color: #666;
      margin-bottom: 3px;
    }
    
    .customer-name {
      font-size: 16px;
      font-weight: 600;
      color: #1a365d;
    }
    
    .customer-details {
      font-size: 11px;
      color: #666;
      margin-top: 5px;
    }
    
    .business-info {
      text-align: left;
      font-size: 11px;
      color: #555;
      line-height: 1.6;
    }
    
    .business-name {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin-bottom: 5px;
    }
    
    /* Receipt Title */
    .receipt-title-row {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }
    
    .receipt-badge {
      background: #1a365d;
      color: white;
      padding: 8px 30px;
      border-radius: 4px;
      font-size: 16px;
      font-weight: 600;
    }
    
    /* Info Section */
    .info-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      font-size: 11px;
    }
    
    .info-item {
      text-align: right;
    }
    
    .info-label {
      color: #888;
      margin-bottom: 2px;
    }
    
    .info-value {
      color: #333;
      font-weight: 500;
    }
    
    /* Table */
    .table-section {
      margin-bottom: 15px;
    }
    
    .section-title {
      background: #1a365d;
      color: white;
      padding: 8px 15px;
      font-size: 12px;
      font-weight: 500;
      border-radius: 4px 4px 0 0;
      display: inline-block;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #ddd;
      font-size: 11px;
    }
    
    th {
      background: #f5f5f5;
      padding: 10px 12px;
      text-align: center;
      font-weight: 500;
      color: #333;
      border-bottom: 1px solid #ddd;
    }
    
    td {
      padding: 12px;
      text-align: center;
      border-bottom: 1px solid #eee;
      color: #444;
    }
    
    /* Total Row */
    .total-row {
      display: flex;
      align-items: center;
      margin-top: -1px;
    }
    
    .total-label {
      background: #1a365d;
      color: white;
      padding: 10px 20px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .total-amount {
      background: #f0f0f0;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 700;
      color: #1a365d;
      border: 1px solid #ddd;
      border-right: none;
    }
    
    /* Notes */
    .notes-section {
      margin-top: 15px;
      padding: 10px 15px;
      background: #fafafa;
      border-radius: 4px;
      font-size: 11px;
    }
    
    .notes-label {
      font-weight: 500;
      color: #666;
      margin-bottom: 5px;
    }
    
    .notes-text {
      color: #555;
    }
    
    /* Footer */
    .footer {
      margin-top: 40px;
      padding-top: 15px;
      border-top: 1px solid #ddd;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #888;
    }
    
    .footer-right {
      text-align: right;
    }
    
    .footer-left {
      text-align: left;
    }
    
    .digital-signature {
      font-weight: 600;
      color: #1a365d;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <div class="receipt">
    <!-- Header: Customer (right) | Business (left) -->
    <div class="header">
      <div class="customer-info">
        <div class="customer-label">לכבוד:</div>
        <div class="customer-name">${receipt.customerName || 'לקוח'}</div>
        <div class="customer-details">
          טלפון: -<br>
          ת.ז / ח.פ: -
        </div>
      </div>
      <div class="business-info">
        <div class="business-name">${businessInfo.name || 'שם העסק'}</div>
        ${getBusinessTypeHebrew(businessInfo.businessType)} ${businessInfo.businessId || ''}<br>
        ${businessInfo.address ? 'כתובת: ' + businessInfo.address + '<br>' : ''}
        ${businessInfo.phone ? 'טלפון: ' + businessInfo.phone + '<br>' : ''}
        ${businessInfo.email || ''}
      </div>
    </div>
    
    <!-- Receipt Title -->
    <div class="receipt-title-row">
      <div class="receipt-badge">קבלה ${receipt.receiptNumber}</div>
    </div>
    
    <!-- Info Row -->
    <div class="info-section">
      <div class="info-item">
        <div class="info-label">העתק נאמן למקור</div>
        <div class="info-value">${receipt.date || getTodayDate()}</div>
      </div>
    </div>
    
    <!-- Payment Details Table -->
    <div class="table-section">
      <div class="section-title">פרטי תשלומים</div>
      <table>
        <thead>
          <tr>
            <th>סוג תשלום</th>
            <th>פרטים</th>
            <th>תאריך</th>
            <th>סה״כ(${currencySymbol})</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${receipt.paymentMethod || 'מזומן'}</td>
            <td>${receipt.description || 'תשלום'}</td>
            <td>${receipt.date || getTodayDate()}</td>
            <td>${formatAmount(receipt.amount)}</td>
          </tr>
        </tbody>
      </table>
      <div class="total-row">
        <div class="total-label">סה״כ שולם</div>
        <div class="total-amount">${currencySymbol}${formatAmount(receipt.amount)}</div>
      </div>
    </div>
    
    ${receipt.notes ? `
    <div class="notes-section">
      <div class="notes-label">הערות:</div>
      <div class="notes-text">${receipt.notes}</div>
    </div>
    ` : ''}
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-right">
        <div class="digital-signature">מסמך ממוחשב חתום דיגיטלית</div>
        <div>הופק ע״י קבליט - הנה״ח דיגיטלית</div>
      </div>
      <div class="footer-left">
        <div>תאריך הפקה: ${getTodayDate()}</div>
        ${businessInfo.vatExempt ? '<div>פטור ממע״מ עפ״י סעיף 31 לחוק</div>' : ''}
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
