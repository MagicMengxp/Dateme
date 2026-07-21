// app/page.tsx
"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/src/utils/supabase/client"

export default function LandingPage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()
  }, [])

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500/30 selection:text-amber-200 relative overflow-hidden">
      
      {/* 🔮 Background Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-amber-500/10 via-amber-600/5 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-amber-500/5 blur-[100px] pointer-events-none -z-10" />

      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-neutral-950/80 border-b border-neutral-800/80 transition-all">
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
            <a href="#privacy" className="hover:text-amber-400 transition-colors">PRIVACY_PROMISE</a>
            {/*<a href="#workflow" className="hover:text-amber-400 transition-colors">HOW_IT_WORKS</a>*/}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <Link
                href="/dashboard"
                className="text-xs bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-4 py-2 rounded-lg transition-all shadow-md shadow-amber-500/10 flex items-center gap-1.5"
              >
                <span>🚀</span> Dashboard
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
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center space-y-8">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span>Privacy-First Scheduling Protocol • GDPR Compliant</span>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Own Your Time. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
              Monetize & Filter 1-on-1 Access.
            </span>
          </h1>
          <p className="text-sm md:text-base text-neutral-400 font-normal leading-relaxed max-w-xl mx-auto">
            The minimal, high-trust availability layer for creators, hosts, and professionals. Screen applications, set custom date menus, and eliminate scheduling friction.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href={user ? "/dashboard" : "/login"}
            className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <span>⚡ Claim Your Host Link</span>
          </Link>
          <a
            href="#privacy"
            className="w-full sm:w-auto px-8 py-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
          >
            🛡️ Privacy Standards
          </a>
        </div>

        {/* Live Mockup / UI Display */}
        <div className="pt-10">
          <div className="relative mx-auto max-w-4xl rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-2 backdrop-blur-xl shadow-2xl shadow-black">
            <div className="flex items-center space-x-2 px-3 py-2 border-b border-neutral-800/60">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="text-[10px] font-mono text-neutral-500 ml-2">chronohost.app/u/alex</span>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                <div className="text-[10px] font-mono text-amber-500 uppercase">⚡ Active Menu</div>
                <div className="text-sm font-bold text-white">Coffee & Strategic Chat</div>
                <div className="text-[11px] text-neutral-500">⏱️ 45m | 💳 Guest Treat</div>
              </div>

              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                <div className="text-[10px] font-mono text-emerald-400 uppercase">📅 Calendar Sync</div>
                <div className="text-sm font-bold text-white">Apple & Google Calendar</div>
                <div className="text-[11px] text-emerald-400/80">✓ Native .ics Export</div>
              </div>

              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                <div className="text-[10px] font-mono text-amber-400 uppercase">🛡️ Vetting Protection</div>
                <div className="text-sm font-bold text-white">Verified Profiles Only</div>
                <div className="text-[11px] text-neutral-400">Zero Spam Guarantee</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 border-t border-neutral-900">
        <div className="text-center space-y-2 mb-16">
          <h2 className="text-xs font-mono text-amber-500 uppercase tracking-widest">Built For Seamless Interaction</h2>
          <p className="text-2xl md:text-3xl font-bold text-white">Designed for high-value time management.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-neutral-900/40 border border-neutral-800/80 rounded-2xl space-y-3 hover:border-amber-500/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-lg">
              ☕
            </div>
            <h3 className="text-sm font-bold text-white">Custom Slot Menus</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Create specific meeting formats with preset rules (e.g., Host Treat, AA, Paid Sessions) without awkward back-and-forth messaging.
            </p>
          </div>

          <div className="p-6 bg-neutral-900/40 border border-neutral-800/80 rounded-2xl space-y-3 hover:border-amber-500/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-lg">
              🔒
            </div>
            <h3 className="text-sm font-bold text-white">Smart Guest Vetting</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Filter incoming meeting applications. Only accept requests from verified applicants that align with your availability.
            </p>
          </div>

          <div className="p-6 bg-neutral-900/40 border border-neutral-800/80 rounded-2xl space-y-3 hover:border-amber-500/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-lg">
              📅
            </div>
            <h3 className="text-sm font-bold text-white">Universal Calendar Export</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Export approved meetings directly into Google Calendar, Apple iCal, or Outlook via clean standard .ics feeds.
            </p>
          </div>
        </div>
      </section>

      {/* 🛡️ PRIVACY & DATA SECURITY SECTION (欧美重点：隐私承诺) */}
      <section id="privacy" className="max-w-5xl mx-auto px-6 py-16 my-10 rounded-3xl bg-neutral-900/30 border border-amber-500/20 relative">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 text-amber-400 text-xs font-mono uppercase tracking-wider">
            <span>🛡️ Privacy & Data Integrity Promise</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Your Personal Data Is Yours. Period.
          </h2>
          <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
            We adhere to strict zero-surveillance architecture. We do NOT collect sensitive personal identity details, track real-time locations, or store private personal conversations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-8 pt-6 border-t border-neutral-800/60 text-left">
          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800/60 space-y-1.5">
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <span>✓</span> What We Store (Functional Only)
            </div>
            <p className="text-[11px] text-neutral-400 leading-normal">
              Basic account credentials (email), specified available timeslots, and appointment application notes required strictly for calendar invitation creation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800/60 space-y-1.5">
            <div className="text-xs font-bold text-red-400 flex items-center gap-1.5">
              <span>✕</span> What We NEVER Collect or Sell
            </div>
            <p className="text-[11px] text-neutral-400 leading-normal">
              No precise location tracking, no cross-site advertising surveillance profiles, and zero selling or monetization of user metadata to third parties.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-10 text-center text-[11px] text-neutral-500 font-mono">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>© {new Date().getFullYear()} ChronoHost. Built with privacy & control in mind. If you have any questions, you can contact 60184010520meng@gmail.com </div>
          <div className="flex space-x-6">
            <button 
              onClick={() => setShowPrivacyModal(true)} 
              className="hover:text-amber-400 underline underline-offset-4 transition-colors cursor-pointer"
            >
              Privacy Policy & Terms
            </button>
            {/*<a href="#features" className="hover:text-neutral-300 transition-colors">Features</a>*/}
          </div>
        </div>
      </footer>

      {/* 📄 Privacy Policy Modal (隐私政策弹窗) */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[80vh] overflow-y-auto text-left">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>🛡️</span> ChronoHost Privacy & Data Terms
              </h3>
              <button 
                onClick={() => setShowPrivacyModal(false)}
                className="text-neutral-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-300 leading-relaxed font-sans">
              <p>
                <strong>1. Minimal Data Collection Notice:</strong><br />
                ChronoHost collects minimal personal information necessary solely for operating the appointment scheduling platform. This includes your email address and basic profile information provided during authentication.
              </p>
              <p>
                <strong>2. Purpose of Data Processing:</strong><br />
                Any data collected (such as timeslot selections, guest application notes, and email addresses) is used <strong>exclusively for core functional purposes</strong>: generating calendar invites, sending appointment status notifications, and maintaining host dashboard availability.
              </p>
              <p>
                <strong>3. Non-Collection of Sensitive Information:</strong><br />
                We explicitly <strong>do NOT collect, process, or monitor sensitive personal information</strong> including but not limited to: precise location data, private chat records, financial credentials, or biometric data.
              </p>
              <p>
                <strong>4. Zero Third-Party Monetization:</strong><br />
                Your data is never sold, rented, or brokered to data brokers, ad networks, or external marketing entities.
              </p>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-4 py-2 bg-amber-500 text-neutral-950 font-bold text-xs rounded-lg hover:bg-amber-400 transition-colors"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}