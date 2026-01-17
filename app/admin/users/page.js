'use client'

import { useState, useEffect } from 'react'
import { Plus, User, Building, Shield, Briefcase } from 'lucide-react'
import { createUser, createCompany, getCompanies, getUsers } from '@/app/actions' // Added createCompany
import Header from '@/app/components/Header'

export default function AdminUserManagement() {
  const [companies, setCompanies] = useState([])
  const [users, setUsers] = useState([])
  
  const [userStatus, setUserStatus] = useState('idle')
  const [companyStatus, setCompanyStatus] = useState('idle')

  // Load data on page load
  useEffect(() => {
    refreshData()
  }, []) 

  function refreshData() {
    Promise.all([getCompanies(), getUsers()]).then(([companyData, userData]) => {
      setCompanies(companyData)
      setUsers(userData)
    })
  }

  // 1. Handle creating a new COMPANY
  async function handleAddCompany(e) {
    e.preventDefault()
    setCompanyStatus('submitting')
    
    const formData = new FormData(e.currentTarget)
    const result = await createCompany(formData)

    if (result.success) {
      setCompanyStatus('success')
      e.target.reset()
      refreshData() // Reload dropdowns instantly
      setTimeout(() => setCompanyStatus('idle'), 3000)
    } else {
      alert(result.message)
      setCompanyStatus('error')
    }
  }

  // 2. Handle creating a new USER
  async function handleAddUser(e) {
    e.preventDefault()
    setUserStatus('submitting')
    
    const formData = new FormData(e.currentTarget)
    const result = await createUser(formData)

    if (result.success) {
      setUserStatus('success')
      e.target.reset() 
      refreshData()
      setTimeout(() => setUserStatus('idle'), 3000)
    } else {
      alert(result.message)
      setUserStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header role="admin" />

      <div className="max-w-6xl mx-auto p-8 space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold text-slate-900">System Management</h1>
          <p className="text-slate-500">Register new client companies and assign users to them.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* CARD 1: ADD COMPANY */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
              <Briefcase className="text-purple-600" size={20}/> 1. Register New Company
            </h2>
            <form onSubmit={handleAddCompany} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company Name</label>
                <input name="name" required placeholder="e.g. Tesla Inc." className="w-full p-2 border rounded-lg bg-slate-50 text-gray-900 outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Short Code (Prefix)</label>
                <input name="code_prefix" required placeholder="e.g. TSL" maxLength="3" className="w-full p-2 border rounded-lg bg-slate-50 text-gray-900 outline-none focus:ring-2 focus:ring-purple-500 uppercase" />
              </div>
              <button disabled={companyStatus === 'submitting'} className="w-full bg-purple-600 text-white font-bold p-2 rounded-lg hover:bg-purple-700 transition-colors">
                {companyStatus === 'submitting' ? 'Saving...' : 'Create Company'}
              </button>
            </form>
            {companyStatus === 'success' && (
              <p className="text-green-600 text-sm mt-3 flex items-center gap-2 font-bold animate-in fade-in">
                <Shield size={16}/> Company Registered!
              </p>
            )}
          </div>

          {/* CARD 2: ADD USER */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
              <Plus className="text-blue-600" size={20}/> 2. Add New User
            </h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                <input name="email" type="email" required placeholder="user@company.com" className="w-full p-2 border rounded-lg bg-slate-50 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                  <select name="role" className="w-full p-2 border rounded-lg bg-slate-50 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="vendor">Vendor</option>
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assign Company</label>
                  <select name="company_id" className="w-full p-2 border rounded-lg bg-slate-50 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">-- Internal / None --</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button disabled={userStatus === 'submitting'} className="w-full bg-blue-600 text-white font-bold p-2 rounded-lg hover:bg-blue-700 transition-colors">
                {userStatus === 'submitting' ? 'Saving...' : 'Create User'}
              </button>
            </form>
            {userStatus === 'success' && (
              <p className="text-green-600 text-sm mt-3 flex items-center gap-2 font-bold animate-in fade-in">
                <Shield size={16}/> User created!
              </p>
            )}
          </div>

        </div>

        {/* USER LIST TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-700">All Registered Users</h3>
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
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
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
                    {user.password_hash ? (
                      <span className="text-green-600 font-bold text-xs flex items-center gap-1">
                        <Shield size={12}/> Active
                      </span>
                    ) : (
                      <span className="text-orange-500 text-xs italic">Pending Activation</span>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                 <tr><td colSpan="4" className="p-8 text-center text-slate-400">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}