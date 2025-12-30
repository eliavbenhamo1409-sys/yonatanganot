'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { ReceiptData, BatchRun } from '@/types';
import { parseAmount, parseDate, parseCustomerName } from '@/utils/excelParser';
import {
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Download,
  Package,
  Sparkles,
  X,
} from 'lucide-react';

export default function GeneratePage() {
  const router = useRouter();
  const {
    businessInfo,
    receiptSettings,
    currentFile,
    excelData,
    columnMappings,
    addBatchRun,
    setReceiptSettings,
    resetCurrentSession,
  } = useStore();

  const [status, setStatus] = useState<'preparing' | 'generating' | 'completed' | 'error'>('preparing');
  const [progress, setProgress] = useState(0);
  const [currentItem, setCurrentItem] = useState(0);
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [errors, setErrors] = useState<{ row: number; message: string }[]>([]);
  const [showOnlyValid, setShowOnlyValid] = useState(false);
  const hasStarted = useRef(false);

  // Redirect if no data
  useEffect(() => {
    if (!currentFile || excelData.length === 0 || columnMappings.length === 0) {
      router.push('/dashboard');
    }
  }, [currentFile, excelData, columnMappings, router]);

  // Start generation process
  useEffect(() => {
    if (hasStarted.current || !currentFile || excelData.length === 0) return;
    hasStarted.current = true;

    const generateReceipts = async () => {
      setStatus('generating');
      
      const generatedReceipts: ReceiptData[] = [];
      const generationErrors: { row: number; message: string }[] = [];
      
      // Get field mappings
      const customerNameCol = columnMappings.find(m => m.receiptField === 'customerName')?.excelColumn;
      const amountCol = columnMappings.find(m => m.receiptField === 'amount')?.excelColumn;
      const dateCol = columnMappings.find(m => m.receiptField === 'date')?.excelColumn;
      const descriptionCol = columnMappings.find(m => m.receiptField === 'description')?.excelColumn;
      const paymentMethodCol = columnMappings.find(m => m.receiptField === 'paymentMethod')?.excelColumn;
      const transactionIdCol = columnMappings.find(m => m.receiptField === 'transactionId')?.excelColumn;
      const notesCol = columnMappings.find(m => m.receiptField === 'notes')?.excelColumn;

      let currentReceiptNumber = receiptSettings.currentNumber || receiptSettings.startingNumber || 1;

      for (let i = 0; i < excelData.length; i++) {
        const row = excelData[i];
        
        // Simulate processing delay for visual feedback
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setCurrentItem(i + 1);
        setProgress(((i + 1) / excelData.length) * 100);

        try {
          // Parse required fields
          const { name: customerName, error: nameError } = customerNameCol 
            ? parseCustomerName(row.data[customerNameCol])
            : { name: null, error: 'לא מופה שדה שם' };
          
          const { amount, error: amountError } = amountCol
            ? parseAmount(row.data[amountCol])
            : { amount: null, error: 'לא מופה שדה סכום' };
          
          const { date, error: dateError } = dateCol
            ? parseDate(row.data[dateCol])
            : { date: new Date(), error: undefined };

          // Check for errors
          if (nameError || amountError) {
            generationErrors.push({
              row: row.rowNumber,
              message: nameError || amountError || 'שגיאה לא ידועה',
            });
            
            generatedReceipts.push({
              id: crypto.randomUUID(),
              receiptNumber: 0,
              customerName: customerName || 'לא ידוע',
              amount: amount || 0,
              date: date || new Date(),
              description: descriptionCol ? String(row.data[descriptionCol] || '') : '',
              paymentMethod: paymentMethodCol ? String(row.data[paymentMethodCol] || '') : undefined,
              transactionId: transactionIdCol ? String(row.data[transactionIdCol] || '') : undefined,
              notes: notesCol ? String(row.data[notesCol] || '') : undefined,
              status: 'error',
              errorMessage: nameError || amountError,
            });
            continue;
          }

          // Create receipt
          const receipt: ReceiptData = {
            id: crypto.randomUUID(),
            receiptNumber: currentReceiptNumber,
            customerName: customerName!,
            amount: amount!,
            date: date || new Date(),
            description: descriptionCol ? String(row.data[descriptionCol] || '') : '',
            paymentMethod: paymentMethodCol ? String(row.data[paymentMethodCol] || '') : undefined,
            transactionId: transactionIdCol ? String(row.data[transactionIdCol] || '') : undefined,
            notes: notesCol ? String(row.data[notesCol] || '') : undefined,
            status: 'generated',
          };

          generatedReceipts.push(receipt);
          currentReceiptNumber++;
        } catch (error) {
          generationErrors.push({
            row: row.rowNumber,
            message: 'שגיאה בעיבוד השורה',
          });
        }
      }

      setReceipts(generatedReceipts);
      setErrors(generationErrors);

      // Update receipt number in settings
      setReceiptSettings({
        ...receiptSettings,
        currentNumber: currentReceiptNumber,
      });

      // Create batch run record
      const batchRun: BatchRun = {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        fileName: currentFile.name,
        totalRows: excelData.length,
        successCount: generatedReceipts.filter(r => r.status === 'generated').length,
        errorCount: generationErrors.length,
        status: 'completed',
        receipts: generatedReceipts,
      };
      addBatchRun(batchRun);

      setStatus('completed');
    };

    generateReceipts();
  }, [currentFile, excelData, columnMappings]);

  const handleDownloadAll = () => {
    // Navigate to results page with receipts
    router.push('/dashboard/results');
  };

  const handleStartNew = () => {
    resetCurrentSession();
    router.push('/dashboard');
  };

  const validReceipts = receipts.filter(r => r.status === 'generated');
  const invalidReceipts = receipts.filter(r => r.status === 'error');

  if (!currentFile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-gray-50)] via-white to-[var(--color-primary-50)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--color-gray-200)]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--color-gray-900)]">
                  הפקת קבלות
                </h1>
                <p className="text-sm text-[var(--color-gray-500)]">
                  {currentFile.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Generating State */}
            {(status === 'preparing' || status === 'generating') && (
              <motion.div
                key="generating"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl shadow-xl p-8 border border-[var(--color-gray-100)] text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-20 h-20 mx-auto mb-6"
                >
                  <div className="w-full h-full border-4 border-[var(--color-gray-200)] border-t-[var(--color-primary)] rounded-full" />
                </motion.div>

                <h2 className="text-2xl font-bold text-[var(--color-gray-900)] mb-2">
                  מייצר קבלות...
                </h2>
                <p className="text-[var(--color-gray-600)] mb-6">
                  {status === 'preparing' ? 'מכין את הנתונים...' : `מעבד שורה ${currentItem} מתוך ${excelData.length}`}
                </p>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-[var(--color-gray-200)] rounded-full overflow-hidden mb-4">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <p className="text-sm text-[var(--color-gray-500)]">
                  {Math.round(progress)}%
                </p>

                {/* Processing Animation */}
                <div className="flex justify-center gap-2 mt-6">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 bg-[var(--color-primary)] rounded-full"
                      animate={{ y: [0, -10, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Completed State */}
            {status === 'completed' && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl p-8 border border-[var(--color-gray-100)]"
              >
                {/* Success Header */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="w-20 h-20 mx-auto mb-4 bg-[var(--color-success-light)] rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-10 h-10 text-[var(--color-success)]" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-[var(--color-gray-900)] mb-2">
                    ההפקה הושלמה! 🎉
                  </h2>
                  <p className="text-[var(--color-gray-600)]">
                    נוצרו {validReceipts.length} קבלות בהצלחה
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-[var(--color-success-light)] rounded-xl text-center">
                    <p className="text-3xl font-bold text-[var(--color-success)]">
                      {validReceipts.length}
                    </p>
                    <p className="text-sm text-[var(--color-success)]">קבלות תקינות</p>
                  </div>
                  {invalidReceipts.length > 0 && (
                    <div className="p-4 bg-[var(--color-error-light)] rounded-xl text-center">
                      <p className="text-3xl font-bold text-[var(--color-error)]">
                        {invalidReceipts.length}
                      </p>
                      <p className="text-sm text-[var(--color-error)]">שורות עם שגיאות</p>
                    </div>
                  )}
                </div>

                {/* Error Details */}
                {errors.length > 0 && (
                  <div className="mb-6 p-4 bg-[var(--color-gray-50)] rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-[var(--color-gray-900)]">
                        שורות שנדלגו:
                      </h3>
                      <button
                        onClick={() => setShowOnlyValid(!showOnlyValid)}
                        className="text-sm text-[var(--color-primary)]"
                      >
                        {showOnlyValid ? 'הצג הכל' : 'הסתר'}
                      </button>
                    </div>
                    {!showOnlyValid && (
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {errors.slice(0, 5).map((err, i) => (
                          <div key={i} className="text-xs text-[var(--color-error)]">
                            שורה {err.row}: {err.message}
                          </div>
                        ))}
                        {errors.length > 5 && (
                          <p className="text-xs text-[var(--color-gray-500)]">
                            ועוד {errors.length - 5} שגיאות...
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={handleDownloadAll}
                    className="w-full btn btn-primary py-4"
                  >
                    <Download className="w-5 h-5" />
                    המשך להורדת הקבלות
                  </button>
                  
                  <button
                    onClick={handleStartNew}
                    className="w-full btn btn-secondary py-4"
                  >
                    <Package className="w-5 h-5" />
                    הפקה חדשה
                  </button>
                </div>
              </motion.div>
            )}

            {/* Error State */}
            {status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl p-8 border border-[var(--color-gray-100)] text-center"
              >
                <div className="w-20 h-20 mx-auto mb-4 bg-[var(--color-error-light)] rounded-full flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-[var(--color-error)]" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-gray-900)] mb-2">
                  אופס! משהו השתבש
                </h2>
                <p className="text-[var(--color-gray-600)] mb-6">
                  לא הצלחנו לעבד את הקובץ. נסו שוב או בדקו את הנתונים.
                </p>
                
                <button
                  onClick={handleStartNew}
                  className="btn btn-primary"
                >
                  נסה שוב
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

