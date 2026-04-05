import React, { useState } from 'react';
import { X, ShieldCheck, Key } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsModal = ({ isOpen, onClose }) => {
  const { apiKey, saveApiKey } = useAppContext();
  const [localKey, setLocalKey] = useState(apiKey);

  const handleSave = () => {
    saveApiKey(localKey);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md bg-[#131313] border border-[#20201f] p-8 rounded-sm shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-['Space_Grotesk'] flex items-center gap-3">
                <ShieldCheck className="text-[#00E5FF]" /> Configuration
              </h2>
              <button onClick={onClose} className="text-[#adaaaa] hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#adaaaa] mb-2 font-medium">
                  AI Service API Key (GEMINI)
                </label>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#565555]" />
                  <input 
                    type="password"
                    value={localKey}
                    onChange={(e) => setLocalKey(e.target.value)}
                    placeholder={import.meta.env.VITE_OPENAI_API_KEY ? "Using key from .env" : "Enter your Gemini API Key..."}
                    className="w-full bg-[#0e0e0e] border-b border-[#20201f] pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#00E5FF] transition-colors"
                  />
                </div>
                <p className="mt-2 text-[10px] text-[#565555]">
                  Place your <code>VITE_GEMINI_API_KEY</code> in your <code>.env</code> file for automatic loading.
                </p>
              </div>

              <button 
                onClick={handleSave}
                className="w-full bg-[#00E5FF] text-[#0e0e0e] py-3 font-semibold hover:bg-[#81ecff] transition-all transform active:scale-95"
              >
                Save Configuration
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
