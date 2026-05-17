"use client";

import Link from 'next/link';
import { motion } from 'motion/react';
import { Home, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-9xl font-serif font-black text-gray-100 mb-4 select-none">404</h1>
          <h2 className="text-2xl font-serif font-bold text-[#333333] mb-4">Page Not Found</h2>
          <p className="text-gray-500 mb-10 text-sm leading-relaxed">
            The page you are looking for doesn't exist or has been moved.
          </p>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => router.back()}
              className="w-full py-4 px-6 border border-gray-200 text-[#333333] font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
            <Link
              href="/"
              className="w-full py-4 px-6 bg-[#333333] text-white font-medium flex items-center justify-center gap-2 hover:bg-black transition-all"
            >
              <Home size={18} />
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
