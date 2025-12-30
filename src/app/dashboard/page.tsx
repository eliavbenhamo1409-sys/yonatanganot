'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { parseExcelFile } from '@/utils/excelParser';
import { useDropzone } from 'react-dropzone';
import {
  FileText,
  Settings,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileSpreadsheet,
  ArrowLeft,
  X,
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

interface AnalysisResult {
  success: boolean;
  receipts: ExtractedReceipt[];
  summary: {
    totalRows: number;
    completeRows: number;
    incompleteRows: number;
    totalAmount: number;
    dateRange: { from: string; to: string };
  };
  error?: string;
}

type ProcessingStep = 'idle' | 'uploading' | 'parsing' | 'analyzing' | 'done' | 'error';

export default function DashboardPage() {
  const router = useRouter();
  const {
    businessInfo,
    isOnboardingComplete,
    setCurrentFile,
    setExcelData,
    setExcelHeaders,
  } = useStore();

  const [step, setStep] = useState<ProcessingStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [fileName, setFileName] = useState<string>('');

  // Redirect to onboarding if not complete
  useEffect(() => {
    if (!isOnboardingComplete) {
      router.push('/onboarding');
    }
  }, [isOnboardingComplete, router]);

  const processFile = async (file: File) => {
    setError(null);
    setFileName(file.name);
    setCurrentFile(file);

    try {
      // Step 1: Parse Excel
      setStep('parsing');
      const { headers, rows } = await parseExcelFile(file);

      if (rows.length === 0) {
        throw new Error('הקובץ לא מכיל שורות נתונים');
      }

      setExcelHeaders(headers);
      setExcelData(rows);

      // Step 2: Send to AI for analysis
      setStep('analyzing');
      
      const response = await fetch('/api/analyze-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headers,
          rows: rows.map(r => r.data),
          businessInfo
        }),
      });

      const result: AnalysisResult = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'שגיאה בניתוח הקובץ');
      }

      setAnalysisResult(result);
      setStep('done');

      // Save to localStorage for the generate page
      localStorage.setItem('extractedReceipts', JSON.stringify(result.receipts));
      localStorage.setItem('analysisSummary', JSON.stringify(result.summary));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בעיבוד הקובץ');
      setStep('error');
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setStep('uploading');
      setTimeout(() => processFile(acceptedFiles[0]), 300);
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
    disabled: step !== 'idle' && step !== 'error',
  });

  const resetUpload = () => {
    setStep('idle');
    setError(null);
    setAnalysisResult(null);
    setFileName('');
    setCurrentFile(null);
  };

  const continueToGenerate = () => {
    router.push('/dashboard/generate');
  };

  if (!isOnboardingComplete) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F172A' }}>
        <Loader2 style={{ width: '2rem', height: '2rem', color: '#3FC1C9', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const getStepMessage = () => {
    switch (step) {
      case 'uploading': return 'מעלה את הקובץ...';
      case 'parsing': return 'קורא את הנתונים מהאקסל...';
      case 'analyzing': return '🤖 AI מנתח את הקובץ ומחלץ קבלות...';
      default: return '';
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', fontFamily: 'Heebo, sans-serif' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'sticky', top: 0, zIndex: 50, background: '#0F172A' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', background: 'linear-gradient(135deg, #3FC1C9 0%, #0F4C75 100%)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>קבליט</h1>
                <p style={{ fontSize: '0.875rem', color: '#94A3B8' }}>
                  {businessInfo?.name || 'העסק שלי'}
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push('/onboarding')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8', transition: 'all 0.2s', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}
            >
              <Settings style={{ width: '1.25rem', height: '1.25rem' }} />
              הגדרות
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '1.5rem' }}
        >
          <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
            הפקת קבלות חכמה
          </h2>
          <p style={{ color: '#94A3B8', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)' }}>
            העלה קובץ Excel והבינה המלאכותית תחלץ את כל הנתונים
          </p>
        </motion.div>

        {/* Main Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ maxWidth: '600px', margin: '0 auto' }}
        >
          <AnimatePresence mode="wait">
            {/* Idle State - Upload Area */}
            {(step === 'idle' || step === 'error') && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div
                  {...getRootProps()}
                  style={{
                    border: `2px dashed ${isDragActive ? '#3FC1C9' : error ? '#EF4444' : '#475569'}`,
                    borderRadius: '1rem',
                    padding: '2rem 1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: isDragActive ? 'rgba(63, 193, 201, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  <input {...getInputProps()} />
                  
                  <div style={{ width: '4rem', height: '4rem', margin: '0 auto 1rem', background: 'rgba(63, 193, 201, 0.15)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileSpreadsheet style={{ width: '2rem', height: '2rem', color: '#3FC1C9' }} />
                  </div>

                  {isDragActive ? (
                    <p style={{ color: '#3FC1C9', fontSize: '1.1rem', fontWeight: '500', margin: 0 }}>
                      שחרר את הקובץ כאן...
                    </p>
                  ) : (
                    <>
                      <p style={{ color: 'white', fontSize: 'clamp(1rem, 4vw, 1.25rem)', fontWeight: '500', marginBottom: '0.3rem' }}>
                        גרור קובץ Excel או לחץ לבחירה
                      </p>
                      <p style={{ color: '#64748B', fontSize: '0.85rem', margin: 0 }}>
                        תומך ב-XLSX, XLS, CSV
                      </p>
                    </>
                  )}

                  {error && (
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                      <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: '#EF4444' }} />
                      <span style={{ color: '#EF4444' }}>{error}</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '1.5rem' }}>
                  {[
                    { icon: Sparkles, text: 'זיהוי AI חכם' },
                    { icon: CheckCircle2, text: 'ללא הגדרות' },
                    { icon: FileText, text: 'קבלות מיידיות' },
                  ].map((item, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '0.75rem 0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem' }}>
                      <item.icon style={{ width: '1.25rem', height: '1.25rem', color: '#3FC1C9', margin: '0 auto 0.3rem' }} />
                      <p style={{ color: '#94A3B8', fontSize: '0.75rem', margin: 0 }}>{item.text}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Processing State */}
            {(step === 'uploading' || step === 'parsing' || step === 'analyzing') && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', padding: '3rem 2rem', textAlign: 'center' }}
              >
                <div style={{ width: '5rem', height: '5rem', margin: '0 auto 1.5rem', background: 'rgba(63, 193, 201, 0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loader2 style={{ width: '2.5rem', height: '2.5rem', color: '#3FC1C9', animation: 'spin 1s linear infinite' }} />
                </div>

                <p style={{ color: 'white', fontSize: '1.25rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  {getStepMessage()}
                </p>
                <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                  {fileName}
                </p>

                {/* Progress Steps */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                  {['העלאה', 'קריאה', 'ניתוח AI'].map((label, i) => {
                    const stepIndex = ['uploading', 'parsing', 'analyzing'].indexOf(step);
                    const isActive = stepIndex >= i;
                    const isCurrent = stepIndex === i;
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{
                          width: '1.75rem', height: '1.75rem', borderRadius: '50%',
                          background: isActive ? '#3FC1C9' : '#334155',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.3s'
                        }}>
                          {isCurrent ? (
                            <Loader2 style={{ width: '0.9rem', height: '0.9rem', color: 'white', animation: 'spin 1s linear infinite' }} />
                          ) : isActive ? (
                            <CheckCircle2 style={{ width: '0.9rem', height: '0.9rem', color: 'white' }} />
                          ) : (
                            <span style={{ color: '#64748B', fontSize: '0.7rem' }}>{i + 1}</span>
                          )}
                        </div>
                        <span style={{ color: isActive ? '#3FC1C9' : '#64748B', fontSize: '0.8rem' }}>{label}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Done State - Results */}
            {step === 'done' && analysisResult && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', padding: '2rem' }}
              >
                {/* Success Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div style={{ width: '4rem', height: '4rem', margin: '0 auto 1rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 style={{ width: '2rem', height: '2rem', color: '#10B981' }} />
                  </div>
                  <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    הניתוח הושלם!
                  </h3>
                  <p style={{ color: '#94A3B8' }}>
                    AI זיהה {analysisResult.receipts.length} קבלות בקובץ
                  </p>
                </div>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '0.75rem', padding: '1rem', textAlign: 'center' }}>
                    <p style={{ color: '#10B981', fontSize: '2rem', fontWeight: 'bold' }}>
                      {analysisResult.summary.completeRows}
                    </p>
                    <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>קבלות מלאות</p>
                  </div>
                  <div style={{ background: 'rgba(63, 193, 201, 0.1)', border: '1px solid rgba(63, 193, 201, 0.3)', borderRadius: '0.75rem', padding: '1rem', textAlign: 'center' }}>
                    <p style={{ color: '#3FC1C9', fontSize: '2rem', fontWeight: 'bold' }}>
                      ₪{analysisResult.summary.totalAmount.toLocaleString()}
                    </p>
                    <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>סה"כ</p>
                  </div>
                </div>

                {/* Date Range */}
                {analysisResult.summary.dateRange.from && (
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                    <span style={{ color: '#64748B', fontSize: '0.85rem' }}>
                      טווח תאריכים: {analysisResult.summary.dateRange.from} - {analysisResult.summary.dateRange.to}
                    </span>
                  </div>
                )}

                {/* Incomplete Rows Warning */}
                {analysisResult.summary.incompleteRows > 0 && (
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <AlertCircle style={{ width: '1.5rem', height: '1.5rem', color: '#F59E0B', flexShrink: 0 }} />
                    <div>
                      <p style={{ color: '#F59E0B', fontWeight: '500' }}>
                        {analysisResult.summary.incompleteRows} שורות עם שדות חסרים
                      </p>
                      <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                        תוכל להשלים אותם בשלב הבא
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={resetUpload}
                    style={{
                      flex: 1,
                      padding: '0.875rem 1.5rem',
                      border: '2px solid #475569',
                      borderRadius: '0.75rem',
                      background: 'transparent',
                      color: '#94A3B8',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontSize: '1rem',
                      fontFamily: 'inherit'
                    }}
                  >
                    <X style={{ width: '1.25rem', height: '1.25rem' }} />
                    בטל
                  </button>
                  <button
                    onClick={continueToGenerate}
                    style={{
                      flex: 2,
                      padding: '0.875rem 1.5rem',
                      border: 'none',
                      borderRadius: '0.75rem',
                      background: 'linear-gradient(135deg, #3FC1C9 0%, #0F4C75 100%)',
                      color: 'white',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontSize: '1rem',
                      fontFamily: 'inherit'
                    }}
                  >
                    המשך ליצירת קבלות
                    <ArrowLeft style={{ width: '1.25rem', height: '1.25rem' }} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
