import { useState, useCallback, useEffect } from 'react';
import axios from '../utils/api';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, PlusCircle, CheckCircle, Clock, 
  Search, UploadCloud, X, LayoutDashboard, 
  Zap, AlertCircle, Camera, ChevronRight,
  TrendingUp, BarChart3, Activity
} from 'lucide-react';
import { PieChart, Cell, ResponsiveContainer, Pie } from 'recharts';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', lat: '', lng: '', address: ''
  });
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiPrediction, setAiPrediction] = useState('');

  useEffect(() => {
    fetchIssues();
    setCategories([
        { _id: '1', name: 'Pothole' },
        { _id: '2', name: 'Garbage' },
        { _id: '3', name: 'Streetlight' },
        { _id: '4', name: 'Water Pipe' }
    ]);

    // Setup WebSocket connection
    const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000');
    
    socket.on('issueCreated', (newIssue) => {
      setIssues(prevIssues => [newIssue, ...prevIssues]);
    });

    socket.on('issueUpdated', (updatedIssue) => {
      setIssues(prevIssues => prevIssues.map(issue => 
        issue._id === updatedIssue._id ? updatedIssue : issue
      ));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchIssues = async () => {
    try {
      const { data } = await axios.get('/api/issues');
      setIssues(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const analyzeImage = async (url) => {
      setIsAnalyzing(true);
      setAiPrediction('Initializing AI Model...');
      try {
          await tf.ready();
          setAiPrediction('Analyzing Image...');
          const model = await mobilenet.load();
          const img = new Image();
          img.src = url;
          img.onload = async () => {
              const predictions = await model.classify(img);
              let detectedCategory = '';
              let dbCategory = '';
              const keywords = predictions.map(p => p.className.toLowerCase()).join(' ');
              
              if (keywords.includes('hole') || keywords.includes('street') || keywords.includes('circle') || keywords.includes('manhole')) {
                  detectedCategory = 'Pothole Detected';
                  dbCategory = '1';
              } else if (keywords.includes('trash') || keywords.includes('ashcan') || keywords.includes('garbage') || keywords.includes('waste')) {
                  detectedCategory = 'Garbage Pile Detected';
                  dbCategory = '2';
              } else if (keywords.includes('light') || keywords.includes('lamp') || keywords.includes('pole')) {
                  detectedCategory = 'Broken Streetlight Detected';
                  dbCategory = '3';
              } else if (keywords.includes('water') || keywords.includes('pipe') || keywords.includes('fountain') || keywords.includes('plumbing')) {
                  detectedCategory = 'Water Leak/Pipe Detected';
                  dbCategory = '4';
              } else {
                  detectedCategory = `Objects: ${predictions[0].className}`;
              }

              setAiPrediction(detectedCategory);
              setFormData(prev => ({ ...prev, category: dbCategory || prev.category }));
              setIsAnalyzing(false);
          };
      } catch (err) {
          console.error("AI Analysis failed", err);
          setAiPrediction('AI Analysis Failed');
          setIsAnalyzing(false);
      }
  };

  const onDrop = useCallback(acceptedFiles => {
     if (acceptedFiles && acceptedFiles[0]) {
        const file = acceptedFiles[0];
        setImage(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        analyzeImage(url);
     }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
      onDrop, 
      accept: {'image/*': []},
      maxFiles: 1 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    Object.keys(formData).forEach(key => submitData.append(key, formData[key]));
    if (image) submitData.append('image', image);
    if (aiPrediction) submitData.append('aiPrediction', aiPrediction);

    try {
      await axios.post('/api/issues', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowForm(false);
      setFormData({ title: '', description: '', category: '', lat: '', lng: '', address: '' });
      setImage(null);
      setPreviewUrl(null);
      setAiPrediction('');
      fetchIssues();
    } catch (error) {}
  };

  const stats = [
    { label: 'Issues Reported', value: issues.length, icon: AlertCircle, color: 'text-primary' },
    { label: 'Issues Resolved', value: issues.filter(i => i.status === 'Resolved').length, icon: CheckCircle, color: 'text-emerald-500' },
    { label: 'Pending Repairs', value: issues.filter(i => i.status !== 'Resolved').length, icon: Clock, color: 'text-amber-500' },
    { label: 'Average Repair Time', value: '2.4 Days', icon: Zap, color: 'text-purple-500' }
  ];

  return (
    <div className="space-y-10">
      
      {/* Dashboard Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
           <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Citizen Terminal</h1>
           <p className="text-slate-500 font-medium">Monitoring city vitals and personal report progress.</p>
        </div>
        <div className="flex items-center gap-4 w-full lg:w-auto">
           <button 
             onClick={() => setShowForm(!showForm)} 
             className={`flex-1 lg:flex-none px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
               showForm ? 'bg-white/5 border border-white/10 text-slate-400 hover:text-white' : 'btn-primary'
             }`}
           >
              {showForm ? <><X size={20}/> Cancel Submission</> : <><PlusCircle size={20}/> File New Report</>}
           </button>
        </div>
      </div>

      {/* Modern SaaS Reporting Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0, scale: 0.98 }} animate={{ opacity: 1, height: 'auto', scale: 1 }} exit={{ opacity: 0, height: 0, scale: 0.98 }}
            className="overflow-hidden mb-10"
          >
             <div className="glass-card p-10 border-primary/20 bg-primary/[0.02]">
                <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                   <div className="p-2 bg-primary/20 rounded-lg text-primary"><Camera size={20}/></div>
                   Submitting Photographic Evidence
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                   <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                      <div className="space-y-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Issue Headline</label>
                            <input required className="input-field" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Describe the issue in 5 words..." />
                         </div>

                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Category</label>
                               <select className="input-field appearance-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                  <option value="">Select Vitals</option>
                                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                               </select>
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Priority</label>
                               <select className="input-field appearance-none" defaultValue="Medium">
                                  <option value="Low">Standard</option>
                                  <option value="Medium">Elevated</option>
                                  <option value="High">Critical</option>
                               </select>
                            </div>
                         </div>

                         <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Address / GPS Reference</label>
                            <div className="relative">
                               <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                               <input required className="input-field pl-12" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Detecting location..." />
                            </div>
                         </div>
                      </div>

                      <div 
                         {...getRootProps()} 
                         className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-10 transition-all cursor-pointer outline-none min-h-[300px] ${
                           isDragActive ? 'border-primary bg-primary/5 active:scale-[0.99]' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'
                         }`}
                      >
                         <input {...getInputProps()} />
                         {previewUrl ? (
                            <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl">
                               <img src={previewUrl} className="w-full h-full object-cover" />
                               <button type="button" onClick={(e) => {e.stopPropagation(); setPreviewUrl(null); setImage(null);}} className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-colors">
                                  <X size={20} />
                                </button>
                            </div>
                         ) : (
                            <>
                               <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-slate-500 mb-6 border border-white/5">
                                  <UploadCloud size={32} />
                               </div>
                               <p className="text-lg font-bold text-white mb-2">Drop evidence here</p>
                               <p className="text-slate-500 font-medium text-sm">PNG, JPG or HEIC up to 10MB</p>
                            </>
                         )}
                      </div>
                   </div>

                   <div className="space-y-2 mt-4">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">AI Smart Detection</label>
                      <div className="input-field bg-primary/5 border border-primary/20 text-primary-400 font-mono text-sm flex items-center gap-3">
                         {isAnalyzing ? (
                             <><div className="w-4 h-4 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div> {aiPrediction}</>
                         ) : (
                             <><Zap size={16}/> {aiPrediction || 'Awaiting image upload for analysis...'}</>
                         )}
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Detailed Log</label>
                      <textarea required rows={4} className="input-field resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Provide additional telemetry or context..." />
                   </div>

                   <div className="pt-6 border-t border-white/5 flex justify-end">
                      <button type="submit" className="btn-primary px-12 py-4 h-auto text-lg shadow-glow">Transmit Report</button>
                   </div>
                </form>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
         {stats.map((stat, i) => (
           <motion.div 
             key={i} whileHover={{ y: -5 }}
             className="glass-card p-6 border-white/5 flex flex-col justify-between"
           >
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest">{stat.label}</h3>
                    <div className="text-3xl font-black mt-2 text-white">{stat.value}</div>
                 </div>
                 <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${stat.color}`}>
                    <stat.icon size={22} />
                 </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                 <TrendingUp size={12} className="text-emerald-500" /> +8.1% From last month
              </div>
           </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         {/* Recent Table */}
         <div className="xl:col-span-2 glass-card border-white/5 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
               <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/5"><Activity size={18} className="text-primary-400"/></div>
                  Active Incident Log
               </h3>
               <div className="flex items-center gap-3">
                  <Search size={16} className="text-slate-500" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live Updates</span>
               </div>
            </div>
            
            <div className="overflow-x-auto flex-1">
               <table className="min-w-full">
                  <thead>
                     <tr className="border-b border-white/5 bg-white/[0.01]">
                        <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Issue Telemetry</th>
                        <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">GPS Node</th>
                        <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                        <th className="px-8 py-5 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {issues.length > 0 ? issues.map(issue => (
                       <tr key={issue._id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                                   {issue.imageUrl ? (
                                     <img src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${issue.imageUrl}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                   ) : (
                                     <div className="w-full h-full flex items-center justify-center text-slate-700 italic text-[10px]">RAW</div>
                                   )}
                                </div>
                                <div>
                                   <div className="text-sm font-bold text-white group-hover:text-primary transition-colors cursor-pointer">{issue.title}</div>
                                   <div className="text-xs text-slate-500 font-medium truncate w-40">{issue.description}</div>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-5">
                             <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                <MapPin size={14} className="text-rose-500/50" />
                                <span className="truncate w-32">{issue.location.address}</span>
                             </div>
                          </td>
                          <td className="px-6 py-5">
                             <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                                issue.status === 'Resolved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                issue.status === 'In Progress' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                'bg-amber-500/10 border-amber-200/20 text-amber-400'
                             }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  issue.status === 'Resolved' ? 'bg-emerald-400' :
                                  issue.status === 'In Progress' ? 'bg-blue-400' :
                                  'bg-amber-400'
                                }`}></span>
                                {issue.status}
                             </div>
                          </td>
                          <td className="px-8 py-5 text-right font-mono text-xs text-slate-500">
                             {new Date(issue.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </td>
                       </tr>
                     )) : (
                        <tr><td colSpan="4" className="text-center py-20 text-slate-600 font-bold uppercase tracking-widest text-sm">No Active Reports Found</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
            
            <div className="p-4 border-t border-white/5 text-center">
               <button className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Load Full Archives</button>
            </div>
         </div>

         {/* Distribution Widget */}
         <div className="glass-card border-white/5 p-8 flex flex-col">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-3">
               <div className="p-2 bg-white/5 rounded-lg border border-white/5"><BarChart3 size={18} className="text-purple-400"/></div>
               Category Vitals
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-8 uppercase tracking-widest">Global Report Distribution</p>
            
            <div className="flex-1 min-h-[300px] flex items-center justify-center">
               <ResponsiveContainer width="100%" height="300">
                  <PieChart>
                     <Pie
                        data={[
                           { name: 'Pothole', value: 40 },
                           { name: 'Garbage', value: 30 },
                           { name: 'Water', value: 20 },
                           { name: 'Lights', value: 10 },
                        ]}
                        innerRadius={80}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                     >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#a855f7" />
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                     </Pie>
                  </PieChart>
               </ResponsiveContainer>
               
               <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-white">72%</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Stability</span>
               </div>
            </div>

            <div className="space-y-4 mt-8">
               {[
                  { label: 'Infrastructure', value: '40%', color: 'bg-primary' },
                  { label: 'Sanitation', value: '30%', color: 'bg-purple-500' },
                  { label: 'Utilities', value: '30%', color: 'bg-emerald-500' }
               ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                     <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        <span>{item.label}</span>
                        <span>{item.value}</span>
                     </div>
                     <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: item.value }} transition={{ duration: 1 }} className={`h-full ${item.color}`} />
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

    </div>
  );
};

export default CitizenDashboard;
