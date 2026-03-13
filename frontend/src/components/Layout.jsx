import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, Map, LayoutDashboard, Building2, 
  Bell, User, PlusCircle, CheckCircle, 
  Clock, Search, Menu, Settings, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!user) return <Outlet />;

  const getNavLinks = () => {
    const baseLinks = [
       { path: '/app/citizen', label: 'Dashboard', icon: LayoutDashboard },
       { path: '/app/map', label: 'City Map', icon: Map },
    ];

    if (user.role === 'citizen') {
        // Already handling via /app/citizen
        baseLinks.push({ path: '#', label: 'My Complaints', icon: CheckCircle });
        baseLinks.push({ path: '#', label: 'Notifications', icon: Bell });
    } else if (user.role === 'admin') {
        baseLinks[0].path = '/app/admin';
        baseLinks.push({ path: '#', label: 'Analytics', icon: BarChart3 });
    }

    baseLinks.push({ path: '#', label: 'Profile', icon: User });
    baseLinks.push({ path: '#', label: 'Settings', icon: Settings });

    return baseLinks;
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen flex bg-[#0F172A] text-slate-200 font-sans">
      
      {/* Sidebar Navigation */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="fixed left-0 top-0 h-screen bg-[#111827] border-r border-white/5 flex flex-col z-50 transition-all duration-300"
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center px-6 mb-4">
           <Link to="/" className="flex items-center gap-3 overflow-hidden">
             <div className="p-2 bg-primary rounded-xl text-white shadow-glow flex-shrink-0">
               <Building2 size={24} />
             </div>
             {isSidebarOpen && (
               <motion.span 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                 className="font-black text-2xl tracking-tighter text-white whitespace-nowrap"
               >
                 CityFix
               </motion.span>
             )}
           </Link>
        </div>
        
        {/* Navigation Section */}
        <div className="flex-1 px-4 space-y-2 overflow-y-auto overflow-x-hidden pt-4">
           {navLinks.map((link, idx) => {
              const isActive = location.pathname.includes(link.path) && link.path !== '#';
              return (
                 <Link
                   key={idx}
                   to={link.path}
                   className={`sidebar-link group ${isActive ? 'sidebar-link-active' : ''} ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
                 >
                   <link.icon size={22} className={`${isActive ? 'text-primary' : 'text-slate-500 group-hover:text-white'} transition-colors flex-shrink-0`} />
                   {isSidebarOpen && (
                     <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-nowrap font-semibold tracking-tight">
                        {link.label}
                     </motion.span>
                   )}
                 </Link>
              );
           })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 mt-auto border-t border-white/5 bg-white/[0.02]">
           <div className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0">
                 {user.name.charAt(0)}
              </div>
              {isSidebarOpen && (
                <div className="flex-1 overflow-hidden">
                   <div className="font-bold text-sm text-white truncate leading-tight">{user.name}</div>
                   <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user.role} Member</div>
                </div>
              )}
           </div>
           
           <button 
             onClick={logout}
             className={`w-full mt-4 flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all font-semibold text-sm ${!isSidebarOpen ? 'justify-center' : ''}`}
           >
              <LogOut size={18} />
              {isSidebarOpen && <span>Logout</span>}
           </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'pl-[280px]' : 'pl-[80px]'}`}>
         
         {/* Top Glass Header */}
         <header className="h-20 border-b border-white/5 bg-[#0F172A]/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
            <div className="flex items-center gap-6 flex-1">
               <button 
                 onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                 className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <Menu size={20} />
               </button>
               
               {/* Search Bar */}
               <div className="relative w-full max-w-md hidden md:block">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search reports, city areas, or staff..." 
                    className="w-full bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all text-white font-medium" 
                  />
               </div>
            </div>
            
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-4">
                  <button className="relative p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                     <Bell size={20} />
                     <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full ring-2 ring-[#0F172A]"></span>
                  </button>
                  <div className="h-8 w-px bg-white/5 mx-2"></div>
                  <div className="flex items-center gap-3 font-semibold text-sm text-slate-300">
                     <span className="hidden sm:inline">Active Session</span>
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20"></div>
                  </div>
               </div>
            </div>
         </header>
         
         {/* Page Viewport */}
         <main className="flex-1 p-8 lg:p-12">
            <motion.div 
               key={location.pathname}
               initial={{ opacity: 0, y: 15 }} 
               animate={{ opacity: 1, y: 0 }} 
               transition={{ duration: 0.5, ease: "easeOut" }}
            >
               <Outlet />
            </motion.div>
         </main>
      </div>

    </div>
  );
};

export default Layout;
