'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { BusinessInfo, ReceiptSettings } from '@/types';
import {
  Building2,
  FileText,
  Check,
  ImagePlus,
  Info,
  ArrowRight,
  ArrowLeft,
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
      if (!formData.name || !formData.businessId) {
        alert('נא למלא את שם העסק ומספר עוסק/ח.פ');
        return;
      }
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 18px',
    fontSize: '16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    background: '#ffffff',
    color: '#0f172a',
    outline: 'none',
    transition: 'all 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '8px',
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: "'Heebo', sans-serif",
      direction: 'rtl',
      padding: '20px 16px'
    }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '24px' }}
        >
          <h1 style={{ fontSize: 'clamp(24px, 6vw, 32px)', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
            הגדרת העסק שלך
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            הזן את הפרטים פעם אחת והמערכת תזכור אותם
          </p>
        </motion.div>

        {/* Progress Steps - Mobile Friendly */}
        <div style={{ marginBottom: '24px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', minWidth: 'fit-content' }}>
            {steps.map((step, index) => (
              <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: currentStep >= step.id ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : '#e2e8f0',
                    color: currentStep >= step.id ? 'white' : '#94a3b8',
                    transition: 'all 0.3s',
                    flexShrink: 0
                  }}>
                    {currentStep > step.id ? (
                      <Check style={{ width: '18px', height: '18px' }} />
                    ) : (
                      <step.icon style={{ width: '18px', height: '18px' }} />
                    )}
                  </div>
                  <span className="step-label" style={{
                    fontWeight: '600',
                    fontSize: '13px',
                    color: currentStep >= step.id ? '#0f172a' : '#94a3b8',
                    display: 'none'
                  }}>
                    {step.title}
                  </span>
                </div>
                
                {index < steps.length - 1 && (
                  <div style={{
                    width: '40px',
                    height: '3px',
                    margin: '0 8px',
                    borderRadius: '2px',
                    background: currentStep > step.id ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)' : '#e2e8f0',
                    transition: 'all 0.3s'
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: 'clamp(20px, 5vw, 40px)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0'
          }}
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Business Info */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>
                      שם העסק <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      style={inputStyle}
                      placeholder="לדוגמה: סטודיו עיצוב"
                      value={formData.name || ''}
                      onChange={(e) => updateFormData('name', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label style={labelStyle}>
                      מספר עוסק / ח.פ <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      style={inputStyle}
                      placeholder="123456789"
                      value={formData.businessId || ''}
                      onChange={(e) => updateFormData('businessId', e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>סוג עסק</label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {[
                      { value: 'osek_patur', label: 'עוסק פטור' },
                      { value: 'osek_morshe', label: 'עוסק מורשה' },
                      { value: 'company', label: 'חברה בע"מ' },
                    ].map((type) => (
                      <label
                        key={type.value}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px 20px',
                          borderRadius: '10px',
                          border: `2px solid ${formData.businessType === type.value ? '#3b82f6' : '#e2e8f0'}`,
                          background: formData.businessType === type.value ? '#eff6ff' : 'transparent',
                          cursor: 'pointer',
                          fontWeight: '500',
                          color: formData.businessType === type.value ? '#3b82f6' : '#64748b',
                          transition: 'all 0.2s'
                        }}
                      >
                        <input
                          type="radio"
                          name="businessType"
                          value={type.value}
                          checked={formData.businessType === type.value}
                          onChange={(e) => updateFormData('businessType', e.target.value)}
                          style={{ display: 'none' }}
                        />
                        {type.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>כתובת</label>
                  <input
                    type="text"
                    style={inputStyle}
                    placeholder="רחוב, עיר"
                    value={formData.address || ''}
                    onChange={(e) => updateFormData('address', e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                  <div>
                    <label style={labelStyle}>טלפון</label>
                    <input
                      type="tel"
                      style={inputStyle}
                      placeholder="050-1234567"
                      value={formData.phone || ''}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label style={labelStyle}>אימייל</label>
                    <input
                      type="email"
                      style={inputStyle}
                      placeholder="email@example.com"
                      value={formData.email || ''}
                      onChange={(e) => updateFormData('email', e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>לוגו (אופציונלי)</label>
                  <div style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '16px',
                    padding: '32px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: '#f8fafc'
                  }}>
                    <ImagePlus style={{ width: '32px', height: '32px', color: '#94a3b8', margin: '0 auto 12px' }} />
                    <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px' }}>
                      גרור תמונה או לחץ להעלאה
                    </p>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                      PNG, JPG עד 1MB
                    </p>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>טקסט קבוע בתחתית הקבלה</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
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
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                  <div>
                    <label style={labelStyle}>מספר קבלה מתחיל</label>
                    <input
                      type="number"
                      style={inputStyle}
                      placeholder="1"
                      min="1"
                      value={settingsData.startingNumber || ''}
                      onChange={(e) => updateSettingsData('startingNumber', parseInt(e.target.value) || 1)}
                    />
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
                      הקבלות ימוספרו החל ממספר זה
                    </p>
                  </div>
                  
                  <div>
                    <label style={labelStyle}>פורמט תאריך</label>
                    <select
                      style={inputStyle}
                      value={settingsData.dateFormat || 'dd/MM/yyyy'}
                      onChange={(e) => updateSettingsData('dateFormat', e.target.value)}
                    >
                      <option value="dd/MM/yyyy">DD/MM/YYYY (31/12/2025)</option>
                      <option value="dd.MM.yyyy">DD.MM.YYYY (31.12.2025)</option>
                      <option value="yyyy-MM-dd">YYYY-MM-DD (2025-12-31)</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>מטבע</label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {[
                      { value: 'ILS', symbol: '₪', label: 'שקל (₪)' },
                      { value: 'USD', symbol: '$', label: 'דולר ($)' },
                      { value: 'EUR', symbol: '€', label: 'יורו (€)' },
                    ].map((curr) => (
                      <label
                        key={curr.value}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px 20px',
                          borderRadius: '10px',
                          border: `2px solid ${settingsData.currency === curr.value ? '#3b82f6' : '#e2e8f0'}`,
                          background: settingsData.currency === curr.value ? '#eff6ff' : 'transparent',
                          cursor: 'pointer',
                          fontWeight: '500',
                          color: settingsData.currency === curr.value ? '#3b82f6' : '#64748b',
                          transition: 'all 0.2s'
                        }}
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
                          style={{ display: 'none' }}
                        />
                        {curr.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{
                  background: '#f8fafc',
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '24px'
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    marginBottom: '16px'
                  }}>
                    <input
                      type="checkbox"
                      checked={!formData.vatExempt}
                      onChange={(e) => updateFormData('vatExempt', !e.target.checked)}
                      style={{ width: '20px', height: '20px', accentColor: '#3b82f6' }}
                    />
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>העסק שלי חייב במע"מ</span>
                  </label>
                  
                  {!formData.vatExempt && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontWeight: '500', color: '#64748b' }}>אחוז מע"מ:</label>
                      <input
                        type="number"
                        style={{ ...inputStyle, width: '100px' }}
                        value={formData.vatRate || 17}
                        onChange={(e) => updateFormData('vatRate', parseFloat(e.target.value) || 17)}
                      />
                      <span style={{ color: '#64748b' }}>%</span>
                    </div>
                  )}
                  
                  {formData.vatExempt && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px' }}>
                      <Info style={{ width: '16px', height: '16px' }} />
                      <span>הקבלות יסומנו כפטורות ממע"מ</span>
                    </div>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>תבנית קבלה</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {[
                      { id: 'default', name: 'קלאסי' },
                      { id: 'modern', name: 'מודרני' },
                      { id: 'detailed', name: 'מפורט' },
                    ].map((template) => (
                      <div
                        key={template.id}
                        onClick={() => updateSettingsData('templateId', template.id)}
                        style={{
                          border: `2px solid ${(settingsData.templateId || 'default') === template.id ? '#3b82f6' : '#e2e8f0'}`,
                          borderRadius: '16px',
                          padding: '16px',
                          cursor: 'pointer',
                          background: (settingsData.templateId || 'default') === template.id ? '#eff6ff' : 'transparent',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{
                          aspectRatio: '3/4',
                          background: '#f1f5f9',
                          borderRadius: '8px',
                          marginBottom: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <FileText style={{ width: '32px', height: '32px', color: '#94a3b8' }} />
                        </div>
                        <p style={{ textAlign: 'center', fontWeight: '600', color: '#0f172a', margin: 0 }}>
                          {template.name}
                        </p>
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
              >
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    style={{
                      width: '80px',
                      height: '80px',
                      margin: '0 auto 20px',
                      background: '#d1fae5',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Check style={{ width: '40px', height: '40px', color: '#10b981' }} />
                  </motion.div>
                  <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                    הכל מוכן!
                  </h2>
                  <p style={{ color: '#64748b' }}>
                    בדוק שהפרטים נכונים ולחץ על "סיים והתחל"
                  </p>
                </div>

                <div style={{
                  background: '#f8fafc',
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '16px'
                }}>
                  <h3 style={{ fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>פרטי העסק</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <span style={{ fontSize: '14px', color: '#64748b' }}>שם העסק:</span>
                      <p style={{ fontWeight: '600', color: '#0f172a', margin: '4px 0 0' }}>{formData.name || '-'}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', color: '#64748b' }}>מספר עוסק:</span>
                      <p style={{ fontWeight: '600', color: '#0f172a', margin: '4px 0 0' }}>{formData.businessId || '-'}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', color: '#64748b' }}>סוג עסק:</span>
                      <p style={{ fontWeight: '600', color: '#0f172a', margin: '4px 0 0' }}>
                        {formData.businessType === 'osek_patur' ? 'עוסק פטור' :
                         formData.businessType === 'osek_morshe' ? 'עוסק מורשה' : 'חברה בע"מ'}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', color: '#64748b' }}>כתובת:</span>
                      <p style={{ fontWeight: '600', color: '#0f172a', margin: '4px 0 0' }}>{formData.address || '-'}</p>
                    </div>
                  </div>
                </div>

                <div style={{
                  background: '#f8fafc',
                  borderRadius: '16px',
                  padding: '24px'
                }}>
                  <h3 style={{ fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>הגדרות קבלה</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div>
                      <span style={{ fontSize: '14px', color: '#64748b' }}>מספר קבלה מתחיל:</span>
                      <p style={{ fontWeight: '600', color: '#0f172a', margin: '4px 0 0' }}>{settingsData.startingNumber}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', color: '#64748b' }}>מטבע:</span>
                      <p style={{ fontWeight: '600', color: '#0f172a', margin: '4px 0 0' }}>{settingsData.currencySymbol}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', color: '#64748b' }}>מע"מ:</span>
                      <p style={{ fontWeight: '600', color: '#0f172a', margin: '4px 0 0' }}>
                        {formData.vatExempt ? 'פטור' : `${formData.vatRate}%`}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #e2e8f0'
          }}>
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '12px',
                border: 'none',
                background: currentStep === 1 ? 'transparent' : '#f1f5f9',
                color: currentStep === 1 ? '#cbd5e1' : '#64748b',
                fontWeight: '600',
                fontSize: '16px',
                cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <ArrowRight style={{ width: '20px', height: '20px' }} />
              חזור
            </button>
            
            <button
              onClick={handleNext}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                fontWeight: '700',
                fontSize: '16px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                transition: 'all 0.2s'
              }}
            >
              {currentStep === 3 ? 'סיים והתחל' : 'המשך'}
              <ArrowLeft style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
