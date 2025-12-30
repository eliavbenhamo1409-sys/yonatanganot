'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
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

type SetupStep = 'upload' | 'setup' | 'worksheet';

export default function WorksheetPage() {
  const router = useRouter();
  const { excelData, setExcelData, setExcelHeaders } = useStore();
  
  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [localData, setLocalData] = useState<any[]>([]);
  
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
  
  // Check for existing data
  useEffect(() => {
    if (excelData && excelData.length > 0) {
      setLocalData(excelData);
      setStep('setup');
    }
  }, [excelData]);
  
  // Process uploaded file
  const processFile = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    setFileName(file.name);
    
    try {
      const parsed = await parseExcelFile(file);
      
      if (!parsed.headers || parsed.headers.length === 0) {
        throw new Error('הקובץ לא מכיל כותרות עמודות');
      }
      
      if (!parsed.rows || parsed.rows.length === 0) {
        throw new Error('הקובץ לא מכיל נתונים');
      }
      
      // Save to store
      setExcelHeaders(parsed.headers);
      setExcelData(parsed.rows);
      setLocalData(parsed.rows);
      
      console.log(`[Worksheet] Loaded ${parsed.rows.length} rows`);
      
      setStep('setup');
    } catch (err) {
      console.error('File processing error:', err);
      setUploadError(err instanceof Error ? err.message : 'שגיאה בעיבוד הקובץ');
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
    disabled: isUploading,
  });
  
  // Initialize rows from data
  useEffect(() => {
    const dataToUse = localData.length > 0 ? localData : excelData;
    if (dataToUse && dataToUse.length > 0 && step === 'worksheet') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const initialRows: WorksheetRow[] = (dataToUse as any[]).map((r: any, index: number) => ({
        id: `row-${index}`,
        receiptNumber: setupData.startingNumber + index,
        date: String(r['תאריך'] || r['date'] || r.data?.['תאריך'] || r.data?.['date'] || ''),
        customerName: String(r['שם לקוח'] || r['שם'] || r['customerName'] || r['name'] || r.data?.['שם לקוח'] || r.data?.['שם'] || ''),
        paymentMethod: '',
        amount: null,
        isComplete: false,
      }));
      setRows(initialRows);
    }
  }, [localData, excelData, step, setupData.startingNumber]);
  
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
    const colors: Record<string, string> = {
      'מזומן': 'bg-green-100 text-green-700 border-green-300',
      'ביט': 'bg-blue-100 text-blue-700 border-blue-300',
      'פייבוקס': 'bg-orange-100 text-orange-700 border-orange-300',
      'העברה בנקאית': 'bg-purple-100 text-purple-700 border-purple-300',
      'צ\'יק': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'אשראי': 'bg-pink-100 text-pink-700 border-pink-300',
    };
    return colors[method] || 'bg-gray-100 text-gray-700 border-gray-300';
  };
  
  // Calculate statistics
  const stats = {
    total: rows.length,
    complete: rows.filter(r => r.isComplete).length,
    incomplete: rows.filter(r => !r.isComplete).length,
    totalAmount: rows.reduce((sum, r) => sum + (r.amount || 0), 0),
  };
  
  // Continue to worksheet
  const continueToWorksheet = () => {
    setStep('worksheet');
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
  
  // Upload Step
  if (step === 'upload') {
    return (
      <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-2"
            >
              ← חזרה
            </button>
            <h1 className="text-3xl font-bold text-gray-900">גיליון עבודה חכם</h1>
            <p className="text-gray-600 mt-2">העלה קובץ Excel עם תאריכים ושמות לקוחות</p>
          </div>
          
          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
              isDragActive 
                ? 'border-purple-500 bg-purple-50' 
                : uploadError 
                  ? 'border-red-400 bg-red-50' 
                  : 'border-gray-300 hover:border-purple-400 bg-white'
            }`}
          >
            <input {...getInputProps()} />
            
            <div className="w-20 h-20 mx-auto mb-6 bg-purple-100 rounded-2xl flex items-center justify-center">
              {isUploading ? (
                <svg className="w-10 h-10 text-purple-500 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              )}
            </div>
            
            {isUploading ? (
              <p className="text-purple-600 text-lg font-medium">מעבד את הקובץ...</p>
            ) : isDragActive ? (
              <p className="text-purple-600 text-lg font-medium">שחרר את הקובץ כאן...</p>
            ) : (
              <>
                <p className="text-gray-800 text-xl font-medium mb-2">גרור קובץ Excel או לחץ לבחירה</p>
                <p className="text-gray-500 text-sm">תומך ב-XLSX, XLS, CSV</p>
              </>
            )}
            
            {uploadError && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-600">
                {uploadError}
              </div>
            )}
            
            {fileName && !uploadError && (
              <div className="mt-4 text-sm text-gray-500">
                קובץ: {fileName}
              </div>
            )}
          </div>
          
          {/* Help Text */}
          <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-800 mb-2">💡 טיפים</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• וודא שהקובץ מכיל עמודות של תאריך ושם לקוח</li>
              <li>• השורה הראשונה צריכה להכיל כותרות</li>
              <li>• ניתן להשלים אמצעי תשלום וסכומים בשלב הבא</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
  
  // Setup Step
  if (step === 'setup') {
    const dataCount = localData.length || excelData?.length || 0;
    
    return (
      <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => setStep('upload')}
              className="text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-2"
            >
              ← החלף קובץ
            </button>
            <h1 className="text-3xl font-bold text-gray-900">הגדרת גיליון עבודה</h1>
            <p className="text-gray-600 mt-2">
              נמצאו <span className="font-bold text-purple-600">{dataCount}</span> שורות בקובץ
              {fileName && <span className="text-gray-400"> ({fileName})</span>}
            </p>
          </div>
          
          {/* Setup Form */}
          <div className="space-y-6">
            {/* Starting Number */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                מספר קבלה התחלתי
              </h2>
              <input
                type="number"
                value={setupData.startingNumber}
                onChange={(e) => setSetupData(prev => ({ ...prev, startingNumber: parseInt(e.target.value) || 1 }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>
            
            {/* Payment Methods */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                שיטות תשלום
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {setupData.paymentMethods.map((method) => (
                  <div
                    key={method}
                    className={`px-3 py-2 rounded-full border flex items-center gap-2 ${getPaymentColor(method)}`}
                  >
                    <span>{method}</span>
                    <button
                      onClick={() => removePaymentMethod(method)}
                      className="w-5 h-5 rounded-full bg-white/50 hover:bg-white flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPaymentMethod}
                  onChange={(e) => setNewPaymentMethod(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addPaymentMethod()}
                  placeholder="הוסף שיטת תשלום..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={addPaymentMethod}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  הוסף
                </button>
              </div>
            </div>
            
            {/* Common Amounts */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                סכומים נפוצים (ש"ח)
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {setupData.commonAmounts.map((amount) => (
                  <div
                    key={amount}
                    className="px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 flex items-center gap-2"
                  >
                    <span className="font-semibold">₪{amount}</span>
                    <button
                      onClick={() => removeAmount(amount)}
                      className="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addAmount()}
                  placeholder="הוסף סכום..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
                <button
                  onClick={addAmount}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  הוסף
                </button>
              </div>
            </div>
            
            {/* Continue Button */}
            <button
              onClick={continueToWorksheet}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-indigo-700 shadow-lg"
            >
              המשך ליצירת הגיליון ({dataCount} שורות) →
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Worksheet Step
  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => setStep('setup')}
              className="text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-2 text-sm"
            >
              ← חזרה להגדרות
            </button>
            <h1 className="text-2xl font-bold text-gray-900">גיליון עבודה חכם</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
                ✓ {stats.complete} הושלמו
              </div>
              <div className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                ○ {stats.incomplete} חסרים
              </div>
              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                ₪{stats.totalAmount.toLocaleString()}
              </div>
            </div>
            {/* Export Button */}
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <span>📥</span>
              ייצא לאקסל
            </button>
          </div>
        </div>
        
        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 w-24">מס' קבלה</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 w-28">תאריך</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">שם לקוח</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 w-40">אמצעי תשלום</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 w-32">מחיר (ש"ח)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`border-b transition-colors ${
                    row.isComplete 
                      ? 'bg-green-50/50' 
                      : index % 2 === 0 
                        ? 'bg-white' 
                        : 'bg-gray-50/50'
                  } hover:bg-blue-50/50`}
                >
                  {/* Receipt Number */}
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold text-gray-800">{row.receiptNumber}</span>
                  </td>
                  
                  {/* Date */}
                  <td className="px-4 py-3 text-gray-600">{row.date}</td>
                  
                  {/* Customer Name */}
                  <td className="px-4 py-3 font-medium text-gray-800">{row.customerName}</td>
                  
                  {/* Payment Method - Dropdown */}
                  <td className="px-4 py-3 relative">
                    {editingCell?.rowId === row.id && editingCell?.field === 'paymentMethod' ? (
                      <div className="absolute z-10 mt-1 bg-white rounded-lg shadow-lg border max-h-48 overflow-auto">
                        {setupData.paymentMethods.map((method) => (
                          <button
                            key={method}
                            onClick={() => updateRow(row.id, 'paymentMethod', method)}
                            className={`w-full px-4 py-2 text-right hover:bg-gray-50 flex items-center gap-2 ${getPaymentColor(method)}`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingCell({ rowId: row.id, field: 'paymentMethod' })}
                        className={`px-3 py-1.5 rounded-full border text-sm w-full text-right ${
                          row.paymentMethod 
                            ? getPaymentColor(row.paymentMethod)
                            : 'bg-yellow-50 border-yellow-200 text-yellow-600'
                        }`}
                      >
                        {row.paymentMethod || 'בחר ▼'}
                      </button>
                    )}
                  </td>
                  
                  {/* Amount - Dropdown */}
                  <td className="px-4 py-3 relative">
                    {editingCell?.rowId === row.id && editingCell?.field === 'amount' ? (
                      <div className="absolute z-10 mt-1 bg-white rounded-lg shadow-lg border max-h-48 overflow-auto left-0">
                        <input
                          type="number"
                          placeholder="הזן סכום..."
                          className="w-full px-3 py-2 border-b text-left"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const val = parseFloat((e.target as HTMLInputElement).value);
                              if (!isNaN(val)) updateRow(row.id, 'amount', val);
                            }
                          }}
                        />
                        {setupData.commonAmounts.map((amount) => (
                          <button
                            key={amount}
                            onClick={() => updateRow(row.id, 'amount', amount)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 font-semibold"
                          >
                            ₪{amount}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingCell({ rowId: row.id, field: 'amount' })}
                        className={`px-3 py-1.5 rounded-lg border text-sm w-full text-left font-semibold ${
                          row.amount 
                            ? 'bg-white border-gray-200 text-gray-800'
                            : 'bg-yellow-50 border-yellow-200 text-yellow-600'
                        }`}
                      >
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
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                // Save completed data to localStorage and navigate
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
                localStorage.setItem('worksheetData', JSON.stringify(completedData));
                localStorage.setItem('worksheetStartNumber', String(setupData.startingNumber));
                router.push('/dashboard/generate');
              }}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-lg hover:from-green-600 hover:to-emerald-700 shadow-lg"
            >
              צור {stats.complete} קבלות →
            </button>
          </div>
        )}
      </div>
      
      {/* Click outside to close dropdown */}
      {editingCell && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setEditingCell(null)}
        />
      )}
    </div>
  );
}
