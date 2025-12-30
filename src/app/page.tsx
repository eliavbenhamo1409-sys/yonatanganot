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
  Lock
} from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-50)] via-white to-[var(--color-accent)]/10" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">קבליט</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Link 
                href="/dashboard" 
                className="btn btn-secondary text-sm"
              >
                כניסה למערכת
                <ChevronLeft className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </nav>

        <div className="container mx-auto px-6 pt-16 pb-24">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md text-sm font-medium text-[var(--color-primary)]">
                <Sparkles className="w-4 h-4" />
                חדש! מיפוי עמודות חכם עם AI
              </span>
            </motion.div>
            
            <motion.h1 
              {...fadeInUp}
              className="text-5xl md:text-6xl font-bold text-[var(--color-gray-900)] mb-6 leading-tight"
            >
              הפקת קבלות PDF
              <br />
              <span className="gradient-text">בלחיצה אחת</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-[var(--color-gray-600)] mb-10 max-w-2xl mx-auto"
            >
              העלו את קובץ האקסל שלכם ותנו למערכת לייצר קבלות PDF מקצועיות לכל שורה. 
              פשוט, מהיר ומאובטח.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/onboarding" className="btn btn-primary text-lg px-8 py-4">
                התחל עכשיו - חינם
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <a href="#how-it-works" className="btn btn-secondary text-lg px-8 py-4">
                איך זה עובד?
              </a>
            </motion.div>
          </div>

          {/* Hero Visual - Receipt Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-16 max-w-3xl mx-auto"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-2xl blur-3xl opacity-20 transform -rotate-1" />
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-[var(--color-gray-100)]">
                {/* Mini Receipt Preview */}
                <div className="bg-[var(--color-gray-50)] rounded-xl p-6 border border-[var(--color-gray-200)]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-right">
                      <div className="w-16 h-16 bg-[var(--color-primary)] rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        לוגו
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-[var(--color-gray-500)]">שם העסק שלך</div>
                      <div className="text-xs text-[var(--color-gray-400)]">עוסק מורשה 123456789</div>
                    </div>
                  </div>
                  <div className="bg-[var(--color-primary)] text-white text-center py-2 rounded-lg mb-4">
                    <span className="font-bold">קבלה מס׳ 1001</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--color-gray-500)]">לקוח לדוגמה</span>
                      <span className="font-medium">לכבוד:</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-gray-500)]">01/01/2025</span>
                      <span className="font-medium">תאריך:</span>
                    </div>
                    <div className="border-t border-[var(--color-gray-200)] my-3" />
                    <div className="flex justify-between font-bold text-lg">
                      <span className="text-[var(--color-primary)]">₪1,000.00</span>
                      <span>סה"כ:</span>
                    </div>
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-[var(--color-accent)]/20 rounded-full blur-xl" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[var(--color-primary)]/20 rounded-full blur-xl" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[var(--color-gray-900)] mb-4">
              איך זה עובד?
            </h2>
            <p className="text-[var(--color-gray-600)] text-lg">
              3 צעדים פשוטים לקבלות מקצועיות
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {[
              {
                icon: FileSpreadsheet,
                step: "01",
                title: "העלו את האקסל",
                description: "גררו את קובץ האקסל או CSV שלכם. המערכת תזהה אוטומטית את העמודות הרלוונטיות."
              },
              {
                icon: Sparkles,
                step: "02",
                title: "בדקו ואשרו",
                description: "המערכת מציעה מיפוי חכם בין העמודות לשדות הקבלה. אפשר לשנות ידנית לפי הצורך."
              },
              {
                icon: Download,
                step: "03",
                title: "הורידו את הקבלות",
                description: "קבלו ZIP עם כל הקבלות, או הורידו כל קבלה בנפרד. גם PDF מאוחד זמין!"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="relative group"
              >
                <div className="card p-8 h-full text-center">
                  <div className="absolute -top-4 right-8 bg-[var(--color-primary)] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    {item.step}
                  </div>
                  <div className="w-16 h-16 mx-auto mb-6 bg-[var(--color-primary-50)] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon className="w-8 h-8 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-gray-900)] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-[var(--color-gray-600)]">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-[var(--color-gray-50)]">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[var(--color-gray-900)] mb-4">
              למה קבליט?
            </h2>
            <p className="text-[var(--color-gray-600)] text-lg">
              מערכת שנבנתה במיוחד לעסקים קטנים בישראל
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Zap, title: "מהיר", desc: "קבלות תוך שניות" },
              { icon: Shield, title: "מאובטח", desc: "הקבצים נמחקים אוטומטית" },
              { icon: Clock, title: "חוסך זמן", desc: "אין יותר עבודה ידנית" },
              { icon: Users, title: "פשוט", desc: "אין צורך בהדרכה" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-gray-100)] text-center hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 mx-auto mb-4 bg-[var(--color-primary-50)] rounded-xl flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <h3 className="font-bold text-[var(--color-gray-900)] mb-1">{feature.title}</h3>
                <p className="text-sm text-[var(--color-gray-500)]">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row items-center gap-12"
            >
              <div className="flex-1">
                <div className="w-20 h-20 bg-[var(--color-success-light)] rounded-2xl flex items-center justify-center mb-6">
                  <Lock className="w-10 h-10 text-[var(--color-success)]" />
                </div>
                <h2 className="text-3xl font-bold text-[var(--color-gray-900)] mb-4">
                  אבטחה ופרטיות
                </h2>
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
                      className="flex items-center gap-3"
                    >
                      <CheckCircle2 className="w-5 h-5 text-[var(--color-success)] flex-shrink-0" />
                      <span className="text-[var(--color-gray-600)]">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-success)] to-[var(--color-accent)] rounded-2xl blur-2xl opacity-20" />
                  <div className="relative bg-[var(--color-gray-50)] rounded-2xl p-8 border border-[var(--color-gray-200)]">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-4">
                        <div className="w-2 h-2 bg-[var(--color-success)] rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-[var(--color-success)]">עיבוד מקומי</span>
                      </div>
                      <p className="text-[var(--color-gray-600)] text-sm">
                        כל העיבוד מתבצע בדפדפן שלך.
                        <br />
                        הנתונים שלך נשארים אצלך.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-[var(--color-gray-50)]">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[var(--color-gray-900)] mb-4">
              שאלות נפוצות
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
                className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-gray-100)]"
              >
                <h3 className="font-bold text-[var(--color-gray-900)] mb-2">{faq.q}</h3>
                <p className="text-[var(--color-gray-600)]">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)]">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              מוכנים להתחיל?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              הצטרפו לאלפי עסקים שכבר חוסכים שעות עבודה עם קבליט
            </p>
            <Link 
              href="/onboarding" 
              className="inline-flex items-center gap-2 bg-white text-[var(--color-primary)] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[var(--color-gray-100)] transition-colors shadow-lg"
            >
              צור קבלות עכשיו
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[var(--color-gray-900)]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold">קבליט</span>
            </div>
            <p className="text-[var(--color-gray-400)] text-sm">
              © 2025 קבליט. כל הזכויות שמורות.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
