'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/app/components/Header'
import { getShipmentById, addComment, saveShipmentChanges } from '@/app/actions'
import { ArrowLeft, Send, Save, AlertTriangle, FileText } from 'lucide-react'
import Link from 'next/link'

export default function VendorShipmentDetails() {
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
      <Header role="vendor" />

      <main className="max-w-5xl mx-auto p-6">
        
        <Link href="/vendor/shipments" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 font-medium">
          <ArrowLeft size={18} /> Back to List
        </Link>

        <form onSubmit={handleSave}>
          <input type="hidden" name="id" value={shipment.id} />
          <input type="hidden" name="role" value="vendor" />

          {/* HEADER WITH SAVE BUTTON */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Shipment Details</h1>
            <button disabled={isSaving} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg">
              <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            
            {/* EDITABLE FIELDS */}
            <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-900 text-lg border-b pb-2">Shipment Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
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

                <InputBox label="PO Number" name="po_number" val={shipment.po_number} />
                <InputBox label="Part Number" name="part_number" val={shipment.part_number} />
                <InputBox label="Qty Received" name="qty_received" val={shipment.qty_received} />
                <InputBox label="Package Type" name="package_type" val={shipment.package_type} />
                <InputBox label="Supplier Name" name="supplier_name" val={shipment.supplier_name} />
                <InputBox label="Location" name="supplier_location" val={shipment.supplier_location} />
                <InputBox label="Warehouse Placement" name="warehouse_placement" val={shipment.warehouse_placement} />
                
                {/* STATUS DROPDOWN (Vendor Allowed) */}
                <div>
                  <label className="block text-xs text-slate-500 uppercase font-bold mb-1">My Status</label>
                  <select name="status" defaultValue={shipment.status} className="w-full p-2 border rounded bg-slate-50 text-gray-900 font-bold">
                    <option value="Received">Received</option>
                    <option value="Complete">Complete (Ready to Invoice)</option>
                    <option value="Invoiced">Invoiced</option>
                  </select>
                </div>
              </div>
            </div>

            {/* READ ONLY STATUS (Vendor cannot edit Customer Status) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 text-lg mb-4">Customer Status</h3>
              <div className="space-y-4">
                <DetailBox label="Company Status" value={shipment.company_status || 'Pending'} />
                <DetailBox label="Inspection Result" value={shipment.company_inspection || 'Pending'} />
              </div>
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg text-xs text-yellow-700">
                Only the customer or admin can update these fields.
              </div>
            </div>
          </div>
        </form>

        {/* PDF SECTION */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
           <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><FileText size={20}/> Attached Documents</h3>
           {shipment.pdf_submission ? (
             <a 
               href={shipment.pdf_submission} 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex items-center gap-3 p-4 border rounded-lg bg-red-50 border-red-100 hover:bg-red-100 transition-colors text-red-700 font-bold"
             >
               <FileText /> Download PDF Submission
             </a>
           ) : (
             <p className="text-slate-400 text-sm italic">No PDF attached.</p>
           )}
        </div>

        {/* COMMENTS SECTION */}
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
             <input name="message" required placeholder="Type a comment..." className="flex-1 border rounded px-3 py-2 text-sm text-gray-900" />
             <button className="bg-blue-600 text-white p-2 rounded"><Send size={16}/></button>
           </form>
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

function DetailBox({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400 uppercase font-bold mb-1">{label}</p>
      <p className="font-medium text-slate-900">{value || '-'}</p>
    </div>
  )
}