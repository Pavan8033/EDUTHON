import { useState, useCallback, useEffect, useRef } from 'react';
import axios from '../utils/api';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, PlusCircle, CheckCircle, Clock, 
  Search, UploadCloud, X, LayoutDashboard, 
  Zap, AlertCircle, Camera, ChevronRight,
  TrendingUp, BarChart3, Activity, GpsFixed, Loader2
} from 'lucide-react';
import { PieChart, Cell, ResponsiveContainer, Pie } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', priority: 'Medium', lat: '', lng: '', address: ''
  });
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiPrediction, setAiPrediction] = useState('');
  
  // Camera & GPS State
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  useEffect(() => {
    fetchIssues();
    const fetchCategories = async () => {
        try {
            const { data } = await axios.get('/api/categories');
            setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };
    fetchCategories();

    // Setup WebSocket connection
    const socket = io(import.meta.env.VITE_API_BASE_URL || 'https://cityfix-backend.onrender.com');
    
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
              
              // Find the corresponding category object from state to get the real _id
              const matchedCat = categories.find(c => 
                c.name.toLowerCase().includes(detectedCategory.split(' ')[0].toLowerCase())
              );

              setFormData(prev => ({ 
                ...prev, 
                category: matchedCat ? matchedCat._id : prev.category 
              }));
              setIsAnalyzing(false);
          };
      } catch (err) {
          console.error("AI Analysis failed", err);
          setAiPrediction('AI Analysis Failed');
          setIsAnalyzing(false);
      }
  };

  const detectLocation = () => {
    setIsDetectingLocation(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setIsDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({ ...prev, lat: latitude, lng: longitude, address: `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
        setIsDetectingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to retrieve your location");
        setIsDetectingLocation(false);
      }
    );
  };

  const startCamera = async () => {
    setIsCapturing(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      console.error("Camera access failed", err);
      alert("Camera access denied. Please enable camera permissions.");
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      setImage(file);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      stopCamera();
      analyzeImage(url);
    }, 'image/jpeg');
  };

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
      setFormData({ title: '', description: '', category: '', priority: 'Medium', lat: '', lng: '', address: '' });
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
                               <select 
                                  className="input-field appearance-none" 
                                  value={formData.priority} 
                                  onChange={e => setFormData({...formData, priority: e.target.value})}
                                >
                                   <option value="Low">Standard</option>
                                   <option value="Medium">Elevated</option>
                                   <option value="High">Priority</option>
                                </select>
                            </div>
                         </div>

                          <div className="space-y-2">
                             <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Address / GPS Reference</label>
                                <button 
                                  type="button" onClick={detectLocation} disabled={isDetectingLocation}
                                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary hove:text-primary-400 transition-colors flex items-center gap-1"
                                >
                                   {isDetectingLocation ? <Loader2 size={12} className="animate-spin" /> : <MapPin size={12} />}
                                   Detect My Location
                                </button>
                             </div>
                             <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input required className="input-field pl-12" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Detecting location..." />
                             </div>
                             {formData.lat && formData.lng && (
                                <div className="mt-4 rounded-xl overflow-hidden border border-white/10 h-[150px] relative group">
                                   <iframe 
                                     width="100%" height="100%" frameBorder="0" style={{ border: 0 }}
                                     src={`https://www.google.com/maps/embed/v1/place?key=REPLACE_ME&q=${formData.lat},${formData.lng}`} 
                                     allowFullScreen
                                   ></iframe>
                                   <div className="absolute inset-0 pointer-events-none border-2 border-primary/20 rounded-xl group-hover:border-primary/40 transition-colors"></div>
                                </div>
                             )}
                          </div>
                      </div>

                         <div className="space-y-2">
                             <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Live Evidence Capture (Required)</label>
                             <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-white/[0.02] border border-white/10 group">
                                {previewUrl ? (
                                   <div className="relative w-full h-full">
                                      <img src={previewUrl} className="w-full h-full object-cover" />
                                      <button type="button" onClick={() => {setPreviewUrl(null); setImage(null);}} className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-colors">
                                         <X size={20} />
                                       </button>
                                   </div>
                                ) : isCapturing ? (
                                   <div className="relative w-full h-full">
                                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                                         <button type="button" onClick={capturePhoto} className="px-6 py-3 bg-primary rounded-xl font-bold text-white shadow-glow flex items-center gap-2">
                                            <Camera size={20}/> Capture Photo
                                         </button>
                                         <button type="button" onClick={stopCamera} className="px-6 py-3 bg-white/10 rounded-xl font-bold text-white border border-white/20">
                                            Cancel
                                         </button>
                                      </div>
                                   </div>
                                ) : (
                                   <div className="w-full h-full flex flex-col items-center justify-center p-10">
                                      <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6 border border-primary/20">
                                         <Camera size={32} />
                                      </div>
                                      <p className="text-lg font-bold text-white mb-2">Live Camera Access</p>
                                      <p className="text-slate-500 font-medium text-sm text-center mb-8 max-w-[200px]">Secure reports require real-time photographic proof.</p>
                                      <button type="button" onClick={startCamera} className="btn-primary px-8 py-3">Open Camera</button>
                                   </div>
                                )}
                             </div>
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
                                      <img src={`${import.meta.env.VITE_API_BASE_URL || 'https://cityfix-backend.onrender.com'}${issue.imageUrl}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
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
