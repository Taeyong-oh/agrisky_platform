import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Route, 
  MapPin, 
  Clock, 
  Zap, 
  Wind, 
  Thermometer,
  Droplets,
  Navigation,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FlightPath {
  id: string;
  work_match_id: string;
  path_data: any;
  total_distance_km: number;
  estimated_flight_time_minutes: number;
  weather_conditions: any;
  optimization_score: number;
  farmland_name: string;
  drone_model: string;
  operator_name: string;
}

interface WorkLog {
  id: string;
  work_match_id: string;
  start_time: string;
  end_time: string | null;
  actual_area_sprayed: number | null;
  chemical_used_liters: number | null;
  flight_data: any;
  completion_status: string;
  farmland_name: string;
}

export default function FlightOptimization() {
  const [flightPaths, setFlightPaths] = useState<FlightPath[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPath, setSelectedPath] = useState<FlightPath | null>(null);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 비행 경로 데이터 가져오기
      const { data: pathsData, error: pathsError } = await supabase
        .from('flight_paths_2025_11_12_19_03')
        .select(`
          *,
          work_matches_2025_11_12_19_03(
            work_requests_2025_11_12_19_03(
              farmlands_2025_11_12_19_03(name)
            ),
            drones_2025_11_12_19_03(model),
            user_profiles_2025_11_12_19_03(full_name)
          )
        `);

      if (pathsError) throw pathsError;

      const formattedPaths = (pathsData || []).map(path => {
        const match = path.work_matches_2025_11_12_19_03 as any;
        return {
          id: path.id,
          work_match_id: path.work_match_id,
          path_data: path.path_data,
          total_distance_km: path.total_distance_km,
          estimated_flight_time_minutes: path.estimated_flight_time_minutes,
          weather_conditions: path.weather_conditions,
          optimization_score: path.optimization_score,
          farmland_name: match?.work_requests_2025_11_12_19_03?.farmlands_2025_11_12_19_03?.name || '알 수 없음',
          drone_model: match?.drones_2025_11_12_19_03?.model || '알 수 없음',
          operator_name: match?.user_profiles_2025_11_12_19_03?.full_name || '알 수 없음'
        };
      });

      setFlightPaths(formattedPaths);

      // 작업 로그 데이터 가져오기
      const { data: logsData, error: logsError } = await supabase
        .from('work_logs_2025_11_12_19_03')
        .select(`
          *,
          work_matches_2025_11_12_19_03(
            work_requests_2025_11_12_19_03(
              farmlands_2025_11_12_19_03(name)
            )
          )
        `)
        .order('start_time', { ascending: false });

      if (logsError) throw logsError;

      const formattedLogs = (logsData || []).map(log => {
        const match = log.work_matches_2025_11_12_19_03 as any;
        return {
          id: log.id,
          work_match_id: log.work_match_id,
          start_time: log.start_time,
          end_time: log.end_time,
          actual_area_sprayed: log.actual_area_sprayed,
          chemical_used_liters: log.chemical_used_liters,
          flight_data: log.flight_data,
          completion_status: log.completion_status,
          farmland_name: match?.work_requests_2025_11_12_19_03?.farmlands_2025_11_12_19_03?.name || '알 수 없음'
        };
      });

      setWorkLogs(formattedLogs);
    } catch (error) {
      console.error('데이터 로딩 오류:', error);
      toast({
        title: "오류",
        description: "데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateOptimizedPath = async () => {
    setIsSimulating(true);
    setSimulationProgress(0);

    // 시뮬레이션 진행률 업데이트
    const interval = setInterval(() => {
      setSimulationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSimulating(false);
          toast({
            title: "최적화 완료",
            description: "AI 비행 경로 최적화가 완료되었습니다.",
          });
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      // 새로운 최적화된 경로 생성 (시뮬레이션)
      const optimizedPathData = {
        work_match_id: 'bbbbbbbb-2222-2222-2222-222222222222',
        path_data: {
          waypoints: [
            { lat: 36.8934, lng: 126.6275, altitude: 10 },
            { lat: 36.8940, lng: 126.6280, altitude: 10 },
            { lat: 36.8945, lng: 126.6285, altitude: 10 },
            { lat: 36.8950, lng: 126.6290, altitude: 10 }
          ],
          spray_pattern: "optimized_zigzag",
          overlap_rate: 0.12,
          turn_radius: 5.0,
          speed_profile: "variable"
        },
        total_distance_km: Math.random() * 5 + 3,
        estimated_flight_time_minutes: Math.floor(Math.random() * 30) + 45,
        weather_conditions: {
          temperature: Math.floor(Math.random() * 10) + 18,
          humidity: Math.floor(Math.random() * 20) + 50,
          wind_speed: Math.random() * 5 + 1,
          wind_direction: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.floor(Math.random() * 8)],
          weather: "clear"
        },
        optimization_score: Math.random() * 0.1 + 0.9
      };

      setTimeout(() => {
        fetchData();
      }, 2000);
    } catch (error) {
      console.error('경로 최적화 오류:', error);
      toast({
        title: "오류",
        description: "경로 최적화에 실패했습니다.",
        variant: "destructive",
      });
      setIsSimulating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'aborted': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return '완료';
      case 'in_progress': return '진행 중';
      case 'aborted': return '중단됨';
      default: return status;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI 비행 최적화 엔진</h1>
          <p className="text-muted-foreground">농지 조건과 기상 데이터를 분석하여 최적의 비행 경로를 설계합니다</p>
        </div>
        <Button onClick={generateOptimizedPath} disabled={isSimulating}>
          <Zap className="mr-2 h-4 w-4" />
          {isSimulating ? '최적화 중...' : 'AI 경로 최적화'}
        </Button>
      </div>

      {isSimulating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 animate-pulse" />
              AI 최적화 진행 중
            </CardTitle>
            <CardDescription>
              농지 데이터, 기상 조건, 드론 성능을 종합 분석하여 최적 경로를 계산하고 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>진행률</span>
                <span>{Math.round(simulationProgress)}%</span>
              </div>
              <Progress value={simulationProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="paths" className="space-y-4">
        <TabsList>
          <TabsTrigger value="paths">최적화된 경로</TabsTrigger>
          <TabsTrigger value="logs">비행 로그</TabsTrigger>
          <TabsTrigger value="analytics">성능 분석</TabsTrigger>
        </TabsList>

        <TabsContent value="paths" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {flightPaths.map((path) => (
              <Card key={path.id} className={selectedPath?.id === path.id ? 'ring-2 ring-primary' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Route className="h-5 w-5" />
                      {path.farmland_name}
                    </CardTitle>
                    <Badge variant="outline">
                      {Math.round(path.optimization_score * 100)}% 최적화
                    </Badge>
                  </div>
                  <CardDescription>
                    {path.drone_model} • {path.operator_name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-muted-foreground" />
                      <span>{path.total_distance_km.toFixed(1)}km</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{path.estimated_flight_time_minutes}분</span>
                    </div>
                  </div>

                  {path.weather_conditions && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">기상 조건</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-muted-foreground" />
                          <span>{path.weather_conditions.temperature}°C</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-muted-foreground" />
                          <span>{path.weather_conditions.humidity}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wind className="h-4 w-4 text-muted-foreground" />
                          <span>{path.weather_conditions.wind_speed}m/s</span>
                        </div>
                        <div className="text-muted-foreground">
                          {path.weather_conditions.wind_direction}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">경로 최적화 특징</h4>
                    <div className="text-sm text-muted-foreground">
                      • 지그재그 패턴으로 효율적 커버리지<br/>
                      • 바람 방향 고려한 비행 순서<br/>
                      • 연료 소모 최소화 경로
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedPath(path)}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      지도 보기
                    </Button>
                    <Button variant="outline" size="sm">
                      <Play className="mr-2 h-4 w-4" />
                      시뮬레이션
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="space-y-4">
            {workLogs.map((log) => (
              <Card key={log.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{log.farmland_name}</CardTitle>
                    <Badge variant={getStatusColor(log.completion_status)}>
                      {getStatusLabel(log.completion_status)}
                    </Badge>
                  </div>
                  <CardDescription>
                    {new Date(log.start_time).toLocaleString('ko-KR')}
                    {log.end_time && ` - ${new Date(log.end_time).toLocaleString('ko-KR')}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">실제 살포 면적</span>
                      <div className="font-medium">
                        {log.actual_area_sprayed ? `${log.actual_area_sprayed}ha` : '-'}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">약제 사용량</span>
                      <div className="font-medium">
                        {log.chemical_used_liters ? `${log.chemical_used_liters}L` : '-'}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">실제 비행시간</span>
                      <div className="font-medium">
                        {log.flight_data?.actual_flight_time ? `${log.flight_data.actual_flight_time}분` : '-'}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">평균 속도</span>
                      <div className="font-medium">
                        {log.flight_data?.average_speed ? `${log.flight_data.average_speed}km/h` : '-'}
                      </div>
                    </div>
                  </div>

                  {log.flight_data && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <h4 className="text-sm font-medium mb-2">비행 데이터</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span>최대 고도: {log.flight_data.max_altitude}m</span>
                        <span>배터리 사용: {log.flight_data.battery_used}%</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>최적화 성능 지표</CardTitle>
                <CardDescription>AI 엔진의 최적화 효과 분석</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">비행 시간 단축</span>
                    <span className="text-sm font-medium">23%</span>
                  </div>
                  <Progress value={23} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">연료 효율성</span>
                    <span className="text-sm font-medium">18%</span>
                  </div>
                  <Progress value={18} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">커버리지 정확도</span>
                    <span className="text-sm font-medium">96%</span>
                  </div>
                  <Progress value={96} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">기상 적응성</span>
                    <span className="text-sm font-medium">89%</span>
                  </div>
                  <Progress value={89} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>학습 데이터 현황</CardTitle>
                <CardDescription>AI 모델 개선을 위한 데이터 수집</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">1,247</div>
                    <div className="text-sm text-muted-foreground">비행 로그</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">3,891</div>
                    <div className="text-sm text-muted-foreground">기상 데이터</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">567</div>
                    <div className="text-sm text-muted-foreground">농지 정보</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">94.2%</div>
                    <div className="text-sm text-muted-foreground">모델 정확도</div>
                  </div>
                </div>

                <div className="pt-4">
                  <h4 className="text-sm font-medium mb-2">최근 학습 개선사항</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 강풍 조건에서의 경로 안정성 향상</li>
                    <li>• 복잡한 농지 형태 대응 알고리즘 개선</li>
                    <li>• 다중 드론 협업 최적화 추가</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}