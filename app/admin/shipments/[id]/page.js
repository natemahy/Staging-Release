'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/app/components/Header'
import { getShipmentById, addComment, saveShipmentChanges } from '@/app/actions'
import { ArrowLeft, Send, Save, AlertTriangle, ShieldCheck, FileText, Camera, User, Hash, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function AdminShipmentDetails() {
  const params = useParams()
  const [data, setData] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    getShipmentById(params.id).then(setData)
  }, [params.id])

  if (!data) return <div className="p-10 text-center font-bold text-slate-500">Loading shipment...</div>
  const { shipment, comments } = data

  if (!shipment) return <div className="p-10 text-center font-bold text-red-500">Shipment record not found.</div>

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
        
        <Link href="/admin/shipments" className="flex items-center gap-2 text-slate-500 hover:text-purple-600 mb-6 font-medium">
          <ArrowLeft size={18} /> Back to Shipment List
        </Link>

        <form onSubmit={handleSave}>
          <input type="hidden" name="id" value={shipment.id} />
          <input type="hidden" name="role" value="admin" />

          {/* --- ADMIN MASTER CONTROLS --- */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-purple-100 mb-6">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-purple-600" />
                <h2 className="text-lg font-bold text-slate-900">Admin Master Controls</h2>
              </div>
              <button disabled={isSaving} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 flex items-center gap-2 shadow-md transition-all">
                <Save size={18} /> {isSaving ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vendor Status</label>
                <select name="status" defaultValue={shipment.status} className="w-full p-2 border rounded bg-slate-50 text-gray-900 font-bold focus:ring-2 focus:ring-purple-500">
                  <option value="Received">Received</option>
                  <option value="Complete">Complete</option>
                  <option value="Invoiced">Invoiced</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Customer Approval</label>
                <select name="company_status" defaultValue={shipment.company_status || ''} className="w-full p-2 border rounded bg-slate-50 text-gray-900 font-bold focus:ring-2 focus:ring-purple-500">
                  <option value="">Pending Review</option>
                  <option value="Need Delivered">Need Delivered</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Inspection Result</label>
                <select name="company_inspection" defaultValue={shipment.company_inspection || ''} className="w-full p-2 border rounded bg-slate-50 text-gray-900 font-bold focus:ring-2 focus:ring-purple-500">
                  <option value="">Pending</option>
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            
            {/* COLUMN 1: MAIN DATA (ALL EDITABLE) */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Customer Info */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2 border-b pb-2">
                  <User className="text-blue-500" size={20} /> Customer Info
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 uppercase font-bold mb-1">Customer Name</label>
                    <div className="p-3 border rounded bg-slate-100 text-gray-900 font-bold">
                      {shipment.company_name}
                    </div>
                  </div>
                  <div>
                     <label className="block text-xs text-slate-500 uppercase font-bold mb-1">Delivery Date</label>
                     <div className="relative">
                       <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
                       <input 
                          type="date" 
                          name="delivery_date" 
                          defaultValue={shipment.delivery_date ? new Date(shipment.delivery_date).toISOString().split('T')[0] : ''} 
                          className="w-full pl-10 p-2 border rounded bg-white text-gray-900 font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                       />
                     </div>
                  </div>
                </div>
              </div>

              {/* Shipment Details */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2 border-b pb-2">
                  <Hash className="text-blue-500" size={20} /> Shipment Details
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <InputBox label="Custom / Original ID #" name="original_id_number" val={shipment.original_id_number} />
                  <InputBox label="PO Number" name="po_number" val={shipment.po_number} />
                  
                  <InputBox label="Part Number" name="part_number" val={shipment.part_number} />
                  <InputBox label="Qty Received" name="qty_received" val={shipment.qty_received} />
                  
                  <InputBox label="Package Type" name="package_type" val={shipment.package_type} />
                  <InputBox label="Supplier Name" name="supplier_name" val={shipment.supplier_name} />
                  
                  <InputBox label="Location" name="supplier_location" val={shipment.supplier_location} />
                  <InputBox label="Warehouse Placement" name="warehouse_placement" val={shipment.warehouse_placement} />
                  
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-500 uppercase font-bold mb-1">Warehouse Column Cell</label>
                    <select name="warehouse_column_cell" defaultValue={shipment.warehouse_column_cell} className="w-full p-2 border rounded bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none">
                        <option value="Heil G2 Sanders">Heil G2 Sanders</option>
                        <option value="Main Warehouse">Main Warehouse</option>
                        <option value="Holding Area">Holding Area</option>
                        <option value="Staging Lane A">Staging Lane A</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: DISCUSSION & DOCS */}
            <div className="space-y-6">
              {/* PDF SECTION */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><FileText size={20}/> Documents</h3>
                {shipment.pdf_submission ? (
                  <a href={shipment.pdf_submission} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 border rounded-lg bg-red-50 text-red-700 font-bold hover:bg-red-100 transition-colors">
                    <FileText size={18}/> Download PDF
                  </a>
                ) : <p className="text-slate-400 text-sm italic">No PDF attached.</p>}
              </div>

              {/* COMMENTS */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4">Discussion</h3>
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
                  <input name="message" required placeholder="Add note..." className="flex-1 border rounded px-3 py-2 text-sm text-gray-900" />
                  <button className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"><Send size={16}/></button>
                </form>
              </div>
            </div>
          </div>
        </form>

        {/* --- PHOTO GALLERY --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-6">
           <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-xl border-b pb-4">
             <Camera className="text-blue-500" /> Photo Gallery
           </h3>
           
           <div className="space-y-8">
             <PhotoSection title="Shipment Overview" photos={shipment.shipment_photos} />
             <PhotoSection title="Packing Slips" photos={shipment.packing_slip_photos} />
             <PhotoSection title="Dimensional Reports" photos={shipment.dimensional_report_photos} />
             
             {shipment.quality_check === 'Damaged' && (
               <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                 <div className="flex items-center gap-2 text-red-700 font-bold mb-4">
                   <AlertTriangle /> Damaged Goods Evidence
                 </div>
                 <PhotoSection title="" photos={shipment.damaged_photos} />
               </div>
             )}
           </div>
        </div>

      </main>
    </div>
  )
}

// --- HELPER COMPONENTS ---

function InputBox({ label, name, val }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 uppercase font-bold mb-1">{label}</label>
      <input 
        name={name} 
        defaultValue={val} 
        className="w-full p-2 border rounded bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none"
      />
    </div>
  )
}

function PhotoSection({ title, photos }) {
  if (!photos || photos.length === 0) return null
  return (
    <div>
      {title && <h4 className="text-sm font-bold text-slate-500 uppercase mb-3">{title}</h4>}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {photos.map((url, i) => (
          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="group relative block overflow-hidden rounded-lg border shadow-sm aspect-square hover:ring-2 hover:ring-blue-500">
            <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
          </a>
        ))}
      </div>
    </div>
  )
}