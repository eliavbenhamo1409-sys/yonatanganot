import { NextRequest, NextResponse } from 'next/server';

interface ExtractedRow {
  customerName: string;
  date: string;
  rowIndex: number;
}

interface ColumnMapping {
  customerName: string | null;
  date: string | null;
}

// ==================== COLUMN DETECTION (from analyze-excel) ====================

function normalizeText(text: string): string {
  return String(text || '').toLowerCase().trim()
    .replace(/[\s_-]+/g, ' ')
    .replace(/['"״׳]/g, '');
}

function detectColumnMapping(headers: string[], rows: any[]): ColumnMapping {
  const mapping: ColumnMapping = {
    customerName: null,
    date: null,
  };

  const normalizedHeaders = headers.map(h => normalizeText(h));

  // Keywords for each field (Hebrew and English)
  const nameKeywords = ['שם', 'לקוח', 'לקוחה', 'שם לקוח', 'customer', 'name', 'client', 'מקבל', 'משלם', 'קונה', 'רוכש', 'חברה', 'עסק', 'שם מלא'];
  const dateKeywords = ['תאריך', 'date', 'יום', 'מועד', 'תאריך תשלום', 'תאריך עסקה', 'when', 'תאריך קבלה'];

  // First pass: exact and partial matches on headers
  for (let i = 0; i < normalizedHeaders.length; i++) {
    const header = normalizedHeaders[i];
    const originalHeader = headers[i];
    
    // Check for name column
    if (!mapping.customerName) {
      for (const keyword of nameKeywords) {
        if (header === keyword || header.includes(keyword) || keyword.includes(header)) {
          mapping.customerName = originalHeader;
          break;
        }
      }
    }
    
    // Check for date column
    if (!mapping.date) {
      for (const keyword of dateKeywords) {
        if (header === keyword || header.includes(keyword) || keyword.includes(header)) {
          mapping.date = originalHeader;
          break;
        }
      }
    }
  }

  // Second pass: detect by data analysis if still not found
  if (!mapping.date || !mapping.customerName) {
    const sampleRows = rows.slice(0, Math.min(10, rows.length));
    
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const values = sampleRows.map(r => r[header]).filter(v => v != null && v !== '');
      
      if (values.length === 0) continue;

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

// ==================== VALUE TYPE DETECTION ====================

function isNumericValue(value: any): boolean {
  if (value === null || value === undefined || value === '') return false;
  
  if (typeof value === 'number') return !isNaN(value);
  
  const str = String(value).trim();
  const cleaned = str.replace(/[₪$€,\s]/g, '').replace(/[,]/g, '.');
  
  return !isNaN(parseFloat(cleaned)) && parseFloat(cleaned) !== 0;
}

function isDateValue(value: any): boolean {
  if (value === null || value === undefined || value === '') return false;
  
  if (value instanceof Date) return !isNaN(value.getTime());
  
  // Excel serial date
  if (typeof value === 'number') {
    if (value > 25000 && value < 100000) return true;
  }
  
  const str = String(value).trim();
  
  // Date patterns
  const datePatterns = [
    /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}$/,
    /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2}$/,
    /^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/,
    /^\d{1,2}\s*[\/\-\.]\s*\d{1,2}\s*[\/\-\.]\s*\d{2,4}$/,
    /^\d{8}$/,
  ];
  
  for (const pattern of datePatterns) {
    if (pattern.test(str)) return true;
  }
  
  if (/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(str)) {
    return true;
  }
  
  return false;
}

function isTextValue(value: any): boolean {
  if (value === null || value === undefined || value === '') return false;
  
  const str = String(value).trim();
  
  if (str.length < 2) return false;
  if (!/[א-תa-zA-Z]/.test(str)) return false;
  
  return true;
}

// ==================== DATE PARSING ====================

function formatDateString(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function parseDateValue(value: any): string {
  if (value === null || value === undefined || value === '') return '';
  
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return '';
    return formatDateString(value);
  }
  
  // Excel serial date
  if (typeof value === 'number' && value > 25000 && value < 100000) {
    const date = new Date((value - 25569) * 86400 * 1000);
    if (!isNaN(date.getTime())) {
      return formatDateString(date);
    }
  }
  
  const str = String(value).trim();
  
  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const ddmmyyyy = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }
  
  // YYYY-MM-DD or YYYY/MM/DD
  const yyyymmdd = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (yyyymmdd) {
    const [, year, month, day] = yyyymmdd;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }
  
  // DD/MM/YY
  const ddmmyy = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})$/);
  if (ddmmyy) {
    const [, day, month, year] = ddmmyy;
    const fullYear = parseInt(year) > 50 ? `19${year}` : `20${year}`;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${fullYear}`;
  }
  
  // Try native Date parsing
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1900 && parsed.getFullYear() < 2100) {
    return formatDateString(parsed);
  }
  
  // Return as-is if nothing works
  return str;
}

// ==================== MAIN API HANDLER ====================

export async function POST(request: NextRequest) {
  console.log('[Extract Names API] Starting extraction...');
  
  try {
    // Parse request
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('[Extract Names API] Failed to parse request body');
      return NextResponse.json({ success: false, error: 'Invalid request format' }, { status: 400 });
    }

    const { headers, rows } = body;
    
    // Validate input
    if (!headers || !Array.isArray(headers) || headers.length === 0) {
      console.error('[Extract Names API] No headers provided');
      return NextResponse.json({ success: false, error: 'No headers provided' }, { status: 400 });
    }
    
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      console.error('[Extract Names API] No rows provided');
      return NextResponse.json({ success: false, error: 'No rows provided' }, { status: 400 });
    }
    
    console.log(`[Extract Names API] Processing ${rows.length} rows with ${headers.length} columns`);
    console.log('[Extract Names API] Headers:', headers);
    
    // Detect column mapping using proven logic
    const mapping = detectColumnMapping(headers, rows);
    console.log('[Extract Names API] Detected mapping:', mapping);
    
    // Extract data from rows
    const extractedRows: ExtractedRow[] = [];
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      // Skip empty rows
      let hasData = false;
      for (const header of headers) {
        if (row[header] !== null && row[header] !== undefined && String(row[header]).trim() !== '') {
          hasData = true;
          break;
        }
      }
      if (!hasData) continue;
      
      // Extract customer name
      let customerName = '';
      if (mapping.customerName && row[mapping.customerName]) {
        customerName = String(row[mapping.customerName]).trim();
      }
      // Fallback: find any text value
      if (!customerName) {
        for (const header of headers) {
          const val = row[header];
          if (val && isTextValue(val) && !isDateValue(val) && !isNumericValue(val)) {
            customerName = String(val).trim();
            break;
          }
        }
      }
      
      // Extract date
      let date = '';
      if (mapping.date && row[mapping.date]) {
        date = parseDateValue(row[mapping.date]);
      }
      // Fallback: find any date value
      if (!date) {
        for (const header of headers) {
          const val = row[header];
          if (val && isDateValue(val)) {
            date = parseDateValue(val);
            if (date) break;
          }
        }
      }
      
      // Add row if has at least name or date
      if (customerName || date) {
        extractedRows.push({
          customerName,
          date,
          rowIndex: i + 1,
        });
      }
    }
    
    console.log(`[Extract Names API] Extracted ${extractedRows.length} valid rows`);
    
    // Return success even if no rows found (let client handle it)
    return NextResponse.json({
      success: true,
      columnMapping: mapping,
      rows: extractedRows,
      totalRows: rows.length,
    });
    
  } catch (error) {
    console.error('[Extract Names API] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Extraction failed' },
      { status: 500 }
    );
  }
}
