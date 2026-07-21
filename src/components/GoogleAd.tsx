// src/components/GoogleAd.tsx
"use client"

import { useEffect } from "react"

interface GoogleAdProps {
  slotId: string // 广告单元 ID (Ad Slot ID)
  format?: 'auto' | 'fluid' | 'rectangle'
  responsive?: boolean
  className?: string
}

export default function GoogleAd({
  slotId,
  format = 'auto',
  responsive = true,
  className = ''
}: GoogleAdProps) {
  useEffect(() => {
    try {
      // 触发 AdSense 渲染当前广告块
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (err) {
      console.error("AdSense Error:", err)
    }
  }, [])

  return (
    <div className={`my-6 text-center overflow-hidden min-h-[90px] ${className}`}>
      {/* 区分环境提示（可选） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-2 border border-dashed border-amber-500/30 text-[10px] font-mono text-amber-500/70 rounded">
          [Google AdSense Placeholder - Slot: {slotId}]
        </div>
      )}

      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-7239749166432385" // 
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  )
}