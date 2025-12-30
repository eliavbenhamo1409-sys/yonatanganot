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

// רישום פונט עברי - David Libre שתומך בעברית באמת
Font.register({
  family: 'David',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/davidlibre/v15/snfus0W_99N64iuYSvp4W8GIw7qbSjORSo9W.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/davidlibre/v15/snfzs0W_99N64iuYSvp4W8l86p6TYS-Y_8kIJ0Vo.ttf',
      fontWeight: 700,
    },
  ],
});

// Disable word hyphenation for Hebrew
Font.registerHyphenationCallback((word) => [word]);

// ====================== DESIGN TEMPLATES ======================

export type ReceiptTemplate = 'classic' | 'modern' | 'minimal';

// Colors for each template
const TEMPLATE_COLORS = {
  classic: {
    primary: '#1a365d',      // Dark blue
    secondary: '#2b6cb0',    // Medium blue
    accent: '#48bb78',       // Green
    light: '#f7fafc',
    border: '#e2e8f0',
    text: '#2d3748',
    textLight: '#718096',
  },
  modern: {
    primary: '#7c3aed',      // Purple
    secondary: '#a78bfa',    // Light purple
    accent: '#10b981',       // Emerald
    light: '#faf5ff',
    border: '#e9d5ff',
    text: '#1f2937',
    textLight: '#6b7280',
  },
  minimal: {
    primary: '#111827',      // Black
    secondary: '#4b5563',    // Gray
    accent: '#059669',       // Green
    light: '#f9fafb',
    border: '#e5e7eb',
    text: '#111827',
    textLight: '#6b7280',
  },
};

// Create styles dynamically based on template
function createStyles(template: ReceiptTemplate) {
  const colors = TEMPLATE_COLORS[template];
  
  return StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      padding: 40,
      fontFamily: 'David',
      direction: 'rtl',
    },
    // Header
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 25,
      paddingBottom: 20,
      borderBottomWidth: template === 'minimal' ? 1 : 3,
      borderBottomColor: colors.primary,
      borderBottomStyle: 'solid',
    },
    businessInfo: {
      textAlign: 'right',
      flex: 1,
    },
    businessName: {
      fontSize: 22,
      fontWeight: 700,
      color: colors.primary,
      marginBottom: 8,
      textAlign: 'right',
    },
    businessDetail: {
      fontSize: 10,
      color: colors.textLight,
      marginBottom: 3,
      textAlign: 'right',
    },
    customerInfo: {
      textAlign: 'left',
      flex: 1,
    },
    customerLabel: {
      fontSize: 10,
      color: colors.textLight,
      marginBottom: 3,
      textAlign: 'left',
    },
    customerName: {
      fontSize: 14,
      fontWeight: 700,
      color: colors.text,
      textAlign: 'left',
    },
    // Receipt title
    titleSection: {
      backgroundColor: colors.primary,
      padding: template === 'modern' ? 15 : 12,
      marginBottom: 20,
      borderRadius: template === 'modern' ? 8 : 0,
      alignItems: 'center',
    },
    titleText: {
      fontSize: 20,
      fontWeight: 700,
      color: '#ffffff',
      textAlign: 'center',
    },
    // Info section
    infoSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
      padding: 15,
      backgroundColor: colors.light,
      borderRadius: template === 'modern' ? 8 : 0,
    },
    infoBlock: {
      alignItems: 'center',
    },
    infoLabel: {
      fontSize: 9,
      color: colors.textLight,
      marginBottom: 4,
    },
    infoValue: {
      fontSize: 12,
      fontWeight: 700,
      color: colors.text,
    },
    // Table
    table: {
      marginTop: 15,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'solid',
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 10,
    },
    tableHeaderCell: {
      fontSize: 11,
      fontWeight: 700,
      color: '#ffffff',
      textAlign: 'center',
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      borderBottomStyle: 'solid',
      paddingVertical: 12,
      paddingHorizontal: 10,
      backgroundColor: '#ffffff',
    },
    tableCell: {
      fontSize: 10,
      color: colors.text,
      textAlign: 'center',
    },
    // Column widths
    col1: { width: '25%' },
    col2: { width: '35%' },
    col3: { width: '20%' },
    col4: { width: '20%' },
    // Total row
    totalSection: {
      flexDirection: 'row',
      backgroundColor: colors.accent,
      paddingVertical: 12,
      paddingHorizontal: 20,
      marginTop: 5,
      borderRadius: template === 'modern' ? 8 : 0,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    totalLabel: {
      fontSize: 14,
      fontWeight: 700,
      color: '#ffffff',
    },
    totalAmount: {
      fontSize: 18,
      fontWeight: 700,
      color: '#ffffff',
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    footerText: {
      fontSize: 8,
      color: colors.textLight,
      marginBottom: 3,
    },
    digitalSignature: {
      fontSize: 10,
      fontWeight: 700,
      color: colors.primary,
      marginTop: 5,
    },
    // Notes section
    notesSection: {
      marginTop: 20,
      padding: 15,
      backgroundColor: colors.light,
      borderRadius: template === 'modern' ? 8 : 0,
      borderLeftWidth: 3,
      borderLeftColor: colors.secondary,
      borderLeftStyle: 'solid',
    },
    notesLabel: {
      fontSize: 10,
      fontWeight: 700,
      color: colors.text,
      marginBottom: 5,
    },
    notesText: {
      fontSize: 9,
      color: colors.textLight,
    },
  });
}

// ====================== HELPER FUNCTIONS ======================

const formatNumber = (num: number): string => {
  if (isNaN(num) || num === null || num === undefined) return '0.00';
  return new Intl.NumberFormat('he-IL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
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

// Reverse Hebrew text for proper display in PDF
const reverseHebrew = (text: string): string => {
  if (!text) return '';
  // Check if contains Hebrew
  if (/[\u0590-\u05FF]/.test(text)) {
    // Split into segments and reverse Hebrew parts
    return text.split('').reverse().join('');
  }
  return text;
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
  
  // Business type text
  const businessTypeMap: Record<string, string> = {
    'osek_patur': 'רוטפ קסוע',
    'osek_morshe': 'השרומ קסוע',
    'company': 'מ"עב הרבח',
  };
  const businessTypeText = businessTypeMap[businessInfo.businessType] || 'קסע';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {/* Customer info - left side */}
          <View style={styles.customerInfo}>
            <Text style={styles.customerLabel}>{reverseHebrew('לכבוד')}</Text>
            <Text style={styles.customerName}>{reverseHebrew(receipt.customerName)}</Text>
          </View>
          
          {/* Business info - right side */}
          <View style={styles.businessInfo}>
            <Text style={styles.businessName}>{reverseHebrew(businessInfo.name)}</Text>
            <Text style={styles.businessDetail}>{businessTypeText} {businessInfo.businessId}</Text>
            {businessInfo.address && (
              <Text style={styles.businessDetail}>{reverseHebrew(businessInfo.address)}</Text>
            )}
            {businessInfo.phone && (
              <Text style={styles.businessDetail}>{reverseHebrew('טלפון')}: {businessInfo.phone}</Text>
            )}
            {businessInfo.email && (
              <Text style={styles.businessDetail}>{businessInfo.email}</Text>
            )}
          </View>
        </View>

        {/* Receipt Title */}
        <View style={styles.titleSection}>
          <Text style={styles.titleText}>{receipt.receiptNumber} {reverseHebrew('קבלה')}</Text>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>{reverseHebrew('אמצעי תשלום')}</Text>
            <Text style={styles.infoValue}>{reverseHebrew(receipt.paymentMethod || 'לא צוין')}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>{reverseHebrew('תאריך')}</Text>
            <Text style={styles.infoValue}>{formattedDate}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>{reverseHebrew('מספר קבלה')}</Text>
            <Text style={styles.infoValue}>{receipt.receiptNumber}</Text>
          </View>
        </View>

        {/* Details Table */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.col4]}>{reverseHebrew('סכום')}</Text>
            <Text style={[styles.tableHeaderCell, styles.col3]}>{reverseHebrew('תאריך')}</Text>
            <Text style={[styles.tableHeaderCell, styles.col2]}>{reverseHebrew('פירוט')}</Text>
            <Text style={[styles.tableHeaderCell, styles.col1]}>{reverseHebrew('סוג תשלום')}</Text>
          </View>
          
          {/* Data Row */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.col4]}>{currencySymbol}{formatNumber(receipt.amount)}</Text>
            <Text style={[styles.tableCell, styles.col3]}>{formattedDate}</Text>
            <Text style={[styles.tableCell, styles.col2]}>{reverseHebrew(receipt.description || 'תשלום')}</Text>
            <Text style={[styles.tableCell, styles.col1]}>{reverseHebrew(receipt.paymentMethod || '-')}</Text>
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalSection}>
          <Text style={styles.totalAmount}>{currencySymbol}{formatNumber(receipt.amount)}</Text>
          <Text style={styles.totalLabel}>{reverseHebrew('סה"כ שולם')}</Text>
        </View>

        {/* Notes */}
        {receipt.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>{reverseHebrew('הערות')}</Text>
            <Text style={styles.notesText}>{reverseHebrew(receipt.notes)}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <View>
              <Text style={styles.footerText}>{formatTodayDate()} :{reverseHebrew('תאריך הפקה')}</Text>
            </View>
            <View>
              <Text style={styles.digitalSignature}>{reverseHebrew('מסמך ממוחשב חתום דיגיטלית')}</Text>
              <Text style={styles.footerText}>{reverseHebrew('הופק על ידי קבליט')}</Text>
            </View>
          </View>
          {businessInfo.vatExempt && (
            <Text style={[styles.footerText, { textAlign: 'center', marginTop: 8 }]}>
              {reverseHebrew('פטור מגביית מע"מ עפ"י סעיף 31 לחוק')}
            </Text>
          )}
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
  try {
    console.log(`[PDF] Generating PDF for receipt ${receipt.receiptNumber}...`);
    
    const doc = (
      <ReceiptDocument
        receipt={receipt}
        businessInfo={businessInfo}
        settings={settings}
        template={template}
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

function parseReceiptDate(dateStr: string | Date | null | undefined): Date {
  if (!dateStr) return new Date();
  
  if (dateStr instanceof Date) {
    return isNaN(dateStr.getTime()) ? new Date() : dateStr;
  }
  
  const str = String(dateStr).trim();
  
  const ddmmyyyy = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }
  
  const yyyymmdd = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (yyyymmdd) {
    const [, year, month, day] = yyyymmdd;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }
  
  const ddmmyy = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})$/);
  if (ddmmyy) {
    const [, day, month, year] = ddmmyy;
    const fullYear = parseInt(year) > 50 ? 1900 + parseInt(year) : 2000 + parseInt(year);
    const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }
  
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
  console.log(`[ZIP] Starting ZIP creation for ${extractedReceipts.length} receipts`);
  
  const zip = new JSZip();
  const total = extractedReceipts.length;
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < extractedReceipts.length; i++) {
    const extracted = extractedReceipts[i];
    const receiptNumber = settings.startingNumber + i;
    
    console.log(`[ZIP] Processing receipt ${i + 1}/${total}: ${extracted.customerName}`);
    
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
      
      if (pdfBlob && pdfBlob.size > 0) {
        const safeName = (extracted.customerName || 'receipt')
          .replace(/[^א-תa-zA-Z0-9\s]/g, '')
          .replace(/\s+/g, '_')
          .trim()
          .substring(0, 30) || 'receipt';
        
        const filename = `kabala_${receiptNumber}_${safeName}.pdf`;
        
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
    
    const progress = Math.round(((i + 1) / total) * 100);
    onProgress?.(progress);
    
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log(`[ZIP] Generation complete: ${successCount} success, ${errorCount} errors`);
  
  const fileCount = Object.keys(zip.files).length;
  if (fileCount === 0) {
    throw new Error('לא נוצרו קבלות. בדוק את הנתונים ונסה שוב.');
  }
  
  console.log(`[ZIP] Creating ZIP file with ${fileCount} files...`);
  
  const zipBlob = await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
  
  console.log(`[ZIP] ZIP created successfully, size: ${zipBlob.size} bytes`);
  
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
