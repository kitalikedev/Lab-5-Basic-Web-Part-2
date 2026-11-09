import type { NextAuthConfig } from 'next-auth';

// File này chạy trong proxy nên KHÔNG import module chỉ có ở Node (bcrypt, database...)
export const authConfig = {
  pages: {
    signIn: '/login', // chưa đăng nhập thì chuyển về đây
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // false = chuyển về /login
      }
      if (isLoggedIn && nextUrl.pathname === '/login') {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [], // thêm provider ở auth.ts
} satisfies NextAuthConfig;
