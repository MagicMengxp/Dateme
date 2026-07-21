// app/u/[userId]/page.tsx
"use client"

import { useEffect, useState, use } from "react"
import { createClient } from "@/src/utils/supabase/client"
import GoogleAd from "@/src/components/GoogleAd"

interface Menu { id: string; title: string; duration: number; bill_policy: 'split' | 'me' | 'you' }
interface Slot { id: string; start_time: string; status: string }

export default function PublicBookingPage({ params }: { params: Promise<{ userId: string }> }) {
  // 解包 Next.js 15+ 的动态路由参数
  const resolvedParams = use(params)
  const hostUserId = resolvedParams.userId

  const supabase = createClient()

  // 页面状态流
  const [hostProfile, setHostProfile] = useState<any>(null)
  const [menus, setMenus] = useState<Menu[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)

  // 访客预约交互状态
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [guestName, setGuestName] = useState('')
  const [guestSocial, setGuestSocial] = useState('')
  const [guestAnswer, setGuestAnswer] = useState('')
  
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function loadPublicData() {
      if (!hostUserId) return

      try {
        // 1. 并发获取：套餐列表 & 仅拉取状态为 'available' 的可预约时间槽
        const [menusRes, slotsRes] = await Promise.all([
          supabase.from('menus').select('*').eq('user_id', hostUserId),
          supabase
            .from('slots')
            .select('*')
            .eq('user_id', hostUserId)
            .eq('status', 'available') // 仅展露未被预约的时间
            .gte('start_time', new Date().toISOString()) // 过滤掉过去的时间
            .order('start_time', { ascending: true })
        ])

        setMenus(menusRes.data || [])
        setSlots(slotsRes.data || [])
      } catch (err) {
        console.error("Failed to load availability slots:", err)
      } finally {
        setLoading(false)
      }
    }

    loadPublicData()
  }, [hostUserId])

  // 提交预约申请
  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSlotId) {
      setErrorMessage("Please select a time slot first.")
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    // 乐观锁二次校验：确保该 Slot 依然处于 'available' 状态
    const { data: currentSlot } = await supabase
      .from('slots')
      .select('status')
      .eq('id', selectedSlotId)
      .single()

    if (!currentSlot || currentSlot.status !== 'available') {
      setErrorMessage("Sorry! This time slot was just booked by someone else.")
      setSubmitting(false)
      // 刷新当前可用列表
      setSlots(slots.filter(s => s.id !== selectedSlotId))
      setSelectedSlotId(null)
      return
    }

    // 更新 Slot 状态为 'pending'，并将访客信息存入 Supabase
    const { error } = await supabase
      .from('slots')
      .update({
        status: 'pending',
        guest_name: guestName,
        guest_social: guestSocial,
        guest_answer: guestAnswer
      })
      .eq('id', selectedSlotId)

    setSubmitting(false)

    if (error) {
      setErrorMessage("Failed to send application. Please try again.")
      console.error(error)
    } else {
      setSubmitted(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-400 flex items-center justify-center text-sm">
        Loading availability...
      </div>
    )
  }

  // 提交成功反馈视图
  if (submitted) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-neutral-900/60 border border-neutral-800 p-8 rounded-2xl text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl">
            ✨
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Application Sent!</h1>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Your request has been delivered. You will be contacted via your social profile once approved.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-4 py-2 rounded-lg transition"
          >
            Back to Calendar
          </button>
          {/* 提交成功反馈视图内部 */}
<div className="pt-4 border-t border-neutral-800">
  <GoogleAd slotId="1234567890" format="auto" />
</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <main className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        
        {/* 顶部 Header：主人标识 */}
        <header className="text-center space-y-2 border-b border-neutral-800 pb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-neutral-950 shadow-lg shadow-amber-500/10">
            ☕
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white pt-2">Book a Session</h1>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Select an available time slot and submit your request to schedule a date.
          </p>
        </header>

        {/* 面板 1：可选择的套餐 Menu 展示 */}
        {menus.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-bold tracking-wider text-neutral-500 uppercase">
              ✨ Dating Options
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {menus.map(menu => (
                <div key={menu.id} className="p-4 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-1">
                  <h3 className="text-sm font-semibold text-amber-400">{menu.title}</h3>
                  <p className="text-xs text-neutral-400">
                    ⏱️ {menu.duration} mins | 💳 {menu.bill_policy === 'split' ? 'AA (Split)' : menu.bill_policy === 'me' ? 'Host Treat' : 'Guest Treat'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 面板 2：核心流程 — 选择时间 & 填写个人表单 */}
        <section className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl space-y-6">
          
          {/* A. 步骤 1：选择时间槽 */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold tracking-wider text-neutral-400 uppercase flex items-center justify-between">
              <span>1. Choose an Available Slot</span>
              <span className="text-[10px] text-neutral-500 font-normal">{slots.length} available</span>
            </h2>

            {slots.length === 0 ? (
              <div className="p-8 border border-dashed border-neutral-800 rounded-xl text-center space-y-1">
                <p className="text-xs text-neutral-500">No available time slots right now.</p>
                <p className="text-[11px] text-neutral-600">Please check back later!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {slots.map(slot => {
                  const isSelected = selectedSlotId === slot.id
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => {
                        setSelectedSlotId(slot.id)
                        setErrorMessage(null)
                      }}
                      className={`p-3 rounded-xl border text-xs text-left transition relative ${
                        isSelected 
                          ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-medium ring-1 ring-amber-500/50' 
                          : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div className="font-semibold">
                        {new Date(slot.start_time).toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' })}
                      </div>
                      <div className="text-[11px] opacity-80 mt-0.5">
                        {new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* B. 步骤 2：表单校验与填写（仅在选择时间槽后展开/可编辑） */}
          {selectedSlotId && (
            <form onSubmit={handleApply} className="pt-6 border-t border-neutral-800 space-y-4 animate-fadeIn">
              <h2 className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
                2. Your Information
              </h2>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400">Your Name / Nickname *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400">Social Handle (IG / Twitter / WeChat) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. instagram.com/alex or @alex"
                    value={guestSocial}
                    onChange={e => setGuestSocial(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">Why would you like to meet? *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Introduce yourself briefly or share what you'd love to chat about..."
                  value={guestAnswer}
                  onChange={e => setGuestAnswer(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 transition resize-none"
                />
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                  ⚠️ {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold rounded-xl text-xs transition shadow-lg shadow-amber-500/10"
              >
                {submitting ? 'Submitting Application...' : 'Request Booking ✨'}
              </button>
            </form>
          )}

        </section>

        {/* 页脚 */}
        <footer className="text-center text-[11px] text-neutral-600">
          Powered by Your Personal Dating Availability System
        </footer>

      </main>
    </div>
  )
}