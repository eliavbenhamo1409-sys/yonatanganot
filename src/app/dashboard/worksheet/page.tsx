'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { parseExcelFile } from '@/utils/excelParser';

interface WorksheetRow {
  id: string;
  receiptNumber: number;
  date: string;
  customerName: string;
  paymentMethod: string;
  amount: number | null;
  isComplete: boolean;
}

interface SetupData {
  startingNumber: number;
  paymentMethods: string[];
  commonAmounts: number[];
}

type SetupStep = 'upload' | 'analyzing' | 'setup' | 'worksheet';

export default function WorksheetPage() {
  const router = useRouter();
  
  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  
  // AI extracted data
  const [extractedData, setExtractedData] = useState<{ customerName: string; date: string; rowIndex: number }[]>([]);
  
  // Setup state
  const [step, setStep] = useState<SetupStep>('upload');
  const [setupData, setSetupData] = useState<SetupData>({
    startingNumber: 1001,
    paymentMethods: ['מזומן', 'ביט', 'פייבוקס', 'העברה בנקאית', 'צ\'יק', 'אשראי'],
    commonAmounts: [120, 140, 150, 160, 200, 250, 280],
  });
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [newAmount, setNewAmount] = useState('');
  
  // Worksheet state
  const [rows, setRows] = useState<WorksheetRow[]>([]);
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: 'paymentMethod' | 'amount' } | null>(null);
  const [manualInputRow, setManualInputRow] = useState<string | null>(null);
  
  // Process uploaded file with AI
  const processFile = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    setFileName(file.name);
    
    try {
      // Parse Excel
      const parsed = await parseExcelFile(file);
      
      if (!parsed.headers || parsed.headers.length === 0) {
        throw new Error('הקובץ לא מכיל כותרות עמודות');
      }
      
      if (!parsed.rows || parsed.rows.length === 0) {
        throw new Error('הקובץ לא מכיל נתונים');
      }
      
      setStep('analyzing');
      
      // Send to AI for extraction
      const response = await fetch('/api/extract-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headers: parsed.headers,
          rows: parsed.rows.map(r => r.data || r),
        }),
      });
      
      if (!response.ok) {
        throw new Error('שגיאה בחילוץ הנתונים');
      }
      
      const result = await response.json();
      
      if (!result.success || !result.rows || result.rows.length === 0) {
        throw new Error('לא נמצאו שמות לקוחות או תאריכים בקובץ');
      }
      
      console.log('[Worksheet] AI extracted:', result.rows.length, 'rows');
      setExtractedData(result.rows);
      setStep('setup');
      
    } catch (err) {
      console.error('File processing error:', err);
      setUploadError(err instanceof Error ? err.message : 'שגיאה בעיבוד הקובץ');
      setStep('upload');
    } finally {
      setIsUploading(false);
    }
  };
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    disabled: isUploading || step === 'analyzing',
  });
  
  // Initialize rows from extracted data
  const initializeRows = () => {
    const initialRows: WorksheetRow[] = extractedData.map((r, index) => ({
      id: `row-${index}`,
      receiptNumber: setupData.startingNumber + index,
      date: r.date,
      customerName: r.customerName,
      paymentMethod: '',
      amount: null,
      isComplete: false,
    }));
    setRows(initialRows);
    setStep('worksheet');
  };
  
  // Add payment method
  const addPaymentMethod = useCallback(() => {
    if (newPaymentMethod.trim() && !setupData.paymentMethods.includes(newPaymentMethod.trim())) {
      setSetupData(prev => ({
        ...prev,
        paymentMethods: [...prev.paymentMethods, newPaymentMethod.trim()]
      }));
      setNewPaymentMethod('');
    }
  }, [newPaymentMethod, setupData.paymentMethods]);
  
  // Remove payment method
  const removePaymentMethod = (method: string) => {
    setSetupData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter(m => m !== method)
    }));
  };
  
  // Add amount
  const addAmount = useCallback(() => {
    const amount = parseFloat(newAmount);
    if (!isNaN(amount) && amount > 0 && !setupData.commonAmounts.includes(amount)) {
      setSetupData(prev => ({
        ...prev,
        commonAmounts: [...prev.commonAmounts, amount].sort((a, b) => a - b)
      }));
      setNewAmount('');
    }
  }, [newAmount, setupData.commonAmounts]);
  
  // Remove amount
  const removeAmount = (amount: number) => {
    setSetupData(prev => ({
      ...prev,
      commonAmounts: prev.commonAmounts.filter(a => a !== amount)
    }));
  };
  
  // Update row
  const updateRow = (rowId: string, field: keyof WorksheetRow, value: string | number | null) => {
    setRows(prev => prev.map(row => {
      if (row.id === rowId) {
        const updated = { ...row, [field]: value };
        updated.isComplete = !!(updated.paymentMethod && updated.amount);
        return updated;
      }
      return row;
    }));
    setEditingCell(null);
  };
  
  // Get color for payment method
  const getPaymentColor = (method: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      'מזומן': { bg: 'rgba(16, 185, 129, 0.2)', text: '#10B981', border: 'rgba(16, 185, 129, 0.5)' },
      'ביט': { bg: 'rgba(59, 130, 246, 0.2)', text: '#3B82F6', border: 'rgba(59, 130, 246, 0.5)' },
      'פייבוקס': { bg: 'rgba(249, 115, 22, 0.2)', text: '#F97316', border: 'rgba(249, 115, 22, 0.5)' },
      'העברה בנקאית': { bg: 'rgba(139, 92, 246, 0.2)', text: '#8B5CF6', border: 'rgba(139, 92, 246, 0.5)' },
      'צ\'יק': { bg: 'rgba(234, 179, 8, 0.2)', text: '#EAB308', border: 'rgba(234, 179, 8, 0.5)' },
      'אשראי': { bg: 'rgba(236, 72, 153, 0.2)', text: '#EC4899', border: 'rgba(236, 72, 153, 0.5)' },
    };
    return colors[method] || { bg: 'rgba(100, 116, 139, 0.2)', text: '#64748B', border: 'rgba(100, 116, 139, 0.5)' };
  };
  
  // Calculate statistics
  const stats = {
    total: rows.length,
    complete: rows.filter(r => r.isComplete).length,
    incomplete: rows.filter(r => !r.isComplete).length,
    totalAmount: rows.reduce((sum, r) => sum + (r.amount || 0), 0),
  };
  
  // Export to Excel
  const exportToExcel = async () => {
    const XLSX = await import('xlsx');
    
    const data = rows.map(row => ({
      'מספר קבלה': row.receiptNumber,
      'תאריך': row.date,
      'שם לקוח': row.customerName,
      'אמצעי תשלום': row.paymentMethod,
      'מחיר (ש"ח)': row.amount,
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'גיליון עבודה');
    XLSX.writeFile(wb, 'worksheet.xlsx');
  };
  
  // Dark theme styles
  const styles = {
    page: { minHeight: '100vh', background: '#0F172A', fontFamily: 'Heebo, sans-serif', padding: '1.5rem' },
    container: { maxWidth: '1200px', margin: '0 auto' },
    card: { background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem' },
    heading: { color: 'white', fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' },
    subtext: { color: '#94A3B8', fontSize: '0.9rem' },
    button: { background: 'linear-gradient(135deg, #8B5CF6 0%, #3FC1C9 100%)', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.875rem 1.5rem', fontWeight: '600', cursor: 'pointer' },
    backButton: { background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' },
  };
  
  // Upload Step
  if (step === 'upload') {
    return (
      <div style={styles.page} dir="rtl">
        <div style={styles.container}>
          <button onClick={() => router.push('/dashboard')} style={styles.backButton}>
            ← חזרה לדף הראשי
          </button>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={styles.heading}>📊 גיליון עבודה חכם</h1>
            <p style={styles.subtext}>העלה קובץ Excel וה-AI יחלץ שמות לקוחות ותאריכים</p>
          </div>
          
          <div style={{ ...styles.card, maxWidth: '600px', margin: '0 auto' }}>
            <div
              {...getRootProps()}
              style={{
                border: `2px dashed ${isDragActive ? '#8B5CF6' : uploadError ? '#EF4444' : '#475569'}`,
                borderRadius: '1rem',
                padding: '3rem 2rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: isDragActive ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
              }}
            >
              <input {...getInputProps()} />
              
              <div style={{ width: '5rem', height: '5rem', margin: '0 auto 1.5rem', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                📁
              </div>
              
              {isDragActive ? (
                <p style={{ color: '#8B5CF6', fontSize: '1.1rem', fontWeight: '500' }}>שחרר את הקובץ כאן...</p>
              ) : (
                <>
                  <p style={{ color: 'white', fontSize: '1.25rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                    גרור קובץ Excel או לחץ לבחירה
                  </p>
                  <p style={{ color: '#64748B', fontSize: '0.85rem' }}>תומך ב-XLSX, XLS, CSV</p>
                </>
              )}
              
              {uploadError && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem', color: '#EF4444' }}>
                  {uploadError}
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '0.75rem', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
              <p style={{ color: '#A78BFA', fontWeight: '600', marginBottom: '0.5rem' }}>💡 טיפים</p>
              <ul style={{ color: '#94A3B8', fontSize: '0.85rem', margin: 0, paddingRight: '1.25rem' }}>
                <li>וודא שהקובץ מכיל עמודות של שם לקוח ותאריך</li>
                <li>ה-AI יזהה אוטומטית את העמודות הרלוונטיות</li>
                <li>תוכל להוסיף אמצעי תשלום וסכומים בשלב הבא</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Analyzing Step
  if (step === 'analyzing') {
    return (
      <div style={styles.page} dir="rtl">
        <div style={{ ...styles.container, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ width: '6rem', height: '6rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #8B5CF6 0%, #3FC1C9 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 2s infinite' }}>
            <span style={{ fontSize: '2.5rem' }}>🤖</span>
          </div>
          <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>AI מנתח את הקובץ...</h2>
          <p style={{ color: '#94A3B8' }}>מחפש שמות לקוחות ותאריכים</p>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.5rem' }}>{fileName}</p>
        </div>
      </div>
    );
  }
  
  // Setup Step
  if (step === 'setup') {
    return (
      <div style={styles.page} dir="rtl">
        <div style={{ ...styles.container, maxWidth: '700px' }}>
          <button onClick={() => setStep('upload')} style={styles.backButton}>
            ← החלף קובץ
          </button>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={styles.heading}>⚙️ הגדרות גיליון</h1>
            <p style={styles.subtext}>
              נמצאו <span style={{ color: '#8B5CF6', fontWeight: 'bold' }}>{extractedData.length}</span> לקוחות בקובץ
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Starting Number */}
            <div style={styles.card}>
              <h2 style={{ color: 'white', fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ width: '1.75rem', height: '1.75rem', background: 'rgba(139, 92, 246, 0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A78BFA', fontSize: '0.8rem', fontWeight: 'bold' }}>1</span>
                מספר קבלה התחלתי
              </h2>
              <input
                type="number"
                value={setupData.startingNumber}
                onChange={(e) => setSetupData(prev => ({ ...prev, startingNumber: parseInt(e.target.value) || 1 }))}
                style={{ width: '100%', padding: '0.875rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: 'white', fontSize: '1.25rem', fontWeight: '600', textAlign: 'center' }}
                min="1"
              />
            </div>
            
            {/* Payment Methods */}
            <div style={styles.card}>
              <h2 style={{ color: 'white', fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ width: '1.75rem', height: '1.75rem', background: 'rgba(139, 92, 246, 0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A78BFA', fontSize: '0.8rem', fontWeight: 'bold' }}>2</span>
                שיטות תשלום
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                {setupData.paymentMethods.map((method) => {
                  const color = getPaymentColor(method);
                  return (
                    <div key={method} style={{ padding: '0.5rem 0.875rem', borderRadius: '2rem', background: color.bg, border: `1px solid ${color.border}`, color: color.text, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <span>{method}</span>
                      <button onClick={() => removePaymentMethod(method)} style={{ background: 'transparent', border: 'none', color: color.text, cursor: 'pointer', padding: 0 }}>×</button>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={newPaymentMethod}
                  onChange={(e) => setNewPaymentMethod(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addPaymentMethod()}
                  placeholder="הוסף שיטת תשלום..."
                  style={{ flex: 1, padding: '0.625rem 0.875rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: 'white' }}
                />
                <button onClick={addPaymentMethod} style={{ padding: '0.625rem 1rem', background: '#8B5CF6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>הוסף</button>
              </div>
            </div>
            
            {/* Common Amounts */}
            <div style={styles.card}>
              <h2 style={{ color: 'white', fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ width: '1.75rem', height: '1.75rem', background: 'rgba(139, 92, 246, 0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A78BFA', fontSize: '0.8rem', fontWeight: 'bold' }}>3</span>
                סכומים נפוצים (₪)
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                {setupData.commonAmounts.map((amount) => (
                  <div key={amount} style={{ padding: '0.5rem 0.875rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: '600' }}>₪{amount}</span>
                    <button onClick={() => removeAmount(amount)} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}>×</button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addAmount()}
                  placeholder="הוסף סכום..."
                  style={{ flex: 1, padding: '0.625rem 0.875rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: 'white' }}
                  min="1"
                />
                <button onClick={addAmount} style={{ padding: '0.625rem 1rem', background: '#8B5CF6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>הוסף</button>
              </div>
            </div>
            
            {/* Continue Button */}
            <button onClick={initializeRows} style={{ ...styles.button, width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
              המשך ליצירת הגיליון ({extractedData.length} שורות) →
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Worksheet Step
  return (
    <div style={styles.page} dir="rtl">
      <div style={styles.container}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <button onClick={() => setStep('setup')} style={styles.backButton}>
              ← חזרה להגדרות
            </button>
            <h1 style={{ ...styles.heading, marginBottom: 0 }}>📊 גיליון עבודה חכם</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ padding: '0.5rem 0.875rem', borderRadius: '2rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', fontSize: '0.85rem' }}>✓ {stats.complete} הושלמו</span>
              <span style={{ padding: '0.5rem 0.875rem', borderRadius: '2rem', background: 'rgba(234, 179, 8, 0.2)', color: '#EAB308', fontSize: '0.85rem' }}>○ {stats.incomplete} חסרים</span>
              <span style={{ padding: '0.5rem 0.875rem', borderRadius: '2rem', background: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6', fontSize: '0.85rem', fontWeight: '600' }}>₪{stats.totalAmount.toLocaleString()}</span>
            </div>
            <button onClick={exportToExcel} style={{ padding: '0.625rem 1rem', background: '#10B981', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
              📥 ייצא לאקסל
            </button>
          </div>
        </div>
        
        {/* Table */}
        <div style={{ ...styles.card, padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'right', color: '#A78BFA', fontWeight: '600', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>מס' קבלה</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'right', color: '#A78BFA', fontWeight: '600', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>תאריך</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'right', color: '#A78BFA', fontWeight: '600', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>שם לקוח</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'right', color: '#A78BFA', fontWeight: '600', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.1)', width: '180px' }}>אמצעי תשלום</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'right', color: '#A78BFA', fontWeight: '600', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.1)', width: '140px' }}>סכום (₪)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} style={{ background: row.isComplete ? 'rgba(16, 185, 129, 0.05)' : index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem 1rem', color: '#94A3B8', fontFamily: 'monospace', fontWeight: '600' }}>{row.receiptNumber}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#94A3B8' }}>{row.date}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'white', fontWeight: '500' }}>{row.customerName}</td>
                  <td style={{ padding: '0.75rem 1rem', position: 'relative' }}>
                    {editingCell?.rowId === row.id && editingCell?.field === 'paymentMethod' ? (
                      <div style={{ position: 'absolute', zIndex: 10, top: '100%', right: 0, background: '#1E293B', borderRadius: '0.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', minWidth: '160px' }}>
                        {setupData.paymentMethods.map((method) => {
                          const color = getPaymentColor(method);
                          return (
                            <button key={method} onClick={() => updateRow(row.id, 'paymentMethod', method)} style={{ width: '100%', padding: '0.625rem 1rem', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', color: color.text, textAlign: 'right', cursor: 'pointer' }}>
                              {method}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <button onClick={() => setEditingCell({ rowId: row.id, field: 'paymentMethod' })} style={{ padding: '0.375rem 0.75rem', borderRadius: '2rem', background: row.paymentMethod ? getPaymentColor(row.paymentMethod).bg : 'rgba(234, 179, 8, 0.15)', border: `1px solid ${row.paymentMethod ? getPaymentColor(row.paymentMethod).border : 'rgba(234, 179, 8, 0.3)'}`, color: row.paymentMethod ? getPaymentColor(row.paymentMethod).text : '#EAB308', cursor: 'pointer', fontSize: '0.85rem', width: '100%', textAlign: 'right' }}>
                        {row.paymentMethod || 'בחר ▼'}
                      </button>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', position: 'relative' }}>
                    {manualInputRow === row.id ? (
                      /* Direct input mode */
                      <input
                        type="number"
                        placeholder="הזן סכום..."
                        autoFocus
                        style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.1)', border: '1px solid #8B5CF6', borderRadius: '0.5rem', color: 'white', textAlign: 'center', fontWeight: '600' }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = parseFloat((e.target as HTMLInputElement).value);
                            if (!isNaN(val) && val > 0) {
                              updateRow(row.id, 'amount', val);
                            }
                            setManualInputRow(null);
                          } else if (e.key === 'Escape') {
                            setManualInputRow(null);
                          }
                        }}
                        onBlur={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val > 0) {
                            updateRow(row.id, 'amount', val);
                          }
                          setManualInputRow(null);
                        }}
                      />
                    ) : editingCell?.rowId === row.id && editingCell?.field === 'amount' ? (
                      /* Dropdown menu */
                      <div style={{ position: 'absolute', zIndex: 10, top: '100%', left: 0, background: '#1E293B', borderRadius: '0.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', minWidth: '140px' }}>
                        {/* Manual input option */}
                        <button
                          onClick={() => { setEditingCell(null); setManualInputRow(row.id); }}
                          style={{ width: '100%', padding: '0.625rem 1rem', background: 'rgba(139, 92, 246, 0.2)', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#A78BFA', textAlign: 'center', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                          ✏️ ידני
                        </button>
                        {/* Common amounts */}
                        {setupData.commonAmounts.map((amount) => (
                          <button key={amount} onClick={() => updateRow(row.id, 'amount', amount)} style={{ width: '100%', padding: '0.625rem', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'white', textAlign: 'center', cursor: 'pointer', fontWeight: '600' }}>
                            ₪{amount}
                          </button>
                        ))}
                      </div>
                    ) : (
                      /* Display button */
                      <button onClick={() => setEditingCell({ rowId: row.id, field: 'amount' })} style={{ padding: '0.375rem 0.75rem', borderRadius: '0.5rem', background: row.amount ? 'rgba(255,255,255,0.05)' : 'rgba(234, 179, 8, 0.15)', border: `1px solid ${row.amount ? 'rgba(255,255,255,0.1)' : 'rgba(234, 179, 8, 0.3)'}`, color: row.amount ? 'white' : '#EAB308', cursor: 'pointer', fontSize: '0.85rem', width: '100%', textAlign: 'center', fontWeight: '600' }}>
                        {row.amount ? `₪${row.amount}` : 'בחר ▼'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Generate Receipts Button */}
        {stats.complete > 0 && (
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button onClick={() => {
              const completedData = rows.filter(r => r.isComplete).map(r => ({
                customerName: r.customerName,
                amount: r.amount || 0,
                date: r.date,
                description: '',
                paymentMethod: r.paymentMethod,
                notes: '',
                rowNumber: r.receiptNumber,
                isComplete: true,
                missingFields: [] as string[],
              }));
              localStorage.setItem('extractedReceipts', JSON.stringify(completedData));
              router.push('/dashboard/generate');
            }} style={{ ...styles.button, padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
              צור {stats.complete} קבלות →
            </button>
          </div>
        )}
      </div>
      
      {editingCell && <div style={{ position: 'fixed', inset: 0, zIndex: 5 }} onClick={() => setEditingCell(null)} />}
    </div>
  );
}
