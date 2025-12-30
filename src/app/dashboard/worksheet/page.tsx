'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';

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

type SetupStep = 'setup' | 'worksheet';

export default function WorksheetPage() {
  const router = useRouter();
  const { excelData } = useStore();
  
  // Setup state
  const [step, setStep] = useState<SetupStep>('setup');
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
  
  // Initialize rows from excel data
  useEffect(() => {
    if (excelData && excelData.length > 0 && step === 'worksheet') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const initialRows: WorksheetRow[] = (excelData as any[]).map((r: any, index: number) => ({
        id: `row-${index}`,
        receiptNumber: setupData.startingNumber + index,
        date: String(r['תאריך'] || r['date'] || ''),
        customerName: String(r['שם לקוח'] || r['שם'] || r['customerName'] || r['name'] || ''),
        paymentMethod: '',
        amount: null,
        isComplete: false,
      }));
      setRows(initialRows);
    }
  }, [excelData, step, setupData.startingNumber]);
  
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
    if (!excelData || excelData.length === 0) {
      alert('אין נתונים מהגיליון המקורי. אנא העלה קובץ קודם.');
      router.push('/dashboard');
      return;
    }
    setStep('worksheet');
  };
  
  // Export to Excel
  const exportToExcel = async () => {
    // Import xlsx dynamically
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
  
  // Setup Step
  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-2"
            >
              ← חזרה
            </button>
            <h1 className="text-3xl font-bold text-gray-900">יצירת גיליון עבודה חכם</h1>
            <p className="text-gray-600 mt-2">הגדר את הפרמטרים לפני יצירת הגיליון</p>
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
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-indigo-700 shadow-lg"
            >
              המשך ליצירת הגיליון →
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
