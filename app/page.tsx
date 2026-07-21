// app/page.tsx
"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/src/utils/supabase/client"

export default function LandingPage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()
  }, [])

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500/30 selection:text-amber-200 relative overflow-hidden">
      
      {/* 🔮 Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-amber-500/10 via-amber-600/5 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-amber-500/5 blur-[100px] pointer-events-none -z-10" />

      {/* Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-neutral-950/70 border-b border-neutral-800/80 transition-all">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-mono font-bold text-neutral-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              ⚡
            </div>
            <span className="font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
              ChronoHost<span className="text-amber-500">.</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-mono text-neutral-400">
            <a href="#features" className="hover:text-amber-400 transition-colors">FEATURES</a>
            <a href="#workflow" className="hover:text-amber-400 transition-colors">WORKFLOW</a>
            <a href="#calendar" className="hover:text-amber-400 transition-colors">CALENDAR_SYNC</a>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <Link
                href="/dashboard"
                className="text-xs bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-4 py-2 rounded-lg transition-all shadow-md shadow-amber-500/10 flex items-center gap-1.5"
              >
                <span>🚀</span> Go to Dashboard
              </Link>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-xs text-neutral-300 hover:text-white px-3 py-2 transition-colors font-mono"
                >
                  Log In
                </Link>
                <Link
                  href="/login"
                  className="text-xs bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-4 py-2 rounded-lg transition-all shadow-md shadow-amber-500/10"
                >
                  Get Started →
                </Link>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center space-y-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-[11px] font-mono animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>v2.0 Architecture Live • Zero Latency Calendar Sync</span>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Monetize & Control Your Time with <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">Precision</span>.
          </h1>
          <p className="text-sm md:text-base text-neutral-400 font-normal leading-relaxed max-w-xl mx-auto">
            The next-generation personal dating & 1-on-1 availability protocol. Host custom slot menus, screen applications, and sync effortlessly with Google & Apple Calendars.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href={user ? "/dashboard" : "/login"}
            className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <span>⚡ Claim Your Personal Link</span>
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
          >
            Explore Features
          </a>
        </div>

        {/* Live Mockup Box */}
        <div className="pt-12">
          <div className="relative mx-auto max-w-4xl rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-2 backdrop-blur-xl shadow-2xl shadow-black">
            <div className="flex items-center space-x-2 px-3 py-2 border-b border-neutral-800/60">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="text-[10px] font-mono text-neutral-500 ml-2">chronohost.app/dashboard</span>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                <div className="text-[10px] font-mono text-amber-500 uppercase">⚡ Active Menus</div>
                <div className="text-sm font-bold text-white">Coffee & Brainstorm</div>
                <div className="text-[11px] text-neutral-500">⏱️ 45m | 💳 Host Treat</div>
              </div>

              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                <div className="text-[10px] font-mono text-emerald-400 uppercase">📅 Upcoming Slot</div>
                <div className="text-sm font-bold text-white">Jul 22, 02:30 PM</div>
                <div className="text-[11px] text-emerald-400/80">✓ Confirmed • Calendar Synced</div>
              </div>

              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                <div className="text-[10px] font-mono text-amber-400 uppercase">📥 Application Inbox</div>
                <div className="text-sm font-bold text-white">1 Pending Vetting</div>
                <div className="text-[11px] text-neutral-400">Guest: Alex (@alex_design)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 border-t border-neutral-900">
        <div className="text-center space-y-2 mb-16">
          <h2 className="text-xs font-mono text-amber-500 uppercase tracking-widest">Architected for Speed</h2>
          <p className="text-2xl md:text-3xl font-bold text-white">Everything you need to manage availability.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-neutral-900/40 border border-neutral-800/80 rounded-2xl space-y-3 hover:border-amber-500/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-lg">
              🎯
            </div>
            <h3 className="text-sm font-bold text-white">Dating & Session Menus</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Define custom terms, billing policies (AA, Host Treat, Guest Treat), and slot durations tailored to your rules.
            </p>
          </div>

          <div className="p-6 bg-neutral-900/40 border border-neutral-800/80 rounded-2xl space-y-3 hover:border-amber-500/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-lg">
              🛡️
            </div>
            <h3 className="text-sm font-bold text-white">Smart Guest Vetting</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Filter incoming applications with mandatory social profile verification and vetting questions before accepting.
            </p>
          </div>

          <div className="p-6 bg-neutral-900/40 border border-neutral-800/80 rounded-2xl space-y-3 hover:border-amber-500/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-lg">
              📅
            </div>
            <h3 className="text-sm font-bold text-white">Universal Calendar Export</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Export confirmed meetings seamlessly into Google Calendar, Apple Calendar, or Outlook via native .ics format.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-8 text-center text-[11px] text-neutral-600 font-mono">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>© {new Date().getFullYear()} ChronoHost. All rights reserved.</div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-neutral-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-neutral-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-neutral-400 transition-colors">System Status</a>
          </div>
        </div>
      </footer>

    </div>
  )
}