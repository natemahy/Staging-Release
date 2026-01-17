'use client'

import { useState, useEffect } from 'react'
import Header from '@/app/components/Header'
import { getCompanies, getDashboardStats, getShipments } from '@/app/actions'
import { Users, Search, Eye, Building, AlertCircle, Filter, X } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [companies, setCompanies] = useState([])
  const [selectedCompany, setSelectedCompany] = useState('all') 
  const [stats, setStats] = useState(null)
  const [shipments, setShipments] = useState([])
  
  // FILTERS
  const [textFilter, setTextFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [companyFilter, setCompanyFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getCompanies()
      .then(data => {
        setCompanies(data || [])
        loadView('all')
      })
      .catch(err => {
        console.error("Failed to load companies", err)
        setError("Could not connect to database.")
        setLoading(false)
      })
  }, [])

  async function loadView(companyId) {
    setLoading(true)
    setSelectedCompany(companyId)
    setStats(null) 
    setError('')

    try {
      let s, rows;
      if (companyId === 'all') {
        s = await getDashboardStats('vendor', null)
        rows = await getShipments('vendor', null)
      } else {
        s = await getDashboardStats('customer', companyId)
        rows = await getShipments('customer', companyId)
      }

      setStats(s)
      setShipments(rows || [])
    } catch (err) {
      console.error("Dashboard Error:", err)
      setError("Failed to load dashboard data.")
    } finally {
      setLoading(false)
    }
  }

  // MASTER FILTER LOGIC
  const filteredShipments = (shipments || []).filter(s => {
    const matchesText = 
      (s.po_number || '').toLowerCase().includes(textFilter.toLowerCase()) ||
      (s.part_number || '').toLowerCase().includes(textFilter.toLowerCase()) ||
      (s.company_name || '').toLowerCase().includes(textFilter.toLowerCase());

    const rowDate = new Date(s.created_at).toISOString().split('T')[0];
    const matchesDate = dateFilter ? rowDate === dateFilter : true;
    const matchesCompany = companyFilter ? s.company_id == companyFilter : true;
    const matchesStatus = statusFilter ? s.status === statusFilter : true;

    return matchesText && matchesDate && matchesCompany && matchesStatus;
  });

  function clearFilters() {
    setTextFilter('')
    setDateFilter('')
    setCompanyFilter('')
    setStatusFilter('')
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header role="admin" />

      <main className="max-w-7xl mx-auto p-8 space-y-8">
        
        {/* TOP CONTROL BAR */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Control</h1>
            <p className="text-slate-500">Monitor activity and manage the system.</p>
          </div>
          
          <div className="flex gap-3">
            <Link href="/admin/users" className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-bold hover:bg-slate-50 shadow-sm">
              <Users size={18} /> Manage Users
            </Link>
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {/* THE "SPY GLASS" SWITCHER */}
        <div className="bg-slate-900 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="text-blue-400" />
            <h2 className="font-bold text-lg">View As...</h2>
          </div>
          
          <div className="flex gap-4 items-center">
            <p className="text-sm text-slate-400">Select Context:</p>
            <select 
              className="bg-slate-800 border border-slate-600 rounded-lg p-2 text-white font-medium outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCompany}
              onChange={(e) => loadView(e.target.value)}
            >
              <option value="all">Global Admin (See All)</option>
              <option disabled>──────────</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* DASHBOARD STATS */}
        {loading && !stats && <div className="text-center p-10 text-slate-500">Loading Dashboard...</div>}
        
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4">
            <StatBox label="Active Shipments" value={stats.active} color="bg-blue-600" />
            <StatBox label="Need Delivered" value={stats.needDelivered} color="bg-orange-500" />
            <StatBox label="Ready to Invoice" value={stats.readyToInvoice} color="bg-green-600" />
            {/* UPDATED LABEL BELOW (Was Damaged, Now Invoiced) */}
            <StatBox label="Invoiced (6mo)" value={stats.invoiced} color="bg-purple-600" />
          </div>
        )}

        {/* MASTER DATA TABLE & FILTERS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* FILTER BAR */}
          <div className="p-4 bg-slate-50 border-b space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Filter size={18} className="text-blue-600"/> 
                Filter Records
              </h3>
              {(textFilter || dateFilter || companyFilter || statusFilter) && (
                <button onClick={clearFilters} className="text-xs text-red-500 flex items-center gap-1 hover:underline font-bold">
                  <X size={14} /> Clear Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 1. Date Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date In</label>
                <input 
                  type="date" 
                  className="w-full p-2 border rounded-lg text-sm text-gray-900 bg-white"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>

              {/* 2. Company Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company</label>
                <select 
                  className="w-full p-2 border rounded-lg text-sm text-gray-900 bg-white"
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                >
                  <option value="">All Companies</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* 3. Status Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                <select 
                  className="w-full p-2 border rounded-lg text-sm text-gray-900 bg-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="Received">Received</option>
                  <option value="Complete">Complete</option>
                  <option value="Invoiced">Invoiced</option>
                </select>
              </div>

              {/* 4. Text Search */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 text-slate-400" size={16} />
                  <input 
                    className="w-full pl-8 pr-4 py-2 border rounded-lg text-sm outline-none focus:border-blue-500 text-gray-900"
                    placeholder="PO # or Part #..."
                    value={textFilter}
                    onChange={(e) => setTextFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-500 font-medium border-b">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Company</th>
                <th className="p-4">PO Number</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredShipments.slice(0, 50).map(row => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="p-4 text-gray-900">{new Date(row.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-blue-600 font-bold">{row.company_name}</td>
                  <td className="p-4 text-gray-900">{row.po_number}</td>
                  <td className="p-4">
                     <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        row.status === 'Invoiced' ? 'bg-purple-100 text-purple-700' :
                        row.status === 'Complete' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                     }`}>
                       {row.status}
                     </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/admin/shipments/${row.id}`} className="text-blue-600 hover:underline">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredShipments.length === 0 && !loading && (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">No records found matching filters.</td></tr>
              )}
            </tbody>
          </table>
          <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 border-t">
            Showing top 50 results
          </div>
        </div>

      </main>
    </div>
  )
}

function StatBox({ label, value, color }) {
  return (
    <div className={`${color} p-6 rounded-xl shadow-lg text-white`}>
      <p className="text-xs opacity-80 font-bold uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  )
}