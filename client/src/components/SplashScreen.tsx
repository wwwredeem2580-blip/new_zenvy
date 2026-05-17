"use client";

import { motion } from 'motion/react';

export default function SplashScreen() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-white flex items-center justify-center p-6"
    >
      <motion.h1 
        initial={{ letterSpacing: '0.2em', opacity: 0 }}
        animate={{ letterSpacing: '0.8em', opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="text-4xl font-serif text-[#333333] uppercase tracking-widest pl-[0.8em]"
      >
        ZENVY
      </motion.h1>
    </motion.div>
  );
}
