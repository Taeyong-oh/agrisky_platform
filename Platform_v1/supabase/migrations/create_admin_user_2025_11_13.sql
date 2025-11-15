-- Admin 사용자 생성 스크립트
-- 이 스크립트는 Supabase SQL Editor에서 실행하거나
-- Supabase CLI를 통해 실행할 수 있습니다.

-- 주의: Supabase에서는 auth.users 테이블에 직접 삽입하는 것보다
-- Supabase 대시보드의 Authentication > Users에서 직접 생성하거나
-- 또는 아래 방법을 사용하는 것이 좋습니다.

-- 방법 1: Supabase 대시보드에서 직접 생성
-- 1. Supabase 대시보드 > Authentication > Users로 이동
-- 2. "Add user" 클릭
-- 3. Email: admin@admin.com (또는 admin)
-- 4. Password: admin1234
-- 5. Auto Confirm User 체크
-- 6. 생성 후 아래 SQL을 실행하여 프로필 생성

-- 방법 2: SQL을 통한 생성 (비밀번호는 해시되어야 함)
-- 아래는 프로필만 생성하는 SQL입니다.
-- 실제 auth.users는 Supabase 대시보드에서 생성해야 합니다.

-- Admin 사용자 프로필 생성
-- 주의: user_id는 Supabase 대시보드에서 생성한 사용자의 ID로 변경해야 합니다.
-- 또는 아래 함수를 사용하여 사용자를 생성할 수 있습니다.

-- Admin 사용자 생성 함수 (Supabase에서 실행)
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- auth.users에 사용자 생성 (비밀번호는 Supabase가 자동으로 해시)
  -- 주의: 이 방법은 Supabase의 내부 함수를 사용해야 합니다.
  -- 실제로는 Supabase 대시보드에서 사용자를 생성하는 것이 더 안전합니다.
  
  -- 사용자가 이미 존재하는지 확인
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@admin.com' OR email = 'admin';
  
  -- 사용자가 없으면 프로필 생성 스크립트는 실행하지 않음
  IF admin_user_id IS NULL THEN
    RAISE NOTICE 'Admin 사용자를 먼저 Supabase 대시보드에서 생성해주세요.';
    RAISE NOTICE 'Email: admin@admin.com 또는 admin';
    RAISE NOTICE 'Password: admin1234';
  ELSE
    -- Admin 프로필 생성
    INSERT INTO public.user_profiles_2025_11_12_19_03 (
      user_id,
      user_type,
      full_name,
      phone,
      address
    ) VALUES (
      admin_user_id,
      'operator', -- Admin은 operator 타입으로 설정
      '관리자',
      '010-0000-0000',
      '시스템 관리자'
    )
    ON CONFLICT (user_id) DO UPDATE
    SET
      user_type = 'operator',
      full_name = '관리자',
      updated_at = NOW();
    
    RAISE NOTICE 'Admin 프로필이 생성되었습니다.';
  END IF;
END $$;

-- 또는 간단하게 프로필만 생성하려면:
-- 1. Supabase 대시보드에서 admin@admin.com / admin1234 계정 생성
-- 2. 생성된 사용자의 ID를 확인
-- 3. 아래 SQL에서 'YOUR_USER_ID_HERE'를 실제 사용자 ID로 변경하여 실행

/*
INSERT INTO public.user_profiles_2025_11_12_19_03 (
  user_id,
  user_type,
  full_name,
  phone,
  address
) VALUES (
  'YOUR_USER_ID_HERE', -- Supabase 대시보드에서 생성한 사용자의 ID
  'operator',
  '관리자',
  '010-0000-0000',
  '시스템 관리자'
)
ON CONFLICT (user_id) DO NOTHING;
*/

