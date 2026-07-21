'use client'

import React, { useState, useEffect } from 'react'

interface DateTimePickerProps {
  value: string // ISO format: yyyy-MM-ddTHH:mm
  onChange: (value: string) => void
}

const MONTHS = [
  { val: '01', label: 'Jan' },
  { val: '02', label: 'Feb' },
  { val: '03', label: 'Mar' },
  { val: '04', label: 'Apr' },
  { val: '05', label: 'May' },
  { val: '06', label: 'Jun' },
  { val: '07', label: 'Jul' },
  { val: '08', label: 'Aug' },
  { val: '09', label: 'Sep' },
  { val: '10', label: 'Oct' },
  { val: '11', label: 'Nov' },
  { val: '12', label: 'Dec' },
]

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  // 1. 获取今天及初始化的年月日
  const today = new Date()
  const currentYear = today.getFullYear()
  
  // 从传入的 value 中解析或使用默认值
  const parseValue = (val: string) => {
    if (val && val.includes('T')) {
      const [dStr, tStr] = val.split('T')
      const [y, m, d] = dStr.split('-')
      return { y: y || String(currentYear), m: m || '01', d: d || '01', t: tStr || '14:00' }
    }
    const y = String(today.getFullYear())
    const m = String(today.getMonth() + 1).padStart(2, '0')
    const d = String(today.getDate()).padStart(2, '0')
    return { y, m, d, t: '14:00' }
  }

  const initial = parseValue(value)
  const [year, setYear] = useState(initial.y)
  const [month, setMonth] = useState(initial.m)
  const [day, setDay] = useState(initial.d)
  const [time, setTime] = useState(initial.t)

  // 当外部 value 被清空时同步重置
  useEffect(() => {
    if (!value) {
      const reset = parseValue('')
      setYear(reset.y)
      setMonth(reset.m)
      setDay(reset.d)
      setTime('14:00')
    }
  }, [value])

  // 状态改变时向上分发标准 ISO 格式 (yyyy-MM-ddTHH:mm)
  const updateValue = (y: string, m: string, d: string, t: string) => {
    if (y && m && d && t) {
      onChange(`${y}-${m}-${d}T${t}`)
    }
  }

  // 2. 生成可供选择的年份 (今年及未来 2 年)
  const yearOptions = [currentYear, currentYear + 1, currentYear + 2]

  // 3. 根据年月计算当月天数
  const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate()
  const dayOptions = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'))

  // 4. 生成 12 小时制带 AM/PM 的时间槽
  const timeSlots = []
  for (let hour = 8; hour <= 22; hour++) {
    for (let min of ['00', '30']) {
      const hh = hour.toString().padStart(2, '0')
      const period = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 === 0 ? 12 : hour % 12
      const label = `${displayHour}:${min} ${period}`
      const val = `${hh}:${min}`
      timeSlots.push({ val, label })
    }
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-400">
        Date & Start Time (US Format)
      </label>

      <div className="grid grid-cols-4 gap-2 w-full">
        {/* 月份 Month */}
        <select
          value={month}
          onChange={(e) => {
            setMonth(e.target.value)
            updateValue(year, e.target.value, day, time)
          }}
          className="bg-neutral-950 border border-neutral-800 text-white font-mono text-xs rounded-lg p-2.5 focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          {MONTHS.map((m) => (
            <option key={m.val} value={m.val} className="bg-neutral-900 text-white">
              {m.label}
            </option>
          ))}
        </select>

        {/* 日期 Day */}
        <select
          value={day}
          onChange={(e) => {
            setDay(e.target.value)
            updateValue(year, month, e.target.value, time)
          }}
          className="bg-neutral-950 border border-neutral-800 text-white font-mono text-xs rounded-lg p-2.5 focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          {dayOptions.map((d) => (
            <option key={d} value={d} className="bg-neutral-900 text-white">
              {d}
            </option>
          ))}
        </select>

        {/* 年份 Year */}
        <select
          value={year}
          onChange={(e) => {
            setYear(e.target.value)
            updateValue(e.target.value, month, day, time)
          }}
          className="bg-neutral-950 border border-neutral-800 text-white font-mono text-xs rounded-lg p-2.5 focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          {yearOptions.map((y) => (
            <option key={y} value={String(y)} className="bg-neutral-900 text-white">
              {y}
            </option>
          ))}
        </select>

        {/* 时间 Time */}
        <select
          value={time}
          onChange={(e) => {
            setTime(e.target.value)
            updateValue(year, month, day, e.target.value)
          }}
          className="bg-neutral-950 border border-neutral-800 text-white font-mono text-xs rounded-lg p-2.5 focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          {timeSlots.map((slot) => (
            <option key={slot.val} value={slot.val} className="bg-neutral-900 text-white">
              {slot.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}