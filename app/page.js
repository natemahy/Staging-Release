import Link from 'next/link'
import { Package, Shield, Truck, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      
      {/* Navigation (Simple) */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Package className="text-blue-400" /> Receiving & Staging Portal
        </div>
        <Link href="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
          Log In
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-8">
        
        <div className="bg-blue-600/10 p-4 rounded-full border border-blue-500/30 mb-4 animate-in fade-in zoom-in duration-700">
           <Truck size={48} className="text-blue-400" />
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-3xl">
          Streamline Your <span className="text-blue-500">Supply Chain</span>.
        </h1>
        
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          The central hub for G2 Supply vendors and customers. Track shipments, manage inventory, and streamline quality control in one unified platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link 
            href="/login" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/50"
          >
            Access Portal <ArrowRight size={20} />
          </Link>
          
          <Link 
            href="/login?tab=register" 
            className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all border border-slate-700"
          >
            Register Account
          </Link>
        </div>

        {/* Feature Grid (Visual Filler) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 text-left max-w-5xl mx-auto pt-12 border-t border-slate-800 w-full">
          <FeatureBox 
            icon={<Truck className="text-blue-400" />} 
            title="Vendor Check-In" 
            desc="Streamlined digital logs for all incoming freight and packages." 
          />
          <FeatureBox 
            icon={<Shield className="text-purple-400" />} 
            title="Quality Control" 
            desc="Integrated damage reporting and dimensional verification." 
          />
          <FeatureBox 
            icon={<Package className="text-green-400" />} 
            title="Customer Staging" 
            desc="Real-time visibility for customers to track their staged inventory." 
          />
        </div>

      </main>

      {/* Footer */}
      <footer className="p-8 text-center text-slate-600 text-sm">
        &copy; {new Date().getFullYear()} Receiving & Staging Portal. Authorized Access Only.
      </footer>
    </div>
  )
}

function FeatureBox({ icon, title, desc }) {
  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
      <div className="mb-4">{icon}</div>
      <h3 className="font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{desc}</p>
    </div>
  )
}