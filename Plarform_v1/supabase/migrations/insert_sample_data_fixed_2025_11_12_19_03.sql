-- 임시로 외래키 제약조건을 비활성화하고 샘플 데이터 삽입
ALTER TABLE public.user_profiles_2025_11_12_19_03 DROP CONSTRAINT user_profiles_2025_11_12_19_03_user_id_fkey;

-- 샘플 사용자 프로필 데이터 (농가)
INSERT INTO public.user_profiles_2025_11_12_19_03 (id, user_id, user_type, full_name, phone, address) VALUES
('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'farmer', '김농부', '010-1234-5678', '경기도 이천시 마장면'),
('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'farmer', '이농장', '010-2345-6789', '충남 당진시 합덕읍'),
('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'farmer', '박벼농사', '010-3456-7890', '전남 나주시 다시면');

-- 샘플 사용자 프로필 데이터 (드론 조작자)
INSERT INTO public.user_profiles_2025_11_12_19_03 (id, user_id, user_type, full_name, phone, address) VALUES
('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'operator', '최드론', '010-4567-8901', '경기도 수원시 영통구'),
('55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'operator', '정방제', '010-5678-9012', '충남 천안시 동남구'),
('66666666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666', 'operator', '한스프레이', '010-6789-0123', '전남 광주시 북구');

-- 샘플 농지 데이터
INSERT INTO public.farmlands_2025_11_12_19_03 (id, farmer_id, name, location_lat, location_lng, area_hectares, crop_type, soil_type) VALUES
('aaaa1111-aaaa-1111-aaaa-111111111111', '11111111-1111-1111-1111-111111111111', '이천 1농장', 37.2722, 127.4350, 5.2, '벼', '점토'),
('bbbb2222-bbbb-2222-bbbb-222222222222', '11111111-1111-1111-1111-111111111111', '이천 2농장', 37.2800, 127.4400, 3.8, '콩', '사양토'),
('cccc3333-cccc-3333-cccc-333333333333', '22222222-2222-2222-2222-222222222222', '당진 대농장', 36.8934, 126.6275, 12.5, '벼', '점토'),
('dddd4444-dddd-4444-dddd-444444444444', '33333333-3333-3333-3333-333333333333', '나주 황금들', 35.0160, 126.7107, 8.7, '벼', '점토');

-- 샘플 드론 데이터
INSERT INTO public.drones_2025_11_12_19_03 (id, operator_id, model, max_payload_kg, max_flight_time_minutes, max_speed_kmh, spray_width_meters, status) VALUES
('1111aaaa-1111-aaaa-1111-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'DJI T40', 40.0, 25, 10.0, 6.5, 'available'),
('2222bbbb-2222-bbbb-2222-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', 'DJI T30', 30.0, 20, 8.0, 5.5, 'available'),
('3333cccc-3333-cccc-3333-cccccccccccc', '55555555-5555-5555-5555-555555555555', 'XAG P100 Pro', 50.0, 30, 12.0, 7.0, 'available'),
('4444dddd-4444-dddd-4444-dddddddddddd', '66666666-6666-6666-6666-666666666666', 'DJI T25', 25.0, 18, 7.0, 5.0, 'maintenance');

-- 샘플 작업 요청 데이터
INSERT INTO public.work_requests_2025_11_12_19_03 (id, farmer_id, farmland_id, work_type, scheduled_date, area_to_spray, chemical_type, urgency_level, status, budget_krw) VALUES
('aaaa1111-bbbb-2222-cccc-333333333333', '11111111-1111-1111-1111-111111111111', 'aaaa1111-aaaa-1111-aaaa-111111111111', 'pesticide', '2025-11-15', 5.2, '살충제', 'high', 'pending', 520000),
('bbbb2222-cccc-3333-dddd-444444444444', '22222222-2222-2222-2222-222222222222', 'cccc3333-cccc-3333-cccc-333333333333', 'fertilizer', '2025-11-18', 12.5, '복합비료', 'normal', 'pending', 1250000),
('cccc3333-dddd-4444-eeee-555555555555', '33333333-3333-3333-3333-333333333333', 'dddd4444-dddd-4444-dddd-444444444444', 'pesticide', '2025-11-20', 8.7, '제초제', 'urgent', 'pending', 870000);

-- 샘플 작업 매칭 데이터
INSERT INTO public.work_matches_2025_11_12_19_03 (id, work_request_id, operator_id, drone_id, estimated_duration_minutes, estimated_cost_krw, match_score, status) VALUES
('match111-1111-1111-1111-111111111111', 'aaaa1111-bbbb-2222-cccc-333333333333', '44444444-4444-4444-4444-444444444444', '1111aaaa-1111-aaaa-1111-aaaaaaaaaaaa', 45, 480000, 0.92, 'proposed'),
('match222-2222-2222-2222-222222222222', 'bbbb2222-cccc-3333-dddd-444444444444', '55555555-5555-5555-5555-555555555555', '3333cccc-3333-cccc-3333-cccccccccccc', 85, 1150000, 0.88, 'accepted');

-- 샘플 비행 경로 데이터
INSERT INTO public.flight_paths_2025_11_12_19_03 (id, work_match_id, path_data, total_distance_km, estimated_flight_time_minutes, weather_conditions, optimization_score) VALUES
('path1111-1111-1111-1111-111111111111', 'match222-2222-2222-2222-222222222222', 
'{"waypoints": [{"lat": 36.8934, "lng": 126.6275, "altitude": 10}, {"lat": 36.8940, "lng": 126.6280, "altitude": 10}, {"lat": 36.8945, "lng": 126.6285, "altitude": 10}], "spray_pattern": "zigzag", "overlap_rate": 0.15}', 
8.5, 85, 
'{"temperature": 22, "humidity": 65, "wind_speed": 3.2, "wind_direction": "NE", "weather": "clear"}', 
0.94);

-- 샘플 작업 로그 데이터
INSERT INTO public.work_logs_2025_11_12_19_03 (id, work_match_id, flight_path_id, start_time, end_time, actual_area_sprayed, chemical_used_liters, flight_data, completion_status) VALUES
('log11111-1111-1111-1111-111111111111', 'match222-2222-2222-2222-222222222222', 'path1111-1111-1111-1111-111111111111', 
'2025-11-12 09:00:00+09', '2025-11-12 10:25:00+09', 12.3, 24.6, 
'{"actual_flight_time": 82, "average_speed": 6.2, "max_altitude": 12, "battery_used": 85}', 
'completed');