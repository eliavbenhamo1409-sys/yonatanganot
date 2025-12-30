'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { RECEIPT_FIELDS, ReceiptField, ColumnMapping } from '@/types';
import { validateAllRows } from '@/utils/excelParser';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Info,
  Eye,
  FileText,
  ArrowRightLeft,
  X,
} from 'lucide-react';

export default function ColumnMappingPage() {
  const router = useRouter();
  const {
    currentFile,
    excelHeaders,
    excelData,
    columnMappings,
    updateColumnMapping,
    setExcelData,
  } = useStore();

  const [showPreview, setShowPreview] = useState(false);
  const [validationResults, setValidationResults] = useState<{
    validCount: number;
    invalidCount: number;
    errors: { row: number; field: string; message: string }[];
  } | null>(null);

  useEffect(() => {
    if (!currentFile || excelHeaders.length === 0) {
      router.push('/dashboard');
    }
  }, [currentFile, excelHeaders, router]);

  useEffect(() => {
    if (excelData.length > 0 && columnMappings.length > 0) {
      const { validRows, invalidRows } = validateAllRows(excelData, columnMappings);
      
      const errors: { row: number; field: string; message: string }[] = [];
      invalidRows.forEach((row) => {
        row.errors.forEach((err) => {
          errors.push({
            row: row.rowNumber,
            field: err.field,
            message: err.message,
          });
        });
      });

      setValidationResults({
        validCount: validRows.length,
        invalidCount: invalidRows.length,
        errors,
      });
    }
  }, [excelData, columnMappings]);

  const handleMappingChange = (excelColumn: string, receiptField: ReceiptField) => {
    updateColumnMapping(excelColumn, receiptField);
  };

  const handleContinue = () => {
    const { validRows, invalidRows } = validateAllRows(excelData, columnMappings);
    setExcelData([...validRows, ...invalidRows]);
    router.push('/dashboard/generate');
  };

  const getConfidenceColor = (confidence: number | undefined) => {
    if (!confidence) return '#e2e8f0';
    if (confidence >= 0.8) return '#10b981';
    if (confidence >= 0.5) return '#f59e0b';
    return '#ef4444';
  };

  const getMappedField = (excelColumn: string): ColumnMapping | undefined => {
    return columnMappings.find((m) => m.excelColumn === excelColumn);
  };

  const requiredFields: ReceiptField[] = ['customerName', 'amount', 'date'];
  const mappedRequiredFields = requiredFields.filter((field) =>
    columnMappings.some((m) => m.receiptField === field)
  );
  const missingRequiredFields = requiredFields.filter(
    (field) => !mappedRequiredFields.includes(field)
  );

  const canContinue = missingRequiredFields.length === 0 && (validationResults?.validCount ?? 0) > 0;

  if (!currentFile) {
    return null;
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
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => router.push('/dashboard')}
                style={{
                  padding: '8px',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <ChevronRight style={{ width: '20px', height: '20px', color: '#64748b' }} />
              </button>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  מיפוי עמודות
                </h1>
                <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0' }}>
                  {currentFile.name}
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setShowPreview(!showPreview)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  color: '#64748b',
                  fontWeight: '500'
                }}
              >
                <Eye style={{ width: '18px', height: '18px' }} />
                <span>תצוגה מקדימה</span>
              </button>
              
              <button
                onClick={handleContinue}
                disabled={!canContinue}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: canContinue ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : '#e2e8f0',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: canContinue ? 'pointer' : 'not-allowed',
                  color: canContinue ? 'white' : '#94a3b8',
                  fontWeight: '600',
                  fontSize: '15px'
                }}
              >
                המשך להפקה
                <ChevronLeft style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* AI Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '24px' }}
        >
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)',
            borderRadius: '50px',
            fontSize: '14px',
            border: '1px solid #dbeafe'
          }}>
            <Sparkles style={{ width: '16px', height: '16px', color: '#8b5cf6' }} />
            <span style={{ color: '#3b82f6', fontWeight: '500' }}>
              המערכת זיהתה אוטומטית את העמודות - בדקו ותקנו לפי הצורך
            </span>
          </span>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
          {/* Mapping Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #dbeafe, #ede9fe)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ArrowRightLeft style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  התאמת עמודות
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0' }}>
                  חברו בין העמודות באקסל לשדות הקבלה
                </p>
              </div>
            </div>

            {/* Missing Fields Warning */}
            {missingRequiredFields.length > 0 && (
              <div style={{
                marginBottom: '20px',
                padding: '16px',
                background: '#fef3c7',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <AlertCircle style={{ width: '20px', height: '20px', color: '#d97706', flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: '600', color: '#d97706', margin: 0 }}>שדות חובה חסרים</p>
                  <p style={{ fontSize: '14px', color: '#78716c', margin: '4px 0 0' }}>
                    יש למפות את השדות הבאים: {missingRequiredFields.map((f) => RECEIPT_FIELDS[f].label).join(', ')}
                  </p>
                </div>
              </div>
            )}

            {/* Mapping Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {excelHeaders.map((header, index) => {
                const mapping = getMappedField(header);
                const isMapped = mapping?.receiptField !== 'ignore';
                
                return (
                  <motion.div
                    key={header}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 20px',
                      borderRadius: '14px',
                      border: `2px solid ${isMapped ? '#3b82f6' : '#e2e8f0'}`,
                      background: isMapped ? '#eff6ff' : '#f8fafc',
                      transition: 'all 0.2s'
                    }}
                  >
                    {/* Excel Column */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '600', color: '#0f172a' }}>{header}</span>
                        {mapping && !mapping.isManual && mapping.confidence && (
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            color: '#64748b'
                          }}>
                            <span style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: getConfidenceColor(mapping.confidence)
                            }} />
                            {Math.round(mapping.confidence * 100)}%
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0' }}>
                        דוגמה: {String(excelData[0]?.data[header] ?? '-').substring(0, 30)}
                      </p>
                    </div>

                    {/* Arrow */}
                    <ArrowLeft style={{ width: '20px', height: '20px', color: '#cbd5e1', flexShrink: 0 }} />

                    {/* Selector */}
                    <select
                      value={mapping?.receiptField || 'ignore'}
                      onChange={(e) => handleMappingChange(header, e.target.value as ReceiptField)}
                      style={{
                        width: '180px',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: `2px solid ${isMapped ? '#3b82f6' : '#e2e8f0'}`,
                        background: 'white',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#0f172a',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="ignore">-- התעלם --</option>
                      {Object.entries(RECEIPT_FIELDS)
                        .filter(([key]) => key !== 'ignore')
                        .map(([key, field]) => (
                          <option key={key} value={key}>
                            {field.label} {field.required ? '*' : ''}
                          </option>
                        ))}
                    </select>

                    {/* Status */}
                    <div style={{ flexShrink: 0 }}>
                      {isMapped ? (
                        <CheckCircle2 style={{ width: '24px', height: '24px', color: '#10b981' }} />
                      ) : (
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: '2px solid #cbd5e1'
                        }} />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Validation Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid #e2e8f0'
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
                סיכום בדיקה
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: '#d1fae5',
                  borderRadius: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 style={{ width: '20px', height: '20px', color: '#059669' }} />
                    <span style={{ color: '#059669', fontWeight: '500' }}>שורות תקינות</span>
                  </div>
                  <span style={{ fontWeight: '700', color: '#059669', fontSize: '18px' }}>
                    {validationResults?.validCount ?? 0}
                  </span>
                </div>
                
                {(validationResults?.invalidCount ?? 0) > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    background: '#fee2e2',
                    borderRadius: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle style={{ width: '20px', height: '20px', color: '#dc2626' }} />
                      <span style={{ color: '#dc2626', fontWeight: '500' }}>שורות עם שגיאות</span>
                    </div>
                    <span style={{ fontWeight: '700', color: '#dc2626', fontSize: '18px' }}>
                      {validationResults?.invalidCount}
                    </span>
                  </div>
                )}
              </div>

              {validationResults && validationResults.errors.length > 0 && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '12px' }}>
                    פירוט שגיאות:
                  </h4>
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {validationResults.errors.slice(0, 10).map((err, i) => (
                      <div key={i} style={{
                        padding: '8px 12px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        marginBottom: '6px',
                        fontSize: '13px'
                      }}>
                        <span style={{ color: '#64748b' }}>שורה {err.row}:</span>{' '}
                        <span style={{ color: '#dc2626' }}>{err.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Legend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                background: '#f8fafc',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid #e2e8f0'
              }}
            >
              <h3 style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Info style={{ width: '18px', height: '18px' }} />
                מקרא
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ fontSize: '14px', color: '#64748b' }}>התאמה גבוהה (80%+)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
                  <span style={{ fontSize: '14px', color: '#64748b' }}>התאמה בינונית (50-80%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                  <span style={{ fontSize: '14px', color: '#64748b' }}>התאמה נמוכה (&lt;50%)</span>
                </div>
                <div style={{ paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '14px', color: '#64748b' }}>* = שדה חובה</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Preview Modal */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px'
              }}
              onClick={() => setShowPreview(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'white',
                  borderRadius: '24px',
                  maxWidth: '600px',
                  width: '100%',
                  maxHeight: '80vh',
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.2)'
                }}
              >
                <div style={{
                  padding: '24px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>
                    תצוגה מקדימה - קבלה לדוגמה
                  </h2>
                  <button
                    onClick={() => setShowPreview(false)}
                    style={{
                      padding: '8px',
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <X style={{ width: '20px', height: '20px', color: '#64748b' }} />
                  </button>
                </div>
                
                <div style={{ padding: '24px', overflowY: 'auto', maxHeight: '60vh' }}>
                  <div style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                  }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                      <span style={{
                        display: 'inline-block',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        color: 'white',
                        padding: '10px 24px',
                        borderRadius: '10px',
                        fontWeight: '700'
                      }}>
                        קבלה מס׳ 1
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {excelData[0] && columnMappings
                        .filter((m) => m.receiptField !== 'ignore')
                        .map((mapping) => (
                          <div key={mapping.excelColumn} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '12px 0',
                            borderBottom: '1px solid #f1f5f9'
                          }}>
                            <span style={{ fontWeight: '600', color: '#0f172a' }}>
                              {RECEIPT_FIELDS[mapping.receiptField].label}:
                            </span>
                            <span style={{ color: '#64748b' }}>
                              {String(excelData[0].data[mapping.excelColumn] || '-')}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
