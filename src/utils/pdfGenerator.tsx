'use client';

import { BusinessInfo, ReceiptData, ReceiptSettings } from '@/types';
import JSZip from 'jszip';

export type ReceiptTemplate = 'classic' | 'modern' | 'minimal';

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

// Helper functions
const formatDate = (date: Date | string | null | undefined): string => {
  try {
    if (!date) return getTodayDate();
    
    let d: Date;
    if (date instanceof Date) {
      d = date;
    } else if (typeof date === 'string') {
      // Already formatted as DD/MM/YYYY
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(date)) {
        return date;
      }
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

// Generate single PDF using API
export async function generateSinglePdf(
  receipt: ReceiptData,
  businessInfo: BusinessInfo,
  settings: ReceiptSettings,
  _template: ReceiptTemplate = 'classic'
): Promise<Blob> {
  console.log(`[PDF] Creating receipt ${receipt.receiptNumber} for ${receipt.customerName}`);
  
  const requestBody = {
    receipt: {
      receiptNumber: receipt.receiptNumber,
      customerName: receipt.customerName || 'לקוח',
      amount: typeof receipt.amount === 'number' ? receipt.amount : parseFloat(String(receipt.amount)) || 0,
      date: formatDate(receipt.date),
      description: receipt.description || '',
      paymentMethod: receipt.paymentMethod || '',
      notes: receipt.notes || '',
    },
    businessInfo: {
      name: businessInfo.name || 'שם העסק',
      businessId: businessInfo.businessId || '',
      businessType: businessInfo.businessType || 'osek_patur',
      address: businessInfo.address || '',
      phone: businessInfo.phone || '',
      email: businessInfo.email || '',
      vatExempt: businessInfo.vatExempt || false,
    },
    currencySymbol: settings.currencySymbol || '₪',
  };
  
  console.log('[PDF] Calling API with:', requestBody.receipt.customerName);
  
  const response = await fetch('/api/generate-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }
  
  const blob = await response.blob();
  console.log(`[PDF] Created, size: ${blob.size}`);
  return blob;
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
  const errors: string[] = [];
  
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
        // Create safe filename with Hebrew support
        const safeName = (item.customerName || 'receipt')
          .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename chars
          .replace(/\s+/g, '_')
          .substring(0, 30) || 'receipt';
        
        const filename = `kabala_${num}_${safeName}.pdf`;
        const buffer = await pdfBlob.arrayBuffer();
        zip.file(filename, buffer);
        success++;
        console.log(`[ZIP] Added: ${filename}`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[ZIP] Error ${num}:`, errorMsg);
      errors.push(`קבלה ${num}: ${errorMsg}`);
    }
    
    onProgress?.(Math.round(((i + 1) / total) * 100));
    
    // Small delay to avoid overwhelming the API
    await new Promise(r => setTimeout(r, 100));
  }
  
  console.log(`[ZIP] Done: ${success}/${total}`);
  
  if (success === 0) {
    const errorDetails = errors.length > 0 ? `\n${errors.slice(0, 3).join('\n')}` : '';
    throw new Error(`לא נוצרו קבלות. בדוק את הנתונים ונסה שוב.${errorDetails}`);
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
