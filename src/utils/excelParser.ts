import * as XLSX from 'xlsx';
import { ExcelRow, ColumnMapping, ReceiptField, FIELD_KEYWORDS, FieldError } from '@/types';

/**
 * קריאת קובץ אקסל והמרה למערך נתונים
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
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        
        // קח את הגיליון הראשון
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // המר ל-JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (jsonData.length < 2) {
          reject(new Error('הקובץ ריק או מכיל רק כותרות'));
          return;
        }
        
        // שורה ראשונה = כותרות
        const headers = (jsonData[0] as any[]).map((h, i) => 
          h?.toString().trim() || `עמודה ${i + 1}`
        );
        
        // שאר השורות = נתונים
        const rows: ExcelRow[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const rowData: Record<string, any> = {};
          const row = jsonData[i] as any[];
          
          // דלג על שורות ריקות
          if (!row || row.every(cell => cell === null || cell === undefined || cell === '')) {
            continue;
          }
          
          headers.forEach((header, j) => {
            rowData[header] = row[j];
          });
          
          rows.push({
            rowNumber: i + 1, // מספר שורה מקורי (1-based + header)
            data: rowData,
            errors: [],
            isValid: true,
          });
        }
        
        resolve({ headers, rows });
      } catch (error) {
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
 * זיהוי אוטומטי של מיפוי עמודות על בסיס שמות הכותרות
 */
export function suggestColumnMappings(headers: string[]): ColumnMapping[] {
  const mappings: ColumnMapping[] = [];
  const usedFields = new Set<ReceiptField>();
  
  for (const header of headers) {
    const normalizedHeader = header.toLowerCase().trim();
    let bestMatch: { field: ReceiptField; score: number } | null = null;
    
    // חפש התאמה בכל השדות
    for (const [field, keywords] of Object.entries(FIELD_KEYWORDS) as [ReceiptField, string[]][]) {
      if (field === 'ignore' || usedFields.has(field)) continue;
      
      for (const keyword of keywords) {
        const normalizedKeyword = keyword.toLowerCase();
        
        // התאמה מדויקת
        if (normalizedHeader === normalizedKeyword) {
          bestMatch = { field, score: 1.0 };
          break;
        }
        
        // הכותרת מכילה את מילת המפתח
        if (normalizedHeader.includes(normalizedKeyword)) {
          const score = normalizedKeyword.length / normalizedHeader.length * 0.9;
          if (!bestMatch || score > bestMatch.score) {
            bestMatch = { field, score };
          }
        }
        
        // מילת המפתח מכילה את הכותרת
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
 * ניקוי וולידציה של ערך סכום
 */
export function parseAmount(value: any): { amount: number | null; error?: string } {
  if (value === null || value === undefined || value === '') {
    return { amount: null, error: 'סכום חסר' };
  }
  
  // אם זה כבר מספר
  if (typeof value === 'number') {
    if (isNaN(value)) return { amount: null, error: 'סכום לא תקין' };
    return { amount: value };
  }
  
  // המר למחרוזת ונקה
  let str = value.toString().trim();
  
  // הסר סימני מטבע וסימנים מיוחדים
  str = str.replace(/[₪$€,\s]/g, '');
  
  // החלף נקודה עשרונית אם צריך
  str = str.replace(/,/g, '.');
  
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
  
  // אם זה כבר Date
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return { date: null, error: 'תאריך לא תקין' };
    return { date: value };
  }
  
  // אם זה מספר (Excel serial date)
  if (typeof value === 'number') {
    // Excel dates are days since 1900-01-01
    const date = new Date((value - 25569) * 86400 * 1000);
    if (isNaN(date.getTime())) return { date: null, error: 'תאריך לא תקין' };
    return { date };
  }
  
  // נסה לפרסר מחרוזת
  const str = value.toString().trim();
  
  // פורמטים נפוצים
  const formats = [
    // DD/MM/YYYY
    /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/,
    // YYYY-MM-DD
    /^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/,
  ];
  
  let match = str.match(formats[0]);
  if (match) {
    const [, day, month, year] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return { date };
  }
  
  match = str.match(formats[1]);
  if (match) {
    const [, year, month, day] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return { date };
  }
  
  // נסה Date.parse כמוצא אחרון
  const parsed = Date.parse(str);
  if (!isNaN(parsed)) {
    return { date: new Date(parsed) };
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
  
  // בדוק שם לקוח
  if (customerNameMapping) {
    const { error } = parseCustomerName(row.data[customerNameMapping.excelColumn]);
    if (error) {
      errors.push({ field: 'customerName', message: error, severity: 'error' });
    }
  } else {
    errors.push({ field: 'customerName', message: 'לא מופה שדה שם לקוח', severity: 'error' });
  }
  
  // בדוק סכום
  if (amountMapping) {
    const { error } = parseAmount(row.data[amountMapping.excelColumn]);
    if (error) {
      errors.push({ field: 'amount', message: error, severity: 'error' });
    }
  } else {
    errors.push({ field: 'amount', message: 'לא מופה שדה סכום', severity: 'error' });
  }
  
  // בדוק תאריך
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

