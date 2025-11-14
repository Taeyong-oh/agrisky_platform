-- 데모 사용자 프로필 추가 (기존 샘플 데이터와 연동)
-- 농가 데모 계정
INSERT INTO public.user_profiles_2025_11_12_19_03 (id, user_id, user_type, full_name, phone, address) 
VALUES ('demo1111-1111-1111-1111-111111111111', 'demo1111-1111-1111-1111-111111111111', 'farmer', '김농부 (데모)', '010-1234-5678', '경기도 이천시 마장면')
ON CONFLICT (id) DO NOTHING;

-- 드론 조작자 데모 계정
INSERT INTO public.user_profiles_2025_11_12_19_03 (id, user_id, user_type, full_name, phone, address) 
VALUES ('demo2222-2222-2222-2222-222222222222', 'demo2222-2222-2222-2222-222222222222', 'operator', '최드론 (데모)', '010-4567-8901', '경기도 수원시 영통구')
ON CONFLICT (id) DO NOTHING;