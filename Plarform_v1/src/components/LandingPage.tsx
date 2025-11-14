import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import { 
  Zap, 
  Users, 
  BarChart3, 
  MapPin, 
  Clock, 
  Shield, 
  Tractor,
  Plane,
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp,
  Leaf,
  Target
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const features = [
    {
      icon: Zap,
      title: "AI 비행 최적화 엔진",
      description: "농지 조건, 기상 데이터, 드론 성능을 종합 분석하여 최적의 비행 경로를 자동 설계합니다.",
      benefits: ["23% 비행시간 단축", "18% 연료 효율성 향상", "96% 커버리지 정확도"]
    },
    {
      icon: Users,
      title: "실시간 협업 관리",
      description: "다수의 드론 조작자가 참여하는 대규모 공동 방제 작업을 실시간으로 관리합니다.",
      benefits: ["실시간 작업 모니터링", "돌발 상황 즉시 대응", "효율적 인력 배치"]
    },
    {
      icon: Target,
      title: "지능형 작업 매칭",
      description: "농가의 방제 수요와 드론 조작자를 AI가 최적으로 매칭하여 원스톱 서비스를 제공합니다.",
      benefits: ["94% 매칭 정확도", "평균 2시간 내 매칭", "계약부터 결제까지 자동화"]
    },
    {
      icon: BarChart3,
      title: "농업 데이터 분석",
      description: "비행 로그, 농약 살포량, 토양 상태 등을 수집·분석하여 AI 기술을 지속적으로 고도화합니다.",
      benefits: ["1,247개 비행 로그", "3,891개 기상 데이터", "567개 농지 정보"]
    }
  ];

  const userTypes = [
    {
      type: "farmer",
      icon: Tractor,
      title: "농가를 위한 솔루션",
      subtitle: "스마트한 농업으로 수확량 증대",
      benefits: [
        "정밀한 방제 작업으로 작물 품질 향상",
        "최적화된 농약 사용으로 비용 절감",
        "실시간 모니터링으로 안심 관리",
        "전문 조작자 매칭으로 신뢰성 확보"
      ],
      cta: "농가로 시작하기"
    },
    {
      type: "operator",
      icon: Plane,
      title: "드론 조작자를 위한 플랫폼",
      subtitle: "전문성을 수익으로 연결",
      benefits: [
        "AI 최적화로 작업 효율성 극대화",
        "안정적인 작업 매칭으로 수익 증대",
        "실시간 협업 시스템으로 대규모 작업 참여",
        "성과 기반 평가로 신뢰도 구축"
      ],
      cta: "조작자로 시작하기"
    }
  ];

  const stats = [
    { number: "1,200+", label: "완료된 작업", icon: CheckCircle },
    { number: "94%", label: "고객 만족도", icon: Star },
    { number: "23%", label: "효율성 향상", icon: TrendingUp },
    { number: "567", label: "등록 농지", icon: MapPin }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      <Header 
        showHomeButton={false}
        onHomeClick={() => window.location.href = '/'}
      />
      {/* 시작하기 버튼을 헤더에 추가 */}
      <div className="container mx-auto px-4 py-2 flex justify-end">
        <Button onClick={onGetStarted} className="bg-primary hover:bg-primary/90">
          시작하기
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* 히어로 섹션 */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="mb-8 flex justify-center">
            <div className="flex items-center justify-center w-24 h-24 bg-white rounded-2xl shadow-lg p-4">
              <img 
                src="/logo.jpg" 
                alt="AGRISKY 로고" 
                className="h-full w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          </div>
          
          <Badge variant="outline" className="mb-6 px-4 py-2">
            <Leaf className="mr-2 h-4 w-4" />
            차세대 스마트 농업 솔루션
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            AI가 설계하는<br />
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              스마트 농업의 미래
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            농지 조건과 기상 데이터를 AI가 실시간 분석하여 최적의 드론 방제 작업을 설계합니다.<br />
            농가와 전문 조작자를 지능적으로 매칭하여 효율적이고 정확한 농업 서비스를 제공합니다.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" onClick={onGetStarted} className="bg-primary hover:bg-primary/90 px-8 py-3">
              <Tractor className="mr-2 h-5 w-5" />
              농가로 시작하기
            </Button>
            <Button size="lg" variant="outline" onClick={onGetStarted} className="px-8 py-3">
              <Plane className="mr-2 h-5 w-5" />
              드론 조작자로 시작하기
            </Button>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 주요 기능 섹션 */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              혁신적인 AI 기술로 농업을 변화시킵니다
            </h2>
            <p className="text-xl text-gray-600">
              최첨단 기술과 농업 전문성이 결합된 통합 플랫폼
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 사용자 유형별 섹션 */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              모든 농업 참여자를 위한 맞춤 솔루션
            </h2>
            <p className="text-xl text-gray-600">
              농가와 드론 조작자, 모두에게 최적화된 서비스를 제공합니다
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {userTypes.map((userType, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                      <userType.icon className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl mb-2">{userType.title}</CardTitle>
                  <CardDescription className="text-lg text-gray-600">
                    {userType.subtitle}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userType.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                  <Button 
                    className="w-full mt-6 bg-primary hover:bg-primary/90" 
                    size="lg"
                    onClick={onGetStarted}
                  >
                    {userType.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 기술 우수성 섹션 */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            검증된 기술력과 신뢰성
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">94.2%</div>
              <div className="text-lg font-medium text-gray-900 mb-2">AI 모델 정확도</div>
              <div className="text-gray-600">1,247개의 비행 로그 학습 기반</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">23%</div>
              <div className="text-lg font-medium text-gray-900 mb-2">비행시간 단축</div>
              <div className="text-gray-600">기존 대비 효율성 대폭 향상</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">2시간</div>
              <div className="text-lg font-medium text-gray-900 mb-2">평균 매칭 시간</div>
              <div className="text-gray-600">빠르고 정확한 작업자 연결</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              지금 시작하여 스마트 농업의 혜택을 경험하세요
            </h3>
            <p className="text-gray-700 mb-6">
              AI 기반 최적화로 더 효율적이고 정확한 농업을 시작할 수 있습니다.
            </p>
            <Button size="lg" onClick={onGetStarted} className="bg-primary hover:bg-primary/90 px-8 py-3">
              무료로 시작하기
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img 
              src="/logo.png" 
              alt="아그리스카이 로고" 
              className="h-12 w-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src.endsWith('.png')) {
                  target.src = '/logo.jpg';
                }
              }}
            />
            <div>
              <h3 className="text-xl font-bold">아그리스카이</h3>
              <p className="text-sm text-gray-400">지능형 방제 작업 플랫폼</p>
            </div>
          </div>
          
          <p className="text-gray-400 mb-6">
            AI 기술로 농업의 미래를 만들어갑니다. 더 스마트하고 효율적인 농업을 위해 함께하세요.
          </p>
          
          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <span>© 2024 아그리스카이 플랫폼</span>
            <span>•</span>
            <span>혁신적인 농업 기술 솔루션</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

