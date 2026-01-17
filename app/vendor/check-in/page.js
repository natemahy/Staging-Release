'use client'

import { useState } from 'react'
import { Camera, CheckCircle, AlertTriangle } from 'lucide-react'
import { submitShipment } from '@/app/actions'
import Header from '@/app/components/Header' // <--- IMPORTED HERE

export default function VendorCheckIn() {
  const [status, setStatus] = useState('idle')
  const [isDamaged, setIsDamaged] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('submitting')
    const formData = new FormData(event.currentTarget)
    formData.append('submitted_by', 'Current_User_ID_Here') 

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
        <Header role="vendor" /> {/* <--- ADDED HERE */}
        <div className="flex flex-col items-center justify-center h-[80vh] p-6">
          <CheckCircle className="w-20 h-20 text-green-600 mb-4" />
          <h2 className="text-2xl font-bold text-green-800">Check-In Complete!</h2>
          <button onClick={() => window.location.reload()} className="mt-8 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg">Check In Another Item</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Replaced the old static blue bar with the real Menu */}
      <Header role="vendor" /> 

      <div className="max-w-md mx-auto mt-6">
        <div className="bg-blue-900 p-4 rounded-t-xl shadow-md">
           <h1 className="text-white text-xl font-bold">New Shipment Entry</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-white shadow-sm rounded-b-xl border border-t-0">
          
          <div className="bg-slate-50 p-3 rounded-lg border">
            <label className="text-xs text-gray-500 uppercase font-bold">Date Entered</label>
            <div className="text-gray-900 font-bold">{new Date().toLocaleDateString()}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
            <input type="date" name="delivery_date" required className="w-full p-3 border rounded-lg bg-white text-gray-900" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <select name="company_id" required className="w-full p-3 border rounded-lg bg-white text-gray-900">
              <option value="">Select Company...</option>
              <option value="1">G2 Supply</option>
              <option value="2">Tesla</option>
              <option value="3">SpaceX</option>
            </select>
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
            className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform"
          >
            {status === 'submitting' ? 'Submitting...' : 'Submit Check-In'}
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
        <input type="file" name={name} multiple accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
      </div>
    </div>
  )
}