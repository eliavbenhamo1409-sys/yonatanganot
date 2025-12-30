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
import { format } from 'date-fns';
import { BusinessInfo, ReceiptData, ReceiptSettings } from '@/types';
import JSZip from 'jszip';

// רישום פונט עברי - נשתמש ב-Rubik מ-Google Fonts
Font.register({
  family: 'Rubik',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/rubik/v28/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-B4iFV0U1dYPFkZVO.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/rubik/v28/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-B4iFWUc1dYPFkZVO.ttf',
      fontWeight: 700,
    },
  ],
});

// סגנונות PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Rubik',
  },
  // Header
  header: {
    flexDirection: 'row-reverse', // RTL
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#0F4C75',
  },
  businessInfo: {
    alignItems: 'flex-end',
  },
  businessName: {
    fontSize: 18,
    fontWeight: 700,
    color: '#0F4C75',
    textAlign: 'right',
  },
  businessDetails: {
    fontSize: 10,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: 'contain',
  },
  // Receipt Title
  receiptTitle: {
    backgroundColor: '#0F4C75',
    padding: 12,
    marginBottom: 20,
    borderRadius: 4,
  },
  receiptTitleText: {
    fontSize: 20,
    fontWeight: 700,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // Info Rows
  infoSection: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoColumn: {
    alignItems: 'flex-end',
  },
  infoRow: {
    flexDirection: 'row-reverse',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 11,
    color: '#666',
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: 700,
    color: '#333',
  },
  // Table
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row-reverse',
    backgroundColor: '#0F4C75',
    padding: 10,
    borderRadius: 4,
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: 700,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row-reverse',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    padding: 10,
  },
  tableCell: {
    fontSize: 10,
    color: '#333',
    textAlign: 'center',
  },
  // Columns widths
  colDescription: { width: '40%' },
  colPayment: { width: '20%' },
  colDate: { width: '20%' },
  colAmount: { width: '20%' },
  // Total
  totalSection: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#0F4C75',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: '#0F4C75',
    marginLeft: 20,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 700,
    color: '#0F4C75',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 9,
    color: '#888',
    textAlign: 'center',
    marginBottom: 4,
  },
  signature: {
    marginTop: 10,
    alignItems: 'center',
  },
  signatureImage: {
    width: 100,
    height: 50,
    objectFit: 'contain',
  },
  signatureText: {
    fontSize: 8,
    color: '#888',
    marginTop: 4,
  },
  // Digital stamp
  digitalStamp: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#0F4C75',
    borderRadius: 4,
    alignItems: 'center',
  },
  digitalStampText: {
    fontSize: 9,
    color: '#0F4C75',
    fontWeight: 700,
  },
});

// פורמט מספר עם פסיקים
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('he-IL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

// פורמט תאריך
const formatDate = (date: Date, dateFormat: string): string => {
  try {
    return format(date, dateFormat);
  } catch {
    return format(new Date(), dateFormat);
  }
};

// רכיב קבלה
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
  const formattedDate = formatDate(new Date(receipt.date), settings.dateFormat);
  const formattedAmount = `${currencySymbol}${formatNumber(receipt.amount)}`;
  
  // חישוב מע"מ אם צריך
  const vatAmount = settings.includeVat && !businessInfo.vatExempt
    ? receipt.amount * (businessInfo.vatRate / 100)
    : 0;
  const totalWithVat = receipt.amount + vatAmount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header - Business Info */}
        <View style={styles.header}>
          <View style={styles.businessInfo}>
            <Text style={styles.businessName}>{businessInfo.name}</Text>
            <Text style={styles.businessDetails}>
              {businessInfo.businessType === 'osek_patur' ? 'עוסק פטור' : 
               businessInfo.businessType === 'osek_morshe' ? 'עוסק מורשה' : 'חברה בע"מ'}{' '}
              {businessInfo.businessId}
            </Text>
            <Text style={styles.businessDetails}>{businessInfo.address}</Text>
            <Text style={styles.businessDetails}>טלפון: {businessInfo.phone}</Text>
            <Text style={styles.businessDetails}>{businessInfo.email}</Text>
          </View>
        </View>

        {/* Receipt Title */}
        <View style={styles.receiptTitle}>
          <Text style={styles.receiptTitleText}>קבלה מס׳ {receipt.receiptNumber}</Text>
        </View>

        {/* Receipt Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoColumn}>
            <View style={styles.infoRow}>
              <Text style={styles.infoValue}>{receipt.customerName}</Text>
              <Text style={styles.infoLabel}>לכבוד:</Text>
            </View>
          </View>
          <View style={styles.infoColumn}>
            <View style={styles.infoRow}>
              <Text style={styles.infoValue}>{formattedDate}</Text>
              <Text style={styles.infoLabel}>תאריך:</Text>
            </View>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colAmount]}>סכום</Text>
            <Text style={[styles.tableHeaderCell, styles.colDate]}>תאריך</Text>
            <Text style={[styles.tableHeaderCell, styles.colPayment]}>אמצעי תשלום</Text>
            <Text style={[styles.tableHeaderCell, styles.colDescription]}>פירוט</Text>
          </View>
          
          {/* Row */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.colAmount]}>{formattedAmount}</Text>
            <Text style={[styles.tableCell, styles.colDate]}>{formattedDate}</Text>
            <Text style={[styles.tableCell, styles.colPayment]}>
              {receipt.paymentMethod || 'לא צוין'}
            </Text>
            <Text style={[styles.tableCell, styles.colDescription]}>
              {receipt.description || 'שירות'}
            </Text>
          </View>
        </View>

        {/* VAT Details (if applicable) */}
        {settings.includeVat && !businessInfo.vatExempt && (
          <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
            <View style={styles.infoRow}>
              <Text style={styles.infoValue}>
                {currencySymbol}{formatNumber(receipt.amount)}
              </Text>
              <Text style={styles.infoLabel}>סכום לפני מע"מ:</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoValue}>
                {currencySymbol}{formatNumber(vatAmount)}
              </Text>
              <Text style={styles.infoLabel}>מע"מ ({businessInfo.vatRate}%):</Text>
            </View>
          </View>
        )}

        {/* Total */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>סה"כ שולם:</Text>
          <Text style={styles.totalAmount}>
            {currencySymbol}{formatNumber(settings.includeVat ? totalWithVat : receipt.amount)}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {businessInfo.footerText && (
            <Text style={styles.footerText}>{businessInfo.footerText}</Text>
          )}
          {businessInfo.vatExempt && (
            <Text style={styles.footerText}>פטור מגביית מע"מ עפ"י סעיף 31 לחוק</Text>
          )}
          <Text style={styles.footerText}>
            מסמך ממוחשב - תאריך הפקה: {formatDate(new Date(), 'dd/MM/yyyy')}
          </Text>
          
          {/* Digital Stamp */}
          <View style={styles.digitalStamp}>
            <Text style={styles.digitalStampText}>מסמך ממוחשב חתום דיגיטלית</Text>
          </View>
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
  const doc = (
    <ReceiptDocument
      receipt={receipt}
      businessInfo={businessInfo}
      settings={settings}
    />
  );
  
  const blob = await pdf(doc).toBlob();
  return blob;
}

/**
 * יצירת מערך של PDFs
 */
export async function generateMultiplePdfs(
  receipts: ReceiptData[],
  businessInfo: BusinessInfo,
  settings: ReceiptSettings,
  onProgress?: (current: number, total: number) => void
): Promise<{ receipt: ReceiptData; blob: Blob }[]> {
  const results: { receipt: ReceiptData; blob: Blob }[] = [];
  
  for (let i = 0; i < receipts.length; i++) {
    const receipt = receipts[i];
    try {
      const blob = await generateSinglePdf(receipt, businessInfo, settings);
      results.push({ receipt, blob });
    } catch (error) {
      console.error(`Error generating PDF for receipt ${receipt.receiptNumber}:`, error);
    }
    
    onProgress?.(i + 1, receipts.length);
  }
  
  return results;
}

/**
 * הורדת PDF
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
function parseReceiptDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  
  // Try DD/MM/YYYY
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  
  // Try to parse as is
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  
  return new Date();
}

/**
 * יצירת ZIP עם כל הקבלות
 */
export async function createZipWithReceipts(
  extractedReceipts: ExtractedReceipt[],
  businessInfo: BusinessInfo,
  settings: ReceiptSettings,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const zip = new JSZip();
  const total = extractedReceipts.length;
  
  for (let i = 0; i < extractedReceipts.length; i++) {
    const extracted = extractedReceipts[i];
    const receiptNumber = settings.startingNumber + i;
    
    // Convert ExtractedReceipt to ReceiptData
    const receiptData: ReceiptData = {
      id: crypto.randomUUID(),
      receiptNumber,
      customerName: extracted.customerName || 'לא ידוע',
      amount: extracted.amount || 0,
      date: parseReceiptDate(extracted.date),
      description: extracted.description || 'שירות',
      paymentMethod: extracted.paymentMethod,
      notes: extracted.notes,
      status: extracted.isComplete ? 'generated' : 'error',
    };
    
    try {
      // Generate PDF for this receipt
      const pdfBlob = await generateSinglePdf(receiptData, businessInfo, settings);
      
      // Create filename - sanitize customer name for filename
      const safeName = (extracted.customerName || 'receipt')
        .replace(/[^א-תa-zA-Z0-9\s]/g, '')
        .trim()
        .substring(0, 30);
      const filename = `receipt_${receiptNumber}_${safeName}.pdf`;
      
      // Add to ZIP
      const arrayBuffer = await pdfBlob.arrayBuffer();
      zip.file(filename, arrayBuffer);
      
    } catch (error) {
      console.error(`Error generating receipt ${receiptNumber}:`, error);
    }
    
    // Report progress
    onProgress?.((i + 1) / total * 100);
  }
  
  // Generate ZIP blob
  const zipBlob = await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
  
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
    id: crypto.randomUUID(),
    receiptNumber,
    customerName: extracted.customerName || 'לא ידוע',
    amount: extracted.amount || 0,
    date: parseReceiptDate(extracted.date),
    description: extracted.description || 'שירות',
    paymentMethod: extracted.paymentMethod,
    notes: extracted.notes,
    status: 'generated',
  };
  
  return generateSinglePdf(receiptData, businessInfo, settings);
}

