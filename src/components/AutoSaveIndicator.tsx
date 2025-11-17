import { motion, AnimatePresence } from 'motion/react';
import { Cloud, Check } from 'lucide-react';

interface AutoSaveIndicatorProps {
  isSaving: boolean;
  lastSaved?: Date;
}

export function AutoSaveIndicator({ isSaving, lastSaved }: AutoSaveIndicatorProps) {
  return (
    <AnimatePresence>
      {(isSaving || lastSaved) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-40"
        >
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
            {isSaving ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Cloud size={16} className="text-blue-500" />
                </motion.div>
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Wird gespeichert...
                </span>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  <Check size={16} className="text-green-500" />
                </motion.div>
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Gespeichert {lastSaved && formatTime(lastSaved)}
                </span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  
  if (seconds < 5) return 'gerade eben';
  if (seconds < 60) return `vor ${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `vor ${minutes}m`;
  
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}
