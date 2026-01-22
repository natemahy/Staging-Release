'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Package, Truck, CheckCircle, AlertTriangle } from 'lucide-react'
import { getDashboardStats } from '@/app/actions'
import Header from '@/app/components/Header'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getDashboardStats('admin', null).then(setStats)
  }, [])

  if (!stats) return <div className="p-10 text-center font-bold text-slate-500">Loading Dashboard Data...</div>

  return (
    <div className="min-h-screen bg-slate-50">
      <Header role="admin" />
      
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* CLICKABLE STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/admin/shipments?filter=Active">
            <StatCard 
              title="Active Inventory" 
              value={stats.active} 
              icon={<Package className="text-blue-600" />} 
              color="bg-blue-50 border-blue-100 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer" 
            />
          </Link>
          
          <Link href="/admin/shipments?filter=Need Delivered">
            <StatCard 
              title="Need Delivered" 
              value={stats.needDelivered} 
              icon={<Truck className="text-orange-600" />} 
              color="bg-orange-50 border-orange-100 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer" 
            />
          </Link>

           <Link href="/admin/shipments?filter=Damaged">
            <StatCard 
              title="Damaged / Issues" 
              value={stats.damaged} 
              icon={<AlertTriangle className="text-red-600" />} 
              color="bg-red-50 border-red-100 hover:border-red-300 hover:shadow-md transition-all cursor-pointer" 
            />
          </Link>
          
          <Link href="/admin/shipments?filter=Invoiced">
            <StatCard 
              title="Total Invoiced (6mo)" 
              value={stats.invoiced} 
              icon={<CheckCircle className="text-slate-600" />} 
              color="bg-slate-100 border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer" 
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* REAL DATA CHART */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Monthly Shipment Volume</h3>
            {stats.graph.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.graph}>
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="total" fill="#7c3aed" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400 italic">
                No data available for graph yet.
              </div>
            )}
          </div>

          {/* RECENT COMMENTS FEED */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Comments</h3>
            <div className="space-y-4">
              {stats.comments.map((c, i) => (
                <Link 
                  href={`/admin/shipments/${c.shipment_id}`} 
                  key={i} 
                  className="block p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-purple-50 hover:border-purple-200 transition-colors group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-purple-600 group-hover:text-purple-700">
                      {c.email.split('@')[0]}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* Context Row: Company & PO */}
                  <div className="flex gap-2 text-xs font-bold text-slate-600 mb-2">
                    <span className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">{c.company_name || 'Unassigned'}</span>
                    <span className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">PO: {c.po_number || 'N/A'}</span>
                  </div>

                  <p className="text-sm text-slate-700 line-clamp-2">"{c.message}"</p>
                </Link>
              ))}
              {stats.comments.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-4">No recent comments.</p>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className={`p-6 rounded-xl border ${color} shadow-sm`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-500 font-medium text-sm">{title}</span>
        {icon}
      </div>
      <div className="text-3xl font-bold text-slate-800">{value}</div>
    </div>
  )
}