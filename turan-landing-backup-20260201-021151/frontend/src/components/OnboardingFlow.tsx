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
} from '@heroicons/react/24/outline';

// Types
interface FormData {
  name: string;
  businessName: string;
  businessType: string;
  businessDescription: string;
  targetAudience: string;
  email: string;
  phone: string;
  selectedTheme: string;
  preferredColors: string;
  websiteGoal: string;
  featuresNeeded: string[];
  hasLogo: boolean;
  hasContent: boolean;
  hasPhotos: boolean;
  competitors: string;
  additionalNotes: string;
  budgetRange: string;
  deadline: string;
}

interface Theme {
  id: string;
  name: string;
  nameKz: string;
  primary: string;
  secondary: string;
  accent: string;
  font: string;
  image: string;
}

// Themes configuration with professional images
const themes: Theme[] = [
  {
    id: 'modern',
    name: 'Modern',
    nameKz: 'Заманауи',
    primary: '#3B82F6',
    secondary: '#60A5FA',
    accent: '#DBEAFE',
    font: 'Inter',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop'
  },
  {
    id: 'elegant',
    name: 'Elegant',
    nameKz: 'Талғампаз',
    primary: '#8B5CF6',
    secondary: '#A78BFA',
    accent: '#EDE9FE',
    font: 'Playfair Display',
    image: 'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=400&h=300&fit=crop'
  },
  {
    id: 'nature',
    name: 'Nature',
    nameKz: 'Табиғи',
    primary: '#10B981',
    secondary: '#34D399',
    accent: '#D1FAE5',
    font: 'Nunito',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop'
  },
  {
    id: 'bold',
    name: 'Bold',
    nameKz: 'Батыл',
    primary: '#EF4444',
    secondary: '#F87171',
    accent: '#FEE2E2',
    font: 'Poppins',
    image: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=300&fit=crop'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    nameKz: 'Қарапайым',
    primary: '#1F2937',
    secondary: '#4B5563',
    accent: '#F3F4F6',
    font: 'DM Sans',
    image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=400&h=300&fit=crop'
  },
];

const businessTypes = [
  'Кафе / Мейрамхана',
  'Дүкен / Магазин',
  'Сұлулық салоны',
  'Білім беру орталығы',
  'Медициналық орталық',
  'Құрылыс компаниясы',
  'IT компаниясы',
  'Туризм агенттігі',
  'Фитнес клубы',
  'Басқа',
];

const websiteGoals = [
  { id: 'sales', label: 'Сату жасау', desc: 'Онлайн сату немесе тапсырыс қабылдау' },
  { id: 'info', label: 'Ақпарат беру', desc: 'Компания туралы ақпарат орналастыру' },
  { id: 'portfolio', label: 'Портфолио', desc: 'Жұмыстарыңызды көрсету' },
  { id: 'booking', label: 'Брондау', desc: 'Қызметтерге жазылу' },
];

const featureOptions = [
  'Байланыс формасы',
  'Онлайн чат',
  'Галерея',
  'Прайс-лист',
  'Блог',
  'Карта',
  'Әлеуметтік желілер',
  'Тілдерді ауыстыру',
];

const budgetRanges = [
  '50,000 - 100,000 ₸',
  '100,000 - 200,000 ₸',
  '200,000 - 500,000 ₸',
  '500,000+ ₸',
];

const deadlineOptions = [
  '1 апта',
  '2 апта',
  '1 ай',
  'Мерзімі маңызды емес',
];

// Typewriter sound effect (royalty-free click sound)
const TYPEWRITER_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3';

// Custom hook for typewriter sound
function useTypewriterSound(enabled: boolean = true) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (enabled) {
      audioRef.current = new Audio(TYPEWRITER_SOUND_URL);
      audioRef.current.volume = 0.1;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [enabled]);

  const playClick = useCallback(() => {
    if (audioRef.current && enabled) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, [enabled]);

  return playClick;
}

// ============================================
// STEP 1: ONBOARDING - Get User Name
// ============================================
function OnboardingStep({ formData, setFormData, onNext }: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onNext: () => void;
}) {
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setIsValid(formData.name.trim().length >= 2);
  }, [formData.name]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="flex flex-col items-center justify-center min-h-screen p-8 bg-the-void"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
        className="w-full max-w-md text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-turan-gold to-turan-bronze flex items-center justify-center"
        >
          <UserIcon className="w-10 h-10 text-turan-dark" />
        </motion.div>

        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-4xl md:text-5xl font-bold text-white mb-4"
        >
          Сәлеметсіз бе!
        </motion.h1>
        <motion.p
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/70 text-lg mb-12"
        >
          Сізбен танысуға қуаныштымыз
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          <div className="text-left">
            <label className="block text-white/80 text-sm font-medium mb-2">
              Сіздің атыңыз
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Мысалы: Алмас"
              autoFocus
              className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-turan-gold focus:ring-2 focus:ring-turan-gold/30 transition-all text-lg"
            />
          </div>

          <motion.button
            onClick={onNext}
            disabled={!isValid}
            whileHover={isValid ? { scale: 1.02 } : {}}
            whileTap={isValid ? { scale: 0.98 } : {}}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
              isValid
                ? 'liquid-glass-button text-white cursor-pointer'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
          >
            Жалғастыру
            <ArrowRightIcon className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// STEP 2: THE VOID - Dark philosophical screen with Liquid Glass
// ============================================
function VoidStep({ onNext }: { onNext: () => void }) {
  const [showButton, setShowButton] = useState(false);
  
  // Updated text per requirements
  const voidText = 'Дизайнның бірінші бетін көрмейінше, ол сізге ешнәрсе емес. Дәл осындай қараңғы бірдеңе. Ақшаны не үшін төлейсіз? Одан да бірінші көзіңізге көрінетін сайттың дизайнды тегін алыңыз.';

  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-the-void flex items-center justify-center p-8"
    >
      <div className="text-center w-full max-w-2xl">
        {/* Fixed Width, Vertically Expanding Liquid Glass Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="liquid-glass p-8 md:p-12 mx-auto w-full overflow-hidden"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
            className="text-white/90 text-xl md:text-2xl leading-relaxed font-light text-center"
          >
            {voidText}
          </motion.p>
        </motion.div>

        <AnimatePresence>
          {showButton && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={onNext}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-12 px-8 py-4 rounded-xl liquid-glass-button text-white font-semibold text-lg transition-all flex items-center gap-2 mx-auto"
            >
              Көрсетіңіз
              <SparklesIcon className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ============================================
// STEP 3: REVEAL with Actual Site Preview + Popup
// ============================================
function RevealWithPopupStep({ userName, selectedTheme, onNext }: { 
  userName: string; 
  selectedTheme: string; 
  onNext: () => void 
}) {
  const [phase, setPhase] = useState<'reveal' | 'popup' | 'unblur'>('reveal');
  const [charIndex, setCharIndex] = useState(0);
  const playClick = useTypewriterSound(true);
  const theme = themes.find(t => t.id === selectedTheme) || themes[0];

  const popupText = 'Міне осындай нәтижені көргеннен кейін, ұнап жатса, ақшасын төлеп, тапсырыс беріп, сайттың толық версиясын алуға болады.';

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('popup'), 1000);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (phase === 'popup' && charIndex < popupText.length) {
      const timer = setTimeout(() => {
        setCharIndex(prev => prev + 1);
        playClick();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [phase, charIndex, popupText.length, playClick]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-the-void overflow-hidden flex flex-col items-center justify-center"
    >
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-white/70 text-lg mb-8"
      >
        Сіздің сайтыңызды примерно осылай тегін көре аласыз
      </motion.p>

      {/* Actual Landing Preview (Non-fullscreen) */}
      <div className="relative w-full max-w-5xl px-4 perspective-1000">
        <motion.div
          animate={{
            filter: phase === 'popup' ? 'blur(10px)' : 'blur(0px)',
            scale: phase === 'popup' ? 0.95 : 1,
            rotateX: phase === 'popup' ? 2 : 0,
          }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-none border border-white/10"
        >
          {/* Header */}
          <div className="border-b px-6 py-4 flex items-center justify-between">
            <div className="h-6 w-24 rounded bg-gray-100" />
            <div className="flex gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-2 w-12 rounded bg-gray-50" />)}
            </div>
          </div>

          {/* Hero */}
          <div className="p-12" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}>
            <h1 className="text-white text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: theme.font }}>
              {userName}, бизнесіңізді жаңа деңгейге шығарыңыз
            </h1>
            <div className="h-4 w-64 bg-white/20 rounded mb-8" />
            <div className="flex gap-3">
              <div className="h-10 w-32 bg-white rounded-xl" />
              <div className="h-10 w-32 bg-white/20 rounded-xl" />
            </div>
          </div>

          {/* Body content placeholders */}
          <div className="p-12 bg-white grid grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-gray-50 rounded-2xl" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-50 rounded w-full" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Popup Overlay */}
        <AnimatePresence>
          {phase === 'popup' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center z-50 p-6"
            >
              <div className="liquid-glass p-8 md:p-12 max-w-xl shadow-2xl text-center">
                <p className="text-white text-lg md:text-xl leading-relaxed mb-8 min-h-[100px]">
                  {popupText.substring(0, charIndex)}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="inline-block w-0.5 h-5 bg-turan-gold ml-1"
                  />
                </p>

                {charIndex >= popupText.length && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <p className="text-white/60 text-sm italic">Келісесіз бе?</p>
                    <motion.button
                      onClick={() => {
                        setPhase('unblur');
                        setTimeout(onNext, 1000);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-10 py-4 rounded-2xl liquid-glass-button text-white font-bold text-lg"
                    >
                      Иә, келісемін
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ============================================
// STEP 4: LIVE EDITS - Independent Bubbles Over Site
// ============================================
function LiveEditsStep({ onNext }: { onNext: () => void }) {
  const [messages, setMessages] = useState<{ id: number; text: string; isUser: boolean }[]>([]);
  const messageIdRef = useRef(0);

  const chatFlow = [
    { text: 'Түсін көкке өзгертіңізші', isUser: true },
    { text: 'Дайын! Түсі өзгертілді', isUser: false },
    { text: 'Батырманы үлкейтіңіз', isUser: true },
    { text: 'Батырма үлкейтілді', isUser: false },
    { text: 'Керемет! Рахмет!', isUser: true },
  ];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < chatFlow.length) {
        const msg = chatFlow[index];
        setMessages(prev => [...prev, { ...msg, id: messageIdRef.current++ }]);
        index++;
      } else {
        clearInterval(interval);
        setTimeout(onNext, 2000);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-the-void overflow-hidden flex items-center justify-center"
    >
      {/* Background Site - Fully Visible */}
      <div className="w-full max-w-5xl px-4">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden opacity-40">
          <div className="p-12 bg-blue-600 h-64" />
          <div className="p-12 grid grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl" />)}
          </div>
        </div>
      </div>

      {/* Floating Bubbles Overlay */}
      <div className="absolute inset-0 p-8 flex flex-col gap-4 pointer-events-none">
        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full gap-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: msg.isUser ? 50 : -50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className="liquid-glass px-6 py-4 max-w-[80%] shadow-xl">
                  <p className="text-white text-sm md:text-base">{msg.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Improved Context Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto"
        >
          <div className="liquid-glass px-6 py-3 border-turan-gold/30">
            <p className="text-turan-gold text-sm font-medium">
              Сайттың алғашқы версиясын көзіңізбен көргеннен кейін поправка жасау да оңай
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ============================================
// STEP 5: STYLE PICKER with Real-time Fullscreen Transition
// ============================================
function StylePickerStep({ formData, setFormData, onNext }: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onNext: () => void;
}) {
  const [activeThemeIndex, setActiveThemeIndex] = useState(0);
  const [autoCycling, setAutoCycling] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (autoCycling) {
      const interval = setInterval(() => {
        setActiveThemeIndex(prev => (prev + 1) % themes.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [autoCycling]);

  const handleSelectTheme = (index: number) => {
    setAutoCycling(false);
    setActiveThemeIndex(index);
    setFormData(prev => ({ ...prev, selectedTheme: themes[index].id }));
  };

  const handleContinue = () => {
    setIsFullscreen(true);
    setTimeout(onNext, 1200);
  };

  const currentTheme = themes[activeThemeIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-the-void relative overflow-hidden"
    >
      {/* Background Site - Transforming in Real-time */}
      <div className="absolute inset-0 flex items-center justify-center p-0 md:p-4">
        <motion.div
          layout
          animate={{
            width: isFullscreen ? '100%' : '90%',
            height: isFullscreen ? '100%' : '85%',
            borderRadius: isFullscreen ? '0px' : '32px',
          }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          className="bg-white shadow-2xl overflow-hidden relative"
        >
          {/* Transforming Content */}
          <div
            className="h-full w-full transition-colors duration-700 overflow-y-auto"
            style={{ backgroundColor: currentTheme.primary }}
          >
            {/* Mock Landing Content that populates */}
            <div className="p-12 md:p-24 max-w-6xl mx-auto">
              <motion.div layout className="mb-12">
                <div className="h-10 w-40 bg-white/20 rounded-lg mb-8" />
                <motion.h1 
                  layout
                  className="text-4xl md:text-7xl font-extrabold text-white mb-6 leading-tight"
                  style={{ fontFamily: currentTheme.font }}
                >
                  {currentTheme.nameKz} <br/> Инновациялық Дизайн
                </motion.h1>
                <p className="text-white/70 text-xl max-w-2xl mb-10">
                  Біз сіздің бизнесіңізді заманауи технологиялармен және автономды жүйелермен жарақтандырамыз.
                </p>
                <div className="flex gap-4">
                  <div className="h-14 w-48 bg-white rounded-2xl" />
                  <div className="h-14 w-48 border-2 border-white/30 rounded-2xl" />
                </div>
              </motion.div>

              {/* Grid items that populate */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
                {[1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.2 }}
                    className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10"
                  >
                    <div className="w-16 h-16 bg-white/20 rounded-2xl mb-6" />
                    <div className="h-6 w-3/4 bg-white/40 rounded mb-4" />
                    <div className="h-4 w-full bg-white/20 rounded mb-2" />
                    <div className="h-4 w-2/3 bg-white/20 rounded" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Controls Overlay (disappears on fullscreen) */}
      <AnimatePresence>
        {!isFullscreen && (
          <>
            <div className="floating-controls bottom-24 left-1/2 -translate-x-1/2 z-50">
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="liquid-glass p-3 flex items-center gap-3 shadow-2xl"
              >
                {themes.map((theme, index) => (
                  <button
                    key={theme.id}
                    onClick={() => handleSelectTheme(index)}
                    className={`relative w-12 h-12 rounded-xl overflow-hidden transition-all ${
                      activeThemeIndex === index
                        ? 'ring-2 ring-turan-gold scale-110'
                        : 'opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={theme.image} className="w-full h-full object-cover" alt="" />
                    {activeThemeIndex === index && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <CheckIcon className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="floating-controls bottom-6 left-1/2 -translate-x-1/2 z-50"
            >
              <motion.button
                onClick={handleContinue}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-4 rounded-2xl liquid-glass-button text-white font-bold text-lg shadow-2xl"
              >
                Жалғастыру
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// STEP 6: FULL LANDING PAGE PREVIEW
// ============================================
function FullLandingStep({ userName, selectedTheme, onNext }: {
  userName: string;
  selectedTheme: string;
  onNext: () => void;
}) {
  const theme = themes.find(t => t.id === selectedTheme) || themes[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-the-void"
    >
      <div className="p-4 md:p-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Толық лендинг нұсқасы
          </h2>
          <p className="text-white/60">
            Міне, сіздің болашақ сайтыңыз осындай болады
          </p>
        </motion.div>

        {/* Full Landing Preview */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="border-b px-6 py-4 flex items-center justify-between">
            <div className="h-8 w-32 rounded" style={{ backgroundColor: `${theme.primary}20` }} />
            <div className="flex gap-6">
              {['Басты', 'Қызметтер', 'Біз туралы', 'Байланыс'].map((item, i) => (
                <span key={i} className="text-gray-600 text-sm">{item}</span>
              ))}
            </div>
            <button
              className="px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: theme.primary }}
            >
              Тапсырыс
            </button>
          </div>

          {/* Hero */}
          <div
            className="p-12 md:p-16"
            style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
          >
            <div className="max-w-xl">
              <h1 className="text-white text-3xl md:text-5xl font-bold mb-4" style={{ fontFamily: theme.font }}>
                {userName}, біз сіздің сайтыңызды жасаймыз
              </h1>
              <p className="text-white/80 text-lg mb-8">
                Заманауи, жылдам және тиімді веб-шешімдер
              </p>
              <div className="flex gap-4">
                <button className="px-6 py-3 bg-white rounded-lg font-medium" style={{ color: theme.primary }}>
                  Бастау
                </button>
                <button className="px-6 py-3 border border-white/50 rounded-lg text-white font-medium">
                  Толығырақ
                </button>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="p-12" style={{ backgroundColor: theme.accent }}>
            <h2 className="text-2xl font-bold text-center mb-8" style={{ color: theme.primary }}>
              Біздің қызметтер
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: GlobeAltIcon, title: 'Веб-сайт', desc: 'Кәсіби сайт жасау' },
                { icon: PaintBrushIcon, title: 'Дизайн', desc: 'Заманауи дизайн' },
                { icon: SparklesIcon, title: 'SEO', desc: 'Іздеу оңтайландыру' },
              ].map((service, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${theme.primary}15` }}
                  >
                    <service.icon className="w-7 h-7" style={{ color: theme.primary }} />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{service.title}</h3>
                  <p className="text-gray-500 text-sm">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="p-12 bg-white text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Бізбен байланысыңыз
            </h2>
            <p className="text-gray-500 mb-6">Тегін консультация алыңыз</p>
            <button
              className="px-8 py-4 rounded-lg text-white font-medium"
              style={{ backgroundColor: theme.primary }}
            >
              Байланысу
            </button>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          onClick={onNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-8 mx-auto block px-8 py-4 rounded-xl liquid-glass-button text-white font-semibold text-lg"
        >
          Жалғастыру
        </motion.button>
      </div>
    </motion.div>
  );
}

// ============================================
// STEP 7: FINAL CTA with Khaby Lame Gesture
// ============================================
function FinalCTAStep({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-the-void flex items-center justify-center p-8"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="max-w-2xl text-center"
      >
        {/* Khaby Lame style gesture animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-32 h-32 mx-auto mb-8 rounded-full liquid-glass flex items-center justify-center"
        >
          <motion.div
            className="khaby-gesture"
          >
            <HandRaisedIcon className="w-16 h-16 text-turan-gold" />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight"
        >
          Ешкімде жоқ сайт жасатқың келе ме?
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white/80 text-lg md:text-xl leading-relaxed mb-10"
        >
          Сұрақ көп болса да, жоқ болса да, ұнаса мына батырманы бас
        </motion.p>

        {/* Arrow pointing to button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 0.6, y: { repeat: Infinity, duration: 1.5 } }}
          className="mb-6"
        >
          <svg className="w-8 h-8 mx-auto text-turan-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={onNext}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-12 py-5 rounded-2xl liquid-glass-button text-white font-bold text-xl shadow-lg hover:shadow-xl transition-all"
        >
          Иә, келісемін
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// STEP 8: THE BRIEF - Detailed lead form (4 sections)
// ============================================
function BriefStep({ formData, setFormData, onSubmit, isSubmitting }: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const [activeSection, setActiveSection] = useState(0);
  const briefRef = useRef<HTMLDivElement>(null);

  const sections = [
    { title: 'Бизнес туралы', icon: BuildingStorefrontIcon },
    { title: 'Сайт мақсаты', icon: GlobeAltIcon },
    { title: 'Қосымша ақпарат', icon: DocumentTextIcon },
    { title: 'Байланыс', icon: EnvelopeIcon },
  ];

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isValidPhone = formData.phone.trim().length >= 10;
  const canSubmit = formData.businessName && formData.email && formData.phone && isValidEmail && isValidPhone;

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      featuresNeeded: prev.featuresNeeded.includes(feature)
        ? prev.featuresNeeded.filter(f => f !== feature)
        : [...prev.featuresNeeded, feature]
    }));
  };

  useEffect(() => {
    if (briefRef.current) {
      briefRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-the-void py-8 px-4"
    >
      <div ref={briefRef} className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Бриф толтыру
          </h1>
          <p className="text-white/60">
            Сіздің сайтыңыз туралы мәліметтер
          </p>
        </motion.div>

        {/* Section Navigation */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => setActiveSection(index)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeSection === index
                  ? 'bg-turan-gold text-turan-dark'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <section.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{section.title}</span>
            </button>
          ))}
        </motion.div>

        {/* Form Sections */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="liquid-glass p-6 md:p-8"
        >
          <AnimatePresence mode="wait">
            {activeSection === 0 && (
              <motion.div
                key="business"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Бизнес атауы *
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder="Мысалы: Алтын Орда кафесі"
                    className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-turan-gold focus:ring-2 focus:ring-turan-gold/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Бизнес түрі
                  </label>
                  <div className="relative">
                    <select
                      value={formData.businessType}
                      onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
                      className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-turan-gold focus:ring-2 focus:ring-turan-gold/30 transition-all appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-turan-dark">Таңдаңыз</option>
                      {businessTypes.map(type => (
                        <option key={type} value={type} className="bg-turan-dark">{type}</option>
                      ))}
                    </select>
                    <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Бизнес сипаттамасы
                  </label>
                  <textarea
                    value={formData.businessDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessDescription: e.target.value }))}
                    placeholder="Не істейсіз, не сатасыз, қандай қызмет көрсетесіз?"
                    rows={4}
                    className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-turan-gold focus:ring-2 focus:ring-turan-gold/30 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Мақсатты аудитория
                  </label>
                  <input
                    type="text"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                    placeholder="Кімдерге арналған? (жас, қызығушылық, т.б.)"
                    className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-turan-gold focus:ring-2 focus:ring-turan-gold/30 transition-all"
                  />
                </div>
              </motion.div>
            )}

            {activeSection === 1 && (
              <motion.div
                key="goal"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-3">
                    Сайттың негізгі мақсаты
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {websiteGoals.map(goal => (
                      <button
                        key={goal.id}
                        onClick={() => setFormData(prev => ({ ...prev, websiteGoal: goal.id }))}
                        className={`p-4 rounded-xl text-left transition-all ${
                          formData.websiteGoal === goal.id
                            ? 'bg-turan-gold/20 border-2 border-turan-gold'
                            : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                        }`}
                      >
                        <h4 className="text-white font-medium mb-1">{goal.label}</h4>
                        <p className="text-white/50 text-sm">{goal.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-3">
                    Қажетті функциялар
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {featureOptions.map(feature => (
                      <button
                        key={feature}
                        onClick={() => toggleFeature(feature)}
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${
                          formData.featuresNeeded.includes(feature)
                            ? 'bg-turan-gold text-turan-dark'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        {feature}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-3">
                    Қолыңызда не бар?
                  </label>
                  <div className="space-y-3">
                    {[
                      { key: 'hasLogo', label: 'Логотип', icon: SparklesIcon },
                      { key: 'hasContent', label: 'Мәтін/контент', icon: DocumentTextIcon },
                      { key: 'hasPhotos', label: 'Фотолар', icon: PhotoIcon },
                    ].map(item => (
                      <button
                        key={item.key}
                        onClick={() => setFormData(prev => ({ ...prev, [item.key]: !prev[item.key as keyof FormData] }))}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                          formData[item.key as keyof FormData]
                            ? 'bg-turan-gold/20 border-2 border-turan-gold'
                            : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                        }`}
                      >
                        <item.icon className={`w-6 h-6 ${formData[item.key as keyof FormData] ? 'text-turan-gold' : 'text-white/50'}`} />
                        <span className="text-white">{item.label}</span>
                        {formData[item.key as keyof FormData] && (
                          <CheckIcon className="w-5 h-5 text-turan-gold ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 2 && (
              <motion.div
                key="additional"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-3">
                    Бюджет диапазоны
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {budgetRanges.map(range => (
                      <button
                        key={range}
                        onClick={() => setFormData(prev => ({ ...prev, budgetRange: range }))}
                        className={`p-4 rounded-xl flex items-center gap-3 transition-all ${
                          formData.budgetRange === range
                            ? 'bg-turan-gold/20 border-2 border-turan-gold'
                            : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                        }`}
                      >
                        <CurrencyDollarIcon className={`w-5 h-5 ${formData.budgetRange === range ? 'text-turan-gold' : 'text-white/50'}`} />
                        <span className="text-white text-sm">{range}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-3">
                    Мерзімі
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {deadlineOptions.map(option => (
                      <button
                        key={option}
                        onClick={() => setFormData(prev => ({ ...prev, deadline: option }))}
                        className={`p-4 rounded-xl flex items-center gap-3 transition-all ${
                          formData.deadline === option
                            ? 'bg-turan-gold/20 border-2 border-turan-gold'
                            : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                        }`}
                      >
                        <ClockIcon className={`w-5 h-5 ${formData.deadline === option ? 'text-turan-gold' : 'text-white/50'}`} />
                        <span className="text-white text-sm">{option}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Бәсекелестер / Ұнайтын сайттар
                  </label>
                  <input
                    type="text"
                    value={formData.competitors}
                    onChange={(e) => setFormData(prev => ({ ...prev, competitors: e.target.value }))}
                    placeholder="Сілтемелер немесе атаулар"
                    className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-turan-gold focus:ring-2 focus:ring-turan-gold/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Қосымша ескертулер
                  </label>
                  <textarea
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                    placeholder="Тағы бір нәрсе айтқыңыз келе ме?"
                    rows={4}
                    className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-turan-gold focus:ring-2 focus:ring-turan-gold/30 transition-all resize-none"
                  />
                </div>
              </motion.div>
            )}

            {activeSection === 3 && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-turan-gold/10 border border-turan-gold/30 rounded-xl p-4 mb-6">
                  <p className="text-white/80 text-sm">
                    Соңғы қадам! Байланыс ақпаратыңызды қалдырыңыз, біз сізбен тегін консультация үшін хабарласамыз.
                  </p>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="example@mail.com"
                      className="w-full pl-12 pr-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-turan-gold focus:ring-2 focus:ring-turan-gold/30 transition-all"
                    />
                  </div>
                  {formData.email && !isValidEmail && (
                    <p className="text-red-400 text-sm mt-1">Дұрыс email енгізіңіз</p>
                  )}
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Телефон *
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+7 (777) 123-45-67"
                      className="w-full pl-12 pr-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-turan-gold focus:ring-2 focus:ring-turan-gold/30 transition-all"
                    />
                  </div>
                  {formData.phone && !isValidPhone && (
                    <p className="text-red-400 text-sm mt-1">Кемінде 10 сан енгізіңіз</p>
                  )}
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Қалаған түстер (қосымша)
                  </label>
                  <input
                    type="text"
                    value={formData.preferredColors}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferredColors: e.target.value }))}
                    placeholder="Мысалы: көк, ақ"
                    className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-turan-gold focus:ring-2 focus:ring-turan-gold/30 transition-all"
                  />
                </div>

                <motion.button
                  onClick={onSubmit}
                  disabled={!canSubmit || isSubmitting}
                  whileHover={canSubmit && !isSubmitting ? { scale: 1.02 } : {}}
                  whileTap={canSubmit && !isSubmitting ? { scale: 0.98 } : {}}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3 ${
                    canSubmit && !isSubmitting
                      ? 'liquid-glass-button text-white cursor-pointer'
                      : 'bg-white/10 text-white/40 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Жіберілуде...
                    </>
                  ) : (
                    <>
                      Өтінімді жіберу
                      <ArrowRightIcon className="w-5 h-5" />
                    </>
                  )}
                </motion.button>

                <p className="text-white/40 text-sm text-center">
                  Біз сіздің деректеріңізді қорғаймыз және спам жібермейміз
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
            <button
              onClick={() => setActiveSection(prev => Math.max(0, prev - 1))}
              disabled={activeSection === 0}
              className={`px-6 py-2 rounded-lg transition-all ${
                activeSection === 0
                  ? 'text-white/30 cursor-not-allowed'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Артқа
            </button>
            {activeSection < sections.length - 1 && (
              <button
                onClick={() => setActiveSection(prev => Math.min(sections.length - 1, prev + 1))}
                className="px-6 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                Алға
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ============================================
// SUCCESS SCREEN
// ============================================
function SuccessScreen({ name }: { name: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-the-void flex items-center justify-center p-8"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="text-center max-w-lg"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-turan-gold to-turan-bronze flex items-center justify-center"
        >
          <CheckIcon className="w-12 h-12 text-turan-dark" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-4xl md:text-5xl font-bold text-white mb-4"
        >
          Рахмет, {name}!
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-white/70 text-xl mb-8"
        >
          Біз сіздің брифіңізді алдық. Жақын арада сізбен байланысамыз.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="liquid-glass p-6 inline-block"
        >
          <p className="text-white/60 text-sm mb-2">Сіздің өтініміңіздің нөмірі</p>
          <p className="text-turan-gold text-3xl font-bold">#{Math.floor(Math.random() * 9000 + 1000)}</p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-white/50 text-sm mt-8"
        >
          Тегін дизайн 2-3 жұмыс күнінде дайын болады
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// MAIN ONBOARDING FLOW
// ============================================
export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    businessName: '',
    businessType: '',
    businessDescription: '',
    targetAudience: '',
    email: '',
    phone: '',
    selectedTheme: 'modern',
    preferredColors: '',
    websiteGoal: '',
    featuresNeeded: [],
    hasLogo: false,
    hasContent: false,
    hasPhotos: false,
    competitors: '',
    additionalNotes: '',
    budgetRange: '',
    deadline: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await axios.post('/api/leads', {
        name: formData.name,
        businessName: formData.businessName,
        businessType: formData.businessType,
        businessDescription: formData.businessDescription,
        targetAudience: formData.targetAudience,
        email: formData.email,
        phone: formData.phone,
        selectedTheme: formData.selectedTheme,
        preferredColors: formData.preferredColors,
        websiteGoal: formData.websiteGoal,
        featuresNeeded: JSON.stringify(formData.featuresNeeded),
        hasLogo: formData.hasLogo,
        hasContent: formData.hasContent,
        hasPhotos: formData.hasPhotos,
        competitors: formData.competitors,
        additionalNotes: formData.additionalNotes,
        budgetRange: formData.budgetRange,
        deadline: formData.deadline,
        agreedToTerms: true,
      });
      setIsComplete(true);
    } catch (error) {
      console.error('Error submitting brief:', error);
      setIsComplete(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return <SuccessScreen name={formData.name} />;
  }

  return (
    <AnimatePresence mode="wait">
      {step === 1 && (
        <OnboardingStep
          key="onboarding"
          formData={formData}
          setFormData={setFormData}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <VoidStep
          key="void"
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <RevealWithPopupStep
          key="reveal"
          userName={formData.name}
          onNext={() => setStep(4)}
        />
      )}
      {step === 4 && (
        <LiveEditsStep
          key="liveedits"
          onNext={() => setStep(5)}
        />
      )}
      {step === 5 && (
        <StylePickerStep
          key="stylepicker"
          formData={formData}
          setFormData={setFormData}
          onNext={() => setStep(6)}
        />
      )}
      {step === 6 && (
        <FullLandingStep
          key="fulllanding"
          userName={formData.name}
          selectedTheme={formData.selectedTheme}
          onNext={() => setStep(7)}
        />
      )}
      {step === 7 && (
        <FinalCTAStep
          key="finalcta"
          onNext={() => setStep(8)}
        />
      )}
      {step === 8 && (
        <BriefStep
          key="brief"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </AnimatePresence>
  );
}
