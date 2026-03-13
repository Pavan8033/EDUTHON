import { useState, useEffect } from 'react';
import axios from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { 
  Users, AlertTriangle, CheckCircle, Clock, 
  MapPin, Search, Calendar, ChevronDown,
  LayoutDashboard, Activity, ShieldCheck, Filter, BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#3b82f6', '#a855f7', '#10b981', '#f59e0b', '#f43f5e'];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, []);

  const fetchData = async () => {
    try {
      const [issuesRes, analyticsRes] = await Promise.all([
        axios.get('/api/issues/all'), 
        axios.get('/api/analytics')
      ]);
      setIssues(issuesRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
      setUsers([
          { _id: '60d5ecb8b392d700153ee001', name: 'Field Lead Alpha', role: 'maintenance' },
          { _id: '60d5ecb8b392d700153ee002', name: 'Repair Team Beta', role: 'maintenance' },
          { _id: '60d5ecb8b392d700153ee003', name: 'Ops Crew Gamma', role: 'maintenance' }
      ]);
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`/api/issues/${id}`, { status: newStatus });
      fetchData();
    } catch (error) {}
  };

  const handleAssign = async (id, assigneeId) => {
    try {
        await axios.put(`/api/issues/${id}`, { assignedTo: assigneeId, status: 'Assigned' });
        fetchData();
    } catch (error) {}
  }

  const filteredIssues = issues.filter(issue => 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      issue.location.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mockTimeline = [
      { t: '08:00', v: 40 }, { t: '10:00', v: 55 }, { t: '12:00', v: 45 },
      { t: '14:00', v: 80 }, { t: '16:00', v: 75 }, { t: '18:00', v: 60 }, { t: '20:00', v: 40 }
  ];

  if (loading) return <div className="h-96 flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-10 animate-fade-in-up">
      
      {/* SaaS Admin Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
           <h1 className="text-4xl font-black text-white tracking-tighter mb-2">City Infrastructure Command</h1>
           <p className="text-slate-500 font-medium">Global municipal telemetry and department orchestration.</p>
        </div>
        
        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 shadow-glass backdrop-blur-md">
           <button 
             onClick={() => setActiveTab('analytics')} 
             className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'analytics' ? 'bg-primary text-white shadow-glow' : 'text-slate-400 hover:text-white'}`}
           >
             Telemetry
           </button>
           <button 
             onClick={() => setActiveTab('queue')} 
             className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'queue' ? 'bg-primary text-white shadow-glow' : 'text-slate-400 hover:text-white'}`}
           >
             Issue Queue
           </button>
        </div>
      </div>

      {activeTab === 'analytics' && analytics && (
        <div className="space-y-8">
           {/* High-level stats */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'System Reports', val: analytics.overview.totalIssues, icon: Activity, color: 'text-primary' },
                { label: 'Pending Review', val: analytics.overview.pendingIssues, icon: Clock, color: 'text-amber-400' },
                { label: 'Active Repairs', val: analytics.overview.inProgressIssues, icon: Users, color: 'text-purple-400' },
                { label: 'Resolved (Last 24h)', val: analytics.overview.resolvedIssues, icon: ShieldCheck, color: 'text-emerald-400' }
              ].map((stat, i) => (
                <div key={i} className="glass-panel p-6 border-white/5 bg-white/[0.02]">
                   <div className="flex justify-between items-start mb-4">
                      <div className={`p-2 bg-white/5 rounded-lg border border-white/5 ${stat.color}`}><stat.icon size={20} /></div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pt-1">LIVE DATA</div>
                   </div>
                   <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</div>
                   <div className="text-3xl font-black text-white">{stat.val}</div>
                </div>
              ))}
           </div>

           {/* Core Charts Area */}
           <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Performance Graph */}
              <div className="xl:col-span-2 glass-card p-8 border-white/5">
                 <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">System Performance Timeline</h3>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">Incident reports vs repair throughput</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                       <Calendar size={14} /> This Week
                    </div>
                 </div>
                 
                 <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={mockTimeline}>
                          <defs>
                             <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                          <XAxis dataKey="t" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 'bold'}} />
                          <RechartsTooltip 
                             contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                             itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                          />
                          <Area type="monotone" dataKey="v" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" dot={{ r: 4, fill: '#2563eb', stroke: '#0F172A', strokeWidth: 2 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* Department Board */}
              <div className="glass-card p-8 border-white/5 flex flex-col">
                 <h3 className="text-xl font-bold text-white tracking-tight mb-2">Category Health</h3>
                 <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-10">Infrastructure Vitals</p>
                 
                 <div className="flex-1 flex flex-col justify-center">
                    <ResponsiveContainer width="100%" height={240}>
                       <PieChart>
                          <Pie 
                            data={analytics.issuesByCategory} cx="50%" cy="50%" 
                            innerRadius={60} outerRadius={85} paddingAngle={8} 
                            dataKey="count" nameKey="_id"
                           >
                            {analytics.issuesByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} cornerRadius={4} />)}
                          </Pie>
                          <RechartsTooltip contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px' }} />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>

                 <div className="grid grid-cols-2 gap-4 mt-8">
                    {analytics.issuesByCategory.slice(0, 4).map((cat, i) => (
                       <div key={i} className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{cat._id}</span>
                          </div>
                          <div className="text-xl font-black text-white">{cat.count}</div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'queue' && (
        <div className="glass-card border-white/5 overflow-hidden animate-fade-in-up">
           <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-white/[0.01]">
              <div className="relative w-full max-w-md">
                 <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                 <input 
                    type="text" placeholder="Global node search..." 
                    className="input-field pl-12"
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                 />
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                 <button className="flex-1 md:flex-none btn-secondary flex items-center justify-center gap-2 h-12">
                    <Filter size={16} /> Filters
                 </button>
                 <button className="flex-1 md:flex-none btn-primary h-12">Export Telemetry</button>
              </div>
           </div>
           
           <div className="overflow-x-auto">
             <table className="min-w-full">
                <thead>
                   <tr className="bg-white/[0.01] border-b border-white/5">
                      <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Report ID</th>
                      <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Issue Metrics</th>
                      <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Stage</th>
                      <th className="px-8 py-5 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assignee Node</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {filteredIssues.map((issue) => (
                      <tr key={issue._id} className="hover:bg-white/[0.02] transition-colors group">
                         <td className="px-8 py-6 font-mono text-[10px] text-slate-500 font-bold">
                            #{issue._id.slice(-8).toUpperCase()}
                         </td>
                         <td className="px-6 py-6">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                   <MapPin size={20} className="text-rose-500/70" />
                               </div>
                               <div>
                                  <div className="text-sm font-bold text-white mb-0.5 group-hover:text-primary transition-colors cursor-pointer">{issue.title}</div>
                                  <div className="text-xs text-slate-500 font-semibold">{issue.location.address}</div>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-6">
                            <select 
                              value={issue.status} onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                              className={`bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none cursor-pointer hover:bg-white/10 transition-all ${
                                issue.status === 'Resolved' ? 'text-emerald-400' : 
                                issue.status === 'In Progress' ? 'text-blue-400' :
                                'text-amber-400'
                              }`}
                            >
                               <option value="Submitted">SUBMITTED</option>
                               <option value="Under Review">UNDER REVIEW</option>
                               <option value="Assigned">ASSIGNED</option>
                               <option value="In Progress">IN PROGRESS</option>
                               <option value="Resolved">RESOLVED</option>
                            </select>
                         </td>
                         <td className="px-8 py-6 text-right">
                            <select
                               className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none cursor-pointer hover:bg-white/10 transition-all text-slate-400 max-w-[180px]"
                               value={issue.assignedTo?._id || issue.assignedTo || ''}
                               onChange={(e) => handleAssign(issue._id, e.target.value)}
                            >
                               <option value="">Unmatched Node</option>
                               {users.map(u => <option key={u._id} value={u._id}>{u.name.toUpperCase()}</option>)}
                            </select>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
