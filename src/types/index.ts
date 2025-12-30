// ==================== TYPES & INTERFACES ====================

// פרטי עסק
export interface BusinessInfo {
  id: string;
  name: string; // שם העסק
  businessId: string; // ח.פ / עוסק מורשה / עוסק פטור
  businessType: 'osek_morshe' | 'osek_patur' | 'company'; // סוג עסק
  address: string; // כתובת
  phone: string; // טלפון
  email: string; // אימייל
  logo?: string; // לוגו (base64 או URL)
  signature?: string; // חתימה (base64 או URL)
  bankDetails?: {
    bankName: string;
    branchNumber: string;
    accountNumber: string;
  };
  footerText?: string; // טקסט קבוע בתחתית
  vatExempt: boolean; // פטור ממע"מ
  vatRate: number; // אחוז מע"מ (17 בד"כ)
}

// הגדרות תבנית קבלה
export interface ReceiptSettings {
  startingNumber: number; // מספר קבלה מתחיל
  currentNumber: number; // מספר קבלה נוכחי
  dateFormat: 'dd/MM/yyyy' | 'yyyy-MM-dd' | 'dd.MM.yyyy';
  currency: 'ILS' | 'USD' | 'EUR';
  currencySymbol: '₪' | '$' | '€';
  includeVat: boolean;
  templateId: string;
}

// שורה בקובץ אקסל
export interface ExcelRow {
  rowNumber: number;
  data: Record<string, any>;
  errors: FieldError[];
  isValid: boolean;
}

// שגיאת שדה
export interface FieldError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

// מיפוי עמודות
export interface ColumnMapping {
  excelColumn: string; // שם העמודה באקסל
  receiptField: ReceiptField; // שדה בקבלה
  confidence?: number; // רמת ביטחון של ה-AI
  isManual: boolean; // האם נבחר ידנית
}

// שדות אפשריים בקבלה
export type ReceiptField = 
  | 'customerName' // שם לקוח
  | 'amount' // סכום
  | 'date' // תאריך
  | 'description' // תיאור/פירוט
  | 'paymentMethod' // אמצעי תשלום
  | 'transactionId' // מספר עסקה
  | 'notes' // הערות
  | 'ignore'; // התעלם

// מידע לקבלה בודדת
export interface ReceiptData {
  id: string;
  receiptNumber: number;
  customerName: string;
  amount: number;
  date: Date;
  description: string;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  status: 'pending' | 'generated' | 'error';
  errorMessage?: string;
  pdfUrl?: string;
}

// הרצת Batch
export interface BatchRun {
  id: string;
  createdAt: Date;
  fileName: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  status: 'processing' | 'completed' | 'failed';
  receipts: ReceiptData[];
  zipUrl?: string;
  mergedPdfUrl?: string;
}

// תבנית קבלה
export interface ReceiptTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  isDefault: boolean;
}

// שדות קבלה עם מידע לתצוגה
export const RECEIPT_FIELDS: Record<ReceiptField, { label: string; required: boolean; type: string }> = {
  customerName: { label: 'שם לקוח', required: true, type: 'text' },
  amount: { label: 'סכום', required: true, type: 'number' },
  date: { label: 'תאריך', required: true, type: 'date' },
  description: { label: 'תיאור/פירוט', required: false, type: 'text' },
  paymentMethod: { label: 'אמצעי תשלום', required: false, type: 'text' },
  transactionId: { label: 'מספר עסקה', required: false, type: 'text' },
  notes: { label: 'הערות', required: false, type: 'text' },
  ignore: { label: 'התעלם', required: false, type: 'none' },
};

// מילות מפתח לזיהוי AI
export const FIELD_KEYWORDS: Record<ReceiptField, string[]> = {
  customerName: ['שם', 'לקוח', 'לקוחה', 'שם לקוח', 'customer', 'name', 'client', 'מקבל'],
  amount: ['סכום', 'סה"כ', 'סהכ', 'מחיר', 'עלות', 'amount', 'total', 'price', 'sum', 'שולם'],
  date: ['תאריך', 'date', 'יום', 'תאריך תשלום'],
  description: ['תיאור', 'פירוט', 'שירות', 'מוצר', 'description', 'details', 'service', 'product'],
  paymentMethod: ['אמצעי תשלום', 'תשלום', 'payment', 'method', 'צ\'יק', 'מזומן', 'העברה', 'אשראי'],
  transactionId: ['מספר עסקה', 'אסמכתא', 'reference', 'transaction', 'id', 'מספר'],
  notes: ['הערות', 'הערה', 'notes', 'note', 'comments'],
  ignore: [],
};

