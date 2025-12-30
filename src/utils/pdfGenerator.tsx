'use client';

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';
import { BusinessInfo, ReceiptData, ReceiptSettings } from '@/types';
import JSZip from 'jszip';

// Simple styles - no custom fonts, using default
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontSize: 12,
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
    color: '#1a365d',
    marginBottom: 8,
  },
  businessDetail: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 4,
  },
  receiptHeader: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#1a365d',
    padding: 15,
  },
  receiptTitle: {
    fontSize: 22,
    color: '#ffffff',
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
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
  },
  value: {
    fontSize: 12,
    color: '#333333',
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
  },
  customerName: {
    fontSize: 16,
    color: '#333333',
  },
  tableContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#dddddd',
    borderStyle: 'solid',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a365d',
    padding: 10,
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontSize: 10,
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
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
    justifyContent: 'flex-end',
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
  },
  totalAmount: {
    fontSize: 20,
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
  },
  notesText: {
    fontSize: 10,
    color: '#666666',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#888888',
  },
});

export type ReceiptTemplate = 'classic' | 'modern' | 'minimal';

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
    
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
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
    'osek_patur': 'Osek Patur',
    'osek_morshe': 'Osek Murshe',
    'company': 'Company',
  };
  return types[type] || 'Business';
};

// Receipt Document Component
interface ReceiptDocProps {
  receipt: ReceiptData;
  businessInfo: BusinessInfo;
  settings: ReceiptSettings;
}

const ReceiptDoc: React.FC<ReceiptDocProps> = ({ receipt, businessInfo, settings }) => {
  const currency = settings.currencySymbol || 'ILS';
  const dateStr = formatDate(receipt.date);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.businessName}>{businessInfo.name || 'Business Name'}</Text>
          <Text style={styles.businessDetail}>
            {getBusinessType(businessInfo.businessType)} | ID: {businessInfo.businessId || '000000000'}
          </Text>
          {businessInfo.address && <Text style={styles.businessDetail}>{businessInfo.address}</Text>}
          {businessInfo.phone && <Text style={styles.businessDetail}>Tel: {businessInfo.phone}</Text>}
          {businessInfo.email && <Text style={styles.businessDetail}>{businessInfo.email}</Text>}
        </View>

        {/* Receipt Title */}
        <View style={styles.receiptHeader}>
          <Text style={styles.receiptTitle}>RECEIPT #{receipt.receiptNumber}</Text>
        </View>

        {/* Info */}
        <View style={styles.infoRow}>
          <View>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{dateStr}</Text>
          </View>
          <View>
            <Text style={styles.label}>Receipt Number:</Text>
            <Text style={styles.value}>{receipt.receiptNumber}</Text>
          </View>
        </View>

        {/* Customer */}
        <View style={styles.customerBox}>
          <Text style={styles.customerLabel}>Received From:</Text>
          <Text style={styles.customerName}>{receipt.customerName || 'Customer'}</Text>
        </View>

        {/* Details Table */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Description</Text>
            <Text style={styles.tableHeaderCell}>Date</Text>
            <Text style={styles.tableHeaderCell}>Payment</Text>
            <Text style={styles.tableHeaderCell}>Amount</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{receipt.description || 'Payment'}</Text>
            <Text style={styles.tableCell}>{dateStr}</Text>
            <Text style={styles.tableCell}>{receipt.paymentMethod || '-'}</Text>
            <Text style={styles.tableCell}>{currency} {formatAmount(receipt.amount)}</Text>
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalContainer}>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalAmount}>{currency} {formatAmount(receipt.amount)}</Text>
          </View>
        </View>

        {/* Notes */}
        {receipt.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText}>{receipt.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerText}>Generated: {getTodayDate()}</Text>
            {businessInfo.vatExempt && <Text style={styles.footerText}>VAT Exempt</Text>}
          </View>
          <View>
            <Text style={styles.footerText}>Digital Document - Electronically Signed</Text>
            <Text style={styles.footerText}>Powered by Kablit</Text>
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
    console.error('[PDF] Generation error:', error);
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
  
  // DD/MM/YYYY
  const match1 = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (match1) {
    return new Date(parseInt(match1[3]), parseInt(match1[2]) - 1, parseInt(match1[1]));
  }
  
  // YYYY-MM-DD
  const match2 = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (match2) {
    return new Date(parseInt(match2[1]), parseInt(match2[2]) - 1, parseInt(match2[3]));
  }
  
  // DD/MM/YY
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
    throw new Error('No receipts to generate');
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
        customerName: item.customerName || 'Customer',
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
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .replace(/\s+/g, '_')
          .substring(0, 20) || 'receipt';
        
        const filename = `receipt_${num}_${name}.pdf`;
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
    throw new Error('Failed to generate any receipts');
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
    customerName: extracted.customerName || 'Customer',
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
