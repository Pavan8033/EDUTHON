import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, MapPin, Camera, CheckCircle2, 
  LayoutDashboard, ShieldCheck, Building2, 
  Activity, BarChart3, Globe, Zap, Users
} from 'lucide-react';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 100, damping: 15 } 
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white selection:bg-primary/30 overflow-x-hidden">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px] opacity-30"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-emerald-500/10 rounded-full blur-[140px] opacity-20"></div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      </div>

      {/* Navigation */}
      <nav className="nav-glass w-full px-6 py-4">
         <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="p-2.5 bg-primary/20 rounded-xl group-hover:bg-primary/30 transition-all border border-primary/20">
                <Building2 size={22} className="text-primary-400" />
              </div>
              <span className="font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">CityFix</span>
            </Link>
            
            <div className="hidden lg:flex items-center gap-8 font-medium text-slate-400">
               {['Features', 'Dashboard', 'How it Works', 'Contact'].map((item) => (
                  <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="hover:text-white transition-colors text-sm">
                    {item}
                  </a>
               ))}
            </div>

            <div className="flex items-center gap-4">
               <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-4 py-2">Sign In</Link>
               <Link to="/register" className="btn-primary text-sm shadow-xl">Get Started</Link>
            </div>
         </div>
      </nav>

      <main>
         {/* Hero Section */}
         <section className="relative pt-20 pb-32 px-6 overflow-hidden">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
               
               <motion.div 
                 initial="hidden" animate="visible" variants={containerVariants}
                 className="flex-1 text-center lg:text-left z-10"
               >
                  <motion.div 
                    variants={itemVariants}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary-400 text-xs font-bold tracking-widest uppercase mb-8 shadow-inner"
                  >
                    <span className="flex h-2 w-2 rounded-full bg-primary animate-ping"></span>
                    Now live in 12 major cities
                  </motion.div>

                  <motion.h1 
                    variants={itemVariants} 
                    className="text-6xl lg:text-8xl font-black mb-8 leading-[0.95] tracking-tighter"
                  >
                    Fix Your City, <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-500 to-emerald-400">Faster.</span>
                  </motion.h1>
                  
                  <motion.p 
                    variants={itemVariants} 
                    className="text-lg lg:text-xl text-slate-400 mb-12 max-w-xl leading-relaxed font-medium"
                  >
                    Report infrastructure issues, track repairs, and improve civic services with a transparent, highly-efficient smart-city platform designed for modern urban living.
                  </motion.p>
                  
                  <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start">
                     <Link to="/register" className="btn-primary w-full sm:w-auto px-10 py-4 h-auto text-lg flex items-center justify-center gap-3">
                        Report Issue <ArrowRight size={22} />
                     </Link>
                     <Link to="/app/dashboard" className="btn-secondary w-full sm:w-auto px-10 py-4 h-auto text-lg flex items-center justify-center gap-3">
                        View Dashboard
                     </Link>
                  </motion.div>

                  <motion.div variants={itemVariants} className="mt-16 flex items-center gap-6 justify-center lg:justify-start grayscale opacity-50">
                     <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Trusted by</span>
                     <div className="flex gap-8 items-center">
                        <Building2 size={24} />
                        <ShieldCheck size={24} />
                        <Globe size={24} />
                     </div>
                  </motion.div>
               </motion.div>

               {/* Hero Dashboard Preview Illustration */}
               <motion.div 
                 initial={{ opacity: 0, x: 50 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.5, duration: 1 }}
                 className="flex-1 relative w-full"
               >
                  <div className="relative group perspective-1000">
                     {/* Glow behind the dashboard */}
                     <div className="absolute -inset-4 bg-primary/20 blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                     
                     {/* The "Dashboard Window" */}
                     <div className="glass-card border-white/10 overflow-hidden shadow-2xl transform rotate-y-[-10deg] rotate-x-[5deg] scale-105">
                        <div className="h-6 bg-white/5 border-b border-white/5 flex items-center gap-1.5 px-4">
                           <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                           <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
                           <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
                        </div>
                        <img 
                          src="https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2000&auto=format&fit=crop" 
                          alt="City View" 
                          className="w-full aspect-[16/10] object-cover opacity-80 mix-blend-screen"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent"></div>
                        
                        {/* Overlay active indicators */}
                        <div className="absolute bottom-8 left-8 right-8 grid grid-cols-2 gap-4">
                           <div className="glass-panel p-4 border-white/10 bg-black/40">
                              <div className="flex justify-between items-center mb-1">
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Reports</span>
                                 <Activity size={12} className="text-emerald-400" />
                              </div>
                              <div className="text-2xl font-black">1,204</div>
                           </div>
                           <div className="glass-panel p-4 border-white/10 bg-black/40">
                              <div className="flex justify-between items-center mb-1">
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resolution Rate</span>
                                 <BarChart3 size={12} className="text-primary-400" />
                              </div>
                              <div className="text-2xl font-black">94.2%</div>
                           </div>
                        </div>
                     </div>
                  </div>
               </motion.div>

            </div>
         </section>

         {/* Features Grid Section */}
         <section id="features" className="py-32 px-6 relative bg-[#0B1120]">
            <div className="max-w-7xl mx-auto">
               <div className="text-center max-w-3xl mx-auto mb-20">
                  <motion.h2 
                    initial={{ opacity:0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    className="text-4xl lg:text-5xl font-black mb-6 tracking-tight"
                  >
                    Built for the <span className="text-primary-400">next generation</span> of urban management.
                  </motion.h2>
                  <p className="text-slate-400 text-lg font-medium">A complete UI system that handles everything from citizen reporting to professional municipal workflow.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
                    { 
                      icon: MapPin, title: "GPS Location Detection", 
                      desc: "Automatic pinpoint positioning using integrated hardware-level geolocation.",
                      color: "text-blue-500", bg: "bg-blue-500/10"
                    },
                    { 
                      icon: Camera, title: "Upload Issue Photos", 
                      desc: "Support for high-res images with instant preview and local processing.",
                      color: "text-emerald-500", bg: "bg-emerald-500/10"
                    },
                    { 
                      icon: Activity, title: "Real-time Repair Tracking", 
                      desc: "Live websocket-powered updates as repairs move through department workflows.",
                      color: "text-purple-500", bg: "bg-purple-500/10"
                    },
                    { 
                      icon: Zap, title: "Smart Priority System", 
                      desc: "AI-driven triage that categorizes reports by severity and public safety risk.",
                      color: "text-amber-500", bg: "bg-amber-500/10"
                    },
                    { 
                      icon: BarChart3, title: "Civic Analytics Dashboard", 
                      desc: "Deep-dive data visualizations for city planners to identify infrastructure hotspots.",
                      color: "text-rose-500", bg: "bg-rose-500/10"
                    },
                    { 
                      icon: Users, title: "Team Management", 
                      desc: "Professional collaboration tools for maintenance crews and municipal staff.",
                      color: "text-cyan-500", bg: "bg-cyan-500/10"
                    }
                  ].map((feat, i) => (
                    <motion.div 
                       key={i}
                       whileHover={{ y: -8, scale: 1.02 }}
                       className="glass-card p-10 border-white/5 bg-[#111827]/40 hover:bg-[#111827]/60 transition-all duration-300 group"
                    >
                       <div className={`w-14 h-14 rounded-2xl ${feat.bg} flex items-center justify-center mb-8 border border-white/5 group-hover:shadow-glow transition-all`}>
                          <feat.icon size={28} className={feat.color} />
                       </div>
                       <h3 className="text-xl font-bold mb-4 tracking-tight text-white">{feat.title}</h3>
                       <p className="text-slate-400 font-medium leading-relaxed">{feat.desc}</p>
                    </motion.div>
                  ))}
               </div>
            </div>
         </section>

         {/* CTAs */}
         <section className="py-32 px-6">
            <motion.div 
               whileInView={{ opacity: 1, scale: 1 }} initial={{ opacity: 0, scale: 0.95 }}
               className="max-w-5xl mx-auto glass-card border-primary/20 bg-gradient-to-br from-primary/10 to-emerald-500/5 p-16 text-center overflow-hidden relative"
            >
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
               <h2 className="text-5xl font-black mb-6 tracking-tight">Build a Smarter City Today</h2>
               <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-12 font-medium">Join thousands of citizens in improving our urban infrastructure one report at a time.</p>
               <Link to="/register" className="btn-primary px-12 py-5 text-xl h-auto transition-transform hover:scale-105 active:scale-100">Get Started for Free</Link>
            </motion.div>
         </section>

      </main>

      <footer className="py-20 px-6 border-t border-white/5 bg-[#0B1120]">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-2">
               <Link to="/" className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/20 rounded-xl text-primary-400 border border-primary/20">
                     <Building2 size={24} />
                  </div>
                  <span className="font-extrabold text-2xl tracking-tighter">CityFix</span>
               </Link>
               <p className="text-slate-400 max-w-sm font-medium">Empowering citizens to take direct action in improving their city architecture and infrastructure. Modern, transparent, and built for speed.</p>
            </div>
            <div>
               <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">Product</h4>
               <ul className="space-y-4 text-slate-500 text-sm font-semibold">
                  <li><a href="#" className="hover:text-primary-400 transition-colors">Safety</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition-colors">API Docs</a></li>
               </ul>
            </div>
            <div>
               <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">Company</h4>
               <ul className="space-y-4 text-slate-500 text-sm font-semibold">
                  <li><a href="#" className="hover:text-primary-400 transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition-colors">Civic Ethics</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy</a></li>
               </ul>
            </div>
         </div>
         <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-slate-600 text-sm font-bold flex justify-between">
            <span>© {new Date().getFullYear()} CityFix Municipal OS.</span>
            <div className="flex gap-6">
               <a href="#">Twitter</a>
               <a href="#">GitHub</a>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
