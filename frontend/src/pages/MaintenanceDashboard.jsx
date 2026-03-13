import { useState, useEffect } from 'react';
import axios from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, AlertCircle, Camera, 
  MapPin, HardHat, UploadCloud, X,
  Activity, ArrowRight, ShieldCheck, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MaintenanceDashboard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [resolveImage, setResolveImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchAssignedIssues();
  }, []);

  const fetchAssignedIssues = async () => {
    try {
      const { data } = await axios.get('/api/issues');
      setIssues(data);
    } catch (error) {
    } finally {
       setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
     try {
        await axios.put(`/api/issues/${id}`, { status });
        fetchAssignedIssues();
     } catch (error) {}
  };

  const handleResolve = async (e, id) => {
     e.preventDefault();
     if (!resolveImage) return alert("Resolution image required.");

     const formData = new FormData();
     formData.append('status', 'Resolved');
     formData.append('resolveImage', resolveImage);

     try {
        await axios.put(`/api/issues/${id}`, formData, {
           headers: { 'Content-Type': 'multipart/form-data' }
        });
        setResolvingId(null);
        setPreviewUrl(null);
        fetchAssignedIssues();
     } catch (error) {}
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-10 animate-fade-in-up">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Field Operations</h1>
           <p className="text-slate-500 font-medium">Real-time maintenance workflow and repair logging.</p>
        </div>
        
        <div className="glass-panel p-6 border-primary/20 bg-primary/5 flex items-center gap-5 shadow-glow">
           <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
              <HardHat size={24} />
           </div>
           <div>
              <div className="text-[10px] font-bold text-primary-400 uppercase tracking-[0.2em]">Active Workflow</div>
              <div className="text-2xl font-black text-white leading-none mt-1">{issues.length} Work Orders</div>
           </div>
        </div>
      </div>

      {issues.length === 0 ? (
        <div className="glass-card p-32 text-center border-white/5 bg-white/[0.01]">
           <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 text-emerald-500">
              <CheckCircle2 size={36} />
           </div>
           <h3 className="text-3xl font-black text-white mb-4">Zero Incidents</h3>
           <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">System status nominal. All assigned work orders in your sector have been neutralized or resolved.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
           {issues.map((issue) => (
              <motion.div 
                 key={issue._id} layout
                 className="glass-card border-white/5 overflow-hidden group hover:border-primary/20 transition-all shadow-xl"
              >
                 <div className="flex flex-col lg:flex-row h-full">
                    {/* Media Node */}
                    <div className="w-full lg:w-[260px] relative bg-black/40 border-b lg:border-b-0 lg:border-r border-white/5">
                       {issue.imageUrl ? (
                          <img src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${issue.imageUrl}`} className="w-full h-64 lg:h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                       ) : (
                          <div className="w-full h-64 lg:h-full flex flex-col items-center justify-center text-slate-700 font-black text-xs space-y-3">
                             <Activity size={40} className="text-slate-800" />
                             <span className="tracking-[0.3em]">NO TELEMETRY</span>
                          </div>
                       )}
                       <div className="absolute top-4 left-4">
                          <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                             issue.priority === 'High' ? 'bg-red-500/20 border-red-500/30 text-red-400' :
                             'bg-amber-500/20 border-amber-500/30 text-amber-400'
                          }`}>
                             {issue.priority} PRIORITY
                          </div>
                       </div>
                    </div>

                    {/* Content Node */}
                    <div className="flex-1 p-8 flex flex-col">
                       <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold text-white tracking-tight leading-tight group-hover:text-primary transition-colors">{issue.title}</h3>
                          <span className="font-mono text-[10px] text-slate-500">#{issue._id.slice(-6).toUpperCase()}</span>
                       </div>
                       
                       <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6 line-clamp-3">{issue.description}</p>
                       
                       <div className="bg-white/5 border border-white/5 rounded-xl p-4 mb-8 flex items-center gap-4">
                          <div className="p-2 bg-white/5 rounded-lg text-rose-500"><MapPin size={18} /></div>
                          <div className="flex-1 overflow-hidden">
                             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Deployment Target</div>
                             <div className="text-sm font-semibold text-white truncate">{issue.location.address}</div>
                          </div>
                       </div>

                       <div className="mt-auto space-y-4">
                          <AnimatePresence>
                             {resolvingId === issue._id ? (
                                <motion.form 
                                  initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                                  onSubmit={(e) => handleResolve(e, issue._id)}
                                  className="space-y-4 bg-primary/5 border border-primary/20 p-5 rounded-2xl"
                                >
                                   <div className="flex justify-between items-center mb-2">
                                      <h4 className="text-xs font-bold uppercase tracking-widest text-primary-400 flex items-center gap-2">
                                         <Camera size={16}/> Repair Confirmation
                                      </h4>
                                      <button type="button" onClick={() => setResolvingId(null)} className="text-slate-500 hover:text-white"><X size={18}/></button>
                                   </div>
                                   
                                   <input type="file" id={`field-log-${issue._id}`} className="hidden" accept="image/*" onChange={(e) => {
                                      const file = e.target.files[0];
                                      setResolveImage(file);
                                      setPreviewUrl(URL.createObjectURL(file));
                                   }} />
                                   
                                   {previewUrl ? (
                                      <div className="relative h-40 rounded-xl overflow-hidden border border-white/10 group">
                                         <img src={previewUrl} className="w-full h-full object-cover" />
                                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                            <span className="text-xs font-bold">Replace Manifest</span>
                                         </div>
                                      </div>
                                   ) : (
                                      <label htmlFor={`field-log-${issue._id}`} className="h-24 flex flex-col items-center justify-center bg-white/5 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/[0.08] transition-all">
                                         <UploadCloud className="text-slate-500 mb-2" />
                                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Proof of Repair</span>
                                      </label>
                                   )}
                                   
                                   <button type="submit" className="btn-primary w-full shadow-glow">Finalize Restoration</button>
                                </motion.form>
                             ) : (
                                <div className="flex gap-4">
                                   {issue.status === 'Assigned' && (
                                      <button 
                                        onClick={() => handleUpdateStatus(issue._id, 'In Progress')}
                                        className="btn-secondary flex-1 py-4 h-auto text-sm flex items-center justify-center gap-2"
                                      >
                                         <Clock size={18} /> Acknowledge & Deploy
                                      </button>
                                   )}
                                   {(issue.status === 'In Progress' || issue.status === 'Assigned') && (
                                      <button 
                                        onClick={() => setResolvingId(issue._id)}
                                        className="btn-primary flex-1 py-4 h-auto text-sm flex items-center justify-center gap-2"
                                      >
                                         <CheckCircle2 size={18} /> Resolve Node
                                      </button>
                                   )}
                                </div>
                             )}
                          </AnimatePresence>
                       </div>
                    </div>
                 </div>
              </motion.div>
           ))}
        </div>
      )}
    </div>
  );
};

export default MaintenanceDashboard;
