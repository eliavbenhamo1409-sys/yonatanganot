import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  BusinessInfo, 
  ReceiptSettings, 
  ColumnMapping, 
  ExcelRow, 
  BatchRun,
  ReceiptTemplate 
} from '@/types';

interface AppState {
  // פרטי עסק
  businessInfo: BusinessInfo | null;
  setBusinessInfo: (info: BusinessInfo) => void;
  
  // הגדרות קבלה
  receiptSettings: ReceiptSettings;
  setReceiptSettings: (settings: ReceiptSettings) => void;
  
  // Onboarding
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  isOnboardingComplete: boolean;
  completeOnboarding: () => void;
  
  // קובץ נוכחי
  currentFile: File | null;
  setCurrentFile: (file: File | null) => void;
  
  // נתוני אקסל
  excelData: ExcelRow[];
  setExcelData: (data: ExcelRow[]) => void;
  excelHeaders: string[];
  setExcelHeaders: (headers: string[]) => void;
  
  // מיפוי עמודות
  columnMappings: ColumnMapping[];
  setColumnMappings: (mappings: ColumnMapping[]) => void;
  updateColumnMapping: (excelColumn: string, receiptField: ColumnMapping['receiptField']) => void;
  
  // היסטוריית הרצות
  batchRuns: BatchRun[];
  addBatchRun: (run: BatchRun) => void;
  updateBatchRun: (id: string, updates: Partial<BatchRun>) => void;
  
  // תבניות
  templates: ReceiptTemplate[];
  selectedTemplate: string;
  setSelectedTemplate: (id: string) => void;
  
  // UI State
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  generationProgress: number;
  setGenerationProgress: (progress: number) => void;
  
  // Reset
  resetCurrentSession: () => void;
}

const defaultReceiptSettings: ReceiptSettings = {
  startingNumber: 1,
  currentNumber: 1,
  dateFormat: 'dd/MM/yyyy',
  currency: 'ILS',
  currencySymbol: '₪',
  includeVat: false,
  templateId: 'default',
};

const defaultTemplates: ReceiptTemplate[] = [
  {
    id: 'default',
    name: 'קלאסי',
    description: 'תבנית קבלה קלאסית ומקצועית',
    thumbnail: '/templates/classic.png',
    isDefault: true,
  },
  {
    id: 'modern',
    name: 'מודרני',
    description: 'עיצוב נקי ומינימליסטי',
    thumbnail: '/templates/modern.png',
    isDefault: false,
  },
  {
    id: 'detailed',
    name: 'מפורט',
    description: 'כולל פירוט מורחב ומקום להערות',
    thumbnail: '/templates/detailed.png',
    isDefault: false,
  },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // פרטי עסק
      businessInfo: null,
      setBusinessInfo: (info) => set({ businessInfo: info }),
      
      // הגדרות קבלה
      receiptSettings: defaultReceiptSettings,
      setReceiptSettings: (settings) => set({ receiptSettings: settings }),
      
      // Onboarding
      onboardingStep: 1,
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      isOnboardingComplete: false,
      completeOnboarding: () => set({ isOnboardingComplete: true }),
      
      // קובץ נוכחי
      currentFile: null,
      setCurrentFile: (file) => set({ currentFile: file }),
      
      // נתוני אקסל
      excelData: [],
      setExcelData: (data) => set({ excelData: data }),
      excelHeaders: [],
      setExcelHeaders: (headers) => set({ excelHeaders: headers }),
      
      // מיפוי עמודות
      columnMappings: [],
      setColumnMappings: (mappings) => set({ columnMappings: mappings }),
      updateColumnMapping: (excelColumn, receiptField) => {
        const mappings = get().columnMappings.map((m) =>
          m.excelColumn === excelColumn
            ? { ...m, receiptField, isManual: true }
            : m
        );
        set({ columnMappings: mappings });
      },
      
      // היסטוריית הרצות
      batchRuns: [],
      addBatchRun: (run) => set({ batchRuns: [run, ...get().batchRuns] }),
      updateBatchRun: (id, updates) => {
        const runs = get().batchRuns.map((r) =>
          r.id === id ? { ...r, ...updates } : r
        );
        set({ batchRuns: runs });
      },
      
      // תבניות
      templates: defaultTemplates,
      selectedTemplate: 'default',
      setSelectedTemplate: (id) => set({ selectedTemplate: id }),
      
      // UI State
      isGenerating: false,
      setIsGenerating: (generating) => set({ isGenerating: generating }),
      generationProgress: 0,
      setGenerationProgress: (progress) => set({ generationProgress: progress }),
      
      // Reset
      resetCurrentSession: () =>
        set({
          currentFile: null,
          excelData: [],
          excelHeaders: [],
          columnMappings: [],
          isGenerating: false,
          generationProgress: 0,
        }),
    }),
    {
      name: 'receipt-generator-storage',
      partialize: (state) => ({
        businessInfo: state.businessInfo,
        receiptSettings: state.receiptSettings,
        isOnboardingComplete: state.isOnboardingComplete,
        batchRuns: state.batchRuns,
        selectedTemplate: state.selectedTemplate,
      }),
    }
  )
);

