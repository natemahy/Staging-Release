'use client'

import { useState, useEffect } from 'react'
import { Camera, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react'
import { submitShipment, getCompanies } from '@/app/actions'
import Header from '@/app/components/Header'
import Link from 'next/link'

export default function AdminAddShipment() {
  const [status, setStatus] = useState('idle')
  const [isDamaged, setIsDamaged] = useState(false)
  const [companies, setCompanies] = useState([])

  useEffect(() => {
    getCompanies().then(setCompanies)
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('submitting')
    const formData = new FormData(event.currentTarget)
    formData.append('submitted_by', '1') 

    try {
      await submitShipment(formData)
      setStatus('success')
    } catch (e) {
      console.error(e)
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header role="admin" />
        <div className="flex flex-col items-center justify-center h-[80vh] p-6">
          <CheckCircle className="w-20 h-20 text-green-600 mb-4" />
          <h2 className="text-2xl font-bold text-green-800">Shipment Logged Successfully!</h2>
          <div className="flex gap-4 mt-8">
            <button onClick={() => window.location.reload()} className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-green-700">
              Log Another
            </button>
            <Link href="/admin/dashboard" className="bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-semibold hover:bg-slate-300">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header role="admin" />

      <div className="max-w-md mx-auto mt-6 px-4">
        
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-4 font-medium">
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>

        <div className="bg-purple-900 p-4 rounded-t-xl shadow-md">
           <h1 className="text-white text-xl font-bold">Admin Manual Entry</h1>
           <p className="text-purple-200 text-xs">Manually logging a shipment on behalf of a vendor.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-white shadow-sm rounded-b-xl border border-t-0">
          
          <div className="bg-slate-50 p-3 rounded-lg border">
            <label className="text-xs text-gray-500 uppercase font-bold">Date Entered</label>
            <div className="text-gray-900 font-bold">{new Date().toLocaleDateString()}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner / Customer</label>
            <select name="company_id" required className="w-full p-3 border rounded-lg bg-white text-gray-900 font-bold focus:ring-2 focus:ring-purple-500 outline-none">
              <option value="">-- Select Company --</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.code_prefix})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
            <input type="date" name="delivery_date" required className="w-full p-3 border rounded-lg bg-white text-gray-900" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PO #</label>
              <input type="text" name="po_number" placeholder="PO-123" className="w-full p-3 border rounded-lg text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Part #</label>
              <input type="text" name="part_number" placeholder="PN-ABC" className="w-full p-3 border rounded-lg text-gray-900" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
            <input type="text" name="supplier_name" className="w-full p-3 border rounded-lg text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Location</label>
            <input type="text" name="supplier_location" className="w-full p-3 border rounded-lg text-gray-900" />
          </div>

          {/* NEW FIELDS ADDED HERE */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse Column Cell</label>
              <select name="warehouse_column_cell" defaultValue="Heil G2 Sanders" className="w-full p-3 border rounded-lg bg-white text-gray-900">
                <option value="Heil G2 Sanders">Heil G2 Sanders</option>
                <option value="Main Warehouse">Main Warehouse</option>
                <option value="Holding Area">Holding Area</option>
                <option value="Staging Lane A">Staging Lane A</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original ID #</label>
              <input type="text" name="original_id_number" placeholder="Enter ID..." className="w-full p-3 border rounded-lg text-gray-900" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Package Type</label>
              <select name="package_type" className="w-full p-3 border rounded-lg bg-white text-gray-900">
                <option>Boxes</option>
                <option>Pallets</option>
                <option>Individual</option>
                <option>Crates</option>
                <option>Racks</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qty Received</label>
              <input type="number" name="qty_received" defaultValue="1" className="w-full p-3 border rounded-lg text-gray-900" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse Placement</label>
            <input type="text" name="warehouse_placement" placeholder="e.g. A-12-B" className="w-full p-3 border rounded-lg text-gray-900" />
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quality of Shipment</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 p-3 border rounded-lg flex-1 cursor-pointer bg-white has-[:checked]:bg-green-50 has-[:checked]:border-green-500">
                <input type="radio" name="quality_check" value="Good" defaultChecked onChange={() => setIsDamaged(false)} />
                <span className="font-medium text-gray-900">Good</span>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded-lg flex-1 cursor-pointer bg-white has-[:checked]:bg-red-50 has-[:checked]:border-red-500">
                <input type="radio" name="quality_check" value="Damaged" onChange={() => setIsDamaged(true)} />
                <span className="font-medium text-red-600">Damaged</span>
              </label>
            </div>

            {isDamaged && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 text-red-700 mb-2">
                  <AlertTriangle size={18} />
                  <span className="text-sm font-bold">Damage Evidence Required</span>
                </div>
                <input type="file" name="damaged_photos" multiple accept="image/*" className="w-full text-sm text-gray-900" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <FileUpload label="Packing Slip" name="packing_slip_photos" />
            <FileUpload label="Dimensional Report" name="dimensional_report_photos" />
            <FileUpload label="Shipment Overview" name="shipment_photos" />
          </div>

          <button 
            type="submit" 
            disabled={status === 'submitting'}
            className="w-full bg-purple-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg hover:bg-purple-700 transition-colors"
          >
            {status === 'submitting' ? 'Submitting...' : 'Log Shipment'}
          </button>

        </form>
      </div>
    </div>
  )
}

function FileUpload({ label, name }) {
  return (
    <div className="bg-slate-50 p-3 rounded-lg border">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <Camera className="text-gray-400" size={20} />
        <input type="file" name={name} multiple accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
      </div>
    </div>
  )
}