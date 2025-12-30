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

// Register Hebrew font - Rubik from Google Fonts
Font.register({
  family: 'Rubik',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/rubik/v28/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-B4iFV0U1.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/rubik/v28/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-NYiFV0U1.ttf',
      fontWeight: 700,
    },
  ],
});

// Disable word hyphenation
Font.registerHyphenationCallback((word) => [word]);

// ====================== DESIGN TEMPLATES ======================

export type ReceiptTemplate = 'classic' | 'modern' | 'minimal';

const TEMPLATE_COLORS = {
  classic: {
    primary: '#1a365d',
    secondary: '#2b6cb0',
    accent: '#38a169',
    light: '#f7fafc',
    border: '#e2e8f0',
    text: '#2d3748',
    textLight: '#718096',
  },
  modern: {
    primary: '#7c3aed',
    secondary: '#a78bfa',
    accent: '#10b981',
    light: '#faf5ff',
    border: '#e9d5ff',
    text: '#1f2937',
    textLight: '#6b7280',
  },
  minimal: {
    primary: '#111827',
    secondary: '#4b5563',
    accent: '#059669',
    light: '#f9fafb',
    border: '#e5e7eb',
    text: '#111827',
    textLight: '#6b7280',
  },
};

function createStyles(template: ReceiptTemplate) {
  const colors = TEMPLATE_COLORS[template];
  
  return StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      padding: 40,
      fontFamily: 'Rubik',
    },
    // Header - RTL layout
    header: {
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      marginBottom: 30,
      paddingBottom: 20,
      borderBottomWidth: template === 'minimal' ? 1 : 3,
      borderBottomColor: colors.primary,
      borderBottomStyle: 'solid',
    },
    businessInfo: {
      textAlign: 'right',
      maxWidth: '55%',
    },
    businessName: {
      fontSize: 24,
      fontWeight: 700,
      color: colors.primary,
      marginBottom: 8,
      textAlign: 'right',
    },
    businessDetail: {
      fontSize: 10,
      color: colors.textLight,
      marginBottom: 4,
      textAlign: 'right',
    },
    receiptInfo: {
      textAlign: 'left',
      maxWidth: '40%',
    },
    receiptNumber: {
      fontSize: 14,
      fontWeight: 700,
      color: colors.primary,
      marginBottom: 4,
      textAlign: 'left',
    },
    receiptDate: {
      fontSize: 11,
      color: colors.textLight,
      textAlign: 'left',
    },
    // Title bar
    titleBar: {
      backgroundColor: colors.primary,
      padding: 15,
      marginBottom: 25,
      borderRadius: template === 'modern' ? 8 : 0,
    },
    titleText: {
      fontSize: 20,
      fontWeight: 700,
      color: '#ffffff',
      textAlign: 'center',
    },
    // Customer section
    customerSection: {
      marginBottom: 25,
      padding: 15,
      backgroundColor: colors.light,
      borderRadius: template === 'modern' ? 8 : 0,
      borderRightWidth: 4,
      borderRightColor: colors.secondary,
      borderRightStyle: 'solid',
    },
    customerLabel: {
      fontSize: 10,
      color: colors.textLight,
      marginBottom: 5,
      textAlign: 'right',
    },
    customerName: {
      fontSize: 16,
      fontWeight: 700,
      color: colors.text,
      textAlign: 'right',
    },
    // Details table
    table: {
      marginBottom: 25,
    },
    tableHeader: {
      flexDirection: 'row-reverse',
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 15,
    },
    tableHeaderCell: {
      fontSize: 11,
      fontWeight: 700,
      color: '#ffffff',
      textAlign: 'center',
    },
    tableRow: {
      flexDirection: 'row-reverse',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      borderBottomStyle: 'solid',
      paddingVertical: 12,
      paddingHorizontal: 15,
      backgroundColor: '#ffffff',
    },
    tableCell: {
      fontSize: 11,
      color: colors.text,
      textAlign: 'center',
    },
    col1: { width: '30%' },
    col2: { width: '25%' },
    col3: { width: '25%' },
    col4: { width: '20%' },
    // Total section
    totalSection: {
      flexDirection: 'row-reverse',
      backgroundColor: colors.accent,
      paddingVertical: 15,
      paddingHorizontal: 25,
      borderRadius: template === 'modern' ? 8 : 0,
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    totalLabel: {
      fontSize: 16,
      fontWeight: 700,
      color: '#ffffff',
    },
    totalAmount: {
      fontSize: 22,
      fontWeight: 700,
      color: '#ffffff',
    },
    // Notes
    notesSection: {
      marginBottom: 25,
      padding: 15,
      backgroundColor: colors.light,
      borderRadius: template === 'modern' ? 8 : 0,
    },
    notesLabel: {
      fontSize: 11,
      fontWeight: 700,
      color: colors.text,
      marginBottom: 5,
      textAlign: 'right',
    },
    notesText: {
      fontSize: 10,
      color: colors.textLight,
      textAlign: 'right',
    },
    // Footer
    footer: {
      position: 'absolute',
      bottom: 30,
      left: 40,
      right: 40,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      borderTopStyle: 'solid',
      paddingTop: 15,
    },
    footerRow: {
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    footerText: {
      fontSize: 9,
      color: colors.textLight,
      textAlign: 'right',
    },
    signatureText: {
      fontSize: 10,
      fontWeight: 700,
      color: colors.primary,
      textAlign: 'left',
    },
  });
}

// ====================== HELPER FUNCTIONS ======================

const formatNumber = (num: number): string => {
  if (isNaN(num) || num === null || num === undefined) return '0.00';
  return num.toLocaleString('he-IL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDateSafe = (date: Date | string | null | undefined): string => {
  try {
    if (!date) return formatTodayDate();
    
    let d: Date;
    if (date instanceof Date) {
      d = date;
    } else if (typeof date === 'string') {
      // Try DD/MM/YYYY format
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

// Business type in Hebrew
const getBusinessTypeHebrew = (type: string): string => {
  const types: Record<string, string> = {
    'osek_patur': 'עוסק פטור',
    'osek_morshe': 'עוסק מורשה',
    'company': 'חברה בע"מ',
  };
  return types[type] || 'עסק';
};

// ====================== RECEIPT COMPONENT ======================

interface ReceiptDocumentProps {
  receipt: ReceiptData;
  businessInfo: BusinessInfo;
  settings: ReceiptSettings;
  template?: ReceiptTemplate;
}

export const ReceiptDocument: React.FC<ReceiptDocumentProps> = ({
  receipt,
  businessInfo,
  settings,
  template = 'classic',
}) => {
  const styles = createStyles(template);
  const currencySymbol = settings.currencySymbol || '₪';
  const formattedDate = formatDateSafe(receipt.date);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {/* Business Info - Right side */}
          <View style={styles.businessInfo}>
            <Text style={styles.businessName}>{businessInfo.name}</Text>
            <Text style={styles.businessDetail}>
              {getBusinessTypeHebrew(businessInfo.businessType)} | {businessInfo.businessId}
            </Text>
            {businessInfo.address && (
              <Text style={styles.businessDetail}>{businessInfo.address}</Text>
            )}
            {businessInfo.phone && (
              <Text style={styles.businessDetail}>{businessInfo.phone}</Text>
            )}
            {businessInfo.email && (
              <Text style={styles.businessDetail}>{businessInfo.email}</Text>
            )}
          </View>
          
          {/* Receipt Info - Left side */}
          <View style={styles.receiptInfo}>
            <Text style={styles.receiptNumber}>קבלה מס׳ {receipt.receiptNumber}</Text>
            <Text style={styles.receiptDate}>תאריך: {formattedDate}</Text>
          </View>
        </View>

        {/* Title Bar */}
        <View style={styles.titleBar}>
          <Text style={styles.titleText}>קבלה</Text>
        </View>

        {/* Customer Section */}
        <View style={styles.customerSection}>
          <Text style={styles.customerLabel}>התקבל מאת:</Text>
          <Text style={styles.customerName}>{receipt.customerName || 'לקוח'}</Text>
        </View>

        {/* Details Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.col1]}>סכום</Text>
            <Text style={[styles.tableHeaderCell, styles.col2]}>אמצעי תשלום</Text>
            <Text style={[styles.tableHeaderCell, styles.col3]}>תאריך</Text>
            <Text style={[styles.tableHeaderCell, styles.col4]}>פירוט</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.col1]}>
              {currencySymbol}{formatNumber(receipt.amount)}
            </Text>
            <Text style={[styles.tableCell, styles.col2]}>
              {receipt.paymentMethod || '-'}
            </Text>
            <Text style={[styles.tableCell, styles.col3]}>
              {formattedDate}
            </Text>
            <Text style={[styles.tableCell, styles.col4]}>
              {receipt.description || 'תשלום'}
            </Text>
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>סה״כ שולם</Text>
          <Text style={styles.totalAmount}>
            {currencySymbol}{formatNumber(receipt.amount)}
          </Text>
        </View>

        {/* Notes */}
        {receipt.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>הערות:</Text>
            <Text style={styles.notesText}>{receipt.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <View>
              <Text style={styles.footerText}>
                {businessInfo.vatExempt ? 'פטור מגביית מע"מ עפ"י סעיף 31 לחוק' : ''}
              </Text>
              <Text style={styles.footerText}>תאריך הפקה: {formatTodayDate()}</Text>
            </View>
            <View>
              <Text style={styles.signatureText}>מסמך ממוחשב - חתום דיגיטלית</Text>
              <Text style={styles.footerText}>הופק על ידי קבליט</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// ====================== PDF GENERATION FUNCTIONS ======================

export async function generateSinglePdf(
  receipt: ReceiptData,
  businessInfo: BusinessInfo,
  settings: ReceiptSettings,
  template: ReceiptTemplate = 'classic'
): Promise<Blob> {
  console.log(`[PDF] Generating receipt ${receipt.receiptNumber} for ${receipt.customerName}...`);
  
  try {
    const doc = (
      <ReceiptDocument
        receipt={receipt}
        businessInfo={businessInfo}
        settings={settings}
        template={template}
      />
    );
    
    const blob = await pdf(doc).toBlob();
    console.log(`[PDF] Success - size: ${blob.size} bytes`);
    return blob;
  } catch (error) {
    console.error(`[PDF] Error:`, error);
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

function parseReceiptDate(dateStr: string | Date | null | undefined): Date {
  if (!dateStr) return new Date();
  
  if (dateStr instanceof Date) {
    return isNaN(dateStr.getTime()) ? new Date() : dateStr;
  }
  
  const str = String(dateStr).trim();
  
  // DD/MM/YYYY
  const ddmmyyyy = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }
  
  // YYYY-MM-DD
  const yyyymmdd = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (yyyymmdd) {
    const [, year, month, day] = yyyymmdd;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }
  
  // DD/MM/YY
  const ddmmyy = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})$/);
  if (ddmmyy) {
    const [, day, month, year] = ddmmyy;
    const fullYear = parseInt(year) > 50 ? 1900 + parseInt(year) : 2000 + parseInt(year);
    const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }
  
  // Try native parsing
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) return parsed;
  
  return new Date();
}

export async function createZipWithReceipts(
  extractedReceipts: ExtractedReceipt[],
  businessInfo: BusinessInfo,
  settings: ReceiptSettings,
  onProgress?: (progress: number) => void,
  template: ReceiptTemplate = 'classic'
): Promise<Blob> {
  console.log(`[ZIP] Starting generation for ${extractedReceipts.length} receipts`);
  
  if (!extractedReceipts || extractedReceipts.length === 0) {
    throw new Error('לא נמצאו קבלות לייצור');
  }
  
  const zip = new JSZip();
  const total = extractedReceipts.length;
  let successCount = 0;
  
  for (let i = 0; i < extractedReceipts.length; i++) {
    const extracted = extractedReceipts[i];
    const receiptNumber = settings.startingNumber + i;
    
    console.log(`[ZIP] Processing ${i + 1}/${total}: ${extracted.customerName || 'Unknown'}`);
    
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
      const pdfBlob = await generateSinglePdf(receiptData, businessInfo, settings, template);
      
      if (pdfBlob && pdfBlob.size > 100) {
        // Create safe filename
        const safeName = (extracted.customerName || 'receipt')
          .replace(/[^א-תa-zA-Z0-9\s]/g, '')
          .replace(/\s+/g, '_')
          .substring(0, 30) || 'receipt';
        
        const filename = `kabala_${receiptNumber}_${safeName}.pdf`;
        
        const arrayBuffer = await pdfBlob.arrayBuffer();
        zip.file(filename, arrayBuffer);
        
        successCount++;
        console.log(`[ZIP] Added: ${filename} (${pdfBlob.size} bytes)`);
      }
    } catch (error) {
      console.error(`[ZIP] Error for receipt ${receiptNumber}:`, error);
    }
    
    // Update progress
    const progress = Math.round(((i + 1) / total) * 100);
    onProgress?.(progress);
    
    // Small delay between PDFs
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`[ZIP] Complete: ${successCount}/${total} receipts`);
  
  if (successCount === 0) {
    throw new Error('לא נוצרו קבלות. בדוק את הנתונים ונסה שוב.');
  }
  
  const zipBlob = await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
  
  console.log(`[ZIP] Final size: ${zipBlob.size} bytes`);
  
  return zipBlob;
}

export async function generateReceiptPDF(
  extracted: ExtractedReceipt,
  businessInfo: BusinessInfo,
  settings: ReceiptSettings,
  receiptNumber: number,
  template: ReceiptTemplate = 'classic'
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
  
  return generateSinglePdf(receiptData, businessInfo, settings, template);
}

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
