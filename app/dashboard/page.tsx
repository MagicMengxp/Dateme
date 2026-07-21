// app/dashboard/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/src/utils/supabase/client"
import { DateTimePicker } from "@/app/dashboard/components/DateTimePicker"
import { getGoogleCalendarUrl } from "@/src/utils/calendar"

interface Menu { 
  id: string; 
  title: string; 
  duration: number; 
  bill_policy: 'split' | 'me' | 'you' 
}

interface Slot { 
  id: string; 
  start_time: string; 
  status: string; 
  guest_name?: string; 
  guest_social?: string; 
  guest_answer?: string 
}

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()

  // State Management
  const [user, setUser] = useState<any>(null)
  const [menus, setMenus] = useState<Menu[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)

  // Menu Creation Form State
  const [newMenu, setNewMenu] = useState({ 
    title: '', 
    duration: 30, 
    bill_policy: 'split' as 'split' | 'me' | 'you' 
  })
  
  // Availability Slot Creation State
  const [newSlotTime, setNewSlotTime] = useState('')
  const [slotError, setSlotError] = useState<string | null>(null)

  useEffect(() => {
    async function initDashboard() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Fetch menus and availability slots concurrently
      const [menusRes, slotsRes] = await Promise.all([
        supabase.from('menus').select('*').eq('user_id', user.id),
        supabase.from('slots').select('*').eq('user_id', user.id).order('start_time', { ascending: true })
      ])

      setMenus(menusRes.data || [])
      setSlots(slotsRes.data || [])
      setLoading(false)
    }
    initDashboard()
  }, [])

  // 1. Create a new menu option
  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMenu.title) return
    const { data } = await supabase
      .from('menus')
      .insert([{ ...newMenu, user_id: user.id }])
      .select()

    if (data) {
      setMenus([...menus, data[0]])
      setNewMenu({ title: '', duration: 30, bill_policy: 'split' })
    }
  }

  // 2. Delete an existing menu
  const handleDeleteMenu = async (id: string) => {
    await supabase.from('menus').delete().eq('id', id)
    setMenus(menus.filter(m => m.id !== id))
  }

  // 3. Host a new slot with deduplication and validation
  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newSlotTime) {
      setSlotError("Please select a date and time.")
      return
    }

    const targetDate = new Date(newSlotTime)
    const targetTimestamp = targetDate.getTime()

    // Validation 1: Verify valid date
    if (isNaN(targetTimestamp)) {
      setSlotError("Invalid date or time selected.")
      return
    }

    // Validation 2: Prevent adding past dates
    if (targetTimestamp < Date.now()) {
      setSlotError("Cannot host a time slot in the past.")
      return
    }

    // Validation 3: Timestamp duplicate check
    const isDuplicate = slots.some((slot) => {
      const existingTimestamp = new Date(slot.start_time).getTime()
      return existingTimestamp === targetTimestamp
    })

    if (isDuplicate) {
      setSlotError("You have already hosted a slot at this exact time!")
      return
    }

    // Clear previous error on valid check
    setSlotError(null)
    const targetISO = targetDate.toISOString()

    const { data, error } = await supabase
      .from('slots')
      .insert([
        { 
          user_id: user.id, 
          start_time: targetISO, 
          status: 'available' 
        }
      ])
      .select()

    if (error) {
      setSlotError("Failed to add slot. Please try again.")
      console.error(error)
      return
    }

    if (data) {
      // Update slots list, re-sort, and reset state
      setSlots([...slots, data[0]].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()))
      setNewSlotTime('') // Reset input state to re-sync DateTimePicker
      setSlotError(null)
    }
  }

  // 4. Accept booking application
  const handleAcceptSlot = async (id: string) => {
    const { error } = await supabase
      .from('slots')
      .update({ status: 'confirmed' })
      .eq('id', id)

    if (!error) {
      setSlots(slots.map(s => s.id === id ? { ...s, status: 'confirmed' } : s))
    }
  }

  // 5. Decline booking application and release slot
  const handleDeclineSlot = async (id: string) => {
    const { error } = await supabase
      .from('slots')
      .update({ status: 'available', guest_name: null, guest_social: null, guest_answer: null })
      .eq('id', id)

    if (!error) {
      setSlots(slots.map(s => s.id === id ? { ...s, status: 'available', guest_name: undefined, guest_social: undefined, guest_answer: undefined } : s))
    }
  }

  // 6. Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center font-mono text-sm">
        Loading Dashboard...
      </div>
    )
  }

  // Filter pending requests for the inbox
  const pendingRequests = slots.filter(s => s.status === 'pending')

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
      {/* Top Header */}
      <header className="max-w-5xl mx-auto px-4 py-6 border-b border-neutral-800 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          {user?.user_metadata?.avatar_url && (
            <img src={user.user_metadata.avatar_url} className="w-8 h-8 rounded-full border border-amber-500/50" alt="avatar" />
          )}
          <div>
            <span className="text-sm font-semibold tracking-wide text-amber-400 block">Dashboard</span>
            <span className="text-[10px] text-neutral-500 font-mono">ID: {user?.id?.slice(0, 8)}...</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Share Public Link Button */}
          <button 
            onClick={() => {
              const publicUrl = `${window.location.origin}/u/${user?.id}`
              navigator.clipboard.writeText(publicUrl)
              alert(`Copied your public booking link:\n${publicUrl}`)
            }}
            className="text-xs bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
          >
            <span>🔗</span> Copy Public Link
          </button>

          {/* Logout Button */}
          <button 
            onClick={handleLogout} 
            className="text-xs bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg hover:bg-neutral-800 transition text-neutral-300"
          >
            Log Out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 grid gap-8 md:grid-cols-3">
        
        {/* Left & Center Column: Manage Menus & Availability */}
        <div className="md:col-span-2 space-y-8">
          
          {/* A. Menu Options Panel */}
          <section className="bg-neutral-900/40 p-6 rounded-xl border border-neutral-800 space-y-6">
            <h2 className="text-sm font-bold tracking-wider text-neutral-400 uppercase">
              ✨ Dating Options
            </h2>
            <div className="space-y-3">
              {menus.map(menu => (
                <div key={menu.id} className="flex justify-between items-center p-4 bg-neutral-950 border border-neutral-800 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-amber-400">{menu.title}</h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      ⏱️ {menu.duration}m | 💳 {menu.bill_policy === 'split' ? 'AA (Split)' : menu.bill_policy === 'me' ? 'Host Treat' : 'Guest Treat'}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDeleteMenu(menu.id)} 
                    className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            {/* Create New Menu Form */}
            <form onSubmit={handleCreateMenu} className="pt-4 border-t border-neutral-800 grid gap-3 grid-cols-1 sm:grid-cols-3">
              <input 
                type="text" 
                placeholder="Menu title (e.g. Coffee & Walk)" 
                required
                value={newMenu.title} 
                onChange={e => setNewMenu({...newMenu, title: e.target.value})}
                className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 sm:col-span-1"
              />
              <select 
                value={newMenu.bill_policy} 
                onChange={e => setNewMenu({...newMenu, bill_policy: e.target.value as any})}
                className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="split">AA (Split)</option>
                <option value="me">Host Treat</option>
                <option value="you">Guest Treat</option>
              </select>
              <button 
                type="submit" 
                className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-lg text-xs py-1.5 transition"
              >
                + Add Menu
              </button>
            </form>
          </section>

          {/* B. Release Availability Slots Panel */}
          <section className="bg-neutral-900/40 p-6 rounded-xl border border-neutral-800 space-y-4">
            <h2 className="text-sm font-bold tracking-wider text-neutral-400 uppercase">
              📅 Release Availability Slots
            </h2>

            {/* Host Slot Form */}
            <form onSubmit={handleAddSlot} className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <DateTimePicker 
                  value={newSlotTime} 
                  onChange={(val) => setNewSlotTime(val)} 
                />
              </div>
              <button 
                type="submit" 
                className="w-full sm:w-auto h-[42px] bg-neutral-100 hover:bg-white text-neutral-950 font-semibold rounded-lg text-xs px-4 transition whitespace-nowrap"
              >
                + Host Slot
              </button>
            </form>

            {/* Error / Duplicate Warning Banner */}
            {slotError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-xs text-red-400 font-medium">
                  ⚠️ {slotError}
                </p>
              </div>
            )}

            {/* Existing Slots List */}
            <div className="flex flex-wrap gap-2 pt-2">
              {slots.map(slot => (
                <div key={slot.id} className="flex flex-col gap-1">
                  <span 
                    className={`text-[11px] font-mono px-2.5 py-1 rounded-md border ${
                      slot.status === 'confirmed' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' :
                      slot.status === 'pending' ? 'border-amber-500 bg-amber-500/10 text-amber-400 animate-pulse' :
                      'border-neutral-800 bg-neutral-950 text-neutral-400'
                    }`}
                  >
                    {new Date(slot.start_time).toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})} ({slot.status})
                  </span>

                  {/* 如果时间已被确认，下方直接提供一键导出日历按钮 */}
                  {slot.status === 'confirmed' && (
                    <a
                      href={getGoogleCalendarUrl({
                        title: `Session with ${slot.guest_name || 'Guest'}`,
                        details: `Social: ${slot.guest_social || 'N/A'}\nAnswer: ${slot.guest_answer || 'N/A'}`,
                        startTimeISO: slot.start_time,
                        durationMinutes: 30
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded px-2 py-0.5 text-center transition"
                    >
                      📅 Add Calendar
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Applications Inbox */}
        <div className="space-y-6">
          <section className="bg-neutral-900/40 p-6 rounded-xl border border-neutral-800 space-y-4">
            <h2 className="text-sm font-bold tracking-wider text-neutral-400 uppercase flex items-center justify-between">
              <span>📥 Inbox Applications</span>
              {pendingRequests.length > 0 && (
                <span className="bg-amber-500 text-neutral-950 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {pendingRequests.length}
                </span>
              )}
            </h2>

            <div className="space-y-4">
              {pendingRequests.map(slot => (
                <div key={slot.id} className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg space-y-3 text-xs">
                  <div className="flex justify-between text-neutral-400 border-b border-neutral-900 pb-2">
                    <span className="font-medium text-amber-500">{slot.guest_name}</span>
                    <span className="font-mono">{new Date(slot.start_time).toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div>
                    <p className="text-neutral-500 text-[11px]">Social Profile:</p>
                    <a href={`https://${slot.guest_social}`} target="_blank" rel="noreferrer" className="text-sky-400 underline break-all">{slot.guest_social}</a>
                  </div>
                  <div>
                    <p className="text-neutral-500 text-[11px]">Vetting Answer:</p>
                    <p className="text-neutral-300 leading-relaxed mt-0.5">{slot.guest_answer}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button 
                      onClick={() => handleAcceptSlot(slot.id)} 
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded transition"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleDeclineSlot(slot.id)} 
                      className="w-full py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 transition"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
              {pendingRequests.length === 0 && (
                <p className="text-xs text-neutral-500 italic text-center py-6">Inbox is empty. No applications pending.</p>
              )}
            </div>
          </section>
        </div>

      </main>
    </div>
  )
}