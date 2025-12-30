'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import FileUpload from '@/components/FileUpload';
import { parseExcelFile, suggestColumnMappings } from '@/utils/excelParser';
import { format } from 'date-fns';
import {
  FileText,
  Settings,
  Plus,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronLeft,
  Eye,
  Trash2,
  FileSpreadsheet,
  Building2,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const {
    businessInfo,
    isOnboardingComplete,
    batchRuns,
    setCurrentFile,
    setExcelData,
    setExcelHeaders,
    setColumnMappings,
    currentFile,
  } = useStore();

  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Redirect to onboarding if not complete
  useEffect(() => {
    if (!isOnboardingComplete) {
      router.push('/onboarding');
    }
  }, [isOnboardingComplete, router]);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setUploadError(null);
    setCurrentFile(file);

    try {
      const { headers, rows } = await parseExcelFile(file);
      
      if (rows.length === 0) {
        throw new Error('הקובץ לא מכיל שורות נתונים');
      }

      setExcelHeaders(headers);
      setExcelData(rows);

      // Generate suggested column mappings
      const mappings = suggestColumnMappings(headers);
      setColumnMappings(mappings);

      // Navigate to column mapping
      router.push('/dashboard/mapping');
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'שגיאה בעיבוד הקובץ');
      setCurrentFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="badge badge-success flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            הושלם
          </span>
        );
      case 'processing':
        return (
          <span className="badge badge-warning flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            בתהליך
          </span>
        );
      case 'failed':
        return (
          <span className="badge badge-error flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            נכשל
          </span>
        );
      default:
        return null;
    }
  };

  if (!isOnboardingComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-gray-50)] via-white to-[var(--color-primary-50)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--color-gray-200)] sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--color-gray-900)]">קבליט</h1>
                <p className="text-sm text-[var(--color-gray-500)]">
                  {businessInfo?.name || 'העסק שלי'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => router.push('/onboarding')}
              className="flex items-center gap-2 text-[var(--color-gray-600)] hover:text-[var(--color-primary)] transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span className="hidden sm:inline">הגדרות</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-[var(--color-gray-900)] mb-2">
            שלום, {businessInfo?.name} 👋
          </h2>
          <p className="text-[var(--color-gray-600)]">
            העלו קובץ Excel או CSV כדי להתחיל להפיק קבלות
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Upload */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-[var(--color-gray-100)]"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[var(--color-primary-50)] rounded-xl flex items-center justify-center">
                  <Plus className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-gray-900)]">הפקה חדשה</h3>
                  <p className="text-sm text-[var(--color-gray-500)]">
                    העלו קובץ עם פרטי הלקוחות והעסקאות
                  </p>
                </div>
              </div>

              <FileUpload
                onFileSelect={handleFileSelect}
                isLoading={isLoading}
                error={uploadError}
                acceptedFile={currentFile}
              />

              {/* Quick Tips */}
              <div className="mt-6 p-4 bg-[var(--color-gray-50)] rounded-xl">
                <h4 className="text-sm font-medium text-[var(--color-gray-700)] mb-2">
                  💡 טיפים לקובץ מושלם:
                </h4>
                <ul className="text-xs text-[var(--color-gray-600)] space-y-1">
                  <li>• שורה ראשונה צריכה להכיל כותרות עמודות</li>
                  <li>• ודאו שיש עמודות: שם לקוח, סכום, תאריך</li>
                  <li>• תאריכים בפורמט DD/MM/YYYY או YYYY-MM-DD</li>
                  <li>• סכומים כמספרים (ללא סימני מטבע)</li>
                </ul>
              </div>
            </motion.div>

            {/* Batch History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-[var(--color-gray-100)]"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--color-primary-50)] rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--color-gray-900)]">היסטוריית הפקות</h3>
                    <p className="text-sm text-[var(--color-gray-500)]">
                      {batchRuns.length} הפקות
                    </p>
                  </div>
                </div>
              </div>

              {batchRuns.length === 0 ? (
                <div className="text-center py-12">
                  <FileSpreadsheet className="w-12 h-12 mx-auto text-[var(--color-gray-300)] mb-4" />
                  <p className="text-[var(--color-gray-500)]">
                    עדיין לא הפקתם קבלות
                  </p>
                  <p className="text-sm text-[var(--color-gray-400)]">
                    העלו קובץ כדי להתחיל
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {batchRuns.slice(0, 5).map((run, index) => (
                    <motion.div
                      key={run.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-[var(--color-gray-50)] rounded-xl hover:bg-[var(--color-gray-100)] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <FileText className="w-5 h-5 text-[var(--color-primary)]" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--color-gray-900)]">
                            {run.fileName}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-[var(--color-gray-500)]">
                            <span>{format(new Date(run.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                            <span>•</span>
                            <span>{run.successCount} קבלות</span>
                            {run.errorCount > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-[var(--color-error)]">
                                  {run.errorCount} שגיאות
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusBadge(run.status)}
                        {run.status === 'completed' && run.zipUrl && (
                          <button className="p-2 text-[var(--color-gray-400)] hover:text-[var(--color-primary)] transition-colors">
                            <Download className="w-5 h-5" />
                          </button>
                        )}
                        <button className="p-2 text-[var(--color-gray-400)] hover:text-[var(--color-primary)] transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Business Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-[var(--color-gray-100)]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[var(--color-primary-50)] rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <h3 className="font-bold text-[var(--color-gray-900)]">פרטי העסק</h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-gray-500)]">שם העסק</span>
                  <span className="font-medium">{businessInfo?.name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-gray-500)]">מספר עוסק</span>
                  <span className="font-medium">{businessInfo?.businessId || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-gray-500)]">סוג עסק</span>
                  <span className="font-medium">
                    {businessInfo?.businessType === 'osek_patur' ? 'עוסק פטור' :
                     businessInfo?.businessType === 'osek_morshe' ? 'עוסק מורשה' : 'חברה'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push('/onboarding')}
                className="w-full mt-4 py-2 text-sm text-[var(--color-primary)] hover:bg-[var(--color-primary-50)] rounded-lg transition-colors"
              >
                ערוך פרטים
              </button>
            </motion.div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-2xl shadow-lg p-6 text-white"
            >
              <h3 className="font-bold mb-4">סטטיסטיקות</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-bold">
                    {batchRuns.reduce((sum, run) => sum + run.successCount, 0)}
                  </p>
                  <p className="text-sm text-white/70">קבלות שנוצרו</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{batchRuns.length}</p>
                  <p className="text-sm text-white/70">הפקות</p>
                </div>
              </div>
            </motion.div>

            {/* Help Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-[var(--color-gray-50)] rounded-2xl p-6 border border-[var(--color-gray-200)]"
            >
              <h3 className="font-bold text-[var(--color-gray-900)] mb-3">
                צריכים עזרה?
              </h3>
              <p className="text-sm text-[var(--color-gray-600)] mb-4">
                יש לנו מדריכים ותמיכה זמינה
              </p>
              <button className="w-full btn btn-secondary text-sm">
                צור קשר
                <ChevronLeft className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

