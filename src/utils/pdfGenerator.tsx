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

// Register Hebrew font from Google Fonts (static URL that works)
Font.register({
  family: 'Heebo',
  src: 'https://fonts.gstatic.com/s/heebo/v22/NGSpv5_NC0k9P_v6ZUCbLRAHxK1EiSysd0mm.ttf',
  fontWeight: 400,
});

Font.register({
  family: 'Heebo',
  src: 'https://fonts.gstatic.com/s/heebo/v22/NGSpv5_NC0k9P_v6ZUCbLRAHxK1ECSysd0mm.ttf',
  fontWeight: 700,
});

// Disable hyphenation
Font.registerHyphenationCallback((word) => [word]);

export type ReceiptTemplate = 'classic' | 'modern' | 'minimal';

// Styles with Hebrew font
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontSize: 12,
    fontFamily: 'Heebo',
  },
  header: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1a365d',
    borderBottomStyle: 'solid',
  },
  businessName: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1a365d',
    marginBottom: 8,
    textAlign: 'right',
  },
  businessDetail: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 4,
    textAlign: 'right',
  },
  receiptHeader: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#1a365d',
    padding: 15,
  },
  receiptTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#ffffff',
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    borderBottomStyle: 'solid',
  },
  label: {
    fontSize: 10,
    color: '#888888',
    textAlign: 'right',
  },
  value: {
    fontSize: 12,
    color: '#333333',
    textAlign: 'right',
  },
  customerBox: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    marginBottom: 20,
  },
  customerLabel: {
    fontSize: 10,
    color: '#888888',
    marginBottom: 5,
    textAlign: 'right',
  },
  customerName: {
    fontSize: 16,
    fontWeight: 700,
    color: '#333333',
    textAlign: 'right',
  },
  tableContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#dddddd',
    borderStyle: 'solid',
  },
  tableHeader: {
    flexDirection: 'row-reverse',
    backgroundColor: '#1a365d',
    padding: 10,
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 700,
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row-reverse',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    borderBottomStyle: 'solid',
  },
  tableCell: {
    fontSize: 10,
    flex: 1,
    textAlign: 'center',
    color: '#333333',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 30,
  },
  totalBox: {
    backgroundColor: '#38a169',
    padding: 15,
    minWidth: 150,
  },
  totalLabel: {
    fontSize: 10,
    color: '#ffffff',
    marginBottom: 5,
    textAlign: 'center',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 700,
    color: '#ffffff',
    textAlign: 'center',
  },
  notesBox: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 10,
    color: '#888888',
    marginBottom: 5,
    textAlign: 'right',
  },
  notesText: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#dddddd',
    borderTopStyle: 'solid',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#888888',
    textAlign: 'right',
  },
});

// Helper functions
const formatAmount = (num: number): string => {
  if (isNaN(num) || num === null || num === undefined) return '0.00';
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const formatDate = (date: Date | string | null | undefined): string => {
  try {
    if (!date) return getTodayDate();
    
    let d: Date;
    if (date instanceof Date) {
      d = date;
    } else if (typeof date === 'string') {
      const parts = date.split('/');
      if (parts.length === 3) {
        d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      } else {
        d = new Date(date);
      }
    } else {
      d = new Date();
    }
    
    if (isNaN(d.getTime())) return getTodayDate();
    
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  } catch {
    return getTodayDate();
  }
};

const getTodayDate = (): string => {
  const d = new Date();
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

const getBusinessType = (type: string): string => {
  const types: Record<string, string> = {
    'osek_patur': 'עוסק פטור',
    'osek_morshe': 'עוסק מורשה',
    'company': 'חברה בע"מ',
  };
  return types[type] || 'עסק';
};

// Receipt Document Component
interface ReceiptDocProps {
  receipt: ReceiptData;
  businessInfo: BusinessInfo;
  settings: ReceiptSettings;
}

const ReceiptDoc: React.FC<ReceiptDocProps> = ({ receipt, businessInfo, settings }) => {
  const currency = settings.currencySymbol || '₪';
  const dateStr = formatDate(receipt.date);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.businessName}>{businessInfo.name || 'שם העסק'}</Text>
          <Text style={styles.businessDetail}>
            {getBusinessType(businessInfo.businessType)} | ח.פ: {businessInfo.businessId || '000000000'}
          </Text>
          {businessInfo.address && <Text style={styles.businessDetail}>{businessInfo.address}</Text>}
          {businessInfo.phone && <Text style={styles.businessDetail}>טלפון: {businessInfo.phone}</Text>}
          {businessInfo.email && <Text style={styles.businessDetail}>{businessInfo.email}</Text>}
        </View>

        {/* Receipt Title */}
        <View style={styles.receiptHeader}>
          <Text style={styles.receiptTitle}>קבלה מספר {receipt.receiptNumber}</Text>
        </View>

        {/* Info */}
        <View style={styles.infoRow}>
          <View>
            <Text style={styles.label}>תאריך</Text>
            <Text style={styles.value}>{dateStr}</Text>
          </View>
          <View>
            <Text style={styles.label}>מספר קבלה</Text>
            <Text style={styles.value}>{receipt.receiptNumber}</Text>
          </View>
        </View>

        {/* Customer */}
        <View style={styles.customerBox}>
          <Text style={styles.customerLabel}>התקבל מאת</Text>
          <Text style={styles.customerName}>{receipt.customerName || 'לקוח'}</Text>
        </View>

        {/* Details Table */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>סכום</Text>
            <Text style={styles.tableHeaderCell}>אמצעי תשלום</Text>
            <Text style={styles.tableHeaderCell}>תאריך</Text>
            <Text style={styles.tableHeaderCell}>פירוט</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{currency}{formatAmount(receipt.amount)}</Text>
            <Text style={styles.tableCell}>{receipt.paymentMethod || '-'}</Text>
            <Text style={styles.tableCell}>{dateStr}</Text>
            <Text style={styles.tableCell}>{receipt.description || 'תשלום'}</Text>
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalContainer}>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>סה״כ שולם</Text>
            <Text style={styles.totalAmount}>{currency}{formatAmount(receipt.amount)}</Text>
          </View>
        </View>

        {/* Notes */}
        {receipt.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>הערות</Text>
            <Text style={styles.notesText}>{receipt.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerText}>תאריך הפקה: {getTodayDate()}</Text>
            {businessInfo.vatExempt && <Text style={styles.footerText}>פטור ממע״מ עפ״י סעיף 31 לחוק</Text>}
          </View>
          <View>
            <Text style={styles.footerText}>מסמך ממוחשב - חתום דיגיטלית</Text>
            <Text style={styles.footerText}>הופק על ידי קבליט</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// Generate single PDF
export async function generateSinglePdf(
  receipt: ReceiptData,
  businessInfo: BusinessInfo,
  settings: ReceiptSettings,
  _template: ReceiptTemplate = 'classic'
): Promise<Blob> {
  console.log(`[PDF] Creating receipt ${receipt.receiptNumber}`);
  
  try {
    const doc = <ReceiptDoc receipt={receipt} businessInfo={businessInfo} settings={settings} />;
    const blob = await pdf(doc).toBlob();
    console.log(`[PDF] Created, size: ${blob.size}`);
    return blob;
  } catch (error) {
    console.error('[PDF] Error:', error);
    throw new Error('Failed to generate PDF');
  }
}

// Interface for extracted receipts
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

// Parse date string to Date
function parseDate(dateStr: string | Date | null | undefined): Date {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? new Date() : dateStr;
  
  const str = String(dateStr).trim();
  
  const match1 = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (match1) return new Date(parseInt(match1[3]), parseInt(match1[2]) - 1, parseInt(match1[1]));
  
  const match2 = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (match2) return new Date(parseInt(match2[1]), parseInt(match2[2]) - 1, parseInt(match2[3]));
  
  const match3 = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})$/);
  if (match3) {
    const year = parseInt(match3[3]) > 50 ? 1900 + parseInt(match3[3]) : 2000 + parseInt(match3[3]);
    return new Date(year, parseInt(match3[2]) - 1, parseInt(match3[1]));
  }
  
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

// Create ZIP with all receipts
export async function createZipWithReceipts(
  extractedReceipts: ExtractedReceipt[],
  businessInfo: BusinessInfo,
  settings: ReceiptSettings,
  onProgress?: (progress: number) => void,
  template: ReceiptTemplate = 'classic'
): Promise<Blob> {
  console.log(`[ZIP] Starting with ${extractedReceipts?.length || 0} receipts`);
  
  if (!extractedReceipts || extractedReceipts.length === 0) {
    throw new Error('לא נמצאו קבלות לייצור');
  }
  
  const zip = new JSZip();
  const total = extractedReceipts.length;
  let success = 0;
  
  for (let i = 0; i < total; i++) {
    const item = extractedReceipts[i];
    const num = (settings.startingNumber || 1) + i;
    
    console.log(`[ZIP] Processing ${i + 1}/${total}: ${item.customerName || 'Unknown'}`);
    
    try {
      const receiptData: ReceiptData = {
        id: `r-${num}-${Date.now()}`,
        receiptNumber: num,
        customerName: item.customerName || 'לקוח',
        amount: typeof item.amount === 'number' ? item.amount : parseFloat(String(item.amount)) || 0,
        date: parseDate(item.date),
        description: item.description || '',
        paymentMethod: item.paymentMethod || '',
        notes: item.notes || '',
        status: 'generated',
      };
      
      const pdfBlob = await generateSinglePdf(receiptData, businessInfo, settings, template);
      
      if (pdfBlob && pdfBlob.size > 100) {
        const name = (item.customerName || 'receipt')
          .replace(/[^א-תa-zA-Z0-9\s]/g, '')
          .replace(/\s+/g, '_')
          .substring(0, 20) || 'receipt';
        
        const filename = `kabala_${num}_${name}.pdf`;
        const buffer = await pdfBlob.arrayBuffer();
        zip.file(filename, buffer);
        success++;
        console.log(`[ZIP] Added: ${filename}`);
      }
    } catch (err) {
      console.error(`[ZIP] Error ${num}:`, err);
    }
    
    onProgress?.(Math.round(((i + 1) / total) * 100));
    await new Promise(r => setTimeout(r, 50));
  }
  
  console.log(`[ZIP] Done: ${success}/${total}`);
  
  if (success === 0) {
    throw new Error('לא נוצרו קבלות. בדוק את הנתונים ונסה שוב.');
  }
  
  const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  console.log(`[ZIP] Size: ${zipBlob.size}`);
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
    id: `r-${receiptNumber}`,
    receiptNumber,
    customerName: extracted.customerName || 'לקוח',
    amount: extracted.amount || 0,
    date: parseDate(extracted.date),
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
