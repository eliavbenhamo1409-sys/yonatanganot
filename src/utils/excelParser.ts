import * as XLSX from 'xlsx';
import { ExcelRow, ColumnMapping, ReceiptField, FIELD_KEYWORDS, FieldError } from '@/types';

/**
 * קריאת קובץ אקסל והמרה למערך נתונים
 * מטפל בכל סוגי הקבצים: XLSX, XLS, CSV
 */
export async function parseExcelFile(file: File): Promise<{
  headers: string[];
  rows: ExcelRow[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        
        // Try different parsing options for better compatibility
        let workbook;
        try {
          workbook = XLSX.read(data, { 
            type: 'array', 
            cellDates: true,
            cellNF: false,
            cellText: false,
            raw: false,
            codepage: 65001 // UTF-8
          });
        } catch (readError) {
          console.error('First read attempt failed, trying alternative:', readError);
          // Fallback without date parsing
          workbook = XLSX.read(data, { 
            type: 'array',
            raw: true
          });
        }
        
        // Validate workbook
        if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
          reject(new Error('הקובץ לא מכיל גיליונות תקינים'));
          return;
        }
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        if (!worksheet) {
          reject(new Error('הגיליון הראשון ריק'));
          return;
        }
        
        // Convert to JSON with header row
        let jsonData: any[][];
        try {
          jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: '',
            blankrows: false,
            raw: false
          }) as any[][];
        } catch (convertError) {
          console.error('JSON conversion failed:', convertError);
          reject(new Error('שגיאה בהמרת הנתונים מהקובץ'));
          return;
        }
        
        // Validate data
        if (!jsonData || jsonData.length === 0) {
          reject(new Error('הקובץ ריק'));
          return;
        }
        
        if (jsonData.length < 2) {
          reject(new Error('הקובץ מכיל רק שורה אחת. נדרשת לפחות שורת כותרות ושורת נתונים אחת.'));
          return;
        }
        
        // Find the header row (might not be the first row)
        let headerRowIndex = findHeaderRow(jsonData);
        if (headerRowIndex === -1) {
          console.log('Could not find header row, using first row');
          headerRowIndex = 0;
        }
        
        // Extract headers
        const rawHeaders = jsonData[headerRowIndex] as any[];
        if (!rawHeaders || rawHeaders.length === 0) {
          reject(new Error('לא נמצאו כותרות עמודות'));
          return;
        }
        
        // Clean and validate headers
        const headers = rawHeaders.map((h, i) => {
          if (h === null || h === undefined || String(h).trim() === '') {
            return `עמודה ${i + 1}`;
          }
          return String(h).trim().substring(0, 100); // Limit header length
        });
        
        // Remove empty columns from the end
        while (headers.length > 0 && headers[headers.length - 1].startsWith('עמודה')) {
          const lastColIndex = headers.length - 1;
          const hasData = jsonData.slice(headerRowIndex + 1).some(row => 
            row && row[lastColIndex] !== null && row[lastColIndex] !== undefined && String(row[lastColIndex]).trim() !== ''
          );
          if (!hasData) {
            headers.pop();
          } else {
            break;
          }
        }
        
        if (headers.length === 0) {
          reject(new Error('לא נמצאו עמודות עם נתונים'));
          return;
        }
        
        // Extract data rows
        const rows: ExcelRow[] = [];
        for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
          const rowData: Record<string, any> = {};
          const row = jsonData[i] as any[];
          
          // Skip completely empty rows
          if (!row || row.length === 0) {
            continue;
          }
          
          // Check if row has any data
          const hasData = row.some((cell, index) => 
            index < headers.length && cell !== null && cell !== undefined && String(cell).trim() !== ''
          );
          
          if (!hasData) {
            continue;
          }
          
          // Map row data to headers
          headers.forEach((header, j) => {
            let cellValue = row[j];
            
            // Clean cell value
            if (cellValue === null || cellValue === undefined) {
              cellValue = '';
            } else if (cellValue instanceof Date) {
              // Keep Date objects as-is for proper handling
              cellValue = cellValue;
            } else if (typeof cellValue === 'number') {
              // Keep numbers as-is
              cellValue = cellValue;
            } else {
              // Convert to string and trim
              cellValue = String(cellValue).trim();
            }
            
            rowData[header] = cellValue;
          });
          
          rows.push({
            rowNumber: i + 1, // Excel row number (1-based)
            data: rowData,
            errors: [],
            isValid: true,
          });
        }
        
        if (rows.length === 0) {
          reject(new Error('הקובץ לא מכיל שורות נתונים מלבד הכותרות'));
          return;
        }
        
        console.log(`[ExcelParser] Successfully parsed ${rows.length} rows with ${headers.length} columns`);
        console.log(`[ExcelParser] Headers: ${headers.join(', ')}`);
        
        resolve({ headers, rows });
        
      } catch (error) {
        console.error('Excel parsing error:', error);
        reject(new Error('שגיאה בקריאת הקובץ. וודא שזה קובץ Excel/CSV תקין.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('שגיאה בטעינת הקובץ'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * חיפוש שורת הכותרות (לפעמים יש שורות ריקות בהתחלה)
 */
function findHeaderRow(data: any[][]): number {
  const maxRowsToCheck = Math.min(10, data.length);
  
  for (let i = 0; i < maxRowsToCheck; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    
    // Count non-empty cells
    const nonEmptyCells = row.filter(cell => 
      cell !== null && cell !== undefined && String(cell).trim() !== ''
    ).length;
    
    // Count cells that look like headers (text, not just numbers or dates)
    const headerLikeCells = row.filter(cell => {
      if (cell === null || cell === undefined) return false;
      const str = String(cell).trim();
      if (str === '') return false;
      // Headers usually contain letters
      return /[א-תa-zA-Z]/.test(str);
    }).length;
    
    // If row has multiple header-like cells, it's probably the header row
    if (nonEmptyCells >= 2 && headerLikeCells >= 2) {
      return i;
    }
  }
  
  return 0; // Default to first row
}

/**
 * זיהוי אוטומטי של מיפוי עמודות על בסיס שמות הכותרות
 */
export function suggestColumnMappings(headers: string[]): ColumnMapping[] {
  const mappings: ColumnMapping[] = [];
  const usedFields = new Set<ReceiptField>();
  
  // First pass: exact matches
  for (const header of headers) {
    const normalizedHeader = normalizeHeaderForMatching(header);
    let bestMatch: { field: ReceiptField; score: number } | null = null;
    
    // Check each field's keywords
    for (const [field, keywords] of Object.entries(FIELD_KEYWORDS) as [ReceiptField, string[]][]) {
      if (field === 'ignore' || usedFields.has(field)) continue;
      
      for (const keyword of keywords) {
        const normalizedKeyword = keyword.toLowerCase().trim();
        
        // Exact match
        if (normalizedHeader === normalizedKeyword) {
          bestMatch = { field, score: 1.0 };
          break;
        }
        
        // Header contains keyword
        if (normalizedHeader.includes(normalizedKeyword)) {
          const score = normalizedKeyword.length / normalizedHeader.length * 0.9;
          if (!bestMatch || score > bestMatch.score) {
            bestMatch = { field, score };
          }
        }
        
        // Keyword contains header
        if (normalizedKeyword.includes(normalizedHeader) && normalizedHeader.length > 2) {
          const score = normalizedHeader.length / normalizedKeyword.length * 0.8;
          if (!bestMatch || score > bestMatch.score) {
            bestMatch = { field, score };
          }
        }
      }
      
      if (bestMatch?.score === 1.0) break;
    }
    
    if (bestMatch && bestMatch.score >= 0.3) {
      usedFields.add(bestMatch.field);
      mappings.push({
        excelColumn: header,
        receiptField: bestMatch.field,
        confidence: bestMatch.score,
        isManual: false,
      });
    } else {
      mappings.push({
        excelColumn: header,
        receiptField: 'ignore',
        confidence: 0,
        isManual: false,
      });
    }
  }
  
  return mappings;
}

/**
 * נרמול כותרת לצורך התאמה
 */
function normalizeHeaderForMatching(header: string): string {
  return header.toLowerCase().trim()
    .replace(/[\s_-]+/g, ' ')
    .replace(/['"״׳]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * ניקוי וולידציה של ערך סכום
 */
export function parseAmount(value: any): { amount: number | null; error?: string } {
  if (value === null || value === undefined || value === '') {
    return { amount: null, error: 'סכום חסר' };
  }
  
  // If it's already a number
  if (typeof value === 'number') {
    if (isNaN(value)) return { amount: null, error: 'סכום לא תקין' };
    return { amount: value };
  }
  
  // Convert to string and clean
  let str = value.toString().trim();
  
  // Remove currency symbols and special characters
  str = str.replace(/[₪$€,\s]/g, '');
  
  // Handle European number format (1.234,56)
  if (str.match(/^\d{1,3}(\.\d{3})*(,\d+)?$/)) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else {
    // Standard format - just replace comma with dot for decimals
    str = str.replace(',', '.');
  }
  
  const num = parseFloat(str);
  if (isNaN(num)) {
    return { amount: null, error: 'סכום לא תקין' };
  }
  
  return { amount: num };
}

/**
 * ניקוי וולידציה של תאריך
 */
export function parseDate(value: any): { date: Date | null; error?: string } {
  if (value === null || value === undefined || value === '') {
    return { date: null, error: 'תאריך חסר' };
  }
  
  // If it's already a Date
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return { date: null, error: 'תאריך לא תקין' };
    return { date: value };
  }
  
  // If it's a number (Excel serial date)
  if (typeof value === 'number') {
    // Excel dates are days since 1899-12-30
    const date = new Date((value - 25569) * 86400 * 1000);
    if (isNaN(date.getTime())) return { date: null, error: 'תאריך לא תקין' };
    return { date };
  }
  
  // Try to parse string
  const str = value.toString().trim();
  
  // Common formats
  const formats = [
    // DD/MM/YYYY
    /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/,
    // YYYY-MM-DD
    /^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/,
    // DD/MM/YY
    /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})$/,
  ];
  
  // Try DD/MM/YYYY
  let match = str.match(formats[0]);
  if (match) {
    const [, day, month, year] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return { date };
  }
  
  // Try YYYY-MM-DD
  match = str.match(formats[1]);
  if (match) {
    const [, year, month, day] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return { date };
  }
  
  // Try DD/MM/YY
  match = str.match(formats[2]);
  if (match) {
    const [, day, month, year] = match;
    const fullYear = parseInt(year) > 50 ? 1900 + parseInt(year) : 2000 + parseInt(year);
    const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return { date };
  }
  
  // Try native Date.parse as last resort
  const parsed = Date.parse(str);
  if (!isNaN(parsed)) {
    const date = new Date(parsed);
    // Validate year is reasonable
    if (date.getFullYear() >= 1900 && date.getFullYear() <= 2100) {
      return { date };
    }
  }
  
  return { date: null, error: 'תאריך לא תקין' };
}

/**
 * ניקוי שם לקוח
 */
export function parseCustomerName(value: any): { name: string | null; error?: string } {
  if (value === null || value === undefined || value === '') {
    return { name: null, error: 'שם לקוח חסר' };
  }
  
  const name = value.toString().trim();
  
  if (name.length < 2) {
    return { name: null, error: 'שם לקוח קצר מדי' };
  }
  
  // Check if it's actually a name (contains letters)
  if (!/[א-תa-zA-Z]/.test(name)) {
    return { name: null, error: 'שם לקוח לא תקין' };
  }
  
  return { name };
}

/**
 * ולידציה של שורת נתונים לפי המיפוי
 */
export function validateRow(
  row: ExcelRow,
  mappings: ColumnMapping[]
): ExcelRow {
  const errors: FieldError[] = [];
  
  const customerNameMapping = mappings.find(m => m.receiptField === 'customerName');
  const amountMapping = mappings.find(m => m.receiptField === 'amount');
  const dateMapping = mappings.find(m => m.receiptField === 'date');
  
  // Check customer name
  if (customerNameMapping) {
    const { error } = parseCustomerName(row.data[customerNameMapping.excelColumn]);
    if (error) {
      errors.push({ field: 'customerName', message: error, severity: 'error' });
    }
  } else {
    errors.push({ field: 'customerName', message: 'לא מופה שדה שם לקוח', severity: 'error' });
  }
  
  // Check amount
  if (amountMapping) {
    const { error } = parseAmount(row.data[amountMapping.excelColumn]);
    if (error) {
      errors.push({ field: 'amount', message: error, severity: 'error' });
    }
  } else {
    errors.push({ field: 'amount', message: 'לא מופה שדה סכום', severity: 'error' });
  }
  
  // Check date
  if (dateMapping) {
    const { error } = parseDate(row.data[dateMapping.excelColumn]);
    if (error) {
      errors.push({ field: 'date', message: error, severity: 'error' });
    }
  } else {
    errors.push({ field: 'date', message: 'לא מופה שדה תאריך', severity: 'error' });
  }
  
  return {
    ...row,
    errors,
    isValid: errors.filter(e => e.severity === 'error').length === 0,
  };
}

/**
 * ולידציה של כל השורות
 */
export function validateAllRows(
  rows: ExcelRow[],
  mappings: ColumnMapping[]
): { validRows: ExcelRow[]; invalidRows: ExcelRow[] } {
  const validatedRows = rows.map(row => validateRow(row, mappings));
  
  return {
    validRows: validatedRows.filter(r => r.isValid),
    invalidRows: validatedRows.filter(r => !r.isValid),
  };
}
