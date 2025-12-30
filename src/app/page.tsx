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

export default function LandingPage() {
  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#0f172a',
      fontFamily: "'Heebo', sans-serif",
      direction: 'rtl'
    }}>
      {/* Hero Section */}
      <section style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Glow - Hidden on mobile */}
        <div className="bg-glow-1" style={{
          position: 'absolute',
          top: '10%',
          right: '20%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none'
        }} />
        <div className="bg-glow-2" style={{
          position: 'absolute',
          bottom: '20%',
          left: '20%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }} />

        {/* Navigation */}
        <nav className="nav-container" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <FileText style={{ width: '22px', height: '22px', color: 'white' }} />
            </div>
            <span style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>קבליט</span>
          </div>
          
          <Link 
            href="/dashboard" 
            className="nav-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50px',
              color: 'white',
              fontWeight: '500',
              fontSize: '14px',
              textDecoration: 'none',
              transition: 'all 0.3s'
            }}
          >
            <span>כניסה</span>
            <ChevronLeft style={{ width: '14px', height: '14px' }} />
          </Link>
        </nav>

        {/* Hero Content */}
        <div className="hero-content" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 20px 80px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10
        }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: '24px' }}
          >
            <span className="hero-badge" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: 'rgba(251,191,36,0.15)',
              border: '1px solid rgba(251,191,36,0.3)',
              borderRadius: '50px',
              fontSize: '13px',
              fontWeight: '500',
              color: '#fbbf24'
            }}>
              <Sparkles style={{ width: '14px', height: '14px' }} />
              חדש! מיפוי חכם עם AI
            </span>
          </motion.div>
          
          {/* Main Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="hero-title"
            style={{
              fontSize: 'clamp(32px, 8vw, 72px)',
              fontWeight: '900',
              lineHeight: '1.15',
              marginBottom: '20px'
            }}
          >
            <span style={{ color: 'white' }}>הפקת קבלות PDF</span>
            <br />
            <span style={{ 
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent'
            }}>
              בלחיצה אחת
            </span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="hero-subtitle"
            style={{
              fontSize: 'clamp(16px, 4vw, 20px)',
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '600px',
              margin: '0 auto 36px',
              lineHeight: '1.6',
              padding: '0 10px'
            }}
          >
            העלו את קובץ האקסל שלכם ותנו למערכת לייצר קבלות PDF מקצועיות.
            <span style={{ color: 'white', fontWeight: '600' }}> פשוט, מהיר ומאובטח.</span>
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="cta-buttons"
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              padding: '0 10px'
            }}
          >
            <Link 
              href="/onboarding" 
              className="cta-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '14px',
                color: 'white',
                fontWeight: '700',
                fontSize: '16px',
                textDecoration: 'none',
                boxShadow: '0 10px 40px rgba(59,130,246,0.4)',
                transition: 'transform 0.3s'
              }}
            >
              <span>התחל עכשיו - חינם</span>
              <ArrowLeft style={{ width: '18px', height: '18px' }} />
            </Link>
            
            <a 
              href="#how-it-works" 
              className="cta-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 28px',
                background: 'transparent',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '14px',
                color: 'white',
                fontWeight: '700',
                fontSize: '16px',
                textDecoration: 'none',
                transition: 'all 0.3s'
              }}
            >
              איך זה עובד?
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="stats-container"
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '40px',
              marginTop: '60px',
              flexWrap: 'wrap'
            }}
          >
            {[
              { number: '+10K', label: 'קבלות נוצרו' },
              { number: '+500', label: 'עסקים משתמשים' },
              { number: '99.9%', label: 'זמינות' },
            ].map((stat, index) => (
              <div key={index} className="stat-item" style={{ textAlign: 'center', minWidth: '100px' }}>
                <div style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: '900', color: 'white' }}>{stat.number}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section-hiw" style={{ padding: '80px 20px', background: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{
              display: 'inline-block',
              padding: '8px 18px',
              background: '#dbeafe',
              color: '#1d4ed8',
              borderRadius: '50px',
              fontSize: '13px',
              fontWeight: '700',
              marginBottom: '14px'
            }}>
              תהליך פשוט
            </span>
            <h2 className="section-title" style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: '900', color: '#0f172a', marginBottom: '14px' }}>
              איך זה עובד?
            </h2>
            <p style={{ fontSize: 'clamp(16px, 4vw, 20px)', color: '#64748b' }}>
              3 צעדים פשוטים לקבלות מקצועיות
            </p>
          </div>

          <div className="steps-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {[
              {
                icon: FileSpreadsheet,
                step: "01",
                title: "העלו את האקסל",
                description: "גררו את קובץ האקסל או CSV שלכם. המערכת תזהה אוטומטית את העמודות.",
                color: "#3b82f6",
                bg: "#dbeafe"
              },
              {
                icon: Sparkles,
                step: "02",
                title: "בדקו ואשרו",
                description: "המערכת מציעה מיפוי חכם בין העמודות לשדות הקבלה.",
                color: "#8b5cf6",
                bg: "#ede9fe"
              },
              {
                icon: Download,
                step: "03",
                title: "הורידו את הקבלות",
                description: "קבלו ZIP עם כל הקבלות, או הורידו כל קבלה בנפרד.",
                color: "#10b981",
                bg: "#d1fae5"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                style={{
                  position: 'relative',
                  padding: '32px 24px',
                  background: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-14px',
                  right: '24px',
                  width: '36px',
                  height: '36px',
                  background: item.color,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '13px'
                }}>
                  {item.step}
                </div>
                
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: item.bg,
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <item.icon style={{ width: '28px', height: '28px', color: item.color }} />
                </div>
                
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '10px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-features" style={{ padding: '80px 20px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{
              display: 'inline-block',
              padding: '8px 18px',
              background: '#ede9fe',
              color: '#7c3aed',
              borderRadius: '50px',
              fontSize: '13px',
              fontWeight: '700',
              marginBottom: '14px'
            }}>
              יתרונות
            </span>
            <h2 className="section-title" style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: '900', color: '#0f172a', marginBottom: '14px' }}>
              למה קבליט?
            </h2>
            <p style={{ fontSize: 'clamp(16px, 4vw, 20px)', color: '#64748b' }}>
              מערכת שנבנתה במיוחד לעסקים קטנים בישראל
            </p>
          </div>

          <div className="features-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px'
          }}>
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
                style={{
                  padding: '24px 16px',
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: feature.bg,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px'
                }}>
                  <feature.icon style={{ width: '24px', height: '24px', color: feature.color }} />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="section-security" style={{ padding: '80px 20px', background: '#0f172a' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="security-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px',
            alignItems: 'center'
          }}>
            <div>
              <span style={{
                display: 'inline-block',
                padding: '8px 18px',
                background: 'rgba(16,185,129,0.2)',
                color: '#10b981',
                borderRadius: '50px',
                fontSize: '13px',
                fontWeight: '700',
                marginBottom: '20px'
              }}>
                אבטחה מלאה
              </span>
              <h2 className="section-title-dark" style={{ fontSize: 'clamp(28px, 6vw, 40px)', fontWeight: '900', color: 'white', marginBottom: '12px' }}>
                אבטחה ופרטיות
              </h2>
              <h3 style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: '700', color: '#10b981', marginBottom: '30px' }}>
                ברמה הגבוהה ביותר
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  "הקבצים שלך לא נשמרים בשרתים",
                  "עיבוד מתבצע בדפדפן שלך בלבד",
                  "מחיקה אוטומטית אחרי הורדה",
                  "ללא מעקב או שיתוף נתונים"
                ].map((item, index) => (
                  <li key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      background: 'rgba(16,185,129,0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <CheckCircle2 style={{ width: '16px', height: '16px', color: '#10b981' }} />
                    </div>
                    <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div style={{
              padding: '32px',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.1))',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '20px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <Lock style={{ width: '36px', height: '36px', color: 'white' }} />
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'rgba(16,185,129,0.2)',
                borderRadius: '50px',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#10b981',
                  borderRadius: '50%'
                }} />
                <span style={{ fontWeight: '700', color: '#10b981', fontSize: '14px' }}>עיבוד מקומי מאובטח</span>
              </div>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', margin: 0 }}>
                כל העיבוד מתבצע בדפדפן שלך.
                <br />
                <span style={{ color: 'white', fontWeight: '600' }}>הנתונים שלך נשארים אצלך.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-faq" style={{ padding: '80px 20px', background: '#ffffff' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{
              display: 'inline-block',
              padding: '8px 18px',
              background: '#cffafe',
              color: '#0891b2',
              borderRadius: '50px',
              fontSize: '13px',
              fontWeight: '700',
              marginBottom: '14px'
            }}>
              שאלות נפוצות
            </span>
            <h2 className="section-title" style={{ fontSize: 'clamp(28px, 6vw, 40px)', fontWeight: '900', color: '#0f172a' }}>
              יש לכם שאלות?
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: "האם המידע שלי מאובטח?", a: "כן! כל העיבוד מתבצע בדפדפן שלך. הקבצים לא נשלחים לשרתים חיצוניים." },
              { q: "באיזה פורמט צריך להיות האקסל?", a: "אנחנו תומכים ב-Excel (.xlsx, .xls) וב-CSV עם כותרות בשורה הראשונה." },
              { q: "האם אפשר להתאים את עיצוב הקבלה?", a: "כרגע יש תבנית מקצועית מובנית. בקרוב נוסיף תבניות נוספות." },
              { q: "האם זה בחינם?", a: "כן, השירות הבסיסי חינמי לחלוטין." }
            ].map((faq, index) => (
              <div
                key={index}
                style={{
                  padding: '20px 24px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px'
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                  {faq.q}
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-cta" style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="cta-title" style={{ fontSize: 'clamp(28px, 6vw, 40px)', fontWeight: '900', color: 'white', marginBottom: '20px' }}>
            מוכנים להתחיל?
          </h2>
          <p style={{ fontSize: 'clamp(16px, 4vw, 18px)', color: 'rgba(255,255,255,0.8)', marginBottom: '36px' }}>
            הצטרפו לאלפי עסקים שכבר חוסכים שעות עבודה
          </p>
          <Link 
            href="/onboarding" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '16px 36px',
              background: 'white',
              color: '#3b82f6',
              borderRadius: '14px',
              fontWeight: '700',
              fontSize: '17px',
              textDecoration: 'none',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            <span>צור קבלות עכשיו</span>
            <ArrowLeft style={{ width: '20px', height: '20px' }} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '30px 20px', background: '#0f172a' }}>
        <div className="footer-content" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText style={{ width: '18px', height: '18px', color: 'white' }} />
            </div>
            <span style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>קבליט</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: '14px' }}>
            © 2025 קבליט. כל הזכויות שמורות.
          </p>
        </div>
      </footer>

      {/* Mobile CSS */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .bg-glow-1, .bg-glow-2 {
            display: none;
          }
          .stats-container {
            gap: 24px !important;
          }
          .stat-item {
            min-width: 80px !important;
          }
          .footer-content {
            flex-direction: column !important;
            text-align: center !important;
          }
        }
        
        @media (max-width: 480px) {
          .cta-buttons {
            flex-direction: column !important;
          }
          .cta-buttons a {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </div>
  );
}
