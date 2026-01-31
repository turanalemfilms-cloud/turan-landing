import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  UserIcon,
  BuildingStorefrontIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckIcon,
  SparklesIcon,
  PaintBrushIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  PhotoIcon,
  CurrencyDollarIcon,
  ClockIcon,
  GlobeAltIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  HandRaisedIcon,
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  StopIcon,
} from '@heroicons/react/24/outline';

// Types
interface FormData {
  name: string; businessName: string; businessType: string; businessDescription: string; targetAudience: string; email: string; phone: string; selectedTheme: string; preferredColors: string; websiteGoal: string; featuresNeeded: string[]; hasLogo: boolean; hasContent: boolean; hasPhotos: boolean; competitors: string; additionalNotes: string; budgetRange: string; deadline: string;
}

interface Theme {
  id: string; name: string; nameKz: string; primary: string; secondary: string; accent: string; font: string; radius: string; image: string; isDark: boolean;
}

const themes: Theme[] = [
  { id: 'ios26', name: 'iOS 26', nameKz: 'iOS 26 GLASS', primary: '#007AFF', secondary: '#5856D6', accent: 'rgba(255,255,255,0.1)', font: 'Inter, sans-serif', radius: '32px', isDark: true, image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=800&q=80' },
  { id: 'cyber', name: 'Cyber Horizon', nameKz: 'CYBER NEON', primary: '#0D0221', secondary: '#00F5FF', accent: '#1A1A2E', font: 'monospace', radius: '8px', isDark: true, image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80' },
  { id: 'sunset', name: 'Sunset Silk', nameKz: 'SUNSET SILK', primary: '#FF4E50', secondary: '#F9D423', accent: '#FFF5F5', font: 'serif', radius: '48px', isDark: false, image: 'https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?w=800&q=80' },
  { id: 'forest', name: 'Emerald Deep', nameKz: 'DEEP FOREST', primary: '#064E3B', secondary: '#065F46', accent: '#ECFDF5', font: 'sans-serif', radius: '16px', isDark: true, image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80' },
  { id: 'chrome', name: 'Cosmic Chrome', primary: '#334155', secondary: '#94A3B8', accent: '#F8FAFC', font: 'sans-serif', radius: '4px', isDark: false, nameKz: 'COSMIC CHROME', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80' },
];

const websiteGoals = [
  { id: 'sales', label: 'Сату жасау', desc: 'Онлайн сату немесе тапсырыс қабылдау' },
  { id: 'info', label: 'Ақпарат беру', desc: 'Компания туралы ақпарат орналастыру' },
  { id: 'portfolio', label: 'Портфолио', desc: 'Жұмыстарыңызды көрсету' },
  { id: 'booking', label: 'Брондау', desc: 'Қызметтерге жазылу' },
];

const featureOptions = ['Байланыс формасы', 'Онлайн чат', 'Галерея', 'Прайс-лист', 'Блог', 'Карта', 'Әлеуметтік желілер', 'Тілдерді ауыстыру'];
const budgetRanges = ['50,000 - 100,000 ₸', '100,000 - 200,000 ₸', '200,000 - 500,000 ₸', '500,000+ ₸'];
const deadlineOptions = ['1 апта', '2 апта', '1 ай', 'Мерзімі маңызды емес'];

function PlayerControls({ onForward, onBackward, onPlayToggle, onStop, isPlaying, canForward, canBackward }: { onForward: () => void; onBackward: () => void; onPlayToggle: () => void; onStop: () => void; isPlaying: boolean; canForward: boolean; canBackward: boolean; }) {
  return (
    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-6 left-6 z-[100] liquid-glass p-3 flex flex-col gap-4 shadow-2xl border-white/10 bg-black/40 backdrop-blur-xl">
      <button onClick={onPlayToggle} className="w-12 h-12 rounded-full bg-turan-gold text-turan-dark flex items-center justify-center hover:scale-110 transition-all shadow-lg">{isPlaying ? <PauseIcon className="w-6 h-6 fill-current" /> : <PlayIcon className="w-6 h-6 fill-current ml-1" />}</button>
      <div className="flex flex-col gap-2">
        <button onClick={onForward} disabled={!canForward} className={`p-2 rounded-xl transition-all ${canForward ? 'text-white hover:bg-white/10' : 'text-white/20'}`}><ForwardIcon className="w-6 h-6" /></button>
        <button onClick={onBackward} disabled={!canBackward} className={`p-2 rounded-xl transition-all ${canBackward ? 'text-white hover:bg-white/10' : 'text-white/20'}`}><BackwardIcon className="w-6 h-6" /></button>
        <button onClick={onStop} className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"><StopIcon className="w-6 h-6" /></button>
      </div>
    </motion.div>
  );
}

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState<'reveal' | 'popup' | 'transform' | 'chat' | 'style'>('reveal');
  const [isPlaying, setIsPlaying] = useState(true); // AUTO-PLAY ENABLED BY DEFAULT
  const [formData, setFormData] = useState<FormData>({
    name: '', businessName: '', businessType: '', businessDescription: '', targetAudience: '', email: '', phone: '', selectedTheme: 'ios26', preferredColors: '', websiteGoal: '', featuresNeeded: [], hasLogo: false, hasContent: false, hasPhotos: false, competitors: '', additionalNotes: '', budgetRange: '', deadline: '',
  });
  const [themeIndex, setThemeIndex] = useState(0);
  const [chatMessages, setChatMessages] = useState<{ id: number; text: string; isUser: boolean }[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);
  const [showRealLogo, setShowRealLogo] = useState(false);
  const [isLighter, setIsLighter] = useState(false);
  const [highlighted, setHighlighted] = useState<string | null>(null);

  const activeTheme = themes[themeIndex];

  // Chat sequence logic - FASTER (1s per pair)
  const runChat = () => {
    const flow = [
      { user: 'Түсін сәл ашық қылайықшы', bot: 'Әрине! Қазір жаңартамын.', type: 'lighten' },
      { user: 'Жазуды сәл үлкейте аласыз ба?', bot: 'Дайын! Мәтін өлшемі өзгертілді.', type: 'enlarge' },
      { user: 'Мына жерге логотип қойыңызшы', bot: 'Логотип сәтті қосылды!', type: 'logo' },
    ];
    let pairIndex = 0;
    const interval = setInterval(() => {
      if (pairIndex < flow.length) {
        const pair = flow[pairIndex];
        setChatMessages([{ id: 1, text: pair.user, isUser: true }]);
        setTimeout(() => {
          setChatMessages([{ id: 1, text: pair.user, isUser: true }, { id: 2, text: pair.bot, isUser: false }]);
          setTimeout(() => {
            setChatMessages([]);
            if (pair.type === 'lighten') { setHighlighted('bg'); setIsLighter(true); }
            if (pair.type === 'enlarge') { setHighlighted('h1'); setFontSizeMultiplier(1.2); }
            if (pair.type === 'logo') { setHighlighted('logo'); setShowRealLogo(true); }
            setTimeout(() => setHighlighted(null), 500);
            pairIndex++;
          }, 800); // Wait 0.8s after bot reply
        }, 800); // Wait 0.8s after user message
      } else {
        clearInterval(interval);
        setTimeout(() => setSubStep('style'), 1000);
      }
    }, 2000); // Full pair cycle ~2s
  };

  useEffect(() => {
    let timer: any;
    if (isPlaying && step === 2) {
      if (subStep === 'reveal') timer = setTimeout(() => setSubStep('popup'), 3000);
      else if (subStep === 'style') timer = setTimeout(() => { setIsFullscreen(true); setTimeout(() => setStep(3), 1200); }, 10000);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, step, subStep]);

  useEffect(() => {
    if (subStep === 'style' && isPlaying && !isFullscreen) {
      const interval = setInterval(() => setThemeIndex(p => (p + 1) % themes.length), 2000);
      return () => clearInterval(interval);
    }
  }, [subStep, isPlaying, isFullscreen]);

  const handleAgree = () => {
    setSubStep('transform');
    setTimeout(() => { setSubStep('chat'); runChat(); }, 1000);
  };

  const nextSubStep = () => {
    if (subStep === 'reveal') setSubStep('popup');
    else if (subStep === 'popup') handleAgree();
    else if (subStep === 'style') { setIsFullscreen(true); setTimeout(() => setStep(3), 1200); }
  };

  const prevSubStep = () => {
    if (subStep === 'popup') setSubStep('reveal');
    else if (subStep === 'chat') { setSubStep('popup'); setChatMessages([]); setIsLighter(false); setFontSizeMultiplier(1); setShowRealLogo(false); }
    else if (subStep === 'style') setSubStep('chat');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try { await axios.post('/api/leads', { ...formData, featuresNeeded: JSON.stringify(formData.featuresNeeded), agreedToTerms: true }); setIsComplete(true); } 
    catch (e) { setIsComplete(true); } finally { setIsSubmitting(false); }
  };

  if (isComplete) return <SuccessScreen name={formData.name} />;

  if (step === 1) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-the-void flex items-center justify-center p-8 z-50 font-sans">
        <div className="max-w-md w-full text-center">
          <UserIcon className="w-16 h-16 text-turan-gold mx-auto mb-8" />
          <h1 className="text-4xl font-bold text-white mb-8">Атыңыз кім?</h1>
          <input type="text" value={formData.name} autoFocus onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-xl text-center focus:outline-none focus:border-turan-gold mb-8 transition-all" placeholder="Атыңызды жазыңыз..." />
          {formData.name.length >= 2 && <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setStep(2)} className="px-12 py-4 rounded-2xl liquid-glass-button text-turan-dark font-black text-lg">Бастау</motion.button>}
        </div>
      </motion.div>
    );
  }

  if (step === 3) {
    return <FinalCTAStep onNext={() => setStep(4)} />;
  }

  if (step === 4) {
    return <BriefStep formData={formData} setFormData={setFormData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
  }

  return (
    <div className="fixed inset-0 bg-[#05050a] overflow-hidden flex flex-col items-center justify-center font-sans">
      <PlayerControls isPlaying={isPlaying} onPlayToggle={() => setIsPlaying(!isPlaying)} onForward={nextSubStep} onBackward={prevSubStep} onStop={() => { setStep(1); setSubStep('reveal'); setIsPlaying(false); setIsLighter(false); setFontSizeMultiplier(1); setShowRealLogo(false); setIsFullscreen(false); }} canForward={subStep !== 'style'} canBackward={subStep !== 'reveal'} />

      <AnimatePresence>
        {subStep === 'reveal' && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-white/40 uppercase tracking-widest text-xs mb-6 text-center px-4">
            сіздің сайтыңызды приблизно осылай тегін көре аласыз <br/>
            <span className="text-white/20 normal-case">(мынау емес, өзіңіздің дизайныңыз)</span>
          </motion.p>
        )}
      </AnimatePresence>

      <motion.div
        layout
        animate={{
          width: isFullscreen ? '100vw' : '340px',
          height: isFullscreen ? '100vh' : '680px',
          borderRadius: isFullscreen ? '0px' : '54px',
          scale: subStep === 'popup' ? 0.9 : 1,
          filter: subStep === 'popup' ? 'blur(10px)' : 'blur(0px)',
          y: isFullscreen ? 0 : [0, -10, 0],
        }}
        style={{ fontFamily: activeTheme.font }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], y: isFullscreen ? { duration: 0 } : { repeat: Infinity, duration: 4, ease: "easeInOut" } }}
        className={`bg-white shadow-[0_50px_100px_rgba(0,0,0,0.6)] relative border-[10px] ${isFullscreen ? 'border-transparent' : 'border-[#1a1a1a]'} overflow-hidden z-40`}
      >
        {!isFullscreen && <div className="iphone-17-island" />}

        <motion.div 
          className="h-full w-full overflow-y-auto overflow-x-hidden transition-all duration-1000" 
          style={{ background: `linear-gradient(135deg, ${activeTheme.primary}, ${activeTheme.secondary})`, color: activeTheme.isDark ? '#fff' : '#000' }}
          animate={{ filter: isLighter ? 'brightness(1.3)' : 'brightness(1)', outline: highlighted === 'bg' ? '8px solid #D4AF37' : '0px solid transparent' }}
        >
          <div className="relative z-10 p-8 max-w-full">
            <div className="flex justify-between items-center mb-12">
              <motion.div animate={{ outline: highlighted === 'logo' ? '4px solid #D4AF37' : '0px solid transparent', padding: highlighted === 'logo' ? '4px' : '0px', borderRadius: '8px' }}>
                {showRealLogo ? (
                  <div className="flex items-center gap-1">
                    <div className="w-6 h-6 bg-white rounded flex items-center justify-center shadow-sm"><SparklesIcon className="w-4 h-4 text-blue-600" /></div>
                    <span className={`font-black text-xs ${activeTheme.isDark ? 'text-white' : 'text-black'}`}>LOGO</span>
                  </div>
                ) : (
                  <div className={`h-6 w-20 rounded-full shimmer ${activeTheme.isDark ? 'bg-white/20' : 'bg-black/10'}`} />
                )}
              </motion.div>
              <div className="flex gap-2">{[1, 2].map(i => <div key={i} className={`h-1 w-8 rounded ${activeTheme.isDark ? 'bg-white/10' : 'bg-black/10'}`} />)}</div>
            </div>
            
            <motion.h1 
              animate={{ 
                fontSize: isFullscreen ? `${4 * fontSizeMultiplier}rem` : `${1.8 * fontSizeMultiplier}rem`, 
                color: highlighted === 'h1' ? '#D4AF37' : (activeTheme.isDark ? '#fff' : '#000') 
              }}
              className="font-black mb-6 leading-[1.1] tracking-tighter" 
            >
              {formData.name}, <br/>Болашақ Осында.
            </motion.h1>
            
            <p className={`${isFullscreen ? 'text-lg mb-12' : 'text-xs mb-8'} font-medium opacity-80 leading-relaxed`}>Инновациялық, стильді және автономды веб-шешімдер.</p>
            
            <div className="mb-10 rounded-2xl overflow-hidden shadow-xl aspect-video border border-white/10">
              <img src={activeTheme.image} className="w-full h-full object-cover" alt={activeTheme.name} />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {['Жылдамдық', 'Автономды', 'Дизайн'].map((t, i) => (
                <div key={i} style={{ borderRadius: activeTheme.radius }} className={`backdrop-blur-md p-6 border ${activeTheme.isDark ? 'bg-white/10 border-white/5' : 'bg-black/5 border-black/5'}`}>
                  <h3 className="text-lg font-bold mb-2 uppercase tracking-tighter">{t}</h3>
                  <div className={`h-1 w-full rounded-full shimmer ${activeTheme.isDark ? 'bg-white/10' : 'bg-black/5'}`} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CHAT OVERLAY */}
        <div className="absolute inset-0 pointer-events-none p-4 z-50 flex flex-col justify-center gap-4">
          <AnimatePresence>
            {chatMessages.map(m => (
              <motion.div
                key={m.id} initial={{ opacity: 0, x: m.isUser ? 30 : -30, scale: 0.8 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0 }}
                className={`flex ${m.isUser ? 'justify-end' : 'justify-start'} w-full`}
              >
                <div style={{ background: '#FFD700', color: '#000', fontWeight: 'bold' }} className="px-4 py-2 max-w-[85%] shadow-2xl rounded-2xl border-2 border-black/5 text-[11px] md:text-sm pointer-events-auto">
                  {m.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {subStep === 'popup' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center z-[60] p-6">
            <div className="liquid-glass p-10 max-w-sm text-center border-white/10 shadow-2xl bg-black/60 backdrop-blur-2xl">
              <p className="text-white text-lg leading-relaxed mb-8">Міне осындай нәтижені көргеннен кейін, ұнап жатса, тапсырыс бере аласыз.</p>
              <button onClick={handleAgree} className="w-full py-4 rounded-2xl liquid-glass-button text-turan-dark font-black text-lg">Келісемін</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VERTICAL STYLE SELECTOR */}
      {subStep === 'style' && !isFullscreen && (
        <div className="absolute bottom-24 right-6 flex flex-col gap-3 z-50">
          {themes.map((t, idx) => (
            <button key={t.id} onClick={() => setThemeIndex(idx)} className={`relative group flex items-center gap-3 transition-all ${themeIndex === idx ? 'scale-110' : 'opacity-50 hover:opacity-100'}`}>
              <span className={`text-[10px] font-black uppercase tracking-tighter transition-all ${themeIndex === idx ? 'text-turan-gold' : 'text-white opacity-0 group-hover:opacity-100'}`}>{t.nameKz}</span>
              <div className={`w-14 h-14 rounded-2xl overflow-hidden border-2 shadow-2xl transition-all ${themeIndex === idx ? 'border-turan-gold ring-4 ring-turan-gold/20' : 'border-white/20'}`}><img src={t.image} className="w-full h-full object-cover" alt="" /></div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FinalCTAStep({ onNext }: { onNext: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-the-void flex items-center justify-center p-8 text-center font-sans">
      <div className="max-w-2xl">
        <HandRaisedIcon className="w-16 h-16 text-turan-gold mx-auto mb-12" />
        <h1 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">Ешкімде жоқ сайт жасатқың келе ме?</h1>
        <p className="text-white/60 text-xl mb-12 font-light">Сұрақ көп болса да, жоқ болса да, ұнаса мына батырманы бас</p>
        <button onClick={onNext} className="px-16 py-6 rounded-3xl liquid-glass-button text-turan-dark font-black text-2xl shadow-2xl">Иә, келісемін</button>
      </div>
    </motion.div>
  );
}

function BriefStep({ formData, setFormData, onSubmit, isSubmitting }: {
  formData: FormData; setFormData: React.Dispatch<React.SetStateAction<FormData>>; onSubmit: () => void; isSubmitting: boolean;
}) {
  const [activeSection, setActiveSection] = useState(0);
  const sections = [{ title: 'Бизнес', icon: BuildingStorefrontIcon }, { title: 'Мақсат', icon: GlobeAltIcon }, { title: 'Қосымша', icon: DocumentTextIcon }, { title: 'Байланыс', icon: EnvelopeIcon }];
  const toggleFeature = (f: string) => { setFormData(p => ({ ...p, featuresNeeded: p.featuresNeeded.includes(f) ? p.featuresNeeded.filter(x => x !== f) : [...p.featuresNeeded, f] })); };

  return (
    <div className="min-h-screen bg-[#05050a] py-20 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16"><h1 className="text-5xl font-black text-white mb-4 tracking-tight">Бриф толтыру</h1><p className="text-white/40 text-xl">Мәліметтерді енгізіңіз</p></div>
        <div className="flex justify-center gap-2 mb-12 flex-wrap">{sections.map((s, i) => (<button key={i} onClick={() => setActiveSection(i)} className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all ${activeSection === i ? 'bg-turan-gold text-turan-dark font-bold' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}><s.icon className="w-5 h-5" /> {s.title}</button>))}</div>
        <div className="liquid-glass p-8 md:p-12">
          {activeSection === 0 && (
            <div className="space-y-8">
              <input type="text" value={formData.businessName} onChange={e => setFormData(p => ({ ...p, businessName: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-xl focus:outline-none focus:border-turan-gold" placeholder="Бизнес атауы *" />
              <textarea rows={4} value={formData.businessDescription} onChange={e => setFormData(p => ({ ...p, businessDescription: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-xl focus:outline-none focus:border-turan-gold resize-none" placeholder="Бизнес сипаттамасы" />
            </div>
          )}
          {activeSection === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {websiteGoals.map(g => (<button key={g.id} onClick={() => setFormData(p => ({ ...p, websiteGoal: g.id }))} className={`p-6 rounded-3xl text-left border-2 transition-all ${formData.websiteGoal === g.id ? 'border-turan-gold bg-turan-gold/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}><h4 className="text-white font-bold text-lg mb-1">{g.label}</h4><p className="text-white/40 text-sm">{g.desc}</p></button>))}
            </div>
          )}
          {activeSection === 2 && (
            <div className="grid grid-cols-2 gap-4">
              {budgetRanges.map(r => (<button key={r} onClick={() => setFormData(p => ({ ...p, budgetRange: r }))} className={`p-6 rounded-2xl border transition-all ${formData.budgetRange === r ? 'border-turan-gold bg-turan-gold/10 text-white' : 'border-white/5 text-white/40'}`}>{r}</button>))}
            </div>
          )}
          {activeSection === 3 && (
            <div className="space-y-8">
              <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-xl" placeholder="Email *" />
              <input type="tel" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-xl" placeholder="Телефон *" />
              <button onClick={onSubmit} disabled={isSubmitting} className="w-full py-6 rounded-3xl liquid-glass-button text-turan-dark font-black text-2xl shadow-2xl">{isSubmitting ? 'Жіберілуде...' : 'Өтінімді жіберу'}</button>
            </div>
          )}
          <div className="flex justify-between mt-12 pt-8 border-t border-white/5">
            <button onClick={() => setActiveSection(p => Math.max(0, p - 1))} className="text-white/30 hover:text-white">Артқа</button>
            {activeSection < 3 && <button onClick={() => setActiveSection(p => Math.min(3, p + 1))} className="px-8 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20">Келесі</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function SuccessScreen({ name }: { name: string }) {
  return (
    <div className="min-h-screen bg-the-void flex items-center justify-center p-8 text-center font-sans">
      <div className="max-w-md"><h1 className="text-5xl font-black text-white mb-6">Рахмет, {name}!</h1><p className="text-white/60 text-xl">Брифіңізді алдық. Хабарласамыз.</p></div>
    </div>
  );
}
