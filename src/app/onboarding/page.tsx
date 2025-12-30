'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { BusinessInfo, ReceiptSettings } from '@/types';
import {
  Building2,
  FileText,
  Upload,
  ChevronLeft,
  ChevronRight,
  Check,
  ImagePlus,
  Info,
} from 'lucide-react';

const steps = [
  { id: 1, title: 'פרטי העסק', icon: Building2 },
  { id: 2, title: 'הגדרות קבלה', icon: FileText },
  { id: 3, title: 'סיום', icon: Check },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { 
    businessInfo, 
    setBusinessInfo, 
    receiptSettings, 
    setReceiptSettings,
    completeOnboarding 
  } = useStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<BusinessInfo>>({
    name: businessInfo?.name || '',
    businessId: businessInfo?.businessId || '',
    businessType: businessInfo?.businessType || 'osek_patur',
    address: businessInfo?.address || '',
    phone: businessInfo?.phone || '',
    email: businessInfo?.email || '',
    footerText: businessInfo?.footerText || 'קבלה אינה חשבונית מס',
    vatExempt: businessInfo?.vatExempt ?? true,
    vatRate: businessInfo?.vatRate || 17,
  });
  
  const [settingsData, setSettingsData] = useState<Partial<ReceiptSettings>>({
    startingNumber: receiptSettings?.startingNumber || 1,
    dateFormat: receiptSettings?.dateFormat || 'dd/MM/yyyy',
    currency: receiptSettings?.currency || 'ILS',
    currencySymbol: receiptSettings?.currencySymbol || '₪',
    includeVat: receiptSettings?.includeVat || false,
  });

  const updateFormData = (field: keyof BusinessInfo, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateSettingsData = (field: keyof ReceiptSettings, value: any) => {
    setSettingsData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate step 1
      if (!formData.name || !formData.businessId) {
        alert('נא למלא את שם העסק ומספר עוסק/ח.פ');
        return;
      }
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save and complete
      setBusinessInfo({
        id: crypto.randomUUID(),
        ...formData,
      } as BusinessInfo);
      
      setReceiptSettings({
        ...receiptSettings,
        ...settingsData,
        currentNumber: settingsData.startingNumber || 1,
        templateId: 'default',
      } as ReceiptSettings);
      
      completeOnboarding();
      router.push('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-gray-50)] via-white to-[var(--color-primary-50)]">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-[var(--color-gray-900)] mb-2">
            הגדרת העסק שלך
          </h1>
          <p className="text-[var(--color-gray-600)]">
            הזן את הפרטים פעם אחת והמערכת תזכור אותם
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-3 ${
                    currentStep >= step.id ? 'text-[var(--color-primary)]' : 'text-[var(--color-gray-400)]'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    currentStep >= step.id 
                      ? 'bg-[var(--color-primary)] text-white' 
                      : 'bg-[var(--color-gray-200)] text-[var(--color-gray-500)]'
                  }`}>
                    {currentStep > step.id ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className="font-medium hidden sm:block">{step.title}</span>
                </motion.div>
                
                {index < steps.length - 1 && (
                  <div className={`w-16 sm:w-24 h-1 mx-2 sm:mx-4 rounded-full transition-all ${
                    currentStep > step.id 
                      ? 'bg-[var(--color-primary)]' 
                      : 'bg-[var(--color-gray-200)]'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-[var(--color-gray-100)]"
          >
            <AnimatePresence mode="wait">
              {/* Step 1: Business Info */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="label">
                        שם העסק <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="input"
                        placeholder="לדוגמה: סטודיו עיצוב"
                        value={formData.name || ''}
                        onChange={(e) => updateFormData('name', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="label">
                        מספר עוסק / ח.פ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="input"
                        placeholder="123456789"
                        value={formData.businessId || ''}
                        onChange={(e) => updateFormData('businessId', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">סוג עסק</label>
                    <div className="flex gap-4 flex-wrap">
                      {[
                        { value: 'osek_patur', label: 'עוסק פטור' },
                        { value: 'osek_morshe', label: 'עוסק מורשה' },
                        { value: 'company', label: 'חברה בע"מ' },
                      ].map((type) => (
                        <label
                          key={type.value}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.businessType === type.value
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary-50)]'
                              : 'border-[var(--color-gray-200)] hover:border-[var(--color-gray-300)]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="businessType"
                            value={type.value}
                            checked={formData.businessType === type.value}
                            onChange={(e) => updateFormData('businessType', e.target.value)}
                            className="sr-only"
                          />
                          <span>{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">כתובת</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="רחוב, עיר"
                      value={formData.address || ''}
                      onChange={(e) => updateFormData('address', e.target.value)}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="label">טלפון</label>
                      <input
                        type="tel"
                        className="input"
                        placeholder="050-1234567"
                        value={formData.phone || ''}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="label">אימייל</label>
                      <input
                        type="email"
                        className="input"
                        placeholder="email@example.com"
                        value={formData.email || ''}
                        onChange={(e) => updateFormData('email', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">לוגו (אופציונלי)</label>
                    <div className="border-2 border-dashed border-[var(--color-gray-200)] rounded-xl p-6 text-center hover:border-[var(--color-primary)] transition-colors cursor-pointer">
                      <ImagePlus className="w-8 h-8 mx-auto text-[var(--color-gray-400)] mb-2" />
                      <p className="text-sm text-[var(--color-gray-500)]">
                        גרור תמונה או לחץ להעלאה
                      </p>
                      <p className="text-xs text-[var(--color-gray-400)] mt-1">
                        PNG, JPG עד 1MB
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="label">טקסט קבוע בתחתית הקבלה</label>
                    <textarea
                      className="input min-h-[80px]"
                      placeholder="לדוגמה: קבלה אינה חשבונית מס"
                      value={formData.footerText || ''}
                      onChange={(e) => updateFormData('footerText', e.target.value)}
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Receipt Settings */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="label">מספר קבלה מתחיל</label>
                      <input
                        type="number"
                        className="input"
                        placeholder="1"
                        min="1"
                        value={settingsData.startingNumber || ''}
                        onChange={(e) => updateSettingsData('startingNumber', parseInt(e.target.value) || 1)}
                      />
                      <p className="text-xs text-[var(--color-gray-500)] mt-1">
                        הקבלות ימוספרו החל ממספר זה
                      </p>
                    </div>
                    
                    <div>
                      <label className="label">פורמט תאריך</label>
                      <select
                        className="input"
                        value={settingsData.dateFormat || 'dd/MM/yyyy'}
                        onChange={(e) => updateSettingsData('dateFormat', e.target.value)}
                      >
                        <option value="dd/MM/yyyy">DD/MM/YYYY (31/12/2025)</option>
                        <option value="dd.MM.yyyy">DD.MM.YYYY (31.12.2025)</option>
                        <option value="yyyy-MM-dd">YYYY-MM-DD (2025-12-31)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">מטבע</label>
                    <div className="flex gap-4 flex-wrap">
                      {[
                        { value: 'ILS', symbol: '₪', label: 'שקל (₪)' },
                        { value: 'USD', symbol: '$', label: 'דולר ($)' },
                        { value: 'EUR', symbol: '€', label: 'יורו (€)' },
                      ].map((curr) => (
                        <label
                          key={curr.value}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                            settingsData.currency === curr.value
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary-50)]'
                              : 'border-[var(--color-gray-200)] hover:border-[var(--color-gray-300)]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="currency"
                            value={curr.value}
                            checked={settingsData.currency === curr.value}
                            onChange={(e) => {
                              updateSettingsData('currency', e.target.value);
                              updateSettingsData('currencySymbol', curr.symbol);
                            }}
                            className="sr-only"
                          />
                          <span>{curr.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[var(--color-gray-50)] rounded-xl p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!formData.vatExempt}
                          onChange={(e) => updateFormData('vatExempt', !e.target.checked)}
                          className="w-5 h-5 rounded border-[var(--color-gray-300)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                        />
                        <span className="font-medium">העסק שלי חייב במע"מ</span>
                      </label>
                    </div>
                    
                    {!formData.vatExempt && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex items-center gap-4"
                      >
                        <label className="label mb-0">אחוז מע"מ:</label>
                        <input
                          type="number"
                          className="input w-24"
                          value={formData.vatRate || 17}
                          onChange={(e) => updateFormData('vatRate', parseFloat(e.target.value) || 17)}
                        />
                        <span className="text-[var(--color-gray-500)]">%</span>
                      </motion.div>
                    )}
                    
                    {formData.vatExempt && (
                      <div className="flex items-center gap-2 text-sm text-[var(--color-gray-500)]">
                        <Info className="w-4 h-4" />
                        <span>הקבלות יסומנו כפטורות ממע"מ</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="label">תבנית קבלה</label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { id: 'default', name: 'קלאסי' },
                        { id: 'modern', name: 'מודרני' },
                        { id: 'detailed', name: 'מפורט' },
                      ].map((template) => (
                        <div
                          key={template.id}
                          className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                            settingsData.templateId === template.id || (!settingsData.templateId && template.id === 'default')
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary-50)]'
                              : 'border-[var(--color-gray-200)] hover:border-[var(--color-gray-300)]'
                          }`}
                          onClick={() => updateSettingsData('templateId', template.id)}
                        >
                          <div className="aspect-[3/4] bg-[var(--color-gray-100)] rounded-lg mb-2 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-[var(--color-gray-400)]" />
                          </div>
                          <p className="text-center text-sm font-medium">{template.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Summary */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className="w-20 h-20 mx-auto bg-[var(--color-success-light)] rounded-full flex items-center justify-center mb-4"
                    >
                      <Check className="w-10 h-10 text-[var(--color-success)]" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-[var(--color-gray-900)] mb-2">
                      הכל מוכן!
                    </h2>
                    <p className="text-[var(--color-gray-600)]">
                      בדוק שהפרטים נכונים ולחץ על "סיים והתחל"
                    </p>
                  </div>

                  <div className="bg-[var(--color-gray-50)] rounded-xl p-6 space-y-4">
                    <h3 className="font-bold text-[var(--color-gray-900)]">פרטי העסק</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-[var(--color-gray-500)]">שם העסק:</span>
                        <p className="font-medium">{formData.name || '-'}</p>
                      </div>
                      <div>
                        <span className="text-[var(--color-gray-500)]">מספר עוסק:</span>
                        <p className="font-medium">{formData.businessId || '-'}</p>
                      </div>
                      <div>
                        <span className="text-[var(--color-gray-500)]">סוג עסק:</span>
                        <p className="font-medium">
                          {formData.businessType === 'osek_patur' ? 'עוסק פטור' :
                           formData.businessType === 'osek_morshe' ? 'עוסק מורשה' : 'חברה בע"מ'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[var(--color-gray-500)]">כתובת:</span>
                        <p className="font-medium">{formData.address || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[var(--color-gray-50)] rounded-xl p-6 space-y-4">
                    <h3 className="font-bold text-[var(--color-gray-900)]">הגדרות קבלה</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-[var(--color-gray-500)]">מספר קבלה מתחיל:</span>
                        <p className="font-medium">{settingsData.startingNumber}</p>
                      </div>
                      <div>
                        <span className="text-[var(--color-gray-500)]">מטבע:</span>
                        <p className="font-medium">{settingsData.currencySymbol}</p>
                      </div>
                      <div>
                        <span className="text-[var(--color-gray-500)]">מע"מ:</span>
                        <p className="font-medium">
                          {formData.vatExempt ? 'פטור' : `${formData.vatRate}%`}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--color-gray-200)]">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentStep === 1
                    ? 'text-[var(--color-gray-300)] cursor-not-allowed'
                    : 'text-[var(--color-gray-600)] hover:bg-[var(--color-gray-100)]'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
                חזור
              </button>
              
              <button
                onClick={handleNext}
                className="btn btn-primary"
              >
                {currentStep === 3 ? 'סיים והתחל' : 'המשך'}
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

