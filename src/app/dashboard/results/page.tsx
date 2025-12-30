'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';
import { generateSinglePdf, downloadPdf } from '@/utils/pdfGenerator';
import {
  FileText,
  Download,
  Package,
  Mail,
  ChevronRight,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Home,
} from 'lucide-react';

export default function ResultsPage() {
  const router = useRouter();
  const { businessInfo, receiptSettings, batchRuns, resetCurrentSession } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'generated' | 'error'>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  // Get the latest batch run
  const latestBatch = batchRuns[0];

  // Redirect if no batch runs
  useEffect(() => {
    if (!latestBatch) {
      router.push('/dashboard');
    }
  }, [latestBatch, router]);

  const filteredReceipts = latestBatch?.receipts.filter((receipt) => {
    const matchesSearch = receipt.customerName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' || receipt.status === filterStatus;
    return matchesSearch && matchesFilter;
  }) || [];

  const handleDownloadSingle = async (receiptId: string) => {
    if (!businessInfo || !latestBatch) return;
    
    const receipt = latestBatch.receipts.find(r => r.id === receiptId);
    if (!receipt || receipt.status === 'error') return;

    setDownloadingId(receiptId);
    
    try {
      const blob = await generateSinglePdf(receipt, businessInfo, receiptSettings);
      downloadPdf(blob, `קבלה_${receipt.receiptNumber}_${receipt.customerName}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('שגיאה ביצירת ה-PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadAll = async () => {
    if (!businessInfo || !latestBatch) return;
    
    setDownloadingAll(true);
    
    try {
      const validReceipts = latestBatch.receipts.filter(r => r.status === 'generated');
      
      // Generate and download each PDF
      for (const receipt of validReceipts) {
        const blob = await generateSinglePdf(receipt, businessInfo, receiptSettings);
        downloadPdf(blob, `קבלה_${receipt.receiptNumber}_${receipt.customerName}.pdf`);
        // Small delay to prevent browser blocking
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.error('Error generating PDFs:', error);
      alert('שגיאה ביצירת הקבלות');
    } finally {
      setDownloadingAll(false);
    }
  };

  const handleNewBatch = () => {
    resetCurrentSession();
    router.push('/dashboard');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: receiptSettings.currency,
    }).format(amount);
  };

  if (!latestBatch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
      </div>
    );
  }

  const validCount = latestBatch.receipts.filter(r => r.status === 'generated').length;
  const errorCount = latestBatch.receipts.filter(r => r.status === 'error').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-gray-50)] via-white to-[var(--color-primary-50)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--color-gray-200)] sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-[var(--color-gray-500)] hover:text-[var(--color-gray-700)] transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-[var(--color-gray-900)]">
                  תוצאות הפקה
                </h1>
                <p className="text-sm text-[var(--color-gray-500)]">
                  {latestBatch.fileName} • {format(new Date(latestBatch.createdAt), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleNewBatch}
              className="btn btn-secondary"
            >
              <Home className="w-5 h-5" />
              חזרה לדף הבית
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-6 border border-[var(--color-gray-100)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-gray-500)]">סה"כ שורות</p>
                <p className="text-2xl font-bold text-[var(--color-gray-900)]">
                  {latestBatch.totalRows}
                </p>
              </div>
              <div className="w-12 h-12 bg-[var(--color-gray-100)] rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-[var(--color-gray-600)]" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md p-6 border border-[var(--color-gray-100)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-success)]">קבלות תקינות</p>
                <p className="text-2xl font-bold text-[var(--color-success)]">
                  {validCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-[var(--color-success-light)] rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-[var(--color-success)]" />
              </div>
            </div>
          </motion.div>

          {errorCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-md p-6 border border-[var(--color-gray-100)]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-error)]">שגיאות</p>
                  <p className="text-2xl font-bold text-[var(--color-error)]">
                    {errorCount}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[var(--color-error-light)] rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-[var(--color-error)]" />
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-xl shadow-md p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">סה"כ סכום</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    latestBatch.receipts
                      .filter(r => r.status === 'generated')
                      .reduce((sum, r) => sum + r.amount, 0)
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-md p-4 border border-[var(--color-gray-100)] mb-6"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search & Filter */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-gray-400)]" />
                <input
                  type="text"
                  placeholder="חיפוש לפי שם לקוח..."
                  className="input pr-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <select
                className="input w-auto"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              >
                <option value="all">הכל</option>
                <option value="generated">תקינות</option>
                <option value="error">שגיאות</option>
              </select>
            </div>

            {/* Download Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleDownloadAll}
                disabled={downloadingAll || validCount === 0}
                className="btn btn-primary flex-1 md:flex-none"
              >
                {downloadingAll ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    מוריד...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    הורד הכל ({validCount})
                  </>
                )}
              </button>
              
              <button
                className="btn btn-secondary flex-1 md:flex-none"
                title="בקרוב"
                disabled
              >
                <Mail className="w-5 h-5" />
                שלח במייל
              </button>
            </div>
          </div>
        </motion.div>

        {/* Receipts Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-md border border-[var(--color-gray-100)] overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>מספר קבלה</th>
                  <th>שם לקוח</th>
                  <th>תאריך</th>
                  <th>סכום</th>
                  <th>סטטוס</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-[var(--color-gray-500)]">
                      לא נמצאו תוצאות
                    </td>
                  </tr>
                ) : (
                  filteredReceipts.map((receipt, index) => (
                    <motion.tr
                      key={receipt.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <td>
                        <span className="font-medium">
                          {receipt.status === 'error' ? '-' : receipt.receiptNumber}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[var(--color-primary-50)] rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-[var(--color-primary)]">
                              {receipt.customerName.charAt(0)}
                            </span>
                          </div>
                          <span>{receipt.customerName}</span>
                        </div>
                      </td>
                      <td className="text-[var(--color-gray-600)]">
                        {format(new Date(receipt.date), 'dd/MM/yyyy')}
                      </td>
                      <td>
                        <span className="font-medium">
                          {formatCurrency(receipt.amount)}
                        </span>
                      </td>
                      <td>
                        {receipt.status === 'generated' ? (
                          <span className="badge badge-success">
                            <CheckCircle2 className="w-3 h-3" />
                            מוכן
                          </span>
                        ) : (
                          <span className="badge badge-error" title={receipt.errorMessage}>
                            <AlertCircle className="w-3 h-3" />
                            שגיאה
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadSingle(receipt.id)}
                            disabled={receipt.status === 'error' || downloadingId === receipt.id}
                            className={`p-2 rounded-lg transition-colors ${
                              receipt.status === 'error'
                                ? 'text-[var(--color-gray-300)] cursor-not-allowed'
                                : 'text-[var(--color-gray-500)] hover:text-[var(--color-primary)] hover:bg-[var(--color-gray-100)]'
                            }`}
                            title="הורד PDF"
                          >
                            {downloadingId === receipt.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Download className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            className="p-2 text-[var(--color-gray-500)] hover:text-[var(--color-primary)] hover:bg-[var(--color-gray-100)] rounded-lg transition-colors"
                            title="תצוגה מקדימה"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Privacy Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center text-sm text-[var(--color-gray-500)]"
        >
          🔒 הקבלות נשמרות בדפדפן שלך בלבד. ניתן למחוק את ההיסטוריה בכל עת.
        </motion.div>
      </main>
    </div>
  );
}

