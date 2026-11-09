// Next.js 16 đổi tên "middleware" thành "proxy".
// Chạy trước mọi request khớp với matcher để bảo vệ /dashboard.
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // Bỏ qua api, file tĩnh và ảnh
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$).*)'],
};
