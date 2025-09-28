/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    ADMIN_USER: process.env.ADMIN_USER,
    ADMIN_PASS: process.env.ADMIN_PASS,
    HASH_SALT: process.env.HASH_SALT,
    EVENT_START: process.env.EVENT_START,
    EVENT_END: process.env.EVENT_END,
  }
}

module.exports = nextConfig
