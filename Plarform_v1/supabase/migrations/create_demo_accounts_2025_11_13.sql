-- 데모 계정 생성 스크립트
-- 이 스크립트는 Supabase SQL Editor에서 실행하거나
-- Supabase CLI를 통해 실행할 수 있습니다.

-- 주의: Supabase에서는 auth.users 테이블에 직접 삽입하는 것보다
-- Supabase 대시보드의 Authentication > Users에서 직접 생성하는 것이 좋습니다.

-- 방법 1: Supabase 대시보드에서 직접 생성 (권장)
-- 1. Supabase 대시보드 > Authentication > Users로 이동
-- 2. 각 계정을 "Add user"로 생성:
--    - 농가: farmer@demo.com / demo123456
--    - 조작자: operator@demo.com / demo123456
--    - Admin: admin@admin.com / admin1234
-- 3. Auto Confirm User 체크
-- 4. 생성 후 아래 SQL을 실행하여 프로필 생성 (USER_ID를 실제 ID로 변경)

-- 방법 2: 아래 SQL을 사용하여 프로필 생성
-- (auth.users는 대시보드에서 먼저 생성해야 함)

-- 농가 데모 계정 프로필 생성
-- 주의: 'YOUR_FARMER_USER_ID'를 Supabase 대시보드에서 생성한 사용자의 UUID로 변경
/*
INSERT INTO public.user_profiles_2025_11_12_19_03 (
  user_id,
  user_type,
  full_name,
  phone,
  address
) VALUES (
  'YOUR_FARMER_USER_ID', -- Supabase 대시보드에서 farmer@demo.com 사용자의 ID
  'farmer',
  '김농부 (데모)',
  '010-1234-5678',
  '경기도 이천시 마장면'
)
ON CONFLICT (user_id) DO UPDATE
SET
  user_type = 'farmer',
  full_name = '김농부 (데모)',
  phone = '010-1234-5678',
  address = '경기도 이천시 마장면',
  updated_at = NOW();
*/

-- 조작자 데모 계정 프로필 생성
-- 주의: 'YOUR_OPERATOR_USER_ID'를 Supabase 대시보드에서 생성한 사용자의 UUID로 변경
/*
INSERT INTO public.user_profiles_2025_11_12_19_03 (
  user_id,
  user_type,
  full_name,
  phone,
  address
) VALUES (
  'YOUR_OPERATOR_USER_ID', -- Supabase 대시보드에서 operator@demo.com 사용자의 ID
  'operator',
  '최드론 (데모)',
  '010-4567-8901',
  '경기도 수원시 영통구'
)
ON CONFLICT (user_id) DO UPDATE
SET
  user_type = 'operator',
  full_name = '최드론 (데모)',
  phone = '010-4567-8901',
  address = '경기도 수원시 영통구',
  updated_at = NOW();
*/

-- Admin 계정 프로필 생성
-- 주의: 'YOUR_ADMIN_USER_ID'를 Supabase 대시보드에서 생성한 사용자의 UUID로 변경
/*
INSERT INTO public.user_profiles_2025_11_12_19_03 (
  user_id,
  user_type,
  full_name,
  phone,
  address
) VALUES (
  'YOUR_ADMIN_USER_ID', -- Supabase 대시보드에서 admin@admin.com 사용자의 ID
  'operator',
  '관리자',
  '010-0000-0000',
  '시스템 관리자'
)
ON CONFLICT (user_id) DO UPDATE
SET
  user_type = 'operator',
  full_name = '관리자',
  phone = '010-0000-0000',
  address = '시스템 관리자',
  updated_at = NOW();
*/

-- 또는 자동으로 사용자 ID를 찾아서 프로필 생성하는 함수
DO $$
DECLARE
  farmer_user_id UUID;
  operator_user_id UUID;
  admin_user_id UUID;
BEGIN
  -- 농가 계정 찾기
  SELECT id INTO farmer_user_id
  FROM auth.users
  WHERE email = 'farmer@demo.com';
  
  IF farmer_user_id IS NOT NULL THEN
    INSERT INTO public.user_profiles_2025_11_12_19_03 (
      user_id, user_type, full_name, phone, address
    ) VALUES (
      farmer_user_id, 'farmer', '김농부 (데모)', '010-1234-5678', '경기도 이천시 마장면'
    )
    ON CONFLICT (user_id) DO UPDATE
    SET user_type = 'farmer', full_name = '김농부 (데모)', updated_at = NOW();
    
    RAISE NOTICE '농가 데모 계정 프로필 생성 완료';
  ELSE
    RAISE NOTICE '농가 계정(farmer@demo.com)을 먼저 Supabase 대시보드에서 생성해주세요.';
  END IF;
  
  -- 조작자 계정 찾기
  SELECT id INTO operator_user_id
  FROM auth.users
  WHERE email = 'operator@demo.com';
  
  IF operator_user_id IS NOT NULL THEN
    INSERT INTO public.user_profiles_2025_11_12_19_03 (
      user_id, user_type, full_name, phone, address
    ) VALUES (
      operator_user_id, 'operator', '최드론 (데모)', '010-4567-8901', '경기도 수원시 영통구'
    )
    ON CONFLICT (user_id) DO UPDATE
    SET user_type = 'operator', full_name = '최드론 (데모)', updated_at = NOW();
    
    RAISE NOTICE '조작자 데모 계정 프로필 생성 완료';
  ELSE
    RAISE NOTICE '조작자 계정(operator@demo.com)을 먼저 Supabase 대시보드에서 생성해주세요.';
  END IF;
  
  -- Admin 계정 찾기
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@admin.com';
  
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_profiles_2025_11_12_19_03 (
      user_id, user_type, full_name, phone, address
    ) VALUES (
      admin_user_id, 'operator', '관리자', '010-0000-0000', '시스템 관리자'
    )
    ON CONFLICT (user_id) DO UPDATE
    SET user_type = 'operator', full_name = '관리자', updated_at = NOW();
    
    RAISE NOTICE 'Admin 계정 프로필 생성 완료';
  ELSE
    RAISE NOTICE 'Admin 계정(admin@admin.com)을 먼저 Supabase 대시보드에서 생성해주세요.';
  END IF;
END $$;

