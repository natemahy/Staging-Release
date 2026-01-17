'use client'

import { useState, useEffect } from 'react'
import { Plus, User, Building, Shield } from 'lucide-react'
import { createUser, getCompanies, getUsers } from '@/app/actions'
import Header from '@/app/components/Header' // <--- IMPORT THIS

export default function AdminUserManagement() {
  const [companies, setCompanies] = useState([])
  const [users, setUsers] = useState([])
  const [status, setStatus] = useState('idle')

  // Load data when page opens
  useEffect(() => {
    Promise.all([getCompanies(), getUsers()]).then(([companyData, userData]) => {
      setCompanies(companyData)
      setUsers(userData)
    })
  }, [status]) 

  async function handleAddUser(e) {
    e.preventDefault()
    setStatus('submitting')
    
    const formData = new FormData(e.currentTarget)
    const result = await createUser(formData)

    if (result.success) {
      setStatus('success')
      e.target.reset() 
      setTimeout(() => setStatus('idle'), 3000)
    } else {
      alert(result.message)
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ADD THE NAV BAR HERE */}
      <Header role="admin" />

      <div className="max-w-4xl mx-auto space-y-8 p-8">
        
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500">Pre-register users and assign their company access.</p>
        </div>

        {/* CREATE USER CARD */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
            <Plus className="text-blue-600" size={20}/> Add New User
          </h2>
          
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
              <input name="email" type="email" required placeholder="user@example.com" className="w-full p-2 border rounded-lg bg-slate-50 text-gray-900" />
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
              <select name="role" className="w-full p-2 border rounded-lg bg-slate-50 text-gray-900">
                <option value="vendor">Vendor</option>
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company</label>
              <select name="company_id" className="w-full p-2 border rounded-lg bg-slate-50 text-gray-900">
                <option value="">-- Internal / None --</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code_prefix})</option>
                ))}
              </select>
            </div>

            <button disabled={status === 'submitting'} className="bg-blue-600 text-white font-bold p-2 rounded-lg hover:bg-blue-700 transition-colors">
              {status === 'submitting' ? 'Saving...' : 'Create User'}
            </button>
          </form>
          
          {status === 'success' && (
            <p className="text-green-600 text-sm mt-3 flex items-center gap-2">
              <Shield size={16}/> User created successfully!
            </p>
          )}
        </div>

        {/* USER LIST TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-700">Registered Users</h3>
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">{users.length} Total</span>
          </div>
          
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Assigned Company</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="p-4 flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                      <User size={16} />
                    </div>
                    <span className="font-medium text-gray-900">{user.email}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'customer' ? 'bg-green-100 text-green-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Building size={14} className="text-slate-400"/>
                      {user.company_name || 'Internal / All Access'}
                    </div>
                  </td>
                  <td className="p-4 text-slate-500">
                    {user.password_hash ? 'Active' : 'Waiting for Activation'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}