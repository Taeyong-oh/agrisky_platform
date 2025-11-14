-- 인증 시스템을 위한 사용자 테이블 생성
-- PostgreSQL 직접 연결용 (Supabase 대신)

-- 사용자 인증 테이블
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 프로필 테이블 (기존 테이블과 연동)
-- user_id를 users 테이블과 연결
ALTER TABLE public.user_profiles_2025_11_12_19_03 
  DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;

-- users 테이블이 없으면 생성
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    CREATE TABLE public.users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email_verified BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- user_profiles 테이블의 user_id를 users 테이블과 연결
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_profiles_user_id_fkey'
  ) THEN
    ALTER TABLE public.user_profiles_2025_11_12_19_03
      ADD CONSTRAINT user_profiles_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles_2025_11_12_19_03(user_id);

-- 데모 계정 생성 함수
-- 비밀번호 해시는 bcrypt를 사용 (Node.js에서 생성)
-- 여기서는 평문 비밀번호를 저장하고, 애플리케이션에서 해시 처리

-- 데모 계정 데이터 (비밀번호는 애플리케이션에서 해시 처리됨)
-- 실제 비밀번호:
-- - farmer@demo.com: demo123456
-- - operator@demo.com: demo123456  
-- - admin@admin.com: admin1234

-- 주의: 실제 배포 시에는 아래 INSERT 문을 실행하지 말고,
-- 애플리케이션의 회원가입 API를 통해 계정을 생성하거나
-- 별도의 스크립트로 해시된 비밀번호를 생성하여 삽입해야 합니다.

