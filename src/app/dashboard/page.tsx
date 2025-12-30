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
  Eye,
  FileSpreadsheet,
  Building2,
  Upload,
  Sparkles,
  ArrowLeft,
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

      const mappings = suggestColumnMappings(headers);
      setColumnMappings(mappings);

      router.push('/dashboard/mapping');
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'שגיאה בעיבוד הקובץ');
      setCurrentFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, React.CSSProperties> = {
      completed: { background: '#d1fae5', color: '#059669' },
      processing: { background: '#fef3c7', color: '#d97706' },
      failed: { background: '#fee2e2', color: '#dc2626' },
    };
    
    const labels: Record<string, string> = {
      completed: 'הושלם',
      processing: 'בתהליך',
      failed: 'נכשל',
    };

    const icons: Record<string, React.ReactNode> = {
      completed: <CheckCircle2 style={{ width: '14px', height: '14px' }} />,
      processing: <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />,
      failed: <AlertCircle style={{ width: '14px', height: '14px' }} />,
    };

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        ...styles[status]
      }}>
        {icons[status]}
        {labels[status]}
      </span>
    );
  };

  if (!isOnboardingComplete) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <Loader2 style={{ width: '32px', height: '32px', color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#f1f5f9',
      fontFamily: "'Heebo', sans-serif",
      direction: 'rtl'
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
        padding: '20px 0',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileText style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'white', margin: 0 }}>קבליט</h1>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                  {businessInfo?.name || 'העסק שלי'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => router.push('/onboarding')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '10px',
                color: 'white',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Settings style={{ width: '18px', height: '18px' }} />
              <span>הגדרות</span>
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '32px' }}
        >
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
            שלום, {businessInfo?.name} 👋
          </h2>
          <p style={{ fontSize: '16px', color: '#64748b' }}>
            העלו קובץ Excel כדי ליצור קבלות PDF
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }}>
          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Upload Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Upload style={{ width: '28px', height: '28px', color: 'white' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                    הפקת קבלות חדשה
                  </h3>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0' }}>
                    העלו קובץ Excel עם פרטי הלקוחות והעסקאות
                  </p>
                </div>
              </div>

              {/* Upload Zone */}
              <div
                style={{
                  border: '3px dashed #cbd5e1',
                  borderRadius: '16px',
                  padding: '48px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  background: '#f8fafc'
                }}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />
                
                {isLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <Loader2 style={{ width: '48px', height: '48px', color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
                    <p style={{ color: '#64748b', fontSize: '16px' }}>מעבד את הקובץ...</p>
                  </div>
                ) : (
                  <>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(135deg, #dbeafe, #ede9fe)',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px'
                    }}>
                      <FileSpreadsheet style={{ width: '40px', height: '40px', color: '#3b82f6' }} />
                    </div>
                    <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>
                      גררו קובץ Excel או CSV לכאן
                    </h4>
                    <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
                      או לחצו לבחירת קובץ מהמחשב
                    </p>
                    <span style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      background: '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#64748b'
                    }}>
                      תומך ב-XLSX, XLS, CSV
                    </span>
                  </>
                )}
              </div>

              {uploadError && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  background: '#fee2e2',
                  borderRadius: '10px',
                  color: '#dc2626',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle style={{ width: '18px', height: '18px' }} />
                  {uploadError}
                </div>
              )}

              {/* Tips */}
              <div style={{
                marginTop: '24px',
                padding: '20px',
                background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)',
                borderRadius: '14px',
                border: '1px solid #dbeafe'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Sparkles style={{ width: '18px', height: '18px', color: '#8b5cf6' }} />
                  <span style={{ fontWeight: '600', color: '#3b82f6' }}>מיפוי חכם עם AI</span>
                </div>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>
                  המערכת מזהה אוטומטית את העמודות בקובץ שלכם ומתאימה אותן לשדות הקבלה.
                  תוכלו לשנות את המיפוי ידנית לפני יצירת הקבלות.
                </p>
              </div>
            </motion.div>

            {/* History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: '#f1f5f9',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Clock style={{ width: '24px', height: '24px', color: '#64748b' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                      היסטוריית הפקות
                    </h3>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: '2px 0 0' }}>
                      {batchRuns.length} הפקות
                    </p>
                  </div>
                </div>
              </div>

              {batchRuns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <FileSpreadsheet style={{ width: '56px', height: '56px', color: '#cbd5e1', margin: '0 auto 16px' }} />
                  <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '4px' }}>
                    עדיין לא הפקתם קבלות
                  </p>
                  <p style={{ fontSize: '14px', color: '#94a3b8' }}>
                    העלו קובץ כדי להתחיל
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {batchRuns.slice(0, 5).map((run, index) => (
                    <motion.div
                      key={run.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          background: 'white',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                          <FileText style={{ width: '22px', height: '22px', color: '#3b82f6' }} />
                        </div>
                        <div>
                          <p style={{ fontWeight: '600', color: '#0f172a', margin: 0 }}>
                            {run.fileName}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>
                              {format(new Date(run.createdAt), 'dd/MM/yyyy HH:mm')}
                            </span>
                            <span style={{ color: '#cbd5e1' }}>•</span>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>
                              {run.successCount} קבלות
                            </span>
                            {run.errorCount > 0 && (
                              <>
                                <span style={{ color: '#cbd5e1' }}>•</span>
                                <span style={{ fontSize: '13px', color: '#dc2626' }}>
                                  {run.errorCount} שגיאות
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {getStatusBadge(run.status)}
                        {run.status === 'completed' && run.zipUrl && (
                          <button style={{
                            padding: '8px',
                            background: '#eff6ff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}>
                            <Download style={{ width: '18px', height: '18px', color: '#3b82f6' }} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Business Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  background: '#f1f5f9',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Building2 style={{ width: '22px', height: '22px', color: '#64748b' }} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  פרטי העסק
                </h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#64748b' }}>שם העסק</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{businessInfo?.name || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#64748b' }}>מספר עוסק</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{businessInfo?.businessId || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#64748b' }}>סוג עסק</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                    {businessInfo?.businessType === 'osek_patur' ? 'עוסק פטור' :
                     businessInfo?.businessType === 'osek_morshe' ? 'עוסק מורשה' : 'חברה'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push('/onboarding')}
                style={{
                  width: '100%',
                  marginTop: '20px',
                  padding: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  color: '#3b82f6',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ערוך פרטים
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '20px',
                padding: '24px',
                color: 'white'
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>סטטיסטיקות</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <p style={{ fontSize: '36px', fontWeight: '800', margin: 0 }}>
                    {batchRuns.reduce((sum, run) => sum + run.successCount, 0)}
                  </p>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>קבלות שנוצרו</p>
                </div>
                <div>
                  <p style={{ fontSize: '36px', fontWeight: '800', margin: 0 }}>{batchRuns.length}</p>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>הפקות</p>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                background: '#f8fafc',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid #e2e8f0'
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
                פעולות מהירות
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => document.getElementById('file-input')?.click()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    width: '100%',
                    textAlign: 'right'
                  }}
                >
                  <Plus style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                  <span style={{ fontWeight: '500', color: '#0f172a' }}>הפקה חדשה</span>
                </button>
                <button
                  onClick={() => router.push('/onboarding')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    width: '100%',
                    textAlign: 'right'
                  }}
                >
                  <Settings style={{ width: '20px', height: '20px', color: '#64748b' }} />
                  <span style={{ fontWeight: '500', color: '#0f172a' }}>הגדרות עסק</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
