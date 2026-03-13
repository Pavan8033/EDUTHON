import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, ArrowRight, Mail, Lock, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const result = await login(email, password);
    if (result.success) {
      navigate('/app/dashboard');
    } else {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center p-6 selection:bg-primary/30 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[70%] bg-primary/10 rounded-full blur-[140px] opacity-40"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px] opacity-30"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="w-full max-w-[480px] z-10"
      >
        <div className="text-center mb-10">
           <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
              <div className="p-3 bg-primary/20 rounded-2xl border border-primary/20 shadow-glow">
                <Building2 size={28} className="text-primary-400" />
              </div>
              <span className="font-black text-3xl tracking-tighter">CityFix</span>
           </Link>
           <h1 className="text-4xl font-extrabold tracking-tight mb-3">Welcome Back</h1>
           <p className="text-slate-500 font-medium">Log in to your secure municipal terminal.</p>
        </div>

        <div className="glass-card p-10 border-white/5 shadow-2xl relative">
           <div className="absolute top-0 right-10 -translate-y-1/2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-widest uppercase">
                 <ShieldCheck size={12} /> Encrypted
              </div>
           </div>

           <form className="space-y-6" onSubmit={handleSubmit}>
              <AnimatePresence>
                 {error && (
                    <motion.div 
                       initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                       className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 text-red-400 text-sm font-semibold"
                    >
                       <AlertCircle size={20} className="shrink-0" />
                       <p>{error}</p>
                    </motion.div>
                 )}
              </AnimatePresence>
              
              <div className="space-y-5">
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                    <div className="relative">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                       <input 
                         required type="email" value={email} onChange={e => setEmail(e.target.value)}
                         className="input-field pl-12" placeholder="admin@cityfix.gov" 
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                       <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Password</label>
                       <a href="#" className="text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors">Forgot?</a>
                    </div>
                    <div className="relative">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                       <input 
                         required type="password" value={password} onChange={e => setPassword(e.target.value)}
                         className="input-field pl-12" placeholder="••••••••" 
                       />
                    </div>
                 </div>
              </div>

              <button 
                type="submit" disabled={isSubmitting}
                className="btn-primary w-full py-4 h-auto text-lg flex items-center justify-center gap-3 mt-4 group"
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In To Terminal'}
                {!isSubmitting && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
              </button>
           </form>
           
           <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-slate-500 text-sm font-medium">
                 Don't have an account?{' '}
                 <Link to="/register" className="text-white hover:text-primary-400 font-bold transition-colors">Create Citizen Proxy</Link>
              </p>
           </div>
        </div>

        <div className="mt-8 text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] max-w-[300px] mx-auto leading-relaxed">
           Restricted access for authorized personnel and registered citizens only.
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
