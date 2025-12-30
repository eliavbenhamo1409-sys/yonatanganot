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

// Register Hebrew font - Alef from CDN (more reliable)
try {
  Font.register({
    family: 'Alef',
    fonts: [
      {
        src: 'https://cdn.jsdelivr.net/npm/@fontsource/alef@5.0.5/files/alef-hebrew-400-normal.woff',
        fontWeight: 400,
      },
      {
        src: 'https://cdn.jsdelivr.net/npm/@fontsource/alef@5.0.5/files/alef-hebrew-700-normal.woff',
        fontWeight: 700,
      },
    ],
  });
} catch (e) {
  console.log('[Font] Could not register Alef font:', e);
}

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
      fontFamily: 'Alef',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 30,
      paddingBottom: 20,
      borderBottomWidth: template === 'minimal' ? 1 : 3,
      borderBottomColor: colors.primary,
      borderBottomStyle: 'solid',
    },
    businessSection: {
      width: '50%',
    },
    businessName: {
      fontSize: 22,
      fontWeight: 700,
      color: colors.primary,
      marginBottom: 8,
    },
    businessDetail: {
      fontSize: 10,
      color: colors.textLight,
      marginBottom: 4,
    },
    receiptSection: {
      width: '40%',
      textAlign: 'right',
    },
    receiptTitle: {
      fontSize: 28,
      fontWeight: 700,
      color: colors.primary,
      marginBottom: 8,
    },
    receiptNumber: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 4,
    },
    receiptDate: {
      fontSize: 12,
      color: colors.textLight,
    },
    divider: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      borderBottomStyle: 'solid',
      marginVertical: 15,
    },
    customerSection: {
      marginBottom: 20,
      padding: 15,
      backgroundColor: colors.light,
      borderRadius: template === 'modern' ? 8 : 0,
    },
    customerLabel: {
      fontSize: 11,
      color: colors.textLight,
      marginBottom: 5,
    },
    customerName: {
      fontSize: 16,
      fontWeight: 700,
      color: colors.text,
    },
    detailsSection: {
      marginBottom: 20,
    },
    detailsHeader: {
      flexDirection: 'row',
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 15,
    },
    detailsHeaderText: {
      fontSize: 11,
      fontWeight: 700,
      color: '#ffffff',
    },
    detailsRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      borderBottomStyle: 'solid',
      paddingVertical: 12,
      paddingHorizontal: 15,
    },
    detailsCell: {
      fontSize: 11,
      color: colors.text,
    },
    colDesc: { width: '40%' },
    colDate: { width: '20%' },
    colPayment: { width: '20%' },
    colAmount: { width: '20%', textAlign: 'right' },
    totalSection: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 10,
      marginBottom: 30,
    },
    totalBox: {
      backgroundColor: colors.accent,
      paddingVertical: 12,
      paddingHorizontal: 25,
      borderRadius: template === 'modern' ? 8 : 0,
    },
    totalLabel: {
      fontSize: 12,
      color: '#ffffff',
      marginBottom: 2,
    },
    totalAmount: {
      fontSize: 24,
      fontWeight: 700,
      color: '#ffffff',
    },
    notesSection: {
      marginBottom: 20,
      padding: 12,
      backgroundColor: colors.light,
      borderRadius: 4,
    },
    notesLabel: {
      fontSize: 10,
      fontWeight: 700,
      color: colors.text,
      marginBottom: 4,
    },
    notesText: {
      fontSize: 10,
      color: colors.textLight,
    },
    footer: {
      position: 'absolute',
      bottom: 30,
      left: 40,
      right: 40,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      borderTopStyle: 'solid',
      paddingTop: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    footerText: {
      fontSize: 9,
      color: colors.textLight,
    },
    footerSignature: {
      fontSize: 10,
      fontWeight: 700,
      color: colors.primary,
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
    
    if (isNaN(d.getTime())) return formatTodayDate();
    
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
          <View style={styles.businessSection}>
            <Text style={styles.businessName}>{businessInfo.name || 'שם העסק'}</Text>
            <Text style={styles.businessDetail}>
              {getBusinessTypeHebrew(businessInfo.businessType)} | {businessInfo.businessId || '000000000'}
            </Text>
            {businessInfo.address && <Text style={styles.businessDetail}>{businessInfo.address}</Text>}
            {businessInfo.phone && <Text style={styles.businessDetail}>{businessInfo.phone}</Text>}
            {businessInfo.email && <Text style={styles.businessDetail}>{businessInfo.email}</Text>}
          </View>
          
          <View style={styles.receiptSection}>
            <Text style={styles.receiptTitle}>קבלה</Text>
            <Text style={styles.receiptNumber}>מספר: {receipt.receiptNumber}</Text>
            <Text style={styles.receiptDate}>תאריך: {formattedDate}</Text>
          </View>
        </View>

        {/* Customer */}
        <View style={styles.customerSection}>
          <Text style={styles.customerLabel}>התקבל מאת:</Text>
          <Text style={styles.customerName}>{receipt.customerName || 'לקוח'}</Text>
        </View>

        {/* Details Table */}
        <View style={styles.detailsSection}>
          <View style={styles.detailsHeader}>
            <Text style={[styles.detailsHeaderText, styles.colDesc]}>פירוט</Text>
            <Text style={[styles.detailsHeaderText, styles.colDate]}>תאריך</Text>
            <Text style={[styles.detailsHeaderText, styles.colPayment]}>אמצעי תשלום</Text>
            <Text style={[styles.detailsHeaderText, styles.colAmount]}>סכום</Text>
          </View>
          
          <View style={styles.detailsRow}>
            <Text style={[styles.detailsCell, styles.colDesc]}>{receipt.description || 'תשלום'}</Text>
            <Text style={[styles.detailsCell, styles.colDate]}>{formattedDate}</Text>
            <Text style={[styles.detailsCell, styles.colPayment]}>{receipt.paymentMethod || '-'}</Text>
            <Text style={[styles.detailsCell, styles.colAmount]}>{currencySymbol}{formatNumber(receipt.amount)}</Text>
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalSection}>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>סה"כ שולם</Text>
            <Text style={styles.totalAmount}>{currencySymbol}{formatNumber(receipt.amount)}</Text>
          </View>
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
          <View>
            {businessInfo.vatExempt && <Text style={styles.footerText}>פטור מגביית מע"מ עפ"י סעיף 31 לחוק</Text>}
            <Text style={styles.footerText}>תאריך הפקה: {formatTodayDate()}</Text>
          </View>
          <View>
            <Text style={styles.footerSignature}>מסמך ממוחשב - חתום דיגיטלית</Text>
            <Text style={styles.footerText}>הופק על ידי קבליט</Text>
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
  console.log(`[PDF] Generating receipt ${receipt.receiptNumber} for ${receipt.customerName}`);
  
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
}

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
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  // YYYY-MM-DD
  const yyyymmdd = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (yyyymmdd) {
    const [, year, month, day] = yyyymmdd;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  // DD/MM/YY
  const ddmmyy = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})$/);
  if (ddmmyy) {
    const [, day, month, year] = ddmmyy;
    const fullYear = parseInt(year) > 50 ? 1900 + parseInt(year) : 2000 + parseInt(year);
    return new Date(fullYear, parseInt(month) - 1, parseInt(day));
  }
  
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export async function createZipWithReceipts(
  extractedReceipts: ExtractedReceipt[],
  businessInfo: BusinessInfo,
  settings: ReceiptSettings,
  onProgress?: (progress: number) => void,
  template: ReceiptTemplate = 'classic'
): Promise<Blob> {
  console.log(`[ZIP] Starting generation for ${extractedReceipts?.length || 0} receipts`);
  
  if (!extractedReceipts || extractedReceipts.length === 0) {
    throw new Error('לא נמצאו קבלות לייצור');
  }
  
  const zip = new JSZip();
  const total = extractedReceipts.length;
  let successCount = 0;
  
  for (let i = 0; i < total; i++) {
    const extracted = extractedReceipts[i];
    const receiptNumber = (settings.startingNumber || 1) + i;
    
    console.log(`[ZIP] Processing ${i + 1}/${total}: ${extracted.customerName || 'Unknown'}`);
    
    try {
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
      
      const pdfBlob = await generateSinglePdf(receiptData, businessInfo, settings, template);
      
      if (pdfBlob && pdfBlob.size > 100) {
        const safeName = (extracted.customerName || 'receipt')
          .replace(/[^א-תa-zA-Z0-9\s]/g, '')
          .replace(/\s+/g, '_')
          .substring(0, 30) || 'receipt';
        
        const filename = `kabala_${receiptNumber}_${safeName}.pdf`;
        const arrayBuffer = await pdfBlob.arrayBuffer();
        zip.file(filename, arrayBuffer);
        
        successCount++;
        console.log(`[ZIP] Added: ${filename}`);
      }
    } catch (err) {
      console.error(`[ZIP] Error for receipt ${receiptNumber}:`, err);
    }
    
    const progress = Math.round(((i + 1) / total) * 100);
    onProgress?.(progress);
    
    await new Promise(resolve => setTimeout(resolve, 50));
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
