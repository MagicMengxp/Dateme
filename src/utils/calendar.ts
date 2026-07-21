// src/utils/calendar.ts

interface CalendarEventParams {
  title: string
  details?: string
  location?: string
  startTimeISO: string
  durationMinutes?: number
}

/**
 * 辅助函数：将 ISO 时间转为 UTC 格式字符串 (例如: 20260720T143000Z)
 */
function formatToUtcString(dateString: string): string {
  const date = new Date(dateString)
  return date.toISOString().replace(/-|:|\.\d+/g, '')
}

/**
 * 1. 生成 Google Calendar 快捷跳转链接
 */
export function getGoogleCalendarUrl({
  title,
  details = '',
  location = '',
  startTimeISO,
  durationMinutes = 30,
}: CalendarEventParams): string {
  const startDate = new Date(startTimeISO)
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000)

  const startUtc = formatToUtcString(startDate.toISOString())
  const endUtc = formatToUtcString(endDate.toISOString())

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startUtc}/${endUtc}`,
    details: details,
    location: location,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * 2. 生成标准的 .ics (iCalendar) 内容文本，供 Apple Calendar / Outlook 导入
 */
function generateIcsContent({
  title,
  details = '',
  location = '',
  startTimeISO,
  durationMinutes = 30,
}: CalendarEventParams): string {
  const startDate = new Date(startTimeISO)
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000)

  const startUtc = formatToUtcString(startDate.toISOString())
  const endUtc = formatToUtcString(endDate.toISOString())
  const nowUtc = formatToUtcString(new Date().toISOString())

  // Clean strings for ICS format
  const cleanTitle = title.replace(/\n/g, '\\n')
  const cleanDetails = details.replace(/\n/g, '\\n')

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Personal Booking App//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:booking-${Date.now()}@bookingapp`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${cleanTitle}`,
    `DESCRIPTION:${cleanDetails}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')
}

/**
 * 3. 生成可直接被 <a> 标签 href 使用的 Data URI 链接（唤起 iPhone/Mac 的原生日历）
 */
export function getIcsCalendarUrl(params: CalendarEventParams): string {
  const icsContent = generateIcsContent(params)
  return `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`
}

/**
 * 4. 触发浏览器直接下载 .ics 文件的函数
 */
export function downloadIcsFile(params: CalendarEventParams): void {
  const icsContent = generateIcsContent(params)
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.setAttribute('download', 'booking-request.ics')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}