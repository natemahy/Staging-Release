'use client'

import { useState } from 'react'
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { loginUser, activateAccount } from '@/app/actions'

export default function LoginPage() {
  const [isActivating, setIsActivating] = useState(false)
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')
    
    const formData = new FormData(e.currentTarget)
    const action = isActivating ? activateAccount : loginUser
    const result = await action(formData)

    if (result.success) {
      if (result.role === 'vendor') router.push('/vendor/check-in')
      else if (result.role === 'customer') router.push('/customer/dashboard')
      else if (result.role === 'admin') router.push('/admin/dashboard')
      else router.push('/')
    } else {
      setErrorMessage(result.message)
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            {isActivating ? 'Activate Account' : 'Welcome Back'}
          </h1>
          <p className="text-slate-500 text-sm">
            {isActivating 
              ? 'Enter the email your Admin assigned to set your password.' 
              : 'Please enter your details to sign in.'}
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => { setIsActivating(false); setErrorMessage(''); }}
            className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${!isActivating ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsActivating(true); setErrorMessage(''); }}
            className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${isActivating ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            First Time Here?
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle size={16} />
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
              {/* FIXED: Added text-gray-900 */}
              <input name="email" type="email" required className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" placeholder="name@company.com" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">
              {isActivating ? 'Create Password' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              {/* FIXED: Added text-gray-900 */}
              <input name="password" type="password" required className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" placeholder="••••••••" />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            {status === 'loading' ? 'Processing...' : (isActivating ? 'Activate & Login' : 'Sign In')}
            {!status === 'loading' && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t text-center text-xs text-slate-400 flex justify-center gap-2">
          <ShieldCheck size={14} /> Secure Portal
        </div>
      </div>
    </div>
  )
}