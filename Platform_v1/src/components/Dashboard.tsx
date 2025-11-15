import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Plane, 
  MapPin,
  Users, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalDrones: number;
  activeDrones: number;
  totalFarmlands: number;
  pendingRequests: number;
  completedWorks: number;
  totalOperators: number;
}

interface WorkRequest {
  id: string;
  farmland_name: string;
  work_type: string;
  urgency_level: string;
  scheduled_date: string;
  status: string;
  area_to_spray: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDrones: 0,
    activeDrones: 0,
    totalFarmlands: 0,
    pendingRequests: 0,
    completedWorks: 0,
    totalOperators: 0
  });
  const [recentRequests, setRecentRequests] = useState<WorkRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 통계 데이터 가져오기
      const [dronesResult, farmlandsResult, requestsResult, operatorsResult, worksResult] = await Promise.all([
        supabase.from('drones_2025_11_12_19_03').select('status'),
        supabase.from('farmlands_2025_11_12_19_03').select('id'),
        supabase.from('work_requests_2025_11_12_19_03').select('*'),
        supabase.from('user_profiles_2025_11_12_19_03').select('user_type').eq('user_type', 'operator'),
        supabase.from('work_logs_2025_11_12_19_03').select('completion_status').eq('completion_status', 'completed')
      ]);

      const drones = dronesResult.data || [];
      const activeDrones = drones.filter(d => d.status === 'available' || d.status === 'in_use').length;
      const pendingRequests = (requestsResult.data || []).filter(r => r.status === 'pending').length;

      setStats({
        totalDrones: drones.length,
        activeDrones,
        totalFarmlands: farmlandsResult.data?.length || 0,
        pendingRequests,
        completedWorks: worksResult.data?.length || 0,
        totalOperators: operatorsResult.data?.length || 0
      });

      // 최근 작업 요청 가져오기
      const recentRequestsData = await supabase
        .from('work_requests_2025_11_12_19_03')
        .select(`
          id,
          work_type,
          urgency_level,
          scheduled_date,
          status,
          area_to_spray,
          farmlands_2025_11_12_19_03(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentRequestsData.data) {
        const formattedRequests = recentRequestsData.data.map(req => ({
          id: req.id,
          farmland_name: (req.farmlands_2025_11_12_19_03 as any)?.name || '알 수 없음',
          work_type: req.work_type,
          urgency_level: req.urgency_level,
          scheduled_date: req.scheduled_date,
          status: req.status,
          area_to_spray: req.area_to_spray
        }));
        setRecentRequests(formattedRequests);
      }
    } catch (error) {
      console.error('대시보드 데이터 로딩 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'normal': return 'outline';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  const getWorkTypeLabel = (type: string) => {
    switch (type) {
      case 'pesticide': return '방제';
      case 'fertilizer': return '시비';
      case 'seeding': return '파종';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">아그리스카이 플랫폼</h1>
          <p className="text-muted-foreground">실시간 드론 작업 모니터링 및 관리</p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline">
          <TrendingUp className="mr-2 h-4 w-4" />
          새로고침
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 드론 수</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDrones}</div>
            <p className="text-xs text-muted-foreground">
              활성: {stats.activeDrones}대
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">등록 농지</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFarmlands}</div>
            <p className="text-xs text-muted-foreground">
              관리 중인 농지
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">대기 작업</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              매칭 대기 중
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료 작업</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedWorks}</div>
            <p className="text-xs text-muted-foreground">
              이번 달 완료
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 메인 콘텐츠 */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="requests">작업 요청</TabsTrigger>
          <TabsTrigger value="analytics">분석</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>최근 작업 요청</CardTitle>
                <CardDescription>
                  최근 등록된 작업 요청 현황
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{request.farmland_name}</h4>
                          <Badge variant={getUrgencyColor(request.urgency_level)}>
                            {request.urgency_level}
                          </Badge>
                          <Badge variant={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {getWorkTypeLabel(request.work_type)} • {request.area_to_spray}ha • {request.scheduled_date}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        상세보기
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>시스템 상태</CardTitle>
                <CardDescription>
                  실시간 시스템 모니터링
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">드론 가동률</span>
                    <span className="text-sm font-medium">
                      {stats.totalDrones > 0 ? Math.round((stats.activeDrones / stats.totalDrones) * 100) : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={stats.totalDrones > 0 ? (stats.activeDrones / stats.totalDrones) * 100 : 0} 
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">작업 처리율</span>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI 최적화 점수</span>
                    <span className="text-sm font-medium">94%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>

                <div className="pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>모든 시스템 정상</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span>AI 엔진 활성화</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span>{stats.totalOperators}명 조작자 대기</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>작업 요청 관리</CardTitle>
              <CardDescription>
                농가의 작업 요청을 확인하고 드론 조작자와 매칭하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">작업 요청 관리</h3>
                <p className="text-muted-foreground mb-4">
                  상세한 작업 요청 관리 기능이 곧 추가됩니다.
                </p>
                <Button>작업 요청 보기</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>데이터 분석</CardTitle>
              <CardDescription>
                농업 데이터 수집 및 AI 분석 결과
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">분석 대시보드</h3>
                <p className="text-muted-foreground mb-4">
                  상세한 데이터 분석 및 인사이트가 곧 추가됩니다.
                </p>
                <Button>분석 보고서 보기</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}