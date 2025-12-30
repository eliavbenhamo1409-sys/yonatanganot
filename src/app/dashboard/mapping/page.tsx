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

  // Redirect if no file
  useEffect(() => {
    if (!currentFile || excelHeaders.length === 0) {
      router.push('/dashboard');
    }
  }, [currentFile, excelHeaders, router]);

  // Validate when mappings change
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
    // Update excelData with validation results
    const { validRows, invalidRows } = validateAllRows(excelData, columnMappings);
    setExcelData([...validRows, ...invalidRows]);
    
    router.push('/dashboard/generate');
  };

  const getConfidenceColor = (confidence: number | undefined) => {
    if (!confidence) return 'bg-[var(--color-gray-200)]';
    if (confidence >= 0.8) return 'bg-[var(--color-success)]';
    if (confidence >= 0.5) return 'bg-[var(--color-warning)]';
    return 'bg-[var(--color-error)]';
  };

  const getMappedField = (excelColumn: string): ColumnMapping | undefined => {
    return columnMappings.find((m) => m.excelColumn === excelColumn);
  };

  // Check if required fields are mapped
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
                  מיפוי עמודות
                </h1>
                <p className="text-sm text-[var(--color-gray-500)]">
                  {currentFile.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-2 text-[var(--color-gray-600)] hover:text-[var(--color-primary)] hover:bg-[var(--color-gray-100)] rounded-lg transition-colors"
              >
                <Eye className="w-5 h-5" />
                <span className="hidden sm:inline">תצוגה מקדימה</span>
              </button>
              
              <button
                onClick={handleContinue}
                disabled={!canContinue}
                className={`btn ${canContinue ? 'btn-primary' : 'bg-[var(--color-gray-300)] text-[var(--color-gray-500)] cursor-not-allowed'}`}
              >
                המשך להפקה
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* AI Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm text-sm">
            <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
            <span className="text-[var(--color-gray-600)]">
              המערכת זיהתה אוטומטית את העמודות - בדקו ותקנו לפי הצורך
            </span>
          </span>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Mapping Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-[var(--color-gray-100)]"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[var(--color-primary-50)] rounded-xl flex items-center justify-center">
                  <ArrowRightLeft className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h2 className="font-bold text-[var(--color-gray-900)]">התאמת עמודות</h2>
                  <p className="text-sm text-[var(--color-gray-500)]">
                    חברו בין העמודות באקסל לשדות הקבלה
                  </p>
                </div>
              </div>

              {/* Required Fields Warning */}
              {missingRequiredFields.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-[var(--color-warning-light)] rounded-xl flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[var(--color-warning)]">שדות חובה חסרים</p>
                    <p className="text-sm text-[var(--color-gray-600)]">
                      יש למפות את השדות הבאים: {missingRequiredFields.map((f) => RECEIPT_FIELDS[f].label).join(', ')}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Mapping Table */}
              <div className="space-y-3">
                {excelHeaders.map((header, index) => {
                  const mapping = getMappedField(header);
                  const isRequired = mapping && requiredFields.includes(mapping.receiptField);
                  
                  return (
                    <motion.div
                      key={header}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-colors ${
                        mapping?.receiptField !== 'ignore'
                          ? 'bg-[var(--color-primary-50)] border-[var(--color-primary-100)]'
                          : 'bg-[var(--color-gray-50)] border-[var(--color-gray-200)]'
                      }`}
                    >
                      {/* Excel Column */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[var(--color-gray-900)] truncate">
                            {header}
                          </span>
                          {mapping && !mapping.isManual && mapping.confidence && (
                            <div className="flex items-center gap-1">
                              <div
                                className={`w-2 h-2 rounded-full ${getConfidenceColor(mapping.confidence)}`}
                              />
                              <span className="text-xs text-[var(--color-gray-500)]">
                                {Math.round(mapping.confidence * 100)}%
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-[var(--color-gray-500)] truncate">
                          דוגמה: {excelData[0]?.data[header] || '-'}
                        </p>
                      </div>

                      {/* Arrow */}
                      <ArrowLeft className="w-5 h-5 text-[var(--color-gray-400)] flex-shrink-0" />

                      {/* Receipt Field Selector */}
                      <div className="flex-1">
                        <select
                          value={mapping?.receiptField || 'ignore'}
                          onChange={(e) => handleMappingChange(header, e.target.value as ReceiptField)}
                          className={`w-full p-3 rounded-lg border-2 transition-colors ${
                            mapping?.receiptField !== 'ignore'
                              ? 'border-[var(--color-primary)] bg-white'
                              : 'border-[var(--color-gray-200)] bg-white'
                          }`}
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
                      </div>

                      {/* Status Icon */}
                      <div className="flex-shrink-0">
                        {mapping?.receiptField !== 'ignore' ? (
                          <CheckCircle2 className="w-6 h-6 text-[var(--color-success)]" />
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-[var(--color-gray-300)]" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Validation Results */}
          <div className="space-y-6">
            {/* Validation Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-[var(--color-gray-100)]"
            >
              <h3 className="font-bold text-[var(--color-gray-900)] mb-4">סיכום בדיקה</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[var(--color-success-light)] rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />
                    <span className="text-[var(--color-success)]">שורות תקינות</span>
                  </div>
                  <span className="font-bold text-[var(--color-success)]">
                    {validationResults?.validCount ?? 0}
                  </span>
                </div>
                
                {(validationResults?.invalidCount ?? 0) > 0 && (
                  <div className="flex items-center justify-between p-3 bg-[var(--color-error-light)] rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-[var(--color-error)]" />
                      <span className="text-[var(--color-error)]">שורות עם שגיאות</span>
                    </div>
                    <span className="font-bold text-[var(--color-error)]">
                      {validationResults?.invalidCount}
                    </span>
                  </div>
                )}
              </div>

              {/* Error Details */}
              {validationResults && validationResults.errors.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[var(--color-gray-200)]">
                  <h4 className="text-sm font-medium text-[var(--color-gray-700)] mb-2">
                    פירוט שגיאות:
                  </h4>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {validationResults.errors.slice(0, 10).map((err, i) => (
                      <div
                        key={i}
                        className="text-xs p-2 bg-[var(--color-gray-50)] rounded"
                      >
                        <span className="text-[var(--color-gray-500)]">שורה {err.row}:</span>{' '}
                        <span className="text-[var(--color-error)]">{err.message}</span>
                      </div>
                    ))}
                    {validationResults.errors.length > 10 && (
                      <p className="text-xs text-[var(--color-gray-500)]">
                        ועוד {validationResults.errors.length - 10} שגיאות...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Legend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[var(--color-gray-50)] rounded-2xl p-6 border border-[var(--color-gray-200)]"
            >
              <h3 className="font-bold text-[var(--color-gray-900)] mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" />
                מקרא
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--color-success)]" />
                  <span className="text-[var(--color-gray-600)]">התאמה גבוהה (80%+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--color-warning)]" />
                  <span className="text-[var(--color-gray-600)]">התאמה בינונית (50-80%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--color-error)]" />
                  <span className="text-[var(--color-gray-600)]">התאמה נמוכה (&lt;50%)</span>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-gray-300)]">
                  <span className="text-[var(--color-gray-600)]">* = שדה חובה</span>
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
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowPreview(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              >
                <div className="p-6 border-b border-[var(--color-gray-200)]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">תצוגה מקדימה - קבלה לדוגמה</h2>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="p-2 hover:bg-[var(--color-gray-100)] rounded-lg transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  {/* Mini Receipt Preview */}
                  <div className="receipt-preview">
                    <div className="text-center mb-4">
                      <div className="inline-block bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg">
                        <span className="font-bold">קבלה מס׳ 1</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      {excelData[0] && columnMappings
                        .filter((m) => m.receiptField !== 'ignore')
                        .map((mapping) => (
                          <div key={mapping.excelColumn} className="flex justify-between border-b border-[var(--color-gray-100)] pb-2">
                            <span className="font-medium">
                              {RECEIPT_FIELDS[mapping.receiptField].label}:
                            </span>
                            <span className="text-[var(--color-gray-600)]">
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

