-- 사용자 프로필 테이블 (농가와 드론 조작자 구분)
CREATE TABLE public.user_profiles_2025_11_12_19_03 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('farmer', 'operator')),
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 농지 정보 테이블
CREATE TABLE public.farmlands_2025_11_12_19_03 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES public.user_profiles_2025_11_12_19_03(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lng DECIMAL(11, 8) NOT NULL,
  area_hectares DECIMAL(10, 2) NOT NULL,
  crop_type TEXT NOT NULL,
  soil_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 드론 정보 테이블
CREATE TABLE public.drones_2025_11_12_19_03 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID REFERENCES public.user_profiles_2025_11_12_19_03(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  max_payload_kg DECIMAL(5, 2) NOT NULL,
  max_flight_time_minutes INTEGER NOT NULL,
  max_speed_kmh DECIMAL(5, 2) NOT NULL,
  spray_width_meters DECIMAL(5, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 작업 요청 테이블
CREATE TABLE public.work_requests_2025_11_12_19_03 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES public.user_profiles_2025_11_12_19_03(id) ON DELETE CASCADE,
  farmland_id UUID REFERENCES public.farmlands_2025_11_12_19_03(id) ON DELETE CASCADE,
  work_type TEXT NOT NULL CHECK (work_type IN ('pesticide', 'fertilizer', 'seeding')),
  scheduled_date DATE NOT NULL,
  area_to_spray DECIMAL(10, 2) NOT NULL,
  chemical_type TEXT,
  urgency_level TEXT NOT NULL DEFAULT 'normal' CHECK (urgency_level IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'in_progress', 'completed', 'cancelled')),
  budget_krw INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 작업 매칭 테이블
CREATE TABLE public.work_matches_2025_11_12_19_03 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_request_id UUID REFERENCES public.work_requests_2025_11_12_19_03(id) ON DELETE CASCADE,
  operator_id UUID REFERENCES public.user_profiles_2025_11_12_19_03(id) ON DELETE CASCADE,
  drone_id UUID REFERENCES public.drones_2025_11_12_19_03(id) ON DELETE CASCADE,
  estimated_duration_minutes INTEGER NOT NULL,
  estimated_cost_krw INTEGER NOT NULL,
  match_score DECIMAL(3, 2) NOT NULL, -- AI 매칭 점수 (0.00 ~ 1.00)
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'accepted', 'rejected', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 비행 경로 테이블
CREATE TABLE public.flight_paths_2025_11_12_19_03 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_match_id UUID REFERENCES public.work_matches_2025_11_12_19_03(id) ON DELETE CASCADE,
  path_data JSONB NOT NULL, -- 경로 좌표 및 최적화 데이터
  total_distance_km DECIMAL(8, 3) NOT NULL,
  estimated_flight_time_minutes INTEGER NOT NULL,
  weather_conditions JSONB, -- 기상 데이터
  optimization_score DECIMAL(3, 2) NOT NULL, -- 최적화 점수
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 작업 로그 테이블
CREATE TABLE public.work_logs_2025_11_12_19_03 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_match_id UUID REFERENCES public.work_matches_2025_11_12_19_03(id) ON DELETE CASCADE,
  flight_path_id UUID REFERENCES public.flight_paths_2025_11_12_19_03(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  actual_area_sprayed DECIMAL(10, 2),
  chemical_used_liters DECIMAL(8, 2),
  flight_data JSONB, -- 실제 비행 데이터
  issues_encountered TEXT,
  completion_status TEXT NOT NULL DEFAULT 'in_progress' CHECK (completion_status IN ('in_progress', 'completed', 'aborted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책 설정
ALTER TABLE public.user_profiles_2025_11_12_19_03 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmlands_2025_11_12_19_03 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drones_2025_11_12_19_03 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_requests_2025_11_12_19_03 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_matches_2025_11_12_19_03 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_paths_2025_11_12_19_03 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_logs_2025_11_12_19_03 ENABLE ROW LEVEL SECURITY;

-- 사용자 프로필 정책
CREATE POLICY "Users can view own profile" ON public.user_profiles_2025_11_12_19_03
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles_2025_11_12_19_03
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles_2025_11_12_19_03
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 농지 정책 (농가만 자신의 농지 관리)
CREATE POLICY "Farmers can manage own farmlands" ON public.farmlands_2025_11_12_19_03
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles_2025_11_12_19_03 
      WHERE id = farmer_id AND user_id = auth.uid()
    )
  );

-- 드론 정책 (조작자만 자신의 드론 관리)
CREATE POLICY "Operators can manage own drones" ON public.drones_2025_11_12_19_03
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles_2025_11_12_19_03 
      WHERE id = operator_id AND user_id = auth.uid()
    )
  );

-- 작업 요청 정책
CREATE POLICY "Farmers can manage own work requests" ON public.work_requests_2025_11_12_19_03
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles_2025_11_12_19_03 
      WHERE id = farmer_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can view work requests" ON public.work_requests_2025_11_12_19_03
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles_2025_11_12_19_03 
      WHERE user_id = auth.uid() AND user_type = 'operator'
    )
  );

-- 작업 매칭 정책
CREATE POLICY "Users can view related work matches" ON public.work_matches_2025_11_12_19_03
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles_2025_11_12_19_03 
      WHERE user_id = auth.uid() AND (
        id = operator_id OR 
        id IN (SELECT farmer_id FROM public.work_requests_2025_11_12_19_03 WHERE id = work_request_id)
      )
    )
  );

-- 비행 경로 및 작업 로그 정책
CREATE POLICY "Users can view related flight paths" ON public.flight_paths_2025_11_12_19_03
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.work_matches_2025_11_12_19_03 wm
      JOIN public.user_profiles_2025_11_12_19_03 up ON (up.id = wm.operator_id OR up.id IN (
        SELECT wr.farmer_id FROM public.work_requests_2025_11_12_19_03 wr WHERE wr.id = wm.work_request_id
      ))
      WHERE wm.id = work_match_id AND up.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view related work logs" ON public.work_logs_2025_11_12_19_03
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.work_matches_2025_11_12_19_03 wm
      JOIN public.user_profiles_2025_11_12_19_03 up ON (up.id = wm.operator_id OR up.id IN (
        SELECT wr.farmer_id FROM public.work_requests_2025_11_12_19_03 wr WHERE wr.id = wm.work_request_id
      ))
      WHERE wm.id = work_match_id AND up.user_id = auth.uid()
    )
  );