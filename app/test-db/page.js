export const dynamic = 'force-dynamic';

import { neon } from '@neondatabase/serverless';

export default async function TestDBPage() {
  let message = "Testing Connection...";
  let color = "text-yellow-500";
  let envStatus = "Unknown";

  try {
    // 1. Check if Vercel sees the Secret Key
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is MISSING from Environment Variables");
    }
    envStatus = "Found";

    // 2. Try to Connect
    const sql = neon(process.env.DATABASE_URL);
    const response = await sql`SELECT version()`;
    
    message = "SUCCESS: Connected to Neon DB!";
    color = "text-green-500";
    envStatus = `Connected. Version: ${response[0].version}`;

  } catch (error) {
    message = `CRASH: ${error.message}`;
    color = "text-red-600";
    envStatus = process.env.DATABASE_URL ? "Variable Exists (But Connection Failed)" : "Variable Missing";
  }

  return (
    <div className="p-10 font-mono">
      <h1 className="text-2xl font-bold mb-4">Diagnostic Report</h1>
      
      <div className="p-4 border rounded mb-4">
        <p className="font-bold">Database Variable Status:</p>
        <p>{envStatus}</p>
      </div>

      <div className={`p-4 border rounded font-bold ${color}`}>
        {message}
      </div>
    </div>
  );
}