import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Farmland {
  id: string;
  name: string;
  location_lat: number;
  location_lng: number;
  area_hectares: number;
  crop_type: string;
  soil_type: string;
  farmer_name: string;
}

export default function FarmlandManagement() {
  const [farmlands, setFarmlands] = useState<Farmland[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFarmland, setEditingFarmland] = useState<Farmland | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    location_lat: '',
    location_lng: '',
    area_hectares: '',
    crop_type: '',
    soil_type: ''
  });

  useEffect(() => {
    fetchFarmlands();
  }, []);

  const fetchFarmlands = async () => {
    try {
      const { data, error } = await supabase
        .from('farmlands_2025_11_12_19_03')
        .select(`
          *,
          user_profiles_2025_11_12_19_03(full_name)
        `);

      if (error) throw error;

      const formattedFarmlands = (data || []).map(farmland => ({
        id: farmland.id,
        name: farmland.name,
        location_lat: farmland.location_lat,
        location_lng: farmland.location_lng,
        area_hectares: farmland.area_hectares,
        crop_type: farmland.crop_type,
        soil_type: farmland.soil_type,
        farmer_name: (farmland.user_profiles_2025_11_12_19_03 as any)?.full_name || '알 수 없음'
      }));

      setFarmlands(formattedFarmlands);
    } catch (error) {
      console.error('농지 데이터 로딩 오류:', error);
      toast({
        title: "오류",
        description: "농지 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const farmlandData = {
        name: formData.name,
        location_lat: parseFloat(formData.location_lat),
        location_lng: parseFloat(formData.location_lng),
        area_hectares: parseFloat(formData.area_hectares),
        crop_type: formData.crop_type,
        soil_type: formData.soil_type,
        farmer_id: '11111111-1111-1111-1111-111111111111' // 샘플 농가 ID
      };

      let error;
      if (editingFarmland) {
        const { error: updateError } = await supabase
          .from('farmlands_2025_11_12_19_03')
          .update(farmlandData)
          .eq('id', editingFarmland.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('farmlands_2025_11_12_19_03')
          .insert(farmlandData);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "성공",
        description: `농지가 성공적으로 ${editingFarmland ? '수정' : '등록'}되었습니다.`,
      });

      setIsDialogOpen(false);
      setEditingFarmland(null);
      setFormData({
        name: '',
        location_lat: '',
        location_lng: '',
        area_hectares: '',
        crop_type: '',
        soil_type: ''
      });
      fetchFarmlands();
    } catch (error) {
      console.error('농지 저장 오류:', error);
      toast({
        title: "오류",
        description: "농지 저장에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (farmland: Farmland) => {
    setEditingFarmland(farmland);
    setFormData({
      name: farmland.name,
      location_lat: farmland.location_lat.toString(),
      location_lng: farmland.location_lng.toString(),
      area_hectares: farmland.area_hectares.toString(),
      crop_type: farmland.crop_type,
      soil_type: farmland.soil_type || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 농지를 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('farmlands_2025_11_12_19_03')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "성공",
        description: "농지가 성공적으로 삭제되었습니다.",
      });

      fetchFarmlands();
    } catch (error) {
      console.error('농지 삭제 오류:', error);
      toast({
        title: "오류",
        description: "농지 삭제에 실패했습니다.",
        variant: "destructive",
      });
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
          <h1 className="text-3xl font-bold tracking-tight">농지 관리</h1>
          <p className="text-muted-foreground">등록된 농지 정보를 관리하고 새로운 농지를 추가하세요</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingFarmland(null);
              setFormData({
                name: '',
                location_lat: '',
                location_lng: '',
                area_hectares: '',
                crop_type: '',
                soil_type: ''
              });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              농지 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingFarmland ? '농지 수정' : '새 농지 추가'}</DialogTitle>
              <DialogDescription>
                농지 정보를 입력하여 {editingFarmland ? '수정' : '등록'}하세요.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">농지명</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 이천 1농장"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location_lat">위도</Label>
                  <Input
                    id="location_lat"
                    type="number"
                    step="any"
                    value={formData.location_lat}
                    onChange={(e) => setFormData({ ...formData, location_lat: e.target.value })}
                    placeholder="37.2722"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location_lng">경도</Label>
                  <Input
                    id="location_lng"
                    type="number"
                    step="any"
                    value={formData.location_lng}
                    onChange={(e) => setFormData({ ...formData, location_lng: e.target.value })}
                    placeholder="127.4350"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area_hectares">면적 (헥타르)</Label>
                <Input
                  id="area_hectares"
                  type="number"
                  step="0.1"
                  value={formData.area_hectares}
                  onChange={(e) => setFormData({ ...formData, area_hectares: e.target.value })}
                  placeholder="5.2"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="crop_type">작물 종류</Label>
                <Select value={formData.crop_type} onValueChange={(value) => setFormData({ ...formData, crop_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="작물을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="벼">벼</SelectItem>
                    <SelectItem value="콩">콩</SelectItem>
                    <SelectItem value="옥수수">옥수수</SelectItem>
                    <SelectItem value="배추">배추</SelectItem>
                    <SelectItem value="무">무</SelectItem>
                    <SelectItem value="기타">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="soil_type">토양 종류</Label>
                <Select value={formData.soil_type} onValueChange={(value) => setFormData({ ...formData, soil_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="토양 종류를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="점토">점토</SelectItem>
                    <SelectItem value="사양토">사양토</SelectItem>
                    <SelectItem value="양토">양토</SelectItem>
                    <SelectItem value="사토">사토</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  취소
                </Button>
                <Button type="submit">
                  {editingFarmland ? '수정' : '등록'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {farmlands.map((farmland) => (
          <Card key={farmland.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{farmland.name}</CardTitle>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(farmland)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(farmland.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>농가: {farmland.farmer_name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {farmland.location_lat.toFixed(4)}, {farmland.location_lng.toFixed(4)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">면적</span>
                <Badge variant="outline">{farmland.area_hectares}ha</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">작물</span>
                <Badge variant="secondary">{farmland.crop_type}</Badge>
              </div>
              
              {farmland.soil_type && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">토양</span>
                  <Badge variant="outline">{farmland.soil_type}</Badge>
                </div>
              )}
              
              <Button variant="outline" className="w-full mt-4">
                지도에서 보기
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {farmlands.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">등록된 농지가 없습니다</h3>
            <p className="text-muted-foreground mb-4">
              첫 번째 농지를 등록하여 드론 방제 서비스를 시작하세요.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              농지 추가
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}