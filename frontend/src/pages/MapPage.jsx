import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from '../utils/api';
import L from 'leaflet';
import 'leaflet.heat';
import { 
  AlertCircle, Clock, CheckCircle2, 
  MapPin, Camera, Navigation, 
  Filter, Layers, Search, X, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Custom Marker Helpers
const createIcon = (color) => new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: ${color}; width: 14px; height: 14px; border: 3px solid rgba(255,255,255,0.2); border-radius: 50%; box-shadow: 0 0 15px ${color};"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -7]
});

const icons = {
  High: createIcon('#f43f5e'),   // Rose 500
  Medium: createIcon('#f59e0b'), // Amber 500
  Low: createIcon('#10b981'),    // Emerald 500
  Default: createIcon('#3b82f6')  // Blue 500
};

const HeatmapLayer = ({ points }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map || points.length === 0) return;
    
    const heatData = points.map(p => [
      p.location?.lat || 19.0760 + (Math.random() - 0.5) * 0.1, // Fallback scatter for demo
      p.location?.lng || 72.8777 + (Math.random() - 0.5) * 0.1,
      p.priority === 'High' ? 1.0 : p.priority === 'Medium' ? 0.6 : 0.3
    ]);
    
    // @ts-ignore - leaflet.heat adds this globally
    const heatLayer = L.heatLayer(heatData, {
      radius: 35,
      blur: 25,
      maxZoom: 12,
      gradient: {
        0.3: '#3b82f6', // Primary Blue
        0.6: '#10b981', // Accent Emerald
        0.8: '#f59e0b', // Amber Warning
        1.0: '#f43f5e'  // Rose Critical
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
};

const MapPage = () => {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapMode, setMapMode] = useState('points'); // 'points' or 'heatmap'

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const { data } = await axios.get('/api/issues/all');
      setIssues(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] relative rounded-3xl overflow-hidden border border-white/5 shadow-2xl bg-[#0F172A] isolate">
      
      {/* Floating Controls Overlay */}
      <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-3">
         <div className="glass-card p-3 border-white/10 shadow-2xl flex items-center gap-4 bg-[#111827]/90">
            <div className="relative">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
               <input 
                 placeholder="Search Node..." 
                 className="bg-white/5 border border-white/5 rounded-lg pl-10 pr-4 py-1.5 text-xs font-bold text-white outline-none focus:border-primary/50 transition-all w-48"
               />
            </div>
            <div className="h-4 w-px bg-white/10"></div>
            <button className="text-slate-400 hover:text-white transition-colors" title="Filter"><Filter size={18}/></button>
            <button 
               onClick={() => setMapMode(prev => prev === 'points' ? 'heatmap' : 'points')}
               className={`transition-colors ${mapMode === 'heatmap' ? 'text-rose-500 hover:text-rose-400' : 'text-slate-400 hover:text-white'}`}
               title="Toggle Heatmap"
            >
               <Layers size={18}/>
            </button>
         </div>
      </div>

      <div className="absolute top-6 right-6 z-[1000]">
         <div className="glass-card p-4 border-white/10 bg-[#111827]/90 space-y-3 shadow-2xl">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Layer Legend</h4>
            {mapMode === 'points' ? (
                <div className="space-y-2">
                   {['High', 'Medium', 'Low'].map(p => (
                      <div key={p} className="flex items-center gap-3">
                         <div className={`w-2.5 h-2.5 rounded-full ring-4 ring-offset-2 ring-transparent ${
                            p === 'High' ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 
                            p === 'Medium' ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 
                            'bg-emerald-500 shadow-[0_0_10px_#10b981]'
                         }`}></div>
                         <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{p} Node</span>
                      </div>
                   ))}
                </div>
            ) : (
                <div className="space-y-2">
                   <div className="w-full h-2 rounded-full bg-gradient-to-r from-blue-500 via-emerald-500 to-rose-500 mb-1"></div>
                   <div className="flex justify-between w-full">
                       <span className="text-[10px] font-black text-slate-500 uppercase">Low Heat</span>
                       <span className="text-[10px] font-black text-slate-500 uppercase">Hotspot</span>
                   </div>
                </div>
            )}
         </div>
      </div>

      <MapContainer 
        center={[19.0760, 72.8777]} 
        zoom={11} 
        style={{ height: '100%', width: '100%', background: '#0F172A' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {mapMode === 'heatmap' && <HeatmapLayer points={issues} />}

        {mapMode === 'points' && issues.map((issue) => (
          <Marker 
            key={issue._id} 
            position={[issue.location?.lat || 19.0760 + (Math.random() - 0.5) * 0.1, issue.location?.lng || 72.8777 + (Math.random() - 0.5) * 0.1]} 
            icon={icons[issue.priority] || icons.Default}
            eventHandlers={{
                click: () => setSelectedIssue(issue)
            }}
          >
            <Popup className="dark-popup">
              <div className="p-1 min-w-[200px]">
                <h3 className="font-bold text-slate-900 border-b pb-1 mb-2">{issue.title}</h3>
                <p className="text-xs text-slate-600 mb-2 line-clamp-2">{issue.description}</p>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter">
                   <span className={issue.priority === 'High' ? 'text-red-600' : 'text-amber-600'}>{issue.priority}</span>
                   <span className="text-slate-400">{issue.status}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Slide-over Detail Card */}
      <AnimatePresence>
         {selectedIssue && (
            <motion.div 
               initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
               className="absolute top-0 right-0 h-full w-full max-w-sm z-[1001] bg-[#111827]/95 backdrop-blur-2xl border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] p-8 flex flex-col"
            >
               <div className="flex justify-between items-center mb-10">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                     selectedIssue.priority === 'High' ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                  }`}>
                     {selectedIssue.priority} PRIORITY
                  </div>
                  <button onClick={() => setSelectedIssue(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={20}/></button>
               </div>

               <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-hide">
                  <div>
                     <h2 className="text-3xl font-black text-white tracking-tighter mb-4 leading-tight">{selectedIssue.title}</h2>
                     <p className="text-slate-400 text-sm font-medium leading-relaxed">{selectedIssue.description}</p>
                  </div>

                  {selectedIssue.imageUrl && (
                     <div className="rounded-2xl overflow-hidden border border-white/5 shadow-xl aspect-video bg-black/40">
                        <img src={`${import.meta.env.VITE_API_BASE_URL || 'https://cityfix-backend.onrender.com'}${selectedIssue.imageUrl}`} className="w-full h-full object-cover" alt="Issue Evidence" />
                     </div>
                  )}

                  <div className="space-y-4">
                     <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-4 mb-1">
                           <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400"><MapPin size={18}/></div>
                           <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Geolocation Target</h4>
                        </div>
                        <p className="text-sm font-bold text-white pl-12">{selectedIssue.location.address}</p>
                     </div>

                     <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-4 mb-1">
                           <div className="p-2 bg-primary/10 rounded-lg text-primary"><Activity size={18}/></div>
                           <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Incident Lifecycle</h4>
                        </div>
                        <div className="pl-12 flex items-center gap-4">
                           <span className="text-sm font-bold text-white">{selectedIssue.status.toUpperCase()}</span>
                           <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: selectedIssue.status === 'Resolved' ? '100%' : '50%' }}></div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="mt-8 pt-8 border-t border-white/5 flex gap-4">
                  <button className="flex-1 btn-primary py-4 h-auto text-sm flex items-center justify-center gap-2">
                     <Navigation size={18}/> Direct Transit
                  </button>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
};

export default MapPage;
