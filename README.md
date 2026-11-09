# Lab 5 - Phần 2: Dashboard hóa đơn với Next.js App Router

Bài thực hành Lab 5 của khóa "The Web Basic": xây ứng dụng dashboard quản lý hóa đơn bằng Next.js App Router, dữ liệu lưu trong PostgreSQL trên Supabase.

Phần 1 của bài (blog tĩnh với Pages Router) nằm ở repo riêng: https://github.com/kitalikedev/Lab-5-BasicWeb

## Chức năng

- Đăng nhập bằng email và mật khẩu (NextAuth), tự chuyển về `/login` nếu chưa đăng nhập.
- Dashboard tổng quan: thẻ thống kê, biểu đồ doanh thu, hóa đơn mới nhất, tải theo từng phần bằng Suspense (streaming).
- Danh sách hóa đơn có tìm kiếm (lưu trong URL, debounce 300ms) và phân trang.
- Thêm, sửa, xóa hóa đơn bằng Server Actions, kiểm tra dữ liệu bằng zod và hiển thị lỗi từng ô.
- Trang khách hàng kèm tìm kiếm và tổng tiền theo từng khách.
- Xử lý lỗi bằng `error.tsx`, `not-found.tsx` và `notFound()`.
- Metadata, tiêu đề theo từng trang và thẻ Open Graph.

## Công nghệ

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 3
- PostgreSQL trên Supabase, truy vấn bằng thư viện `postgres`
- NextAuth v5 (beta), `bcryptjs`, `zod`

## Yêu cầu

- Node.js từ 20.9 trở lên
- Một project Supabase (gói miễn phí là đủ)

## Cài đặt và chạy

1. Cài thư viện:

   ```bash
   npm install
   ```

2. Tạo file `.env.local` ở thư mục gốc với nội dung:

   ```
   DATABASE_URL="chuỗi kết nối Transaction pooler của Supabase (cổng 6543)"
   AUTH_SECRET="chuỗi ngẫu nhiên, tạo bằng: openssl rand -base64 32"
   ```

   Lấy chuỗi kết nối ở Supabase: nút Connect, chọn Transaction pooler, thay phần mật khẩu bằng mật khẩu database của bạn. File `.env.local` đã nằm trong `.gitignore`, không đưa lên git.

3. Chạy chế độ phát triển:

   ```bash
   npm run dev
   ```

4. Tạo bảng và nạp dữ liệu mẫu bằng cách mở `http://localhost:3000/seed` một lần. Trang trả về `Database seeded successfully` khi thành công. Có thể chạy lại nhiều lần, dữ liệu không bị nhân đôi.

5. Mở `http://localhost:3000` và đăng nhập. Email và mật khẩu của tài khoản thử nằm trong phần chú thích đầu file `app/lib/placeholder-data.ts`.

Chạy bản production trên máy:

```bash
npm run build
npm run start
```

Khi chạy `npm run start` trên localhost, cần thêm `AUTH_TRUST_HOST=true` vào `.env.local`, nếu không NextAuth báo lỗi `UntrustedHost`.

## Cấu trúc chính

```
app/
  layout.tsx            layout gốc, font và metadata
  page.tsx              trang chủ
  login/                trang đăng nhập
  seed/route.ts         tạo bảng và dữ liệu mẫu
  dashboard/
    layout.tsx          layout chung kèm thanh điều hướng
    (overview)/         trang tổng quan
    invoices/           danh sách, tạo, sửa hóa đơn
    customers/          danh sách khách hàng
  lib/
    db.ts               kết nối database
    data.ts             các hàm truy vấn
    actions.ts          Server Actions
    placeholder-data.ts dữ liệu mẫu
  ui/                   các component giao diện
auth.ts, auth.config.ts cấu hình đăng nhập
proxy.ts                chặn truy cập /dashboard khi chưa đăng nhập
```

## Khác biệt so với tài liệu của bài lab

- Dùng Supabase với thư viện `postgres` thay cho `@vercel/postgres` ở code mẫu.
- Next.js 16 đổi `middleware.ts` thành `proxy.ts`. Partial Prerendering được bật qua `cacheComponents` trong `next.config.ts`, thay cho `experimental.ppr` và `experimental_ppr`.
- Dữ liệu động (truy vấn database, `searchParams`, `params`, `usePathname`) được đặt trong `<Suspense>` theo yêu cầu của `cacheComponents`.
- Ảnh trang chủ và ảnh đại diện khách hàng là file SVG tự tạo, không dùng ảnh PNG của khóa học.
- Dùng Tailwind CSS 3 vì Tailwind 4 cần Node từ 20.19 trở lên.
- Route `/seed` công khai chỉ dùng khi phát triển. Nên xóa hoặc bảo vệ route này trước khi deploy.
- Route `/api/auth/[...nextauth]` được thêm vào vì NextAuth cần khi chạy với Next.js 16.

## Triển khai

Ứng dụng cần server Node.js (đăng nhập, Server Actions, truy vấn database) nên không chạy được trên hosting tĩnh như GitHub Pages. Có thể triển khai lên Vercel và khai báo hai biến `DATABASE_URL`, `AUTH_SECRET` trong phần cài đặt của dự án. Repo này chưa được triển khai.

## Bảo mật

- Không commit `.env.local`, mật khẩu database hay `AUTH_SECRET`.
- Mật khẩu người dùng được băm bằng bcrypt trước khi lưu.
- Các bảng bật Row Level Security để Data API công khai của Supabase không đọc được. Kết nối của ứng dụng dùng role `postgres` nên vẫn truy cập bình thường.
