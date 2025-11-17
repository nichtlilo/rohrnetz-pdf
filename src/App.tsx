import { useState, useEffect } from 'react';
import { FormLeistungsauftrag } from './components/FormLeistungsauftrag';
import { FormTagesbericht } from './components/FormTagesbericht';
import { SplashScreen } from './components/SplashScreen';
import { ConfettiEffect } from './components/ConfettiEffect';
import { FileText, Calendar, Moon, Sun } from 'lucide-react';
import { Toaster, toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';

type FormType = 'leistungsauftrag' | 'tagesbericht';

export default function App() {
  const [activeForm, setActiveForm] = useState<FormType>('leistungsauftrag');
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  const [showSplash, setShowSplash] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(isDark));
  }, [isDark]);

  // Hide splash screen after animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Toggle dark mode: Ctrl/Cmd + D
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        setIsDark(!isDark);
        toast.info(`Dark Mode ${!isDark ? 'aktiviert' : 'deaktiviert'}`);
      }
      
      // Switch forms: Ctrl/Cmd + Tab
      if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
        e.preventDefault();
        setActiveForm(prev => prev === 'leistungsauftrag' ? 'tagesbericht' : 'leistungsauftrag');
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [isDark]);

  // Trigger confetti
  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 100);
  };

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  if (showSplash) {
    return (
      <AnimatePresence>
        <SplashScreen onComplete={() => setShowSplash(false)} />
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-500">
      <Toaster position="top-right" richColors />
      <ConfettiEffect trigger={showConfetti} />

      <motion.div 
        className="mx-auto max-w-7xl px-4 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="mb-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="mb-2 text-slate-800 dark:text-slate-100 transition-colors">ROHRNETZ Beil GmbH</h1>
            <p className="text-slate-600 dark:text-slate-400 transition-colors">PDF Formular Generator</p>
          </motion.div>
          
          {/* Dark Mode Toggle */}
          <div className="absolute right-0 top-0">
            <motion.button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition-all duration-300 text-slate-700 dark:text-slate-300 hover:scale-110"
              whileHover={{ rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              title="Dark Mode umschalten (Ctrl + D)"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
          </div>
        </div>

        {/* Tab Navigation */}
        <motion.div 
          className="mb-8 flex justify-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="inline-flex rounded-lg bg-white dark:bg-slate-800 p-1 shadow-md transition-colors duration-300">
            <motion.button
              onClick={() => setActiveForm('leistungsauftrag')}
              className={`flex items-center gap-2 rounded-md px-6 py-3 transition-all duration-300 ${
                activeForm === 'leistungsauftrag'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FileText size={20} />
              <span>Leistungsauftrag</span>
            </motion.button>
            <motion.button
              onClick={() => setActiveForm('tagesbericht')}
              className={`flex items-center gap-2 rounded-md px-6 py-3 transition-all duration-300 ${
                activeForm === 'tagesbericht'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Calendar size={20} />
              <span>Tagesbericht</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Form Content */}
        <div className="mx-auto max-w-5xl">
          <AnimatePresence mode="wait">
            {activeForm === 'leistungsauftrag' ? (
              <motion.div
                key="leistungsauftrag"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
              >
                <FormLeistungsauftrag onSuccess={triggerConfetti} />
              </motion.div>
            ) : (
              <motion.div
                key="tagesbericht"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
              >
                <FormTagesbericht onSuccess={triggerConfetti} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}