# Admin 계정 설정 가이드

## Admin 계정 정보
- **이메일**: `admin@admin.com` 또는 `admin`
- **비밀번호**: `admin1234`

## 설정 방법

### 방법 1: Supabase 대시보드에서 직접 생성 (권장)

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard 접속
   - 프로젝트 선택

2. **Authentication > Users로 이동**
   - 왼쪽 메뉴에서 "Authentication" 클릭
   - "Users" 탭 선택

3. **새 사용자 추가**
   - "Add user" 버튼 클릭
   - **Email**: `admin@admin.com` 입력
   - **Password**: `admin1234` 입력
   - **Auto Confirm User** 체크박스 선택 (이메일 인증 없이 바로 사용 가능)
   - "Create user" 클릭

4. **사용자 ID 확인**
   - 생성된 사용자의 UUID를 복사

5. **프로필 생성**
   - SQL Editor로 이동
   - 아래 SQL을 실행 (USER_ID를 위에서 복사한 UUID로 변경):

```sql
INSERT INTO public.user_profiles_2025_11_12_19_03 (
  user_id,
  user_type,
  full_name,
  phone,
  address
) VALUES (
  'YOUR_USER_ID_HERE', -- 위에서 복사한 UUID로 변경
  'operator',
  '관리자',
  '010-0000-0000',
  '시스템 관리자'
)
ON CONFLICT (user_id) DO NOTHING;
```

### 방법 2: 로그인 페이지에서 직접 회원가입

1. **앱 실행**
2. **회원가입 탭 선택**
3. **정보 입력**:
   - 사용자 유형: 드론 조작자 (서비스 제공자)
   - 이름: 관리자
   - 이메일: `admin@admin.com`
   - 비밀번호: `admin1234`
   - 비밀번호 확인: `admin1234`
4. **회원가입 완료**

### 방법 3: 로그인 페이지의 Admin 버튼 사용

로그인 페이지에서 "Admin" 버튼을 클릭하면 자동으로 로그인을 시도합니다.
(계정이 먼저 생성되어 있어야 합니다)

## 로그인 테스트

1. 앱 실행
2. 로그인 페이지에서:
   - 이메일: `admin@admin.com`
   - 비밀번호: `admin1234`
   - 또는 "Admin" 버튼 클릭

## 주의사항

- Supabase의 RLS(Row Level Security) 정책에 따라 admin 계정도 일반 사용자와 동일한 권한을 가집니다.
- 모든 데이터에 접근하려면 RLS 정책을 수정하거나, admin 전용 정책을 추가해야 할 수 있습니다.
- 프로덕션 환경에서는 더 강력한 비밀번호를 사용하는 것을 권장합니다.

