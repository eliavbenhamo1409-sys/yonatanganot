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
  Star,
  Layers,
  MousePointerClick
} from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafbfc]">
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#0a1628]" />
          
          {/* Floating Orbs */}
          <div className="absolute top-20 right-[20%] w-[500px] h-[500px] bg-[#3b82f6]/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-20 left-[10%] w-[400px] h-[400px] bg-[#8b5cf6]/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#06b6d4]/10 rounded-full blur-[150px]" />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] rounded-xl blur-lg opacity-50" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold text-white">קבליט</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link 
                href="/dashboard" 
                className="group relative inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-medium hover:bg-white/20 transition-all duration-300"
              >
                <span>כניסה למערכת</span>
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 pt-20 pb-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#3b82f6]/20 to-[#8b5cf6]/20 backdrop-blur-sm border border-white/10 rounded-full text-sm font-medium text-white/90">
                <Sparkles className="w-4 h-4 text-[#fbbf24]" />
                <span>חדש! מיפוי עמודות חכם עם AI</span>
                <Star className="w-4 h-4 text-[#fbbf24]" />
              </span>
            </motion.div>
            
            {/* Main Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-white mb-8 leading-[1.1]"
            >
              הפקת קבלות PDF
              <br />
              <span className="bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent">
                בלחיצה אחת
              </span>
            </motion.h1>
            
            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              העלו את קובץ האקסל שלכם ותנו למערכת לייצר קבלות PDF מקצועיות לכל שורה. 
              <span className="text-white/80 font-medium"> פשוט, מהיר ומאובטח.</span>
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link 
                href="/onboarding" 
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 overflow-hidden rounded-2xl font-bold text-lg transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] to-[#3b82f6] bg-[length:200%_100%] animate-gradient-x" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-[#8b5cf6] via-[#3b82f6] to-[#8b5cf6] bg-[length:200%_100%] animate-gradient-x" />
                <span className="relative text-white">התחל עכשיו - חינם</span>
                <ArrowLeft className="relative w-5 h-5 text-white group-hover:-translate-x-1 transition-transform" />
              </Link>
              
              <a 
                href="#how-it-works" 
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-2xl font-bold text-lg text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300"
              >
                <span>איך זה עובד?</span>
                <MousePointerClick className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              {[
                { number: '10K+', label: 'קבלות נוצרו' },
                { number: '500+', label: 'עסקים משתמשים' },
                { number: '99.9%', label: 'זמינות' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-sm text-white/50">{stat.label}</div>
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
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 bg-white/60 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 bg-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#0a1628] to-transparent" />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="inline-block px-4 py-2 bg-[#3b82f6]/10 rounded-full text-[#3b82f6] font-semibold text-sm mb-4">
              תהליך פשוט
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0a1628] mb-6">
              איך זה עובד?
            </h2>
            <p className="text-xl text-[#64748b] max-w-xl mx-auto">
              3 צעדים פשוטים לקבלות מקצועיות
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {[
              {
                icon: FileSpreadsheet,
                step: "01",
                title: "העלו את האקסל",
                description: "גררו את קובץ האקסל או CSV שלכם. המערכת תזהה אוטומטית את העמודות הרלוונטיות.",
                gradient: "from-[#3b82f6] to-[#06b6d4]"
              },
              {
                icon: Sparkles,
                step: "02",
                title: "בדקו ואשרו",
                description: "המערכת מציעה מיפוי חכם בין העמודות לשדות הקבלה. אפשר לשנות ידנית לפי הצורך.",
                gradient: "from-[#8b5cf6] to-[#ec4899]"
              },
              {
                icon: Download,
                step: "03",
                title: "הורידו את הקבלות",
                description: "קבלו ZIP עם כל הקבלות, או הורידו כל קבלה בנפרד. גם PDF מאוחד זמין!",
                gradient: "from-[#10b981] to-[#06b6d4]"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group relative"
              >
                <div className="relative bg-white rounded-3xl p-8 shadow-xl shadow-[#0a1628]/5 border border-[#e2e8f0] hover:border-transparent hover:shadow-2xl hover:shadow-[#3b82f6]/10 transition-all duration-500 h-full">
                  {/* Step Number */}
                  <div className={`absolute -top-5 right-8 w-10 h-10 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-lg`}>
                    {item.step}
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 mb-6 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-[#0a1628] mb-4">
                    {item.title}
                  </h3>
                  <p className="text-[#64748b] leading-relaxed text-lg">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 bg-gradient-to-b from-[#f8fafc] to-white relative">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="inline-block px-4 py-2 bg-[#8b5cf6]/10 rounded-full text-[#8b5cf6] font-semibold text-sm mb-4">
              יתרונות
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0a1628] mb-6">
              למה קבליט?
            </h2>
            <p className="text-xl text-[#64748b] max-w-xl mx-auto">
              מערכת שנבנתה במיוחד לעסקים קטנים בישראל
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
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
                className="group bg-white p-8 rounded-3xl shadow-lg shadow-[#0a1628]/5 border border-[#e2e8f0] hover:shadow-xl hover:border-transparent hover:-translate-y-2 transition-all duration-300"
              >
                <div 
                  className="w-14 h-14 mb-6 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: feature.bg }}
                >
                  <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                </div>
                <h3 className="text-xl font-bold text-[#0a1628] mb-2">{feature.title}</h3>
                <p className="text-[#64748b]">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-32 bg-[#0a1628] relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#10b981]/10 rounded-full blur-[150px]" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-16 items-center"
            >
              <div>
                <span className="inline-block px-4 py-2 bg-[#10b981]/20 rounded-full text-[#10b981] font-semibold text-sm mb-6">
                  אבטחה מלאה
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                  אבטחה ופרטיות
                  <br />
                  <span className="text-[#10b981]">ברמה הגבוהה ביותר</span>
                </h2>
                <ul className="space-y-5">
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
                      <div className="w-8 h-8 bg-[#10b981]/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                      </div>
                      <span className="text-white/80 text-lg">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#10b981] to-[#06b6d4] rounded-3xl blur-2xl opacity-20" />
                <div className="relative bg-[#0f2847] rounded-3xl p-10 border border-white/10">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#10b981] to-[#06b6d4] rounded-3xl flex items-center justify-center">
                      <Lock className="w-12 h-12 text-white" />
                    </div>
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#10b981]/20 rounded-full mb-6">
                      <div className="w-2.5 h-2.5 bg-[#10b981] rounded-full animate-pulse" />
                      <span className="font-semibold text-[#10b981]">עיבוד מקומי מאובטח</span>
                    </div>
                    <p className="text-white/60 text-lg leading-relaxed">
                      כל העיבוד מתבצע בדפדפן שלך.
                      <br />
                      <span className="text-white/80 font-medium">הנתונים שלך נשארים אצלך.</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="inline-block px-4 py-2 bg-[#06b6d4]/10 rounded-full text-[#06b6d4] font-semibold text-sm mb-4">
              שאלות נפוצות
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0a1628]">
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
                className="group bg-[#f8fafc] hover:bg-white rounded-2xl p-8 border border-[#e2e8f0] hover:border-[#3b82f6]/30 hover:shadow-xl hover:shadow-[#3b82f6]/5 transition-all duration-300"
              >
                <h3 className="text-xl font-bold text-[#0a1628] mb-3 group-hover:text-[#3b82f6] transition-colors">{faq.q}</h3>
                <p className="text-[#64748b] text-lg leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6] via-[#8b5cf6] to-[#06b6d4]" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
              מוכנים להתחיל?
            </h2>
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto">
              הצטרפו לאלפי עסקים שכבר חוסכים שעות עבודה עם קבליט
            </p>
            <Link 
              href="/onboarding" 
              className="group inline-flex items-center gap-3 bg-white text-[#3b82f6] px-10 py-5 rounded-2xl font-bold text-xl hover:bg-[#f8fafc] transition-all duration-300 shadow-2xl shadow-black/20 hover:scale-105"
            >
              <span>צור קבלות עכשיו</span>
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#0a1628]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">קבליט</span>
            </div>
            <p className="text-white/40 text-sm">
              © 2025 קבליט. כל הזכויות שמורות.
            </p>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
