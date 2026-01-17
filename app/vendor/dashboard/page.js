'use client'
import { useEffect, useState } from 'react'
import Header from '@/app/components/Header'
import { getDashboardStats } from '@/app/actions'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { MessageSquare } from 'lucide-react'

export default function VendorDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    // Vendor sees all (pass null for companyId)
    getDashboardStats('vendor', null).then(setStats)
  }, [])

  if (!stats) return <div className="p-8">Loading Dashboard...</div>

  // Simple Trend Data (Mocked for visual)
  const trendData = [
    { name: 'Jan', items: 40 },
    { name: 'Feb', items: 30 },
    { name: 'Mar', items: 20 },
    { name: 'Apr', items: 27 },
    { name: 'May', items: 18 },
    { name: 'Jun', items: parseInt(stats.active) + 10 },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Header role="vendor" />
      
      <main className="max-w-7xl mx-auto p-8 space-y-8">
        
        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatBox label="Total Checked In" value={stats.active} color="bg-slate-800" />
          <StatBox label="Pending Delivery" value={stats.needDelivered} color="bg-orange-600" />
          <StatBox label="Need Invoicing" value={stats.readyToInvoice} color="bg-blue-600" />
          {/* UPDATED LABEL BELOW */}
          <StatBox label="Invoiced (6mo)" value={stats.invoiced} color="bg-green-600" />
        </div>

        {/* GRAPH: Incoming Volume */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Check-In Volume (Trend)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorItems" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="items" stroke="#3b82f6" fillOpacity={1} fill="url(#colorItems)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT COMMENTS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <MessageSquare className="text-slate-400"/> Recent Activity
          </h3>
          <div className="space-y-4">
             {stats.comments.length === 0 ? (
              <p className="text-slate-400 italic">No recent comments found.</p>
            ) : (
              stats.comments.map((c, i) => (
                <div key={i} className="flex gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                    {c.email.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">User: {c.email}</p>
                    <p className="text-sm text-slate-600">"{c.message}"</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  )
}

function StatBox({ label, value, color }) {
  return (
    <div className={`${color} p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform`}>
      <p className="text-xs opacity-80 font-bold uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  )
}