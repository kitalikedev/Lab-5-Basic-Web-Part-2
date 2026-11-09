import postgres from 'postgres';

// Dùng chung một kết nối trong lúc dev (hot reload không tạo thêm kết nối mới)
const globalForDb = globalThis as unknown as {
  sql?: ReturnType<typeof postgres>;
};

const sql =
  globalForDb.sql ??
  postgres(process.env.DATABASE_URL!, {
    ssl: 'require',
    prepare: false, // bắt buộc với Transaction pooler của Supabase (cổng 6543)
  });

if (process.env.NODE_ENV !== 'production') globalForDb.sql = sql;

export default sql;
