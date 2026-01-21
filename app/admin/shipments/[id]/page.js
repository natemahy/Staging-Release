'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/app/components/Header'
import { getShipmentById, addComment, saveShipmentChanges } from '@/app/actions'
import { ArrowLeft, Send, Save, AlertTriangle, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function AdminShipmentDetails() {
  const params = useParams()
  const [data, setData] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    getShipmentById(params.id).then(setData)
  }, [params.id])

  if (!data) return <div className="p-8 text-center">Loading...</div>
  const { shipment, comments } = data

  async function handleSave(e) {
    e.preventDefault()
    setIsSaving(true)
    const formData = new FormData(e.currentTarget)
    await saveShipmentChanges(formData)
    setIsSaving(false)
    window.location.reload() 
  }

  async function handleComment(e) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await addComment(formData)
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header role="admin" />

      <main className="max-w-6xl mx-auto p-6">
        
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 font-medium">
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>

        {/* ONE GIANT FORM FOR EVERYTHING */}
        <form onSubmit={handleSave}>
          <input type="hidden" name="id" value={shipment.id} />
          <input type="hidden" name="role" value="admin" />

          {/* TOP CONTROLS */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-purple-100 mb-8">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-purple-600" />
                <h2 className="text-lg font-bold text-slate-900">Admin Controls</h2>
              </div>
              <button disabled={isSaving} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 flex items-center gap-2 shadow-md">
                <Save size={18} /> {isSaving ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vendor Status</label>
                <select name="status" defaultValue={shipment.status} className="w-full p-2 border rounded bg-slate-50 text-gray-900">
                  <option value="Received">Received</option>
                  <option value="Complete">Complete</option>
                  <option value="Invoiced">Invoiced</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Customer Approval</label>
                <select name="company_status" defaultValue={shipment.company_status || ''} className="w-full p-2 border rounded bg-slate-50 text-gray-900">
                  <option value="">Pending Review</option>
                  <option value="Need Delivered">Need Delivered</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Inspection</label>
                <select name="company_inspection" defaultValue={shipment.company_inspection || ''} className="w-full p-2 border rounded bg-slate-50 text-gray-900">
                  <option value="">Pending</option>
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>
          </div>

          {/* EDITABLE SHIPMENT DATA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-900 text-lg">Shipment Data (Editable)</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* NEW EDITABLE FIELDS */}
                <div>
                   <label className="block text-xs text-slate-500 uppercase font-bold mb-1">Warehouse Col Cell</label>
                   <select name="warehouse_column_cell" defaultValue={shipment.warehouse_column_cell} className="w-full p-2 border rounded bg-slate-50 text-gray-900 focus:bg-white outline-none">
                      <option value="Heil G2 Sanders">Heil G2 Sanders</option>
                      <option value="Main Warehouse">Main Warehouse</option>
                      <option value="Holding Area">Holding Area</option>
                      <option value="Staging Lane A">Staging Lane A</option>
                   </select>
                </div>
                <InputBox label="Original ID #" name="original_id_number" val={shipment.original_id_number} />

                {/* EXISTING FIELDS */}
                <InputBox label="PO Number" name="po_number" val={shipment.po_number} />
                <InputBox label="Part Number" name="part_number" val={shipment.part_number} />
                <InputBox label="Qty Received" name="qty_received" val={shipment.qty_received} />
                <InputBox label="Package Type" name="package_type" val={shipment.package_type} />
                <InputBox label="Supplier Name" name="supplier_name" val={shipment.supplier_name} />
                <InputBox label="Location" name="supplier_location" val={shipment.supplier_location} />
                <InputBox label="Warehouse Placement" name="warehouse_placement" val={shipment.warehouse_placement} />
                
                <div className="col-span-2 mt-2">
                   <p className="text-xs text-slate-400 uppercase font-bold mb-1">Quality Check (Photo Evidence)</p>
                   {shipment.quality_check === 'Damaged' ? (
                     <span className="flex items-center gap-2 text-red-600 font-bold bg-red-50 p-2 rounded"><AlertTriangle size={16}/> Marked as Damaged</span>
                   ) : (
                     <span className="text-green-600 font-bold bg-green-50 p-2 rounded">Marked as Good</span>
                   )}
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* COMMENTS SECTION */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
           <h3 className="font-bold text-slate-900 mb-4">Discussion Log</h3>
           <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
             {comments.map(c => (
               <div key={c.id} className="bg-slate-50 p-2 rounded border text-sm">
                 <p className="text-xs font-bold text-blue-600">{c.email}</p>
                 <p className="text-slate-700">{c.message}</p>
               </div>
             ))}
           </div>
           <form onSubmit={handleComment} className="flex gap-2">
             <input type="hidden" name="shipment_id" value={shipment.id} />
             <input name="message" required placeholder="Add a note..." className="flex-1 border rounded px-3 py-2 text-sm text-gray-900" />
             <button className="bg-blue-600 text-white p-2 rounded"><Send size={16}/></button>
           </form>
        </div>

        {/* IMAGES */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-slate-900 mb-4">Photos</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {shipment.damaged_photos?.map((url, i) => (
               <img key={i} src={url} className="w-full h-32 object-cover rounded border" />
             ))}
             {!shipment.damaged_photos && <p className="text-slate-400 text-sm">No photos available.</p>}
           </div>
        </div>

      </main>
    </div>
  )
}

function InputBox({ label, name, val }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 uppercase font-bold mb-1">{label}</label>
      <input 
        name={name} 
        defaultValue={val} 
        className="w-full p-2 border rounded bg-slate-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
      />
    </div>
  )
}