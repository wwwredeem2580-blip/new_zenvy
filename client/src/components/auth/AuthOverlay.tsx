import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, User, Chrome, ArrowRight, Loader2, ArrowLeft, Check, AlertCircle } from "lucide-react";
import { authApi } from "../../lib/api/authApi";
import { useAuth } from "@/context/AuthContext";

export default function AuthOverlay({ 
  isOpen, 
  onClose, 
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSuccess: (user: any) => void;
}) {
  const { user, logout, verificationMessage, setVerificationMessage } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'invite'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('invite_token') ? 'invite' : 'login';
    }
    return 'login';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const handleResend = async () => {
    setIsResending(true);
    setResendStatus(null);
    try {
      const result = await authApi.resendVerification();
      setResendStatus({ type: 'success', message: result.message });
    } catch (err: any) {
      setResendStatus({ type: 'error', message: err.message || "Failed to resend" });
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeEmail = async () => {
    await logout();
    setMode('register');
    setIsVerifying(false);
    setResendStatus(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setVerificationMessage(null);
    
    try {
      if (mode === 'login') {
        const response = await authApi.login({
          email: formData.email,
          password: formData.password
        });
        if (response.success) {
          onSuccess(response.user);
          if (!response.user.isEmailVerified) {
             setIsVerifying(true);
          } else {
             onClose();
          }
        }
      } else if (mode === 'register') {
        const response = await authApi.register({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName
        });
        if (response.success) {
          setIsVerifying(true);
        }
      } else {
        // Invite mode - placeholder as we'll handle this in Phase 2
        console.log("Invite mode placeholder");
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.getGoogleAuthUrl();
    } catch (err: any) {
      setError(err.message || "Google auth error");
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // If user is already logged in but unverified, we force the verification view
  const showVerification = isVerifying || (user && !user.isEmailVerified);
  const displayEmail = user?.email || formData.email;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={user && !user.isEmailVerified ? undefined : onClose} // Prevent closing if unverified
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-[450px] max-h-[90vh] md:max-h-[95vh] rounded-[24px] sm:rounded-[32px] overflow-y-auto shadow-2xl flex flex-col"
        >
          {showVerification ? (
            /* Registration Success / Verification Notice View */
            <div className="p-8 space-y-8">
              <div className="flex justify-end">
                {(!user || user.isEmailVerified) && (
                  <button 
                    onClick={onClose}
                    className="p-2 hover:bg-black/5 rounded-full transition-colors -mr-2"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-black/5 rounded-[32px] flex items-center justify-center mx-auto">
                  <Mail size={40} className="text-black" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-space font-bold tracking-tighter">Check Your Inbox</h2>
                  <p className="text-sm text-black/40 font-medium px-4">
                    We've sent a verification link to <span className="text-black font-bold">{displayEmail}</span>. 
                    Please click the link to activate your account.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {resendStatus && (
                   <motion.div 
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className={`p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center ${resendStatus.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}
                   >
                      {resendStatus.message}
                   </motion.div>
                )}

                <button 
                  onClick={handleResend}
                  disabled={isResending}
                  className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-xl shadow-black/10 disabled:opacity-50"
                >
                  {isResending ? <Loader2 size={18} className="animate-spin" /> : 'Resend Verification Link'}
                </button>
                
                <div className="flex flex-col gap-2">
                   <p className="text-center text-[10px] uppercase tracking-widest font-bold text-black/20">
                     Entered the wrong email?
                   </p>
                   <button 
                     onClick={handleChangeEmail}
                     className="text-xs font-bold text-black hover:underline"
                   >
                     Change Email Address
                   </button>
                </div>

                {!user && (
                   <button 
                     onClick={() => {
                       setIsVerifying(false);
                       setMode('login');
                     }}
                     className="w-full text-[10px] uppercase tracking-widest font-bold text-black/40 hover:text-black transition-colors"
                   >
                     Back to Login
                   </button>
                )}
              </div>
            </div>
          ) : (
            /* Main Auth View */
             <>
               <div className="p-8 pb-4 flex justify-between items-start">
                 <div className="space-y-1">
                   <h2 className="text-3xl font-space font-bold tracking-tighter">
                     {mode === 'login' ? 'Welcome Back' : mode === 'invite' ? 'Welcome Agent' : 'Create Account'}
                   </h2>
                   <p className="text-sm text-black/40 font-medium">
                     {mode === 'login' ? 'Login to manage your CAF applications' : 
                      mode === 'invite' ? 'Secure your account to access the Agent Hub' :
                      'Join Smart CAF to start your journey'}
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
                 {/* Notifications Section */}
                 {(error || verificationMessage) && (
                   <motion.div 
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className={`p-4 rounded-xl flex items-start gap-3 ${
                       verificationMessage?.type === 'success' 
                         ? 'bg-green-50 border border-green-100 text-green-800' 
                         : 'bg-red-50 border border-red-100 text-red-800'
                     }`}
                   >
                     {verificationMessage?.type === 'success' ? <Check size={18} className="mt-0.5 shrink-0" /> : <AlertCircle size={18} className="mt-0.5 shrink-0" />}
                     <p className="text-xs font-medium leading-relaxed">
                       {error || verificationMessage?.text}
                     </p>
                   </motion.div>
                 )}

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

                   {mode !== 'invite' && (
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
                   )}

                   <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-widest font-bold text-black/40 pl-1">
                        {mode === 'invite' ? 'Create Password' : 'Password'}
                     </label>
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
                         {mode === 'invite' ? 'Complete Setup' : mode === 'login' ? 'Sign In' : 'Create Account'}
                         <ArrowRight size={18} />
                       </>
                     )}
                   </button>
                 </form>

                 {mode !== 'invite' && (
                   <>
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
                         onClick={() => {
                           setMode(mode === 'login' ? 'register' : 'login');
                           setError(null);
                           setVerificationMessage(null);
                         }}
                         className="ml-1 text-black font-bold hover:underline"
                       >
                         {mode === 'login' ? 'Sign Up' : 'Login'}
                       </button>
                     </p>
                   </>
                 )}
               </div>
             </>
           )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
