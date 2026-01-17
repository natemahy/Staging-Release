'use client'

import { useEffect, useState } from 'react'
import Header from '@/app/components/Header'
import { getShipments } from '@/app/actions'
import { Search, Eye, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from 'next/link' // <--- ADDED THIS IMPORT

export default function VendorShipments() {
  const [shipments, setShipments] = useState([])
  const [filter, setFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 1. Fetch shipments when page loads
    getShipments('vendor', null)
      .then(data => {
        setShipments(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error("Failed to load shipments", err)
        setIsLoading(false)
      })
  }, [])

  // 2. Search Logic
  const filtered = shipments.filter(s => 
    (s.part_number || '').toLowerCase().includes(filter.toLowerCase()) ||
    (s.po_number || '').toLowerCase().includes(filter.toLowerCase()) ||
    (s.company_name || '').toLowerCase().includes(filter.toLowerCase())
  )

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading Shipment Data...</div>

  return (
    <div className="min-h-screen bg-slate-50">
      <Header role="vendor" />

      <main className="max-w-7xl mx-auto p-8">
        
        {/* Page Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-slate-900">Shipment History</h1>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search PO, Part #, or Company..." 
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        {/* The Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b">
                <tr>
                  <th className="p-4 font-medium">Date In</th>
                  <th className="p-4 font-medium">Company</th>
                  <th className="p-4 font-medium">PO / Part #</th>
                  <th className="p-4 font-medium">Qty</th>
                  <th className="p-4 font-medium">Quality</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Company Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Date */}
                    <td className="p-4 text-gray-900">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>

                    {/* Company */}
                    <td className="p-4 font-medium text-blue-600">
                      {item.company_name || 'Unknown'}
                    </td>

                    {/* Details */}
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{item.po_number}</div>
                      <div className="text-xs text-slate-500">{item.part_number}</div>
                    </td>

                    {/* Qty */}
                    <td className="p-4 text-gray-900 font-medium">
                      {item.qty_received} <span className="text-xs text-slate-400 font-normal">{item.package_type}</span>
                    </td>

                    {/* Quality Check */}
                    <td className="p-4">
                      {item.quality_check === 'Damaged' ? (
                        <span className="flex items-center gap-1 text-red-600 font-bold bg-red-50 px-2 py-1 rounded-full w-fit text-xs">
                          <AlertTriangle size={12} /> Damaged
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full w-fit text-xs">
                          <CheckCircle size={12} /> Good
                        </span>
                      )}
                    </td>

                    {/* Vendor Status */}
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                        item.status === 'Invoiced' ? 'bg-purple-100 text-purple-700' :
                        item.status === 'Complete' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    {/* Company Status (Feedback) */}
                    <td className="p-4">
                      {item.company_status ? (
                         <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                           {item.company_status}
                         </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Pending...</span>
                      )}
                    </td>

                    {/* Actions Button - UPDATED HERE */}
                    <td className="p-4 text-right">
                      <Link 
                        href={`/vendor/shipments/${item.id}`} 
                        className="text-slate-400 hover:text-blue-600 transition-colors inline-block"
                      >
                        <Eye size={20} />
                      </Link>
                    </td>

                  </tr>
                ))}
                
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-400">
                      No shipments found matching your search.
                    </td>
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