import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, where, getCountFromServer } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { 
  BarChart3, Users, Globe, Smartphone, ArrowRight, Lock, KeyRound, Clock, Activity, CreditCard
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    liveUsers: 0,
    todayViews: 0,
    todayUnique: 0,
    totalViews: 0,
    totalUnique: 0,
    bounceRate: 0,
    avgSessionViews: 0,
    paymentsCount: 0,
    devices: {},
    countries: {},
    referrers: {},
    topPages: {},
    chartData: []
  });

  const [dateRange, setDateRange] = useState("today"); // today, 7d, 30d, all

  useEffect(() => {
    // Check if previously authenticated
    if (localStorage.getItem("pw_admin") === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      const interval = setInterval(fetchStats, 60000); // refresh every minute
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, dateRange]);

  const handleLogin = (e) => {
    e.preventDefault();
    const correctPassword = import.meta.env.VITE_ADMIN_KEY;
    if (!correctPassword) {
      setError("Admin key not configured in .env");
      return;
    }
    if (password === correctPassword) {
      localStorage.setItem("pw_admin", "true");
      setIsAuthenticated(true);
    } else {
      setError("Incorrect password");
    }
  };

  const fetchStats = async () => {
    if (!isFirebaseConfigured || !db) return;
    setLoading(true);

    try {
      const now = new Date();
      const viewsRef = collection(db, "page_views");
      
      // Calculate date filters
      let startDate = new Date(0); // All time default
      if (dateRange === "today") {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (dateRange === "7d") {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (dateRange === "30d") {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Query for views within range
      const viewsQuery = dateRange === "all" 
        ? query(viewsRef) 
        : query(viewsRef, where("timestamp", ">=", startDate.toISOString()));

      const snapshot = await getDocs(viewsQuery);
      
      // Calculate live users (active in last 5 minutes)
      const fiveMinsAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
      const liveUsersSet = new Set();

      const uniqueVisitors = new Set();
      const todayUnique = new Set();
      let todayViewsCount = 0;
      
      const devicesMap = {};
      const countriesMap = {};
      const referrersMap = {};
      const pagesMap = {};
      const dailyViewsMap = {};
      const dailyUniqueMap = {};
      const sessionsMap = {};
      
      const todayString = now.toISOString().split("T")[0];

      snapshot.forEach(doc => {
        const data = doc.data();
        
        uniqueVisitors.add(data.visitorId);
        
        if (data.date === todayString) {
          todayViewsCount++;
          todayUnique.add(data.visitorId);
        }

        if (data.timestamp >= fiveMinsAgo) {
          liveUsersSet.add(data.visitorId);
        }

        devicesMap[data.deviceType] = (devicesMap[data.deviceType] || 0) + 1;
        countriesMap[data.country] = (countriesMap[data.country] || 0) + 1;
        referrersMap[data.referrer] = (referrersMap[data.referrer] || 0) + 1;
        pagesMap[data.path] = (pagesMap[data.path] || 0) + 1;
        
        if (data.sessionId) {
          sessionsMap[data.sessionId] = (sessionsMap[data.sessionId] || 0) + 1;
        }

        if (data.date) {
          dailyViewsMap[data.date] = (dailyViewsMap[data.date] || 0) + 1;
          if (!dailyUniqueMap[data.date]) dailyUniqueMap[data.date] = new Set();
          dailyUniqueMap[data.date].add(data.visitorId);
        }
      });

      // Fetch payment counts
      let totalPayments = 0;
      try {
         const bouquetsSnap = await getCountFromServer(collection(db, "bouquets"));
         const cakesSnap = await getCountFromServer(collection(db, "cakes"));
         const cardsSnap = await getCountFromServer(collection(db, "cards"));
         totalPayments = bouquetsSnap.data().count + cakesSnap.data().count + cardsSnap.data().count;
      } catch(e) {
         console.warn("Could not fetch payment counts", e);
      }

      // Calculate Bounce Rate and Avg Session
      let singlePageSessions = 0;
      const totalSessions = Object.keys(sessionsMap).length;
      Object.values(sessionsMap).forEach(count => {
        if (count === 1) singlePageSessions++;
      });
      const bounceRate = totalSessions > 0 ? Math.round((singlePageSessions / totalSessions) * 100) : 0;
      const avgSessionViews = totalSessions > 0 ? (snapshot.size / totalSessions).toFixed(1) : 0;

      // Prepare chart data
      const chartDataArray = Object.keys(dailyViewsMap)
        .sort()
        .map(date => ({
          date,
          views: dailyViewsMap[date],
          unique: dailyUniqueMap[date] ? dailyUniqueMap[date].size : 0
        }));

      setStats({
        liveUsers: liveUsersSet.size,
        todayViews: todayViewsCount,
        todayUnique: todayUnique.size,
        totalViews: snapshot.size,
        totalUnique: uniqueVisitors.size,
        bounceRate,
        avgSessionViews,
        paymentsCount: totalPayments,
        devices: devicesMap,
        countries: countriesMap,
        referrers: referrersMap,
        topPages: pagesMap,
        chartData: chartDataArray
      });

    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
        <div className="bg-neutral-800 p-8 rounded-2xl border border-neutral-700 w-full max-w-md shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-neutral-700/50 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-white/50" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-2">Admin Access</h1>
          <p className="text-neutral-400 text-center mb-8 text-sm">
            Enter your passphrase to view analytics. Logging in will exclude you from tracking.
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Passphrase"
                  className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-neutral-200 transition-colors"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Helper to sort and slice objects for Top lists
  const getTopEntries = (obj, limit = 5) => {
    return Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-neutral-200 p-4 md:p-8 font-sans pb-32">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-rose-500" />
              Analytics Dashboard
            </h1>
            <p className="text-neutral-400 mt-1 text-sm">
              Your visits are currently excluded from tracking.
            </p>
          </div>
          <div className="flex bg-neutral-800/50 p-1 rounded-xl border border-neutral-800 w-fit">
            {["today", "7d", "30d", "all"].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  dateRange === range 
                    ? "bg-neutral-700 text-white shadow-sm" 
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`}
              >
                {range === "today" ? "Today" : range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "All Time"}
              </button>
            ))}
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl" />
            <div className="flex items-center gap-3 text-neutral-400 mb-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium">Live Users</span>
            </div>
            <div className="text-4xl font-bold text-white flex items-baseline gap-2">
              {loading ? "..." : stats.liveUsers}
              <span className="text-xs font-normal text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Active now
              </span>
            </div>
          </div>
          
          <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 text-neutral-400 mb-2">
              <Users className="w-4 h-4 text-rose-400" />
              <span className="text-sm font-medium">Unique Visitors</span>
            </div>
            <div className="text-4xl font-bold text-white">
              {loading ? "..." : (dateRange === "today" ? stats.todayUnique : stats.totalUnique)}
            </div>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 text-neutral-400 mb-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium">Page Views</span>
            </div>
            <div className="text-4xl font-bold text-white">
              {loading ? "..." : (dateRange === "today" ? stats.todayViews : stats.totalViews)}
            </div>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl relative overflow-hidden lg:col-span-2">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
            <div className="flex items-center gap-3 text-neutral-400 mb-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium">Total Gifts Saved</span>
            </div>
            <div className="text-4xl font-bold text-white">
              {loading ? "..." : stats.paymentsCount}
            </div>
            <p className="text-xs text-neutral-500 mt-1">Bouquets, Cakes & Cards</p>
          </div>
          
          <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 text-neutral-400 mb-2">
              <span className="text-sm font-medium">Bounce Rate</span>
            </div>
            <div className="text-4xl font-bold text-white">
              {loading ? "..." : `${stats.bounceRate}%`}
            </div>
            <p className="text-xs text-neutral-500 mt-1">Single page visits</p>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 text-neutral-400 mb-2">
              <span className="text-sm font-medium">Pages/Session</span>
            </div>
            <div className="text-4xl font-bold text-white">
              {loading ? "..." : stats.avgSessionViews}
            </div>
            <p className="text-xs text-neutral-500 mt-1">Average views</p>
          </div>
        </div>



        {/* Traffic Chart */}
        {stats.chartData.length > 0 && (
          <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-neutral-400" /> Page Views Over Time
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(tick) => {
                      const d = new Date(tick);
                      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    }}
                    stroke="#525252" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#f43f5e' }}
                    labelStyle={{ color: '#a3a3a3', marginBottom: '4px' }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  />
                  <Area type="monotone" dataKey="views" name="Page Views" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                  <Area type="monotone" dataKey="unique" name="Unique Visitors" stroke="#3b82f6" strokeWidth={2} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Detailed Breakdown Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Top Pages */}
          <div className="bg-neutral-900/30 border border-neutral-800 p-6 rounded-2xl lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-neutral-400" /> Top Pages
            </h3>
            <div className="space-y-4">
              {getTopEntries(stats.topPages, 8).map(([path, count]) => (
                <div key={path} className="flex items-center justify-between">
                  <div className="truncate text-sm pr-4">{path}</div>
                  <div className="flex items-center gap-4 text-sm w-32 justify-end">
                    <span className="text-white font-medium">{count}</span>
                    <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-rose-500/50 rounded-full"
                        style={{ width: `${Math.min(100, (count / (dateRange === "today" ? stats.todayViews : stats.totalViews)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {Object.keys(stats.topPages).length === 0 && !loading && (
                <p className="text-neutral-500 text-sm">No data available</p>
              )}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-neutral-900/30 border border-neutral-800 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-neutral-400" /> Referrers
            </h3>
            <div className="space-y-4">
              {getTopEntries(stats.referrers, 8).map(([source, count]) => (
                <div key={source} className="flex items-center justify-between text-sm">
                  <span className="text-neutral-300">{source}</span>
                  <span className="text-white font-medium bg-neutral-800 px-2 py-0.5 rounded-md">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Countries */}
          <div className="bg-neutral-900/30 border border-neutral-800 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-neutral-400" /> Countries
            </h3>
            <div className="space-y-4">
              {getTopEntries(stats.countries, 6).map(([country, count]) => (
                <div key={country} className="flex items-center justify-between text-sm">
                  <span className="text-neutral-300">{country}</span>
                  <span className="text-white font-medium bg-neutral-800 px-2 py-0.5 rounded-md">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Devices */}
          <div className="bg-neutral-900/30 border border-neutral-800 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-neutral-400" /> Devices
            </h3>
            <div className="space-y-4 mt-6">
              {["mobile", "desktop", "tablet"].map(device => {
                const count = stats.devices[device] || 0;
                const total = dateRange === "today" ? stats.todayViews : stats.totalViews;
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={device} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize text-neutral-300">{device}</span>
                      <span className="text-white font-medium">{percentage}% ({count})</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500/50 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
