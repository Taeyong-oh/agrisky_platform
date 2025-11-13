import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plane, Plus, Edit, Trash2, Battery, Clock, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DroneData {
  id: string;
  model: string;
  max_payload_kg: number;
  max_flight_time_minutes: number;
  max_speed_kmh: number;
  spray_width_meters: number;
  status: string;
  operator_name: string;
}

export default function DroneManagement() {
  const [drones, setDrones] = useState<DroneData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDrone, setEditingDrone] = useState<DroneData | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    model: '',
    max_payload_kg: '',
    max_flight_time_minutes: '',
    max_speed_kmh: '',
    spray_width_meters: '',
    status: 'available'
  });

  useEffect(() => {
    fetchDrones();
  }, []);

  const fetchDrones = async () => {
    try {
      const { data, error } = await supabase
        .from('drones_2025_11_12_19_03')
        .select(`
          *,
          user_profiles_2025_11_12_19_03(full_name)
        `);

      if (error) throw error;

      const formattedDrones = (data || []).map(drone => ({
        id: drone.id,
        model: drone.model,
        max_payload_kg: drone.max_payload_kg,
        max_flight_time_minutes: drone.max_flight_time_minutes,
        max_speed_kmh: drone.max_speed_kmh,
        spray_width_meters: drone.spray_width_meters,
        status: drone.status,
        operator_name: (drone.user_profiles_2025_11_12_19_03 as any)?.full_name || '알 수 없음'
      }));

      setDrones(formattedDrones);
    } catch (error) {
      console.error('드론 데이터 로딩 오류:', error);
      toast({
        title: "오류",
        description: "드론 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const droneData = {
        model: formData.model,
        max_payload_kg: parseFloat(formData.max_payload_kg),
        max_flight_time_minutes: parseInt(formData.max_flight_time_minutes),
        max_speed_kmh: parseFloat(formData.max_speed_kmh),
        spray_width_meters: parseFloat(formData.spray_width_meters),
        status: formData.status,
        operator_id: '44444444-4444-4444-4444-444444444444' // 샘플 조작자 ID
      };

      let error;
      if (editingDrone) {
        const { error: updateError } = await supabase
          .from('drones_2025_11_12_19_03')
          .update(droneData)
          .eq('id', editingDrone.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('drones_2025_11_12_19_03')
          .insert(droneData);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "성공",
        description: `드론이 성공적으로 ${editingDrone ? '수정' : '등록'}되었습니다.`,
      });

      setIsDialogOpen(false);
      setEditingDrone(null);
      setFormData({
        model: '',
        max_payload_kg: '',
        max_flight_time_minutes: '',
        max_speed_kmh: '',
        spray_width_meters: '',
        status: 'available'
      });
      fetchDrones();
    } catch (error) {
      console.error('드론 저장 오류:', error);
      toast({
        title: "오류",
        description: "드론 저장에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (drone: DroneData) => {
    setEditingDrone(drone);
    setFormData({
      model: drone.model,
      max_payload_kg: drone.max_payload_kg.toString(),
      max_flight_time_minutes: drone.max_flight_time_minutes.toString(),
      max_speed_kmh: drone.max_speed_kmh.toString(),
      spray_width_meters: drone.spray_width_meters.toString(),
      status: drone.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 드론을 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('drones_2025_11_12_19_03')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "성공",
        description: "드론이 성공적으로 삭제되었습니다.",
      });

      fetchDrones();
    } catch (error) {
      console.error('드론 삭제 오류:', error);
      toast({
        title: "오류",
        description: "드론 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'in_use': return 'secondary';
      case 'maintenance': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return '사용 가능';
      case 'in_use': return '작업 중';
      case 'maintenance': return '정비 중';
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
          <h1 className="text-3xl font-bold tracking-tight">드론 관리</h1>
          <p className="text-muted-foreground">등록된 드론 정보를 관리하고 새로운 드론을 추가하세요</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingDrone(null);
              setFormData({
                model: '',
                max_payload_kg: '',
                max_flight_time_minutes: '',
                max_speed_kmh: '',
                spray_width_meters: '',
                status: 'available'
              });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              드론 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingDrone ? '드론 수정' : '새 드론 추가'}</DialogTitle>
              <DialogDescription>
                드론 정보를 입력하여 {editingDrone ? '수정' : '등록'}하세요.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model">드론 모델</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="예: DJI T40"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_payload_kg">최대 적재량 (kg)</Label>
                  <Input
                    id="max_payload_kg"
                    type="number"
                    step="0.1"
                    value={formData.max_payload_kg}
                    onChange={(e) => setFormData({ ...formData, max_payload_kg: e.target.value })}
                    placeholder="40.0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_flight_time_minutes">최대 비행시간 (분)</Label>
                  <Input
                    id="max_flight_time_minutes"
                    type="number"
                    value={formData.max_flight_time_minutes}
                    onChange={(e) => setFormData({ ...formData, max_flight_time_minutes: e.target.value })}
                    placeholder="25"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_speed_kmh">최대 속도 (km/h)</Label>
                  <Input
                    id="max_speed_kmh"
                    type="number"
                    step="0.1"
                    value={formData.max_speed_kmh}
                    onChange={(e) => setFormData({ ...formData, max_speed_kmh: e.target.value })}
                    placeholder="10.0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spray_width_meters">살포 폭 (m)</Label>
                  <Input
                    id="spray_width_meters"
                    type="number"
                    step="0.1"
                    value={formData.spray_width_meters}
                    onChange={(e) => setFormData({ ...formData, spray_width_meters: e.target.value })}
                    placeholder="6.5"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">상태</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="상태를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">사용 가능</SelectItem>
                    <SelectItem value="in_use">작업 중</SelectItem>
                    <SelectItem value="maintenance">정비 중</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  취소
                </Button>
                <Button type="submit">
                  {editingDrone ? '수정' : '등록'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {drones.map((drone) => (
          <Card key={drone.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  {drone.model}
                </CardTitle>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(drone)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(drone.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>조작자: {drone.operator_name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">상태</span>
                <Badge variant={getStatusColor(drone.status)}>
                  {getStatusLabel(drone.status)}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Battery className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">적재량</span>
                  </div>
                  <span className="text-sm font-medium">{drone.max_payload_kg}kg</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">비행시간</span>
                  </div>
                  <span className="text-sm font-medium">{drone.max_flight_time_minutes}분</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">최대속도</span>
                  </div>
                  <span className="text-sm font-medium">{drone.max_speed_kmh}km/h</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">살포 폭</span>
                  <span className="text-sm font-medium">{drone.spray_width_meters}m</span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                성능 상세보기
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {drones.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Plane className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">등록된 드론이 없습니다</h3>
            <p className="text-muted-foreground mb-4">
              첫 번째 드론을 등록하여 농업 방제 서비스를 시작하세요.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              드론 추가
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}