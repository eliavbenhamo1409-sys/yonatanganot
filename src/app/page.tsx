'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  FileSpreadsheet, 
  Sparkles, 
  Download, 
  Shield, 
  Zap, 
  ChevronLeft,
  CheckCircle2,
  FileText,
  ArrowLeft,
  Clock,
  Users,
  Lock,
  Star
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0f172a' }}>
      {/* Hero Section */}
      <section className="relative min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)' }}>
        {/* Background Glow Effects */}
        <div className="absolute top-20 right-1/4 w-96 h-96 rounded-full opacity-30" style={{ background: '#3b82f6', filter: 'blur(120px)' }} />
        <div className="absolute bottom-20 left-1/4 w-80 h-80 rounded-full opacity-20" style={{ background: '#8b5cf6', filter: 'blur(100px)' }} />

        {/* Navigation */}
        <nav className="relative z-10 container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">קבליט</span>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <span>כניסה למערכת</span>
                <ChevronLeft className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 pt-20 pb-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <span 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium"
                style={{ background: 'rgba(251, 191, 36, 0.2)', border: '1px solid rgba(251, 191, 36, 0.3)' }}
              >
                <Sparkles className="w-4 h-4" style={{ color: '#fbbf24' }} />
                <span style={{ color: '#fbbf24' }}>חדש! מיפוי עמודות חכם עם AI</span>
                <Star className="w-4 h-4" style={{ color: '#fbbf24' }} />
              </span>
            </motion.div>
            
            {/* Main Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black mb-8 leading-tight"
            >
              <span className="text-white">הפקת קבלות PDF</span>
              <br />
              <span style={{ 
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                בלחיצה אחת
              </span>
            </motion.h1>
            
            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              העלו את קובץ האקסל שלכם ותנו למערכת לייצר קבלות PDF מקצועיות לכל שורה.
              <span className="font-semibold text-white"> פשוט, מהיר ומאובטח.</span>
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link 
                href="/onboarding" 
                className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg text-white transition-all hover:scale-105 hover:shadow-2xl"
                style={{ 
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  boxShadow: '0 10px 40px rgba(59, 130, 246, 0.4)'
                }}
              >
                <span>התחל עכשיו - חינם</span>
                <ArrowLeft className="w-5 h-5" />
              </Link>
              
              <a 
                href="#how-it-works" 
                className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg text-white transition-all hover:scale-105"
                style={{ 
                  background: 'transparent',
                  border: '2px solid rgba(255,255,255,0.3)'
                }}
              >
                <span>איך זה עובד?</span>
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-24 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              {[
                { number: '10K+', label: 'קבלות נוצרו' },
                { number: '500+', label: 'עסקים משתמשים' },
                { number: '99.9%', label: 'זמינות' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-black text-white mb-2">{stat.number}</div>
                  <div className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full flex items-start justify-center p-2" style={{ border: '2px solid rgba(255,255,255,0.3)' }}>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.6)' }}
            />
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24" style={{ background: '#ffffff' }}>
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span 
              className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-4"
              style={{ background: '#dbeafe', color: '#1d4ed8' }}
            >
              תהליך פשוט
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: '#0f172a' }}>
              איך זה עובד?
            </h2>
            <p className="text-xl" style={{ color: '#64748b' }}>
              3 צעדים פשוטים לקבלות מקצועיות
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: FileSpreadsheet,
                step: "01",
                title: "העלו את האקסל",
                description: "גררו את קובץ האקסל או CSV שלכם. המערכת תזהה אוטומטית את העמודות הרלוונטיות.",
                color: "#3b82f6",
                bg: "#dbeafe"
              },
              {
                icon: Sparkles,
                step: "02",
                title: "בדקו ואשרו",
                description: "המערכת מציעה מיפוי חכם בין העמודות לשדות הקבלה. אפשר לשנות ידנית לפי הצורך.",
                color: "#8b5cf6",
                bg: "#ede9fe"
              },
              {
                icon: Download,
                step: "03",
                title: "הורידו את הקבלות",
                description: "קבלו ZIP עם כל הקבלות, או הורידו כל קבלה בנפרד. גם PDF מאוחד זמין!",
                color: "#10b981",
                bg: "#d1fae5"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative p-8 rounded-3xl transition-all hover:-translate-y-2 hover:shadow-xl"
                style={{ 
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                }}
              >
                {/* Step Number */}
                <div 
                  className="absolute -top-4 right-8 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm"
                  style={{ background: item.color }}
                >
                  {item.step}
                </div>
                
                {/* Icon */}
                <div 
                  className="w-16 h-16 mb-6 rounded-2xl flex items-center justify-center"
                  style={{ background: item.bg }}
                >
                  <item.icon className="w-8 h-8" style={{ color: item.color }} />
                </div>
                
                <h3 className="text-2xl font-bold mb-3" style={{ color: '#0f172a' }}>
                  {item.title}
                </h3>
                <p className="text-lg leading-relaxed" style={{ color: '#64748b' }}>
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24" style={{ background: '#f8fafc' }}>
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span 
              className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-4"
              style={{ background: '#ede9fe', color: '#7c3aed' }}
            >
              יתרונות
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: '#0f172a' }}>
              למה קבליט?
            </h2>
            <p className="text-xl" style={{ color: '#64748b' }}>
              מערכת שנבנתה במיוחד לעסקים קטנים בישראל
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Zap, title: "מהיר", desc: "קבלות תוך שניות", color: "#f59e0b", bg: "#fef3c7" },
              { icon: Shield, title: "מאובטח", desc: "הקבצים נמחקים אוטומטית", color: "#10b981", bg: "#d1fae5" },
              { icon: Clock, title: "חוסך זמן", desc: "אין יותר עבודה ידנית", color: "#3b82f6", bg: "#dbeafe" },
              { icon: Users, title: "פשוט", desc: "אין צורך בהדרכה", color: "#8b5cf6", bg: "#ede9fe" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl text-center transition-all hover:-translate-y-2 hover:shadow-lg"
                style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}
              >
                <div 
                  className="w-14 h-14 mb-4 mx-auto rounded-xl flex items-center justify-center"
                  style={{ background: feature.bg }}
                >
                  <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#0f172a' }}>{feature.title}</h3>
                <p style={{ color: '#64748b' }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24" style={{ background: '#0f172a' }}>
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span 
                  className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-6"
                  style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}
                >
                  אבטחה מלאה
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                  אבטחה ופרטיות
                </h2>
                <h3 className="text-2xl font-bold mb-8" style={{ color: '#10b981' }}>
                  ברמה הגבוהה ביותר
                </h3>
                <ul className="space-y-4">
                  {[
                    "הקבצים שלך לא נשמרים בשרתים שלנו",
                    "עיבוד מתבצע בדפדפן שלך בלבד",
                    "אפשרות למחיקה אוטומטית אחרי הורדה",
                    "ללא מעקב או שיתוף נתונים",
                  ].map((item, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4"
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(16, 185, 129, 0.2)' }}
                      >
                        <CheckCircle2 className="w-5 h-5" style={{ color: '#10b981' }} />
                      </div>
                      <span className="text-lg" style={{ color: 'rgba(255,255,255,0.8)' }}>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div 
                  className="p-10 rounded-3xl text-center"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                  }}
                >
                  <div 
                    className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
                  >
                    <Lock className="w-12 h-12 text-white" />
                  </div>
                  <div 
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6"
                    style={{ background: 'rgba(16, 185, 129, 0.2)' }}
                  >
                    <div 
                      className="w-2.5 h-2.5 rounded-full animate-pulse"
                      style={{ background: '#10b981' }}
                    />
                    <span className="font-bold" style={{ color: '#10b981' }}>עיבוד מקומי מאובטח</span>
                  </div>
                  <p className="text-lg" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    כל העיבוד מתבצע בדפדפן שלך.
                    <br />
                    <span className="font-semibold text-white">הנתונים שלך נשארים אצלך.</span>
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24" style={{ background: '#ffffff' }}>
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span 
              className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-4"
              style={{ background: '#cffafe', color: '#0891b2' }}
            >
              שאלות נפוצות
            </span>
            <h2 className="text-4xl md:text-5xl font-black" style={{ color: '#0f172a' }}>
              יש לכם שאלות?
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "האם המידע שלי מאובטח?",
                a: "כן! כל העיבוד מתבצע בדפדפן שלך. הקבצים לא נשלחים לשרתים חיצוניים ונמחקים אוטומטית."
              },
              {
                q: "באיזה פורמט צריך להיות האקסל?",
                a: "אנחנו תומכים ב-Excel (.xlsx, .xls) וב-CSV. וודאו ששורה ראשונה מכילה כותרות עמודות."
              },
              {
                q: "האם אפשר להתאים את עיצוב הקבלה?",
                a: "כרגע יש תבנית מובנית מקצועית. בקרוב נוסיף אפשרות לבחור בין מספר תבניות."
              },
              {
                q: "האם זה בחינם?",
                a: "כן, השירות הבסיסי חינמי לחלוטין. ייתכנו תוספות פרימיום בעתיד."
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl transition-all hover:shadow-lg"
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
              >
                <h3 className="text-xl font-bold mb-2" style={{ color: '#0f172a' }}>{faq.q}</h3>
                <p className="text-lg" style={{ color: '#64748b' }}>{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              מוכנים להתחיל?
            </h2>
            <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.8)' }}>
              הצטרפו לאלפי עסקים שכבר חוסכים שעות עבודה עם קבליט
            </p>
            <Link 
              href="/onboarding" 
              className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-xl transition-all hover:scale-105"
              style={{ 
                background: '#ffffff',
                color: '#3b82f6',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
              }}
            >
              <span>צור קבלות עכשיו</span>
              <ArrowLeft className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10" style={{ background: '#0f172a' }}>
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
              >
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">קבליט</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)' }}>
              © 2025 קבליט. כל הזכויות שמורות.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
