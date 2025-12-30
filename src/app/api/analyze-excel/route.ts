import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini only when API is called, not at build time
function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

export interface ExtractedReceipt {
  customerName: string;
  amount: number;
  date: string;
  description: string;
  paymentMethod: string;
  notes: string;
  rowNumber: number;
  isComplete: boolean;
  missingFields: string[];
}

export interface AnalysisResult {
  success: boolean;
  receipts: ExtractedReceipt[];
  summary: {
    totalRows: number;
    completeRows: number;
    incompleteRows: number;
    totalAmount: number;
    dateRange: { from: string; to: string };
  };
  error?: string;
}

// ==================== MAIN API HANDLER ====================

export async function POST(request: NextRequest) {
  console.log('[API] Starting analysis request...');
  
  try {
    // 1. Parse request body safely
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('[API] Failed to parse request body:', e);
      return NextResponse.json(
        { success: false, error: 'Invalid request format' },
        { status: 400 }
      );
    }

    const { headers, rows } = body;

    // 2. Validate API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('[API] Gemini API key not configured');
      return NextResponse.json(
        { success: false, error: 'AI service not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // 3. Validate input data
    if (!headers || !Array.isArray(headers) || headers.length === 0) {
      console.error('[API] No headers provided');
      return NextResponse.json(
        { success: false, error: 'הקובץ לא מכיל כותרות עמודות' },
        { status: 400 }
      );
    }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      console.error('[API] No rows provided');
      return NextResponse.json(
        { success: false, error: 'הקובץ לא מכיל שורות נתונים' },
        { status: 400 }
      );
    }

    console.log(`[API] Processing ${rows.length} rows with ${headers.length} columns`);

    // 4. Try AI analysis first
    let receipts: ExtractedReceipt[] = [];
    let aiSuccess = false;

    try {
      receipts = await analyzeWithGemini(headers, rows);
      aiSuccess = receipts.length > 0;
      console.log(`[API] Gemini analysis returned ${receipts.length} receipts`);
    } catch (aiError) {
      console.error('[API] Gemini analysis failed:', aiError);
      // Continue to fallback
    }

    // 5. If AI failed or returned nothing, use smart fallback
    if (!aiSuccess) {
      console.log('[API] Using smart fallback extraction...');
      try {
        receipts = smartFallbackExtraction(headers, rows);
        console.log(`[API] Fallback extraction returned ${receipts.length} receipts`);
      } catch (fallbackError) {
        console.error('[API] Fallback extraction failed:', fallbackError);
      }
    }

    // 6. If still no receipts, try basic extraction
    if (receipts.length === 0) {
      console.log('[API] Using basic extraction as last resort...');
      receipts = basicExtraction(headers, rows);
      console.log(`[API] Basic extraction returned ${receipts.length} receipts`);
    }

    // 7. Validate and clean receipts
    receipts = validateAndCleanReceipts(receipts);

    // 8. Calculate summary
    const summary = calculateSummary(receipts);

    console.log(`[API] Final result: ${receipts.length} receipts, ${summary.completeRows} complete`);

    return NextResponse.json({
      success: true,
      receipts,
      summary
    });

  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'שגיאה לא צפויה. אנא נסה שוב.'
      },
      { status: 500 }
    );
  }
}

// ==================== GEMINI AI ANALYSIS ====================

async function analyzeWithGemini(headers: string[], rows: any[]): Promise<ExtractedReceipt[]> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 65536,
      responseMimeType: "application/json",
    }
  });

  // Prepare data - limit to 200 rows for API limits
  const maxRows = Math.min(rows.length, 200);
  const tableData = prepareTableData(headers, rows.slice(0, maxRows));
  const prompt = createEnhancedPrompt(headers, tableData, rows.length);

  console.log('[Gemini] Sending request to Gemini...');
  
  // Retry logic
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();
      
      if (!content) {
        throw new Error('Empty response from Gemini');
      }

      console.log(`[Gemini] Received response (attempt ${attempt})`);
      
      // Parse JSON response
      const receipts = parseGeminiResponse(content);
      
      if (receipts.length > 0) {
        return receipts;
      }
      
      console.log(`[Gemini] No receipts parsed, attempt ${attempt}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`[Gemini] Attempt ${attempt} failed:`, lastError.message);
      
      // Wait before retry (exponential backoff)
      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  throw lastError || new Error('All Gemini attempts failed');
}

function parseGeminiResponse(content: string): ExtractedReceipt[] {
  let jsonContent = content.trim();
  
  // Remove markdown code blocks
  if (jsonContent.startsWith('```json')) {
    jsonContent = jsonContent.slice(7);
  }
  if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.slice(3);
  }
  if (jsonContent.endsWith('```')) {
    jsonContent = jsonContent.slice(0, -3);
  }
  jsonContent = jsonContent.trim();

  try {
    const parsed = JSON.parse(jsonContent);
    
    if (Array.isArray(parsed)) {
      return parsed;
    }
    
    if (parsed.receipts && Array.isArray(parsed.receipts)) {
      return parsed.receipts;
    }
    
    return [];
  } catch (e) {
    console.error('[Gemini] JSON parse error:', e);
    return [];
  }
}

// ==================== SMART FALLBACK EXTRACTION ====================

function smartFallbackExtraction(headers: string[], rows: any[]): ExtractedReceipt[] {
  console.log('[Fallback] Starting smart extraction...');
  
  // Detect column mappings
  const mapping = detectColumnMapping(headers, rows);
  console.log('[Fallback] Detected mapping:', mapping);

  const receipts: ExtractedReceipt[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    
    // Skip empty rows
    if (isEmptyRow(row, headers)) {
      continue;
    }

    // Skip summary rows
    if (isSummaryRow(row, headers)) {
      continue;
    }

    // Extract data using detected mapping
    const receipt = extractReceiptFromRow(row, mapping, i + 1);
    
    // Only add if has some meaningful data
    if (receipt.customerName || receipt.amount > 0 || receipt.date) {
      receipts.push(receipt);
    }
  }

  return receipts;
}

interface ColumnMapping {
  customerName: string | null;
  amount: string | null;
  date: string | null;
  description: string | null;
  paymentMethod: string | null;
  notes: string | null;
}

function detectColumnMapping(headers: string[], rows: any[]): ColumnMapping {
  const mapping: ColumnMapping = {
    customerName: null,
    amount: null,
    date: null,
    description: null,
    paymentMethod: null,
    notes: null
  };

  const normalizedHeaders = headers.map(h => normalizeText(h));

  // Keywords for each field (Hebrew and English)
  const keywords: Record<keyof ColumnMapping, string[]> = {
    customerName: ['שם', 'לקוח', 'לקוחה', 'שם לקוח', 'customer', 'name', 'client', 'מקבל', 'משלם', 'קונה', 'רוכש', 'חברה', 'עסק'],
    amount: ['סכום', 'סה"כ', 'סהכ', 'מחיר', 'total', 'amount', 'sum', 'שולם', 'לתשלום', 'סך', 'עלות', 'תשלום', 'כסף', 'ש"ח', 'שח', 'nis', 'price', 'cost'],
    date: ['תאריך', 'date', 'יום', 'מועד', 'תאריך תשלום', 'תאריך עסקה', 'when'],
    description: ['תיאור', 'פירוט', 'שירות', 'מוצר', 'description', 'details', 'service', 'product', 'פרטים', 'עבור', 'בגין', 'item'],
    paymentMethod: ['אמצעי תשלום', 'תשלום', 'payment', 'method', 'צ\'יק', 'צק', 'מזומן', 'העברה', 'אשראי', 'bit', 'ביט', 'אמצעי', 'שיטה'],
    notes: ['הערות', 'הערה', 'notes', 'note', 'comments', 'comment', 'מידע נוסף', 'פרטים נוספים', 'remarks']
  };

  // First pass: exact and partial matches on headers
  for (const [field, fieldKeywords] of Object.entries(keywords) as [keyof ColumnMapping, string[]][]) {
    if (mapping[field]) continue;

    for (let i = 0; i < normalizedHeaders.length; i++) {
      const header = normalizedHeaders[i];
      
      // Exact match
      if (fieldKeywords.includes(header)) {
        mapping[field] = headers[i];
        break;
      }
      
      // Partial match
      for (const keyword of fieldKeywords) {
        if (header.includes(keyword) || keyword.includes(header)) {
          if (!mapping[field]) {
            mapping[field] = headers[i];
            break;
          }
        }
      }
    }
  }

  // Second pass: detect by data analysis
  if (!mapping.amount || !mapping.date || !mapping.customerName) {
    const sampleRows = rows.slice(0, Math.min(10, rows.length));
    
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const values = sampleRows.map(r => r[header]).filter(v => v != null && v !== '');
      
      if (values.length === 0) continue;

      // Detect amount column by numeric values
      if (!mapping.amount) {
        const numericCount = values.filter(v => isNumericValue(v)).length;
        if (numericCount >= values.length * 0.7) {
          const avg = values.map(v => parseNumericValue(v)).reduce((a, b) => a + b, 0) / values.length;
          if (avg > 0) {
            mapping.amount = header;
          }
        }
      }

      // Detect date column by date-like values
      if (!mapping.date) {
        const dateCount = values.filter(v => isDateValue(v)).length;
        if (dateCount >= values.length * 0.5) {
          mapping.date = header;
        }
      }

      // Detect customer name by text values (not numbers, not dates)
      if (!mapping.customerName) {
        const textCount = values.filter(v => isTextValue(v) && !isDateValue(v) && !isNumericValue(v)).length;
        if (textCount >= values.length * 0.5) {
          mapping.customerName = header;
        }
      }
    }
  }

  return mapping;
}

function extractReceiptFromRow(row: any, mapping: ColumnMapping, rowNumber: number): ExtractedReceipt {
  const missingFields: string[] = [];

  // Extract customer name
  let customerName = '';
  if (mapping.customerName && row[mapping.customerName]) {
    customerName = String(row[mapping.customerName]).trim();
  }
  if (!customerName) {
    // Try to find any text value that looks like a name
    for (const key of Object.keys(row)) {
      const val = row[key];
      if (val && isTextValue(val) && !isDateValue(val) && !isNumericValue(val)) {
        customerName = String(val).trim();
        break;
      }
    }
  }
  if (!customerName) missingFields.push('customerName');

  // Extract amount
  let amount = 0;
  if (mapping.amount && row[mapping.amount]) {
    amount = parseNumericValue(row[mapping.amount]);
  }
  if (amount === 0) {
    // Try to find any numeric value
    for (const key of Object.keys(row)) {
      const val = row[key];
      if (val && isNumericValue(val)) {
        const parsed = parseNumericValue(val);
        if (parsed > 0 && parsed > amount) {
          amount = parsed;
        }
      }
    }
  }
  if (amount === 0) missingFields.push('amount');

  // Extract date
  let date = '';
  if (mapping.date && row[mapping.date]) {
    date = parseDateValue(row[mapping.date]);
  }
  if (!date) {
    // Try to find any date value
    for (const key of Object.keys(row)) {
      const val = row[key];
      if (val && isDateValue(val)) {
        date = parseDateValue(val);
        if (date) break;
      }
    }
  }
  if (!date) missingFields.push('date');

  // Extract optional fields
  const description = mapping.description && row[mapping.description] 
    ? String(row[mapping.description]).trim() 
    : '';
  
  const paymentMethod = mapping.paymentMethod && row[mapping.paymentMethod] 
    ? String(row[mapping.paymentMethod]).trim() 
    : '';
  
  const notes = mapping.notes && row[mapping.notes] 
    ? String(row[mapping.notes]).trim() 
    : '';

  return {
    customerName,
    amount,
    date,
    description,
    paymentMethod,
    notes,
    rowNumber,
    isComplete: missingFields.length === 0,
    missingFields
  };
}

// ==================== BASIC EXTRACTION (Last Resort) ====================

function basicExtraction(headers: string[], rows: any[]): ExtractedReceipt[] {
  console.log('[Basic] Starting basic extraction...');
  
  const receipts: ExtractedReceipt[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const values = headers.map(h => row[h]).filter(v => v != null && v !== '');
    
    if (values.length === 0) continue;

    // Find first text value (potential name)
    const textValues = values.filter(v => isTextValue(v) && !isDateValue(v) && !isNumericValue(v));
    const customerName = textValues[0] ? String(textValues[0]).trim() : '';

    // Find first numeric value (potential amount)
    const numericValues = values.filter(v => isNumericValue(v)).map(v => parseNumericValue(v)).filter(v => v > 0);
    const amount = numericValues.length > 0 ? Math.max(...numericValues) : 0;

    // Find first date value
    const dateValues = values.filter(v => isDateValue(v)).map(v => parseDateValue(v)).filter(v => v);
    const date = dateValues[0] || '';

    // Build missing fields list
    const missingFields: string[] = [];
    if (!customerName) missingFields.push('customerName');
    if (amount === 0) missingFields.push('amount');
    if (!date) missingFields.push('date');

    // Only add if has at least some data
    if (customerName || amount > 0 || date) {
      receipts.push({
        customerName,
        amount,
        date,
        description: '',
        paymentMethod: '',
        notes: '',
        rowNumber: i + 1,
        isComplete: missingFields.length === 0,
        missingFields
      });
    }
  }

  return receipts;
}

// ==================== UTILITY FUNCTIONS ====================

function normalizeText(text: string): string {
  return String(text || '').toLowerCase().trim()
    .replace(/[\s_-]+/g, ' ')
    .replace(/['"״׳]/g, '');
}

function isEmptyRow(row: any, headers: string[]): boolean {
  for (const header of headers) {
    const val = row[header];
    if (val !== null && val !== undefined && String(val).trim() !== '') {
      return false;
    }
  }
  return true;
}

function isSummaryRow(row: any, headers: string[]): boolean {
  const summaryKeywords = ['סה"כ', 'סהכ', 'סיכום', 'total', 'subtotal', 'sum', 'סך הכל', 'grand total'];
  
  for (const header of headers) {
    const val = row[header];
    if (val) {
      const normalized = normalizeText(String(val));
      for (const keyword of summaryKeywords) {
        if (normalized.includes(keyword) || normalized.startsWith(keyword)) {
          return true;
        }
      }
    }
  }
  return false;
}

function isNumericValue(value: any): boolean {
  if (value === null || value === undefined || value === '') return false;
  
  if (typeof value === 'number') return !isNaN(value);
  
  const str = String(value).trim();
  // Remove currency symbols and commas
  const cleaned = str.replace(/[₪$€,\s]/g, '').replace(/[,]/g, '.');
  
  return !isNaN(parseFloat(cleaned)) && parseFloat(cleaned) !== 0;
}

function parseNumericValue(value: any): number {
  if (value === null || value === undefined) return 0;
  
  if (typeof value === 'number') return value;
  
  const str = String(value).trim();
  // Remove currency symbols, commas and spaces
  let cleaned = str.replace(/[₪$€\s]/g, '');
  
  // Handle thousands separators
  // If format is like 1,234.56 or 1,234
  if (cleaned.match(/^\d{1,3}(,\d{3})*(\.\d+)?$/)) {
    cleaned = cleaned.replace(/,/g, '');
  }
  // If format is like 1.234,56 (European)
  else if (cleaned.match(/^\d{1,3}(\.\d{3})*(,\d+)?$/)) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  }
  // If has comma as decimal
  else {
    cleaned = cleaned.replace(',', '.');
  }
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function isDateValue(value: any): boolean {
  if (value === null || value === undefined || value === '') return false;
  
  // If it's a Date object
  if (value instanceof Date) return !isNaN(value.getTime());
  
  // If it's a number (Excel serial date)
  if (typeof value === 'number' && value > 25000 && value < 100000) return true;
  
  const str = String(value).trim();
  
  // Check for date patterns - comprehensive list
  const datePatterns = [
    /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}$/,    // DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
    /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2}$/,    // DD/MM/YY, DD-MM-YY
    /^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/,    // YYYY/MM/DD, YYYY-MM-DD
    /^\d{1,2}\s*[\/\-\.]\s*\d{1,2}\s*[\/\-\.]\s*\d{2,4}$/, // With spaces
    /^\d{1,2}\s+[א-ת]+\s+\d{4}$/,               // Hebrew date format
    /^[א-ת]+\s+\d{1,2}\s*,?\s*\d{4}$/,          // Hebrew month format
    /^\d{8}$/,                                   // DDMMYYYY or YYYYMMDD
  ];
  
  for (const pattern of datePatterns) {
    if (pattern.test(str)) return true;
  }
  
  // Also check if it contains date-like content with time
  if (/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(str)) {
    return true;
  }
  
  return false;
}

function parseDateValue(value: any): string {
  if (value === null || value === undefined || value === '') return '';
  
  // If it's a Date object
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return '';
    return formatDateString(value);
  }
  
  // If it's an Excel serial date
  if (typeof value === 'number' && value > 25000 && value < 100000) {
    const date = new Date((value - 25569) * 86400 * 1000);
    if (!isNaN(date.getTime())) {
      return formatDateString(date);
    }
  }
  
  const str = String(value).trim();
  
  // Try to parse DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const ddmmyyyy = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }
  
  // Try to parse YYYY-MM-DD or YYYY/MM/DD
  const yyyymmdd = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (yyyymmdd) {
    const [, year, month, day] = yyyymmdd;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }
  
  // Try to parse DD/MM/YY
  const ddmmyy = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})$/);
  if (ddmmyy) {
    const [, day, month, year] = ddmmyy;
    const fullYear = parseInt(year) > 50 ? `19${year}` : `20${year}`;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${fullYear}`;
  }
  
  // Try native Date parsing as last resort
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1900 && parsed.getFullYear() < 2100) {
    return formatDateString(parsed);
  }
  
  return '';
}

function formatDateString(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function isTextValue(value: any): boolean {
  if (value === null || value === undefined || value === '') return false;
  
  const str = String(value).trim();
  
  // Must have at least 2 characters
  if (str.length < 2) return false;
  
  // Should contain letters (Hebrew or English)
  if (!/[א-תa-zA-Z]/.test(str)) return false;
  
  return true;
}

// ==================== VALIDATION & CLEANUP ====================

function validateAndCleanReceipts(receipts: ExtractedReceipt[]): ExtractedReceipt[] {
  return receipts.map((r, index) => {
    const missingFields: string[] = [];
    
    // Clean and validate customer name
    let customerName = String(r.customerName || '').trim();
    if (customerName.length < 2) {
      customerName = '';
      missingFields.push('customerName');
    }
    
    // Clean and validate amount
    let amount = typeof r.amount === 'number' ? r.amount : parseNumericValue(r.amount);
    if (amount <= 0) {
      amount = 0;
      missingFields.push('amount');
    }
    // Round to 2 decimal places
    amount = Math.round(amount * 100) / 100;
    
    // Clean and validate date
    let date = r.date || '';
    if (date && typeof date === 'string') {
      date = parseDateValue(date) || date;
    }
    if (!date || date.length < 6) {
      date = '';
      missingFields.push('date');
    }
    
    // Clean optional fields
    const description = String(r.description || '').trim().substring(0, 500);
    const paymentMethod = normalizePaymentMethod(String(r.paymentMethod || '').trim());
    const notes = String(r.notes || '').trim().substring(0, 1000);
    
    return {
      customerName,
      amount,
      date,
      description,
      paymentMethod,
      notes,
      rowNumber: r.rowNumber || index + 1,
      isComplete: missingFields.length === 0,
      missingFields
    };
  }).filter(r => {
    // Keep only rows with at least some data
    return r.customerName || r.amount > 0 || r.date;
  });
}

function normalizePaymentMethod(value: string): string {
  const lower = value.toLowerCase();
  
  if (lower.includes('מזומן') || lower.includes('cash')) return 'מזומן';
  if (lower.includes('אשראי') || lower.includes('credit') || lower.includes('כרטיס')) return 'אשראי';
  if (lower.includes('העברה') || lower.includes('transfer') || lower.includes('בנק')) return 'העברה בנקאית';
  if (lower.includes('צק') || lower.includes('צ\'יק') || lower.includes('check') || lower.includes('שיק')) return 'צ\'ק';
  if (lower.includes('bit') || lower.includes('ביט')) return 'bit';
  if (lower.includes('paybox') || lower.includes('פייבוקס')) return 'paybox';
  
  return value;
}

// ==================== SUMMARY CALCULATION ====================

function calculateSummary(receipts: ExtractedReceipt[]): AnalysisResult['summary'] {
  const totalRows = receipts.length;
  const completeRows = receipts.filter(r => r.isComplete).length;
  const incompleteRows = totalRows - completeRows;
  const totalAmount = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);
  
  // Find date range
  const dates = receipts
    .map(r => r.date)
    .filter(d => d && d.length > 0)
    .map(d => {
      const parts = d.split('/');
      if (parts.length === 3) {
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
      return null;
    })
    .filter((d): d is Date => d !== null && !isNaN(d.getTime()));
  
  let dateRange = { from: '', to: '' };
  if (dates.length > 0) {
    dates.sort((a, b) => a.getTime() - b.getTime());
    dateRange = {
      from: formatDateString(dates[0]),
      to: formatDateString(dates[dates.length - 1])
    };
  }
  
  return {
    totalRows,
    completeRows,
    incompleteRows,
    totalAmount: Math.round(totalAmount * 100) / 100,
    dateRange
  };
}

// ==================== ENHANCED PROMPT ====================

function prepareTableData(headers: string[], rows: any[]): string {
  let table = '';
  
  // Headers
  table += 'שורה | ' + headers.join(' | ') + '\n';
  table += '-'.repeat(100) + '\n';
  
  // Data rows
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const values = headers.map(h => {
      const val = row[h];
      if (val === null || val === undefined) return '';
      
      // Handle Date objects
      if (val instanceof Date) {
        return formatDateString(val);
      }
      
      return String(val).substring(0, 50);
    });
    table += `${i + 1} | ${values.join(' | ')}\n`;
  }
  
  return table;
}

function createEnhancedPrompt(headers: string[], tableData: string, totalRows: number): string {
  return `אתה מומחה בניתוח טבלאות Excel ונתונים פיננסיים. המשימה שלך היא לחלץ קבלות מהטבלה.

## כותרות העמודות בטבלה:
${JSON.stringify(headers, null, 2)}

## הנתונים בטבלה (${totalRows} שורות):
${tableData}

## משימתך:
חלץ את כל הקבלות מהטבלה. לכל שורה שמכילה נתוני תשלום/קבלה, צור רשומה.

## כללי זיהוי עמודות - חשוב מאוד!

### זיהוי שם לקוח (customerName):
- חפש עמודות עם: "שם", "לקוח", "לקוחה", "שם לקוח", "customer", "name", "client", "מקבל", "משלם", "קונה", "רוכש", "חברה", "עסק"
- אם אין כותרת ברורה - חפש עמודה עם שמות (טקסט שנראה כמו שם אדם/חברה)
- **חשוב**: זהה גם אם הכותרת פשוטה כמו "שם" בלבד

### זיהוי סכום (amount):
- חפש עמודות עם: "סכום", "סה"כ", "סהכ", "מחיר", "total", "amount", "sum", "שולם", "לתשלום", "סך", "עלות", "כסף", "ש"ח", "price"
- הסכום יכול להכיל: ₪, $, €, מספרים, פסיקים, נקודות
- אם יש כמה עמודות סכום - קח את הסכום הגדול ביותר (הסופי/כולל)
- **חשוב**: הסר את סימן המטבע והחזר מספר בלבד

### זיהוי תאריך (date):
- חפש עמודות עם: "תאריך", "date", "יום", "מועד", "when"
- פורמטים אפשריים: DD/MM/YYYY, YYYY-MM-DD, DD.MM.YY, DD-MM-YYYY, ועוד
- **חשוב**: המר תמיד לפורמט DD/MM/YYYY

### זיהוי תיאור (description):
- חפש עמודות עם: "תיאור", "פירוט", "שירות", "מוצר", "description", "details", "service", "product", "פרטים", "עבור", "בגין", "item"

### זיהוי אמצעי תשלום (paymentMethod):
- חפש עמודות עם: "תשלום", "אמצעי", "payment", "method", "סוג תשלום", "אופן תשלום"
- ערכים אפשריים: מזומן, אשראי, העברה, צ'ק, bit, paybox, העברה בנקאית

### זיהוי הערות (notes):
- חפש עמודות עם: "הערות", "הערה", "notes", "note", "comments", "comment", "מידע נוסף"

## כללים קריטיים:

1. **קרא את כל השורות** - אל תדלג על שום שורה עם נתונים!
2. **דלג רק על**: 
   - שורות סיכום (מכילות "סה"כ", "סיכום", "total" בתחילה)
   - שורות ריקות לחלוטין
   - כותרות כפולות
3. **שדות חובה**: customerName, amount, date
4. **אם שדה חסר** - סמן isComplete: false והוסף את שם השדה ל-missingFields
5. **נרמל סכומים** - החזר מספר בלבד (לדוגמה: 1234.56)
6. **נרמל תאריכים** - החזר בפורמט DD/MM/YYYY
7. **rowNumber** - מספר השורה המקורית (החל מ-1)

## פורמט התשובה - JSON בלבד!

{
  "receipts": [
    {
      "customerName": "שם הלקוח",
      "amount": 1234.56,
      "date": "15/12/2024",
      "description": "תיאור השירות",
      "paymentMethod": "אשראי",
      "notes": "הערות אם יש",
      "rowNumber": 1,
      "isComplete": true,
      "missingFields": []
    }
  ]
}

## חובה!
- החזר JSON תקין בלבד
- amount חייב להיות מספר (number), לא מחרוזת
- כלול את כל השורות עם נתונים
- אל תוסיף טקסט לפני או אחרי ה-JSON`;
}
