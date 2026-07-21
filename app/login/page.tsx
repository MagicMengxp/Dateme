// app/login/page.tsx
"use client"
import { createClient } from '@/src/utils/supabase/client'

export default function LoginPage() {
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-sm w-full bg-neutral-900 border border-neutral-800 p-8 rounded-2xl text-center space-y-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Welcome to DateMe Menu</h1>
        <p className="text-xs text-neutral-400">Sign in to manage your public menus and calendar slots.</p>
        <button 
          onClick={handleGoogleLogin}
          className="w-full py-2.5 bg-white text-neutral-950 rounded-lg text-sm font-semibold hover:bg-neutral-200 transition"
        >
          Continue with Google
        </button>
      </div>
    </div>
  )
}