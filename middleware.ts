// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // 核心修改点：将 name, value, options 打包成一个单一对象传入 set 方法
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({ name, value, ...options })
          })
          
          // 优化点：基于同步好最新 cookie 的 request 重新生成 response，保证后续中间件或页面能拿到新请求头
          response = NextResponse.next({ request })
          
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({ name, value, ...options })
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 路由守护：如果未登录用户尝试访问 /dashboard，强制重定向到 /login
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    // 技巧：重定向时最好把刚刚更新完的 auth cookie 响应对象也带上，防止 session 状态丢失
    return NextResponse.redirect(new URL('/login', request.url), {
      headers: response.headers,
    })
  }

  return response
}

export const config = {
  // 注意：Supabase 官方建议中间件也包含静态资源和 API 的过滤，但保持你原有的拦截范围也是可以的
  matcher: ['/dashboard/:path*'],
}