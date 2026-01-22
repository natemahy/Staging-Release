'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { getShipments } from '@/app/actions'
import Header from '@/app/components/Header'

export default function VendorShipments() {
  const [data, setData] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const initialFilter = searchParams.get('filter')

  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' })

  useEffect(() => {
    getShipments('vendor').then(serverData => {
      setData(serverData)
      if (initialFilter) setSearch(initialFilter === 'Active' ? '' : initialFilter)
      setLoading(false)
    })
  }, [initialFilter])

  // --- SORT & FILTER LOGIC ---
  const filteredData = useMemo(() => {
    let processed = [...data]

    if (initialFilter === 'Active' && search === '') {
      processed = processed.filter(item => item.status !== 'Invoiced')
    }
    else if (search) {
      const lowerSearch = search.toLowerCase()
      processed = processed.filter(item => 
        Object.values(item).some(val => 
          String(val).toLowerCase().includes(lowerSearch)
        )
      )
    }

    if (sortConfig.key) {
      processed.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return processed
  }, [data, search, sortConfig, initialFilter])

  const requestSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const SortableHeader = ({ label, sortKey }) => (
    <th 
      onClick={() => requestSort(sortKey)} 
      className="p-4 text-left font-bold text-slate-500 uppercase text-xs cursor-pointer hover:bg-slate-100 hover:text-blue-600 transition-colors select-none"
    >
      <div className="flex items-center gap-1">
        {label}
        {sortConfig.key === sortKey ? (
          sortConfig.direction === 'asc' ? <ArrowUp size={14}/> : <ArrowDown size={14}/>
        ) : (
          <ArrowUpDown size={14} className="text-slate-300"/>
        )}
      </div>
    </th>
  )

  if (loading) return <div className="p-10 text-center text-slate-500">Loading shipments...</div>

  return (
    <div className="min-h-screen bg-slate-50">
      <Header role="vendor" />
      
      <main className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Shipment History</h1>
          <Link href="/vendor/check-in" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md">
            + New Check-In
          </Link>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by PO, Part #, Status..." 
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {initialFilter && (
            <button onClick={() => window.location.href = '/vendor/shipments'} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-red-500 bg-slate-100 rounded-lg">
              Clear Filter: {initialFilter}
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <SortableHeader label="Date" sortKey="delivery_date" />
                  <SortableHeader label="Company" sortKey="company_name" />
                  <SortableHeader label="PO Number" sortKey="po_number" />
                  <SortableHeader label="Part #" sortKey="part_number" />
                  <SortableHeader label="Qty" sortKey="qty_received" />
                  <SortableHeader label="My Status" sortKey="status" />
                  <SortableHeader label="Cust. Approval" sortKey="company_status" />
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm text-slate-600 font-medium">{new Date(s.delivery_date).toLocaleDateString()}</td>
                    <td className="p-4 text-sm font-bold text-slate-900">{s.company_name}</td>
                    <td className="p-4 text-sm text-slate-600">{s.po_number}</td>
                    <td className="p-4 text-sm text-slate-600">{s.part_number}</td>
                    <td className="p-4 text-sm text-slate-600">{s.qty_received}</td>
                    
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        s.status === 'Received' ? 'bg-blue-100 text-blue-700' : 
                        s.status === 'Complete' ? 'bg-green-100 text-green-700' : 
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-4">
                       <span className={`text-xs font-bold px-2 py-1 rounded ${
                         s.company_status === 'Need Delivered' ? 'bg-orange-100 text-orange-700' :
                         s.company_status === 'Delivered' ? 'bg-green-100 text-green-700' :
                         'bg-slate-100 text-slate-500'
                       }`}>
                         {s.company_status || 'Pending'}
                       </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/vendor/shipments/${s.id}`} className="text-blue-600 font-bold text-sm hover:underline">
                        Details &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                   <tr>
                     <td colSpan="8" className="p-8 text-center text-slate-400">No shipments found.</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  )
}