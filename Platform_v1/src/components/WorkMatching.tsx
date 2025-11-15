import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Plus, MapPin, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WorkRequest {
  id: string;
  farmland_name: string;
  farmer_name: string;
  work_type: string;
  scheduled_date: string;
  area_to_spray: number;
  chemical_type: string;
  urgency_level: string;
  status: string;
  budget_krw: number;
  created_at: string;
}

interface WorkMatch {
  id: string;
  work_request_id: string;
  operator_name: string;
  drone_model: string;
  estimated_duration_minutes: number;
  estimated_cost_krw: number;
  match_score: number;
  status: string;
}

export default function WorkMatching() {
  const [workRequests, setWorkRequests] = useState<WorkRequest[]>([]);
  const [workMatches, setWorkMatches] = useState<WorkMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WorkRequest | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    farmland_id: '',
    work_type: '',
    scheduled_date: '',
    area_to_spray: '',
    chemical_type: '',
    urgency_level: 'normal',
    budget_krw: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 작업 요청 데이터 가져오기
      const { data: requestsData, error: requestsError } = await supabase
        .from('work_requests_2025_11_12_19_03')
        .select(`
          *,
          farmlands_2025_11_12_19_03(name),
          user_profiles_2025_11_12_19_03(full_name)
        `)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      const formattedRequests = (requestsData || []).map(request => ({
        id: request.id,
        farmland_name: (request.farmlands_2025_11_12_19_03 as any)?.name || '알 수 없음',
        farmer_name: (request.user_profiles_2025_11_12_19_03 as any)?.full_name || '알 수 없음',
        work_type: request.work_type,
        scheduled_date: request.scheduled_date,
        area_to_spray: request.area_to_spray,
        chemical_type: request.chemical_type,
        urgency_level: request.urgency_level,
        status: request.status,
        budget_krw: request.budget_krw,
        created_at: request.created_at
      }));

      setWorkRequests(formattedRequests);

      // 작업 매칭 데이터 가져오기
      const { data: matchesData, error: matchesError } = await supabase
        .from('work_matches_2025_11_12_19_03')
        .select(`
          *,
          user_profiles_2025_11_12_19_03(full_name),
          drones_2025_11_12_19_03(model)
        `);

      if (matchesError) throw matchesError;

      const formattedMatches = (matchesData || []).map(match => ({
        id: match.id,
        work_request_id: match.work_request_id,
        operator_name: (match.user_profiles_2025_11_12_19_03 as any)?.full_name || '알 수 없음',
        drone_model: (match.drones_2025_11_12_19_03 as any)?.model || '알 수 없음',
        estimated_duration_minutes: match.estimated_duration_minutes,
        estimated_cost_krw: match.estimated_cost_krw,
        match_score: match.match_score,
        status: match.status
      }));

      setWorkMatches(formattedMatches);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const requestData = {
        farmer_id: '11111111-1111-1111-1111-111111111111', // 샘플 농가 ID
        farmland_id: formData.farmland_id,
        work_type: formData.work_type,
        scheduled_date: formData.scheduled_date,
        area_to_spray: parseFloat(formData.area_to_spray),
        chemical_type: formData.chemical_type,
        urgency_level: formData.urgency_level,
        budget_krw: parseInt(formData.budget_krw)
      };

      const { error } = await supabase
        .from('work_requests_2025_11_12_19_03')
        .insert(requestData);

      if (error) throw error;

      toast({
        title: "성공",
        description: "작업 요청이 성공적으로 등록되었습니다.",
      });

      setIsDialogOpen(false);
      setFormData({
        farmland_id: '',
        work_type: '',
        scheduled_date: '',
        area_to_spray: '',
        chemical_type: '',
        urgency_level: 'normal',
        budget_krw: ''
      });
      fetchData();
    } catch (error) {
      console.error('작업 요청 저장 오류:', error);
      toast({
        title: "오류",
        description: "작업 요청 저장에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const generateAIMatch = async (requestId: string) => {
    try {
      // AI 매칭 시뮬레이션 (실제로는 복잡한 알고리즘 사용)
      const matchData = {
        work_request_id: requestId,
        operator_id: '44444444-4444-4444-4444-444444444444', // 샘플 조작자 ID
        drone_id: 'aaaaaaaa-1111-aaaa-1111-aaaaaaaaaaaa', // 샘플 드론 ID
        estimated_duration_minutes: Math.floor(Math.random() * 60) + 30,
        estimated_cost_krw: Math.floor(Math.random() * 500000) + 300000,
        match_score: Math.random() * 0.3 + 0.7 // 0.7-1.0 사이의 점수
      };

      const { error } = await supabase
        .from('work_matches_2025_11_12_19_03')
        .insert(matchData);

      if (error) throw error;

      toast({
        title: "성공",
        description: "AI 매칭이 완료되었습니다.",
      });

      fetchData();
    } catch (error) {
      console.error('AI 매칭 오류:', error);
      toast({
        title: "오류",
        description: "AI 매칭에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const acceptMatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('work_matches_2025_11_12_19_03')
        .update({ status: 'accepted' })
        .eq('id', matchId);

      if (error) throw error;

      toast({
        title: "성공",
        description: "매칭이 승인되었습니다.",
      });

      fetchData();
    } catch (error) {
      console.error('매칭 승인 오류:', error);
      toast({
        title: "오류",
        description: "매칭 승인에 실패했습니다.",
        variant: "destructive",
      });
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
      case 'accepted': return 'default';
      case 'in_progress': return 'secondary';
      case 'pending': return 'outline';
      case 'proposed': return 'secondary';
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

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return '긴급';
      case 'high': return '높음';
      case 'normal': return '보통';
      case 'low': return '낮음';
      default: return urgency;
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
          <h1 className="text-3xl font-bold tracking-tight">지능형 작업 매칭</h1>
          <p className="text-muted-foreground">농가의 작업 요청과 드론 조작자를 AI로 최적 매칭합니다</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              작업 요청
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>새 작업 요청</DialogTitle>
              <DialogDescription>
                농지 방제 작업을 요청하세요.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="farmland_id">농지 선택</Label>
                <Select value={formData.farmland_id} onValueChange={(value) => setFormData({ ...formData, farmland_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="농지를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aaaaaaaa-aaaa-1111-aaaa-111111111111">이천 1농장</SelectItem>
                    <SelectItem value="bbbbbbbb-bbbb-2222-bbbb-222222222222">이천 2농장</SelectItem>
                    <SelectItem value="cccccccc-cccc-3333-cccc-333333333333">당진 대농장</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="work_type">작업 종류</Label>
                <Select value={formData.work_type} onValueChange={(value) => setFormData({ ...formData, work_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="작업 종류를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pesticide">방제</SelectItem>
                    <SelectItem value="fertilizer">시비</SelectItem>
                    <SelectItem value="seeding">파종</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduled_date">예정일</Label>
                  <Input
                    id="scheduled_date"
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area_to_spray">작업 면적 (ha)</Label>
                  <Input
                    id="area_to_spray"
                    type="number"
                    step="0.1"
                    value={formData.area_to_spray}
                    onChange={(e) => setFormData({ ...formData, area_to_spray: e.target.value })}
                    placeholder="5.2"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="chemical_type">사용 약제</Label>
                <Input
                  id="chemical_type"
                  value={formData.chemical_type}
                  onChange={(e) => setFormData({ ...formData, chemical_type: e.target.value })}
                  placeholder="예: 살충제, 복합비료"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="urgency_level">긴급도</Label>
                  <Select value={formData.urgency_level} onValueChange={(value) => setFormData({ ...formData, urgency_level: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">낮음</SelectItem>
                      <SelectItem value="normal">보통</SelectItem>
                      <SelectItem value="high">높음</SelectItem>
                      <SelectItem value="urgent">긴급</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget_krw">예산 (원)</Label>
                  <Input
                    id="budget_krw"
                    type="number"
                    value={formData.budget_krw}
                    onChange={(e) => setFormData({ ...formData, budget_krw: e.target.value })}
                    placeholder="500000"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  취소
                </Button>
                <Button type="submit">
                  요청 등록
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 작업 요청 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>작업 요청 목록</CardTitle>
            <CardDescription>농가에서 요청한 작업 목록</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {workRequests.map((request) => {
              const matches = workMatches.filter(m => m.work_request_id === request.id);
              return (
                <div key={request.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{request.farmland_name}</h4>
                      <Badge variant={getUrgencyColor(request.urgency_level)}>
                        {getUrgencyLabel(request.urgency_level)}
                      </Badge>
                    </div>
                    <Badge variant={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{getWorkTypeLabel(request.work_type)} • {request.area_to_spray}ha</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{request.scheduled_date}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    농가: {request.farmer_name} • 예산: {request.budget_krw?.toLocaleString()}원
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">매칭 현황: {matches.length}개</span>
                    {request.status === 'pending' && (
                      <Button size="sm" onClick={() => generateAIMatch(request.id)}>
                        <Zap className="mr-2 h-4 w-4" />
                        AI 매칭
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* 매칭 결과 */}
        <Card>
          <CardHeader>
            <CardTitle>AI 매칭 결과</CardTitle>
            <CardDescription>최적화된 드론 조작자 매칭</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {workMatches.map((match) => {
              const request = workRequests.find(r => r.id === match.work_request_id);
              return (
                <div key={match.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{request?.farmland_name}</h4>
                    <Badge variant={getStatusColor(match.status)}>
                      {match.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">조작자</span>
                      <span className="font-medium">{match.operator_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">드론</span>
                      <span className="font-medium">{match.drone_model}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">예상 시간</span>
                      <span className="font-medium">{match.estimated_duration_minutes}분</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">예상 비용</span>
                      <span className="font-medium">{match.estimated_cost_krw.toLocaleString()}원</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">매칭 점수</span>
                      <Badge variant="outline">{Math.round(match.match_score * 100)}%</Badge>
                    </div>
                    {match.status === 'proposed' && (
                      <Button size="sm" onClick={() => acceptMatch(match.id)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        승인
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}