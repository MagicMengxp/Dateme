"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/src/utils/supabase/client"

interface Profile {
  username: string
  bio: string
  avatar_url: string
}

interface Menu {
  id: string
  title: string
  duration: number
  bill_policy: 'split' | 'me' | 'you'
}

interface Slot {
  id: string
  start_time: string
  status: string
}

export default function PublicBookingPage() {
  const { username } = useParams()
  const supabase = createClient()

  // 状态流管理
  const [profile, setProfile] = useState<Profile | null>(null)
  const [menus, setMenus] = useState<Menu[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  
  // 交互表单状态
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [formData, setFormData] = useState({ guestName: '', guestSocial: '', guestAnswer: '' })
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  // 获取该用户的公开约会配置数据
  useEffect(() => {
    async function fetchData() {
      if (!username) return

      // 1. 获取用户资料
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (profileData) {
        setProfile(profileData)

        // 2. 获取该用户的约会菜单卡片
        const { data: menusData } = await supabase
          .from('menus')
          .select('*')
          .eq('user_id', profileData.id)
        setMenus(menusData || [])

        // 3. 获取可预约的时间槽 (只显示 available 的状态)
        const { data: slotsData } = await supabase
          .from('slots')
          .select('*')
          .eq('user_id', profileData.id)
          .eq('status', 'available')
          .order('start_time', { ascending: true })
        setSlots(slotsData || [])
      }
      setLoading(false)
    }
    fetchData()
  }, [username])

  // 处理浏览者预约提交
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSlot || !selectedMenu) return

    setBookingStatus('submitting')

    // 更新时间槽状态为 pending，并写入预约人提供的高信号数据
    const { error } = await supabase
      .from('slots')
      .update({
        status: 'pending',
        guest_name: formData.guestName,
        guest_social: formData.guestSocial,
        guest_answer: formData.guestAnswer
      })
      .eq('id', selectedSlot.id)
      .eq('status', 'available') // 乐观锁：确保提交时没被别人抢占

    if (error) {
      setBookingStatus('error')
    } else {
      setBookingStatus('success')
      // 预约成功后移出当前已被选的时间槽
      setSlots(slots.filter(s => s.id !== selectedSlot.id))
    }
  }

  // 格式化本地时区显示 (针对欧美用户习惯)
  const formatToLocalTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleString(navigator.language || 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })
  }

  // 账单政策文案转换
  const getBillPolicyLabel = (policy: string) => {
    if (policy === 'split') return 'Let\'s split the bill (AA)'
    if (policy === 'me') return 'It\'s my treat (I pay)'
    return 'You treat me'
  }

  if (loading) return <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Loading Profile...</div>
  if (!profile) return <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">User not found.</div>

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500 selection:text-neutral-950">
      
      {/* 核心布局容器 */}
      <main className="max-w-2xl mx-auto px-4 py-16 space-y-12">
        
        {/* 1. Hero 个人头像与介绍区域 */}
        <section className="text-center space-y-4">
          {profile.avatar_url && (
            <img src={profile.avatar_url} alt={profile.username} className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-amber-500/30" />
          )}
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Date with {profile.username}
          </h1>
          <p className="text-neutral-400 max-w-md mx-auto text-sm leading-relaxed">{profile.bio}</p>
        </section>

        {/* 2. 约会菜单卡表 (Dating Menu) */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-wide text-neutral-300 uppercase text-xs">✨ Select a Dating Menu</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {menus.map((menu) => (
              <button
                key={menu.id}
                onClick={() => { setSelectedMenu(menu); setSelectedSlot(null); }}
                className={`p-5 rounded-xl border text-left transition-all duration-200 ${
                  selectedMenu?.id === menu.id
                    ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/5'
                    : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                }`}
              >
                <h3 className="font-medium text-amber-400">{menu.title}</h3>
                <div className="mt-2 space-y-1 text-xs text-neutral-400">
                  <p>⏱️ Duration: {menu.duration} mins</p>
                  <p>💳 Policy: {getBillPolicyLabel(menu.bill_policy)}</p>
                </div>
              </button>
            ))}
            {menus.length === 0 && <p className="text-sm text-neutral-500 italic">No menus listed yet.</p>}
          </div>
        </section>

        {/* 3. 时间槽选择器 (基于所选菜单触发) */}
        {selectedMenu && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-lg font-semibold tracking-wide text-neutral-300 uppercase text-xs">📅 Pick an Available Slot ({navigator.language ? 'Your Local Time' : 'Time'})</h2>
            <div className="grid gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-3 rounded-lg border text-sm text-center transition-all ${
                    selectedSlot?.id === slot.id
                      ? 'border-amber-500 bg-amber-500 text-neutral-950 font-medium'
                      : 'border-neutral-800 bg-neutral-900/30 text-neutral-300 hover:bg-neutral-900'
                  }`}
                >
                  {formatToLocalTime(slot.start_time)}
                </button>
              ))}
              {slots.length === 0 && <p className="text-sm text-neutral-500 italic">No slots currently open for booking.</p>}
            </div>
          </section>
        )}

        {/* 4. 高信号初筛表单 (Vetting Gate) */}
        {selectedMenu && selectedSlot && bookingStatus !== 'success' && (
          <form onSubmit={handleBookingSubmit} className="space-y-4 p-6 rounded-xl border border-neutral-800 bg-neutral-900/40 animate-in fade-in duration-300">
            <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">🔒 Drop Your Application</h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs text-neutral-400 font-medium">Your Name</label>
                <input 
                  type="text" required 
                  value={formData.guestName} onChange={e => setFormData({...formData, guestName: e.target.value})}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500" 
                  placeholder="e.g. Alex"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-neutral-400 font-medium">Instagram / LinkedIn URL</label>
                <input 
                  type="text" required
                  value={formData.guestSocial} onChange={e => setFormData({...formData, guestSocial: e.target.value})}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500" 
                  placeholder="e.g. instagram.com/username"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400 font-medium">Why would you like to meet up? (High-Signal Question)</label>
              <textarea 
                required rows={3}
                value={formData.guestAnswer} onChange={e => setFormData({...formData, guestAnswer: e.target.value})}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 resize-none" 
                placeholder="Share a bit about yourself or what caught your eye..."
              />
            </div>

            <button
              type="submit"
              disabled={bookingStatus === 'submitting'}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 font-semibold rounded-lg text-sm hover:from-amber-400 hover:to-orange-500 transition duration-200 disabled:opacity-50"
            >
              {bookingStatus === 'submitting' ? 'Sending Application...' : 'Confirm My Appointment Request'}
            </button>
            {bookingStatus === 'error' && <p className="text-xs text-red-400 text-center">Slot just taken or a connection issue occurred. Please refresh.</p>}
          </form>
        )}

        {/* 5. 成功提交状态（弹窗或替换显示，后续也是放置全屏插屏广告的最佳位置） */}
        {bookingStatus === 'success' && (
          <div className="p-8 rounded-xl border border-emerald-950 bg-emerald-950/20 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="text-2xl">🎉</div>
            <h3 className="text-lg font-medium text-emerald-400">Request Sent Successfully</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Your proposal has been routed straight to {profile.username}'s private inbox. You'll receive a confirmation email if they accept the invitation.
            </p>
          </div>
        )}

      </main>
    </div>
  )
}