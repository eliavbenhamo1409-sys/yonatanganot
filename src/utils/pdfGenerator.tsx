'use client';

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from '@react-pdf/renderer';
import { BusinessInfo, ReceiptData, ReceiptSettings } from '@/types';
import JSZip from 'jszip';

// רישום פונט עברי - Heebo מ-CDN
Font.register({
  family: 'Heebo',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/@fontsource/heebo@4.5.0/files/heebo-latin-400-normal.woff',
      fontWeight: 400,
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/@fontsource/heebo@4.5.0/files/heebo-latin-700-normal.woff',
      fontWeight: 700,
    },
  ],
});

// Alternative: Register from local or use default
Font.registerHyphenationCallback((word) => [word]);

// צבעים מותאמים לעיצוב
const COLORS = {
  primary: '#0F4C75',
  secondary: '#3FC1C9',
  dark: '#1B262C',
  light: '#F8F9FA',
  border: '#E0E0E0',
  text: '#333333',
  textLight: '#666666',
  white: '#FFFFFF',
};

// סגנונות PDF - עיצוב מקצועי
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: COLORS.white,
    paddingTop: 30,
    paddingBottom: 80,
    paddingHorizontal: 40,
    fontFamily: 'Heebo',
  },
  // Header עליון
  headerTop: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  // פרטי עסק מימין
  businessSection: {
    alignItems: 'flex-end',
    maxWidth: '60%',
  },
  businessName: {
    fontSize: 16,
    fontWeight: 700,
    color: COLORS.primary,
    textAlign: 'right',
    marginBottom: 4,
  },
  businessDetail: {
    fontSize: 9,
    color: COLORS.textLight,
    textAlign: 'right',
    marginBottom: 2,
  },
  // מידע לקוח משמאל
  customerSection: {
    alignItems: 'flex-start',
    maxWidth: '35%',
  },
  customerLabel: {
    fontSize: 9,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  customerName: {
    fontSize: 12,
    fontWeight: 700,
    color: COLORS.dark,
  },
  // כותרת קבלה
  receiptHeader: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 15,
    alignItems: 'center',
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: COLORS.white,
    textAlign: 'center',
  },
  // פרטי קבלה
  receiptInfo: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  infoBlock: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 8,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.dark,
  },
  // תווית צילום מנגנים
  greenLabel: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 6,
    paddingHorizontal: 15,
    marginVertical: 10,
    alignItems: 'center',
  },
  greenLabelText: {
    fontSize: 10,
    fontWeight: 700,
    color: COLORS.white,
  },
  // טבלת פירוט
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tableHeader: {
    flexDirection: 'row-reverse',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 700,
    color: COLORS.white,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row-reverse',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 8,
    paddingHorizontal: 5,
    backgroundColor: COLORS.light,
  },
  tableCell: {
    fontSize: 9,
    color: COLORS.text,
    textAlign: 'center',
  },
  // רוחב עמודות
  col1: { width: '20%' },
  col2: { width: '40%' },
  col3: { width: '20%' },
  col4: { width: '20%' },
  // סה"כ
  totalRow: {
    flexDirection: 'row-reverse',
    backgroundColor: COLORS.secondary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.white,
    width: '60%',
    textAlign: 'right',
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: 700,
    color: COLORS.white,
    width: '40%',
    textAlign: 'left',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerContent: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    alignItems: 'flex-start',
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  footerText: {
    fontSize: 8,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  digitalSignature: {
    fontSize: 9,
    fontWeight: 700,
    color: COLORS.primary,
    marginTop: 5,
  },
});

// פורמט מספר עם פסיקים
const formatNumber = (num: number): string => {
  if (isNaN(num) || num === null || num === undefined) return '0.00';
  return new Intl.NumberFormat('he-IL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

// פורמט תאריך
const formatDateSafe = (date: Date | string | null | undefined): string => {
  try {
    if (!date) return formatTodayDate();
    
    let d: Date;
    if (date instanceof Date) {
      d = date;
    } else if (typeof date === 'string') {
      // Try DD/MM/YYYY format first
      const parts = date.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        d = new Date(year, month, day);
      } else {
        d = new Date(date);
      }
    } else {
      d = new Date();
    }
    
    if (isNaN(d.getTime())) {
      return formatTodayDate();
    }
    
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return formatTodayDate();
  }
};

const formatTodayDate = (): string => {
  const d = new Date();
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// רכיב קבלה - עיצוב כמו בתמונה
interface ReceiptDocumentProps {
  receipt: ReceiptData;
  businessInfo: BusinessInfo;
  settings: ReceiptSettings;
}

export const ReceiptDocument: React.FC<ReceiptDocumentProps> = ({
  receipt,
  businessInfo,
  settings,
}) => {
  const currencySymbol = settings.currencySymbol || '₪';
  const formattedDate = formatDateSafe(receipt.date);
  const formattedAmount = `${formatNumber(receipt.amount)}${currencySymbol}`;
  
  // סוג עסק
  const businessTypeText = businessInfo.businessType === 'osek_patur' ? 'עוסק פטור' : 
    businessInfo.businessType === 'osek_morshe' ? 'עוסק מורשה' : 'חברה בע״מ';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerTop}>
          {/* פרטי עסק מימין */}
          <View style={styles.businessSection}>
            <Text style={styles.businessDetail}>לכבוד: {receipt.customerName}</Text>
            <Text style={styles.businessDetail}>טלפון {businessInfo.phone || '0'}</Text>
            <Text style={styles.businessDetail}>ח.פ / ת.ז {businessInfo.businessId || '0'}</Text>
          </View>
          
          {/* פרטי נמען משמאל */}
          <View style={styles.customerSection}>
            <Text style={styles.businessName}>{businessInfo.name}</Text>
            <Text style={styles.businessDetail}>{businessTypeText} {businessInfo.businessId}</Text>
            <Text style={styles.businessDetail}>כתובת: {businessInfo.address || ''}</Text>
            <Text style={styles.businessDetail}>טלפון: {businessInfo.phone || ''}</Text>
            <Text style={styles.businessDetail}>{businessInfo.email || ''}</Text>
          </View>
        </View>

        {/* כותרת קבלה */}
        <View style={styles.receiptHeader}>
          <Text style={styles.receiptTitle}>קבלה {receipt.receiptNumber}</Text>
        </View>

        {/* מידע נוסף */}
        <View style={styles.receiptInfo}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>העתק נאמן למקור</Text>
            <Text style={styles.infoValue}>{formattedDate}</Text>
          </View>
        </View>

        {/* תווית צילום מנגנים */}
        <View style={styles.greenLabel}>
          <Text style={styles.greenLabelText}>צילום מנגנים</Text>
        </View>

        {/* תווית פרטי תשלומים */}
        <View style={styles.greenLabel}>
          <Text style={styles.greenLabelText}>פרטי תשלומים</Text>
        </View>

        {/* טבלת פירוט */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.col1]}>סוג תשלום</Text>
            <Text style={[styles.tableHeaderCell, styles.col2]}>פרטים</Text>
            <Text style={[styles.tableHeaderCell, styles.col3]}>תאריך</Text>
            <Text style={[styles.tableHeaderCell, styles.col4]}>סה״כ(₪)</Text>
          </View>
          
          {/* Data Row */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.col1]}>
              {receipt.paymentMethod || 'לא צוין'}
            </Text>
            <Text style={[styles.tableCell, styles.col2]}>
              {receipt.description || 'שירות'}
              {receipt.notes ? `, ${receipt.notes}` : ''}
            </Text>
            <Text style={[styles.tableCell, styles.col3]}>{formattedDate}</Text>
            <Text style={[styles.tableCell, styles.col4]}>{formatNumber(receipt.amount)}</Text>
          </View>
        </View>

        {/* סה"כ */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>סה״כ שולם</Text>
          <Text style={styles.totalAmount}>{formattedAmount}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerLeft}>
              <Text style={styles.footerText}>תאריך הפקה: {formatTodayDate()}</Text>
            </View>
            <View style={styles.footerRight}>
              <Text style={styles.digitalSignature}>מסמך ממוחשב חתום דיגיטלית</Text>
              <Text style={styles.footerText}>הופק ע״י קבליט</Text>
            </View>
          </View>
          {businessInfo.vatExempt && (
            <Text style={[styles.footerText, { textAlign: 'center', marginTop: 5 }]}>
              פטור מגביית מע״מ עפ״י סעיף 31 לחוק
            </Text>
          )}
        </View>
      </Page>
    </Document>
  );
};

/**
 * יצירת PDF בודד
 */
export async function generateSinglePdf(
  receipt: ReceiptData,
  businessInfo: BusinessInfo,
  settings: ReceiptSettings
): Promise<Blob> {
  try {
    console.log(`[PDF] Generating PDF for receipt ${receipt.receiptNumber}...`);
    
    const doc = (
      <ReceiptDocument
        receipt={receipt}
        businessInfo={businessInfo}
        settings={settings}
      />
    );
    
    const blob = await pdf(doc).toBlob();
    console.log(`[PDF] Generated PDF, size: ${blob.size} bytes`);
    return blob;
  } catch (error) {
    console.error(`[PDF] Error generating PDF:`, error);
    throw error;
  }
}

// Interface for extracted receipts from AI
interface ExtractedReceipt {
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

/**
 * המרת תאריך מפורמט DD/MM/YYYY ל-Date
 */
function parseReceiptDate(dateStr: string | Date | null | undefined): Date {
  if (!dateStr) return new Date();
  
  if (dateStr instanceof Date) {
    return isNaN(dateStr.getTime()) ? new Date() : dateStr;
  }
  
  const str = String(dateStr).trim();
  
  // Try DD/MM/YYYY
  const ddmmyyyy = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }
  
  // Try YYYY-MM-DD
  const yyyymmdd = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (yyyymmdd) {
    const [, year, month, day] = yyyymmdd;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }
  
  // Try DD/MM/YY
  const ddmmyy = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})$/);
  if (ddmmyy) {
    const [, day, month, year] = ddmmyy;
    const fullYear = parseInt(year) > 50 ? 1900 + parseInt(year) : 2000 + parseInt(year);
    const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }
  
  // Try native parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) return parsed;
  
  return new Date();
}

/**
 * יצירת ZIP עם כל הקבלות - גרסה יציבה
 */
export async function createZipWithReceipts(
  extractedReceipts: ExtractedReceipt[],
  businessInfo: BusinessInfo,
  settings: ReceiptSettings,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  console.log(`[ZIP] Starting ZIP creation for ${extractedReceipts.length} receipts`);
  
  const zip = new JSZip();
  const total = extractedReceipts.length;
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < extractedReceipts.length; i++) {
    const extracted = extractedReceipts[i];
    const receiptNumber = settings.startingNumber + i;
    
    console.log(`[ZIP] Processing receipt ${i + 1}/${total}: ${extracted.customerName}`);
    
    // Convert ExtractedReceipt to ReceiptData
    const receiptData: ReceiptData = {
      id: `receipt-${receiptNumber}-${Date.now()}`,
      receiptNumber,
      customerName: extracted.customerName || 'לקוח',
      amount: typeof extracted.amount === 'number' ? extracted.amount : parseFloat(String(extracted.amount)) || 0,
      date: parseReceiptDate(extracted.date),
      description: extracted.description || '',
      paymentMethod: extracted.paymentMethod || '',
      notes: extracted.notes || '',
      status: 'generated',
    };
    
    try {
      // Generate PDF for this receipt
      const pdfBlob = await generateSinglePdf(receiptData, businessInfo, settings);
      
      if (pdfBlob && pdfBlob.size > 0) {
        // Create filename - sanitize customer name for filename
        const safeName = (extracted.customerName || 'receipt')
          .replace(/[^א-תa-zA-Z0-9\s]/g, '')
          .replace(/\s+/g, '_')
          .trim()
          .substring(0, 30) || 'receipt';
        
        const filename = `kabala_${receiptNumber}_${safeName}.pdf`;
        
        // Add to ZIP
        const arrayBuffer = await pdfBlob.arrayBuffer();
        zip.file(filename, arrayBuffer);
        
        successCount++;
        console.log(`[ZIP] Added ${filename} (${pdfBlob.size} bytes)`);
      } else {
        console.error(`[ZIP] Empty PDF for receipt ${receiptNumber}`);
        errorCount++;
      }
      
    } catch (error) {
      console.error(`[ZIP] Error generating receipt ${receiptNumber}:`, error);
      errorCount++;
    }
    
    // Report progress
    const progress = Math.round(((i + 1) / total) * 100);
    onProgress?.(progress);
    
    // Small delay to prevent overwhelming
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log(`[ZIP] Generation complete: ${successCount} success, ${errorCount} errors`);
  
  // Check if we have any files
  const fileCount = Object.keys(zip.files).length;
  if (fileCount === 0) {
    throw new Error('לא נוצרו קבלות. בדוק את הנתונים ונסה שוב.');
  }
  
  console.log(`[ZIP] Creating ZIP file with ${fileCount} files...`);
  
  // Generate ZIP blob
  const zipBlob = await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
  
  console.log(`[ZIP] ZIP created successfully, size: ${zipBlob.size} bytes`);
  
  return zipBlob;
}

/**
 * יצירת PDF מ-extracted receipt ישירות
 */
export async function generateReceiptPDF(
  extracted: ExtractedReceipt,
  businessInfo: BusinessInfo,
  settings: ReceiptSettings,
  receiptNumber: number
): Promise<Blob> {
  const receiptData: ReceiptData = {
    id: `receipt-${receiptNumber}`,
    receiptNumber,
    customerName: extracted.customerName || 'לקוח',
    amount: extracted.amount || 0,
    date: parseReceiptDate(extracted.date),
    description: extracted.description || '',
    paymentMethod: extracted.paymentMethod || '',
    notes: extracted.notes || '',
    status: 'generated',
  };
  
  return generateSinglePdf(receiptData, businessInfo, settings);
}

/**
 * הורדת PDF בודד
 */
export function downloadPdf(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
