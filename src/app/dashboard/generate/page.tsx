'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { createZipWithReceipts } from '@/utils/pdfGenerator';
import {
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Save,
  X,
  Loader2,
  ArrowRight,
  Package,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileCheck,
  Zap,
  Archive,
} from 'lucide-react';

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

interface Summary {
  totalRows: number;
  completeRows: number;
  incompleteRows: number;
  totalAmount: number;
  dateRange: { from: string; to: string };
}

const FIELD_LABELS: Record<string, string> = {
  customerName: 'שם לקוח',
  amount: 'סכום',
  date: 'תאריך',
  description: 'תיאור',
  paymentMethod: 'אמצעי תשלום',
  notes: 'הערות',
};

// הודעות אנימציה בזמן יצירת קבלות
const GENERATION_MESSAGES = [
  { icon: Sparkles, text: 'מכין את הקבלות...' },
  { icon: FileText, text: 'יוצר מסמכי PDF...' },
  { icon: FileCheck, text: 'מאמת את הנתונים...' },
  { icon: Zap, text: 'מעבד את הקבלות...' },
  { icon: Archive, text: 'אורז לקובץ ZIP...' },
  { icon: Download, text: 'מכין להורדה...' },
];

export default function GeneratePage() {
  const router = useRouter();
  const { businessInfo, receiptSettings, isOnboardingComplete, resetCurrentSession, addBatchRun } = useStore();

  const [receipts, setReceipts] = useState<ExtractedReceipt[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<ExtractedReceipt>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState(0);
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Rotate generation messages
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setGenerationStep((prev) => (prev + 1) % GENERATION_MESSAGES.length);
      }, 2500);
      return () => clearInterval(interval);
    } else {
      setGenerationStep(0);
    }
  }, [isGenerating]);

  // Load data from localStorage
  useEffect(() => {
    if (!isOnboardingComplete) {
      router.push('/onboarding');
      return;
    }

    const savedReceipts = localStorage.getItem('extractedReceipts');
    const savedSummary = localStorage.getItem('analysisSummary');

    if (!savedReceipts) {
      router.push('/dashboard');
      return;
    }

    try {
      const parsedReceipts = JSON.parse(savedReceipts);
      setReceipts(parsedReceipts);
      if (savedSummary) setSummary(JSON.parse(savedSummary));
    } catch {
      router.push('/dashboard');
    }
  }, [isOnboardingComplete, router]);

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditData({ ...receipts[index] });
  };

  const saveEdit = () => {
    if (editingIndex === null) return;

    const updated = [...receipts];
    updated[editingIndex] = {
      ...updated[editingIndex],
      ...editData,
      isComplete: true,
      missingFields: [],
    };
    setReceipts(updated);
    localStorage.setItem('extractedReceipts', JSON.stringify(updated));

    // Update summary
    if (summary) {
      const newIncomplete = updated.filter(r => !r.isComplete).length;
      setSummary({
        ...summary,
        completeRows: updated.length - newIncomplete,
        incompleteRows: newIncomplete,
      });
    }

    setEditingIndex(null);
    setEditData({});
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditData({});
  };

  const toggleRowExpand = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const generateAndDownload = async () => {
    if (!businessInfo) {
      alert('אנא הגדר את פרטי העסק תחילה');
      return;
    }

    // Check if there are incomplete receipts
    const incompleteCount = receipts.filter(r => !r.isComplete).length;
    if (incompleteCount > 0) {
      const proceed = confirm(`יש ${incompleteCount} קבלות עם שדות חסרים. האם להמשיך בכל זאת?`);
      if (!proceed) return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationError(null);

    try {
      console.log('[Generate] Starting ZIP generation...');
      console.log('[Generate] Receipts count:', receipts.length);
      console.log('[Generate] Business info:', businessInfo.name);

      const zipBlob = await createZipWithReceipts(
        receipts,
        businessInfo,
        receiptSettings,
        (progress) => {
          setGenerationProgress(progress);
          console.log('[Generate] Progress:', progress);
        }
      );

      console.log('[Generate] ZIP created, size:', zipBlob.size);

      if (!zipBlob || zipBlob.size === 0) {
        throw new Error('נוצר קובץ ZIP ריק. אנא נסה שוב.');
      }

      // Download ZIP
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `receipts_${dateStr}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('[Generate] Download initiated');

      // Save batch run
      addBatchRun({
        id: crypto.randomUUID(),
        createdAt: new Date(),
        fileName: 'Excel Import',
        totalRows: receipts.length,
        successCount: receipts.filter(r => r.isComplete).length,
        errorCount: receipts.filter(r => !r.isComplete).length,
        status: 'completed',
        receipts: receipts.map((r, i) => ({
          id: crypto.randomUUID(),
          receiptNumber: receiptSettings.startingNumber + i,
          customerName: r.customerName,
          amount: r.amount,
          date: parseDate(r.date),
          description: r.description,
          paymentMethod: r.paymentMethod,
          notes: r.notes,
          status: r.isComplete ? 'generated' : 'error',
        })),
      });

      // Cleanup
      localStorage.removeItem('extractedReceipts');
      localStorage.removeItem('analysisSummary');
      resetCurrentSession();

      // Redirect to success
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (error) {
      console.error('[Generate] Error:', error);
      setGenerationError(error instanceof Error ? error.message : 'שגיאה ביצירת הקבלות');
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to parse date
  const parseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const filteredReceipts = showIncompleteOnly 
    ? receipts.filter(r => !r.isComplete)
    : receipts;

  if (receipts.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F172A' }}>
        <Loader2 style={{ width: '2rem', height: '2rem', color: '#3FC1C9', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', fontFamily: 'Heebo, sans-serif' }}>
      {/* Generation Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.95)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                background: 'linear-gradient(145deg, #1E293B 0%, #0F172A 100%)',
                borderRadius: '24px',
                padding: '48px',
                textAlign: 'center',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                border: '1px solid rgba(63, 193, 201, 0.2)',
              }}
            >
              {/* Animated Icon */}
              <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 24px' }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    border: '3px solid transparent',
                    borderTopColor: '#3FC1C9',
                    borderRightColor: '#8b5cf6',
                  }}
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    inset: '10px',
                    borderRadius: '50%',
                    border: '3px solid transparent',
                    borderBottomColor: '#10B981',
                    borderLeftColor: '#F59E0B',
                  }}
                />
                <div style={{
                  position: 'absolute',
                  inset: '20px',
                  background: 'linear-gradient(135deg, #3FC1C9 0%, #8b5cf6 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={generationStep}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      {(() => {
                        const CurrentIcon = GENERATION_MESSAGES[generationStep].icon;
                        return <CurrentIcon style={{ width: '28px', height: '28px', color: 'white' }} />;
                      })()}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Title */}
              <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '12px' }}>
                מייצר את הקבלות שלך
              </h2>

              {/* Animated Message */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={generationStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ color: '#94A3B8', fontSize: '1rem', marginBottom: '24px' }}
                >
                  {GENERATION_MESSAGES[generationStep].text}
                </motion.p>
              </AnimatePresence>

              {/* Progress Bar */}
              <div style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '12px',
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${generationProgress}%` }}
                  transition={{ duration: 0.3 }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #3FC1C9 0%, #10B981 50%, #8b5cf6 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'gradient 2s ease infinite',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                {Math.round(generationProgress)}% הושלם
              </p>

              {/* Receipt Counter */}
              <div style={{
                marginTop: '20px',
                padding: '12px 20px',
                background: 'rgba(63, 193, 201, 0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}>
                <FileText style={{ width: '18px', height: '18px', color: '#3FC1C9' }} />
                <span style={{ color: '#3FC1C9', fontWeight: '500' }}>
                  {Math.round(generationProgress / 100 * receipts.length)} / {receipts.length} קבלות
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'sticky', top: 0, zIndex: 50, background: '#0F172A' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => router.push('/dashboard')}
                style={{ color: '#94A3B8', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <ArrowRight style={{ width: '1.25rem', height: '1.25rem' }} />
                חזור
              </button>
              <div style={{ height: '1.5rem', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>
                סקירה ויצירת קבלות
              </h1>
            </div>

            <button
              onClick={generateAndDownload}
              disabled={isGenerating}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.75rem',
                background: isGenerating ? '#475569' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                fontWeight: 'bold',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                fontFamily: 'inherit',
                boxShadow: isGenerating ? 'none' : '0 4px 15px rgba(16, 185, 129, 0.4)',
              }}
            >
              <Package style={{ width: '1.25rem', height: '1.25rem' }} />
              הורד ZIP עם כל הקבלות
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Error Message */}
        {generationError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <AlertCircle style={{ width: '24px', height: '24px', color: '#EF4444', flexShrink: 0 }} />
            <div>
              <p style={{ color: '#EF4444', fontWeight: '500' }}>שגיאה ביצירת הקבלות</p>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>{generationError}</p>
            </div>
            <button
              onClick={() => setGenerationError(null)}
              style={{ marginRight: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <X style={{ width: '20px', height: '20px', color: '#94A3B8' }} />
            </button>
          </motion.div>
        )}

        {/* Summary Bar */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}
          >
            <div style={{ flex: 1, minWidth: '150px', background: 'rgba(63, 193, 201, 0.1)', border: '1px solid rgba(63, 193, 201, 0.3)', borderRadius: '0.75rem', padding: '1rem' }}>
              <p style={{ color: '#3FC1C9', fontSize: '1.5rem', fontWeight: 'bold' }}>{receipts.length}</p>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>סה"כ קבלות</p>
            </div>
            <div style={{ flex: 1, minWidth: '150px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '0.75rem', padding: '1rem' }}>
              <p style={{ color: '#10B981', fontSize: '1.5rem', fontWeight: 'bold' }}>{summary.completeRows}</p>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>קבלות מלאות</p>
            </div>
            {summary.incompleteRows > 0 && (
              <div style={{ flex: 1, minWidth: '150px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '0.75rem', padding: '1rem' }}>
                <p style={{ color: '#F59E0B', fontSize: '1.5rem', fontWeight: 'bold' }}>{summary.incompleteRows}</p>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>דורשות השלמה</p>
              </div>
            )}
            <div style={{ flex: 1, minWidth: '150px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '1rem' }}>
              <p style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>₪{summary.totalAmount.toLocaleString()}</p>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>סכום כולל</p>
            </div>
          </motion.div>
        )}

        {/* Filter Toggle */}
        {summary && summary.incompleteRows > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={() => setShowIncompleteOnly(!showIncompleteOnly)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: `2px solid ${showIncompleteOnly ? '#F59E0B' : '#475569'}`,
                background: showIncompleteOnly ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                color: showIncompleteOnly ? '#F59E0B' : '#94A3B8',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontFamily: 'inherit'
              }}
            >
              {showIncompleteOnly ? 'הצג הכל' : `הצג רק לא מלאות (${summary.incompleteRows})`}
            </button>
          </div>
        )}

        {/* Receipts List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredReceipts.map((receipt, index) => {
            const actualIndex = receipts.indexOf(receipt);
            const isEditing = editingIndex === actualIndex;
            const isExpanded = expandedRows.has(actualIndex);

            return (
              <motion.div
                key={actualIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                style={{
                  background: receipt.isComplete ? 'rgba(255,255,255,0.03)' : 'rgba(245, 158, 11, 0.05)',
                  border: `1px solid ${receipt.isComplete ? 'rgba(255,255,255,0.1)' : 'rgba(245, 158, 11, 0.3)'}`,
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  marginBottom: '0.75rem'
                }}
              >
                {/* Row Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.5rem',
                    cursor: 'pointer',
                  }}
                  onClick={() => !isEditing && toggleRowExpand(actualIndex)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    {receipt.isComplete ? (
                      <CheckCircle2 style={{ width: '1.5rem', height: '1.5rem', color: '#10B981', flexShrink: 0 }} />
                    ) : (
                      <AlertCircle style={{ width: '1.5rem', height: '1.5rem', color: '#F59E0B', flexShrink: 0 }} />
                    )}
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: 'white', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {receipt.customerName || 'ללא שם לקוח'}
                      </p>
                      <p style={{ color: '#64748B', fontSize: '0.85rem' }}>
                        קבלה #{receiptSettings.startingNumber + actualIndex}
                        {receipt.date && ` • ${receipt.date}`}
                      </p>
                    </div>

                    <div style={{ textAlign: 'left', marginRight: '1rem' }}>
                      <p style={{ color: '#3FC1C9', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        ₪{(receipt.amount || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {!receipt.isComplete && (
                      <button
                        onClick={(e) => { e.stopPropagation(); startEditing(actualIndex); }}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          border: '1px solid #F59E0B',
                          background: 'transparent',
                          color: '#F59E0B',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.85rem',
                          fontFamily: 'inherit'
                        }}
                      >
                        <Edit3 style={{ width: '1rem', height: '1rem' }} />
                        השלם
                      </button>
                    )}
                    {isExpanded ? (
                      <ChevronUp style={{ width: '1.25rem', height: '1.25rem', color: '#64748B' }} />
                    ) : (
                      <ChevronDown style={{ width: '1.25rem', height: '1.25rem', color: '#64748B' }} />
                    )}
                  </div>
                </div>

                {/* Expanded Content / Edit Form */}
                <AnimatePresence>
                  {(isExpanded || isEditing) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ borderTop: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}
                    >
                      {isEditing ? (
                        // Edit Form
                        <div style={{ padding: '1.5rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            {['customerName', 'amount', 'date', 'description', 'paymentMethod', 'notes'].map((field) => (
                              <div key={field}>
                                <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                  {FIELD_LABELS[field]}
                                  {receipt.missingFields.includes(field) && (
                                    <span style={{ color: '#F59E0B', marginRight: '0.25rem' }}>*</span>
                                  )}
                                </label>
                                <input
                                  type={field === 'amount' ? 'number' : 'text'}
                                  value={(editData as any)[field] || ''}
                                  onChange={(e) => setEditData({ ...editData, [field]: field === 'amount' ? parseFloat(e.target.value) || 0 : e.target.value })}
                                  style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: receipt.missingFields.includes(field) ? '2px solid #F59E0B' : '1px solid #475569',
                                    background: '#1E293B',
                                    color: 'white',
                                    fontSize: '0.95rem',
                                    fontFamily: 'inherit'
                                  }}
                                  placeholder={FIELD_LABELS[field]}
                                />
                              </div>
                            ))}
                          </div>

                          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={cancelEdit}
                              style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #475569',
                                background: 'transparent',
                                color: '#94A3B8',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontFamily: 'inherit'
                              }}
                            >
                              <X style={{ width: '1rem', height: '1rem' }} />
                              ביטול
                            </button>
                            <button
                              onClick={saveEdit}
                              style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                background: '#10B981',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontWeight: '500',
                                fontFamily: 'inherit'
                              }}
                            >
                              <Save style={{ width: '1rem', height: '1rem' }} />
                              שמור
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Details
                        <div style={{ padding: '1.5rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            {[
                              { label: 'תיאור', value: receipt.description },
                              { label: 'אמצעי תשלום', value: receipt.paymentMethod },
                              { label: 'הערות', value: receipt.notes },
                            ].map((item, i) => (
                              <div key={i}>
                                <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '0.25rem' }}>{item.label}</p>
                                <p style={{ color: 'white' }}>{item.value || '-'}</p>
                              </div>
                            ))}
                          </div>
                          
                          {!receipt.isComplete && receipt.missingFields.length > 0 && (
                            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '0.5rem' }}>
                              <p style={{ color: '#F59E0B', fontSize: '0.85rem' }}>
                                שדות חסרים: {receipt.missingFields.map(f => FIELD_LABELS[f]).join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* CSS for gradient animation */}
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
