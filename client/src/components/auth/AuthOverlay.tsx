import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, User, Chrome, ArrowRight, Loader2, ArrowLeft, Check } from "lucide-react";
import { mockApi } from "../../lib/api/mockApi";

export default function AuthOverlay({ 
  isOpen, 
  onClose, 
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSuccess: (user: any) => void;
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [tempUser, setTempUser] = useState<any>(null);
  const [otp, setOtp] = useState(["", "", "", ""]);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (mode === 'login') {
        const { user } = await mockApi.login(formData.email, formData.password);
        onSuccess(user);
        onClose();
      } else {
        const { user } = await mockApi.register({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName
        });
        setTempUser(user);
        setIsVerifying(true);
      }
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      // Dummy verification
      await mockApi.verifyEmail('dummy_token');
      onSuccess(tempUser);
      onClose();
    } catch (error) {
      console.error("Verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { user } = await mockApi.googleLogin();
      onSuccess(user);
      onClose();
    } catch (error) {
      console.error("Google auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (val: string, index: number) => {
    if (!/^\d*$/.test(val)) return;
    if (val.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-[450px] rounded-[32px] overflow-hidden shadow-2xl"
        >
          {isVerifying ? (
            /* Verification View */
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-start">
                <button 
                  onClick={() => setIsVerifying(false)}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors -ml-2"
                >
                  <ArrowLeft size={20} />
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors -mr-2"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-black/5 rounded-[24px] flex items-center justify-center mx-auto">
                  <Mail size={32} className="text-black" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-3xl font-space font-bold tracking-tighter">Verify Email</h2>
                  <p className="text-sm text-black/40 font-medium px-4">
                    We've sent a 4-digit verification code to <span className="text-black font-bold">{formData.email}</span>
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength={1}
                    value={otp[i]}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    className="w-14 h-16 bg-black/5 border border-black/5 rounded-2xl text-center text-3xl font-space font-bold focus:outline-none focus:border-black/20 focus:bg-white transition-all"
                  />
                ))}
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleVerify}
                  disabled={isLoading || otp.some(d => !d)}
                  className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 shadow-xl shadow-black/10"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
                    <>
                      Verify & Continue
                      <Check size={18} />
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] uppercase tracking-widest font-bold text-black/40">
                  Didn't receive code? <button className="text-black hover:underline">Resend</button>
                </p>
              </div>
            </div>
          ) : (
            /* Main Auth View */
            <>
              <div className="p-8 pb-4 flex justify-between items-start">
                <div className="space-y-1">
                  <h2 className="text-3xl font-space font-bold tracking-tighter">
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <p className="text-sm text-black/40 font-medium">
                    {mode === 'login' ? 'Login to manage your CAF applications' : 'Join Smart CAF to start your journey'}
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 pt-4 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'register' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-black/40 pl-1">First Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={16} />
                          <input 
                            required
                            type="text" 
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 bg-black/5 border border-black/5 rounded-xl focus:outline-none focus:border-black/20 transition-colors text-sm"
                            placeholder="John"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-black/40 pl-1">Last Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={16} />
                          <input 
                            required
                            type="text" 
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 bg-black/5 border border-black/5 rounded-xl focus:outline-none focus:border-black/20 transition-colors text-sm"
                            placeholder="Doe"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-black/40 pl-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={16} />
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-black/5 border border-black/5 rounded-xl focus:outline-none focus:border-black/20 transition-colors text-sm"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-black/40 pl-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={16} />
                      <input 
                        required
                        type="password" 
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-black/5 border border-black/5 rounded-xl focus:outline-none focus:border-black/20 transition-colors text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
                      <>
                        {mode === 'login' ? 'Sign In' : 'Create Account'}
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                <div className="relative h-px bg-black/5 w-full">
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[10px] uppercase tracking-widest font-bold text-black/20">or</span>
                </div>

                <button 
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-xl border border-black/10 font-bold text-sm hover:bg-black/5 transition-colors disabled:opacity-50"
                >
                  <Chrome size={18} />
                  Continue with Google
                </button>

                <p className="text-center text-xs text-black/40 font-medium">
                  {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                  <button 
                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                    className="ml-1 text-black font-bold hover:underline"
                  >
                    {mode === 'login' ? 'Sign Up' : 'Login'}
                  </button>
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
