'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileSpreadsheet, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Loader2 
} from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  error?: string | null;
  acceptedFile?: File | null;
}

export default function FileUpload({ 
  onFileSelect, 
  isLoading = false, 
  error = null,
  acceptedFile = null 
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    disabled: isLoading,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer
          transition-all duration-300 ease-out
          ${isDragActive || dragActive
            ? 'border-[var(--color-primary)] bg-[var(--color-primary-50)] scale-[1.02]'
            : 'border-[var(--color-gray-300)] hover:border-[var(--color-primary)] hover:bg-[var(--color-gray-50)]'
          }
          ${isLoading ? 'pointer-events-none opacity-70' : ''}
          ${error ? 'border-[var(--color-error)] bg-[var(--color-error-light)]' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4"
            >
              <Loader2 className="w-16 h-16 mx-auto text-[var(--color-primary)] animate-spin" />
              <div>
                <p className="text-lg font-medium text-[var(--color-gray-700)]">
                  מעבד את הקובץ...
                </p>
                <p className="text-sm text-[var(--color-gray-500)]">
                  אנא המתן
                </p>
              </div>
            </motion.div>
          ) : acceptedFile ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 mx-auto bg-[var(--color-success-light)] rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-[var(--color-success)]" />
              </div>
              <div>
                <p className="text-lg font-medium text-[var(--color-gray-700)]">
                  קובץ נטען בהצלחה!
                </p>
                <div className="flex items-center justify-center gap-2 mt-2 text-sm text-[var(--color-gray-500)]">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{acceptedFile.name}</span>
                  <span className="text-[var(--color-gray-400)]">
                    ({formatFileSize(acceptedFile.size)})
                  </span>
                </div>
              </div>
              <p className="text-sm text-[var(--color-primary)]">
                לחץ או גרור קובץ חדש להחלפה
              </p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 mx-auto bg-[var(--color-error-light)] rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-[var(--color-error)]" />
              </div>
              <div>
                <p className="text-lg font-medium text-[var(--color-error)]">
                  שגיאה בטעינת הקובץ
                </p>
                <p className="text-sm text-[var(--color-gray-600)] mt-1">
                  {error}
                </p>
              </div>
              <p className="text-sm text-[var(--color-primary)]">
                נסה שוב עם קובץ אחר
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4"
            >
              <motion.div
                animate={{ 
                  y: isDragActive ? -10 : 0,
                  scale: isDragActive ? 1.1 : 1 
                }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="w-20 h-20 mx-auto bg-[var(--color-primary-50)] rounded-2xl flex items-center justify-center">
                  <Upload className="w-10 h-10 text-[var(--color-primary)]" />
                </div>
              </motion.div>
              
              <div>
                <p className="text-xl font-medium text-[var(--color-gray-700)]">
                  {isDragActive ? 'שחרר את הקובץ כאן' : 'גרור קובץ Excel או CSV'}
                </p>
                <p className="text-sm text-[var(--color-gray-500)] mt-1">
                  או לחץ לבחירת קובץ מהמחשב
                </p>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-gray-400)]">
                <FileSpreadsheet className="w-4 h-4" />
                <span>תומך ב-XLSX, XLS, CSV</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative corners */}
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[var(--color-primary)] rounded-tr-lg opacity-30" />
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[var(--color-primary)] rounded-tl-lg opacity-30" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[var(--color-primary)] rounded-br-lg opacity-30" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[var(--color-primary)] rounded-bl-lg opacity-30" />
      </div>

      {/* Privacy Notice */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-xs text-[var(--color-gray-500)] mt-4"
      >
        🔒 הקבצים מעובדים בדפדפן שלך ולא נשמרים בשרתים חיצוניים
      </motion.p>
    </div>
  );
}

