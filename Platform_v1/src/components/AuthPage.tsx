import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { User, Tractor, Plane, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 로그인 폼 상태
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // 회원가입 폼 상태
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    user_type: '',
    full_name: '',
    phone: '',
    address: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn(loginForm.email, loginForm.password);
      if (result.error) {
        console.error('로그인 실패:', result.error);
      } else {
        console.log('로그인 성공, 페이지 전환 대기 중...');
        // onAuthStateChange가 자동으로 트리거되어 페이지가 전환됩니다
      }
    } catch (error) {
      console.error('로그인 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupForm.password !== signupForm.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!signupForm.user_type) {
      alert('사용자 유형을 선택해주세요.');
      return;
    }

    setLoading(true);

    try {
      await signUp(signupForm.email, signupForm.password, {
        user_type: signupForm.user_type,
        full_name: signupForm.full_name,
        phone: signupForm.phone,
        address: signupForm.address
      });
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (userType: 'farmer' | 'operator' | 'admin') => {
    setLoading(true);
    const demoCredentials = {
      farmer: { email: 'farmer@demo.com', password: 'demo123456' },
      operator: { email: 'operator@demo.com', password: 'demo123456' },
      admin: { email: 'admin@admin.com', password: 'admin1234' }
    };

    try {
      const result = await signIn(demoCredentials[userType].email, demoCredentials[userType].password);
      if (result.error) {
        console.error('데모 로그인 실패:', result.error);
        alert(`데모 계정 로그인에 실패했습니다.\n\n계정이 아직 생성되지 않았을 수 있습니다.\n\n이메일: ${demoCredentials[userType].email}\n비밀번호: ${demoCredentials[userType].password}\n\n먼저 회원가입을 진행해주세요.`);
      } else {
        console.log('데모 로그인 성공, 페이지 전환 대기 중...');
        // onAuthStateChange가 자동으로 트리거되어 페이지가 전환됩니다
      }
    } catch (error: any) {
      console.error('데모 로그인 오류:', error);
      alert(`로그인 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      <Header showHomeButton={true} />
      <div className="flex items-center justify-center p-4 pt-8">
        <div className="w-full max-w-md">

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">로그인</CardTitle>
            <CardDescription className="text-center">
              계정에 로그인하여 아그리스카이 서비스를 이용하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">로그인</TabsTrigger>
                <TabsTrigger value="signup">회원가입</TabsTrigger>
              </TabsList>

              {/* 로그인 탭 */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">이메일</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">비밀번호</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="비밀번호를 입력하세요"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? '로그인 중...' : '로그인'}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      또는 데모 계정으로 체험
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => demoLogin('farmer')}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Tractor className="h-4 w-4" />
                    농가 체험
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => demoLogin('operator')}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Plane className="h-4 w-4" />
                    조작자 체험
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => demoLogin('admin')}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Admin
                  </Button>
                </div>
              </TabsContent>

              {/* 회원가입 탭 */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-type">사용자 유형</Label>
                    <Select value={signupForm.user_type} onValueChange={(value) => setSignupForm({ ...signupForm, user_type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="사용자 유형을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="farmer">
                          <div className="flex items-center gap-2">
                            <Tractor className="h-4 w-4" />
                            농가 (작업 요청자)
                          </div>
                        </SelectItem>
                        <SelectItem value="operator">
                          <div className="flex items-center gap-2">
                            <Plane className="h-4 w-4" />
                            드론 조작자 (서비스 제공자)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">이름</Label>
                      <Input
                        id="signup-name"
                        placeholder="홍길동"
                        value={signupForm.full_name}
                        onChange={(e) => setSignupForm({ ...signupForm, full_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">연락처</Label>
                      <Input
                        id="signup-phone"
                        placeholder="010-1234-5678"
                        value={signupForm.phone}
                        onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-address">주소</Label>
                    <Input
                      id="signup-address"
                      placeholder="경기도 이천시 마장면"
                      value={signupForm.address}
                      onChange={(e) => setSignupForm({ ...signupForm, address: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">이메일</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">비밀번호</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="8자 이상"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">비밀번호 확인</Label>
                      <Input
                        id="signup-confirm"
                        type="password"
                        placeholder="비밀번호 재입력"
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? '가입 중...' : '회원가입'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

          {/* 푸터 */}
          <div className="text-center mt-6 text-sm text-gray-600">
            <p>아그리스카이 플랫폼으로 스마트한 농업을 시작하세요</p>
            <p className="mt-1">• 비행 경로 최적화 • 실시간 협업 관리 • 지능형 작업 매칭</p>
          </div>
        </div>
      </div>
    </div>
  );
}

