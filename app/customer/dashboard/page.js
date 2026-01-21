'use client'
import { useEffect, useState } from 'react'
import Header from '@/app/components/Header'
import { getDashboardStats } from '@/app/actions'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { MessageSquare, AlertCircle } from 'lucide-react'

export default function CustomerDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    // Hardcoded company ID for demo. In real app, we get this from the session cookie!
    getDashboardStats('customer', 1).then(setStats)
  }, [])

  if (!stats) return <div className="p-8">Loading Dashboard...</div>

  // Data for Graphs
  const barData = [
    { name: 'Active', value: parseInt(stats.active) },
    { name: 'Delivered', value: parseInt(stats.needDelivered) },
    { name: 'Complete', value: parseInt(stats.readyToInvoice) },
  ]
  const pieData = [
    { name: 'Good', value: 100 }, // Placeholder logic
    { name: 'Damaged', value: parseInt(stats.damaged) },
  ]
  const COLORS = ['#22c55e', '#ef4444']

  return (
    <div className="min-h-screen bg-slate-50">
      <Header role="customer" />
      
      <main className="max-w-7xl mx-auto p-8 space-y-8">
        
        {/* TOP METRICS BOXES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatBox label="Active Records" value={stats.active} color="bg-blue-600" />
          <StatBox label="Need Delivered" value={stats.needDelivered} color="bg-orange-500" />
          <StatBox label="Complete (Ready)" value={stats.readyToInvoice} color="bg-green-600" />
          <StatBox label="Invoiced (6mo)" value={stats.invoiced} color="bg-purple-600" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* GRAPH 1: Shipment Status */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 col-span-2">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Shipment Overview</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GRAPH 2: Damage Report */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-red-500"/> Damage Ratio
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center mt-2 text-sm text-slate-500">
                <span className="text-red-500 font-bold">{stats.damaged}</span> items flagged damaged
              </div>
            </div>
          </div>

        </div>

        {/* RECENT COMMENTS SECTION */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <MessageSquare className="text-slate-400"/> Recent Comments
          </h3>
          <div className="space-y-4">
            {stats.comments.length === 0 ? (
              <p className="text-slate-400 italic">No recent discussions.</p>
            ) : (
              stats.comments.map((c, i) => (
                <div key={i} className="flex gap-4 p-3 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                    {c.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{c.email}</p>
                    <p className="text-sm text-slate-600">{c.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(c.created_at).toLocaleDateString()}</p>
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
    <div className={`${color} p-6 rounded-xl shadow-lg text-white`}>
      <p className="text-sm opacity-90 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-4xl font-bold mt-2">{value}</p>
    </div>
  )
}