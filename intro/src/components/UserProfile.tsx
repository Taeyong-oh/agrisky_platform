import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Phone, MapPin, Mail, Edit, Save, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function UserProfile() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || ''
  });

  const handleSave = async () => {
    const { error } = await updateProfile(formData);
    if (!error) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      address: profile?.address || ''
    });
    setIsEditing(false);
  };

  const getUserTypeLabel = (type: string) => {
    return type === 'farmer' ? '농가' : '드론 조작자';
  };

  const getUserTypeColor = (type: string) => {
    return type === 'farmer' ? 'default' : 'secondary';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">사용자 프로필</h1>
          <p className="text-muted-foreground">계정 정보를 확인하고 수정하세요</p>
        </div>
        <Button variant="outline" onClick={signOut}>
          로그아웃
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 기본 정보 카드 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>기본 정보</CardTitle>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  수정
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="mr-2 h-4 w-4" />
                    취소
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    저장
                  </Button>
                </div>
              )}
            </div>
            <CardDescription>
              개인 정보 및 연락처를 관리합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 프로필 아바타 */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">{profile?.full_name}</h3>
                <Badge variant={getUserTypeColor(profile?.user_type || '')}>
                  {getUserTypeLabel(profile?.user_type || '')}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* 편집 가능한 필드들 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">이름</Label>
                {isEditing ? (
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{profile?.full_name || '이름 없음'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">연락처</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="010-1234-5678"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profile?.phone || '연락처 없음'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">주소</Label>
                {isEditing ? (
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="경기도 이천시 마장면"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profile?.address || '주소 없음'}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 계정 정보 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>계정 정보</CardTitle>
            <CardDescription>
              로그인 및 보안 관련 정보입니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>이메일</Label>
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user?.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>계정 생성일</Label>
              <div className="p-2 bg-muted rounded-md">
                <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '알 수 없음'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>이메일 인증 상태</Label>
              <div className="p-2 bg-muted rounded-md">
                <Badge variant={user?.email_confirmed_at ? 'default' : 'destructive'}>
                  {user?.email_confirmed_at ? '인증 완료' : '인증 필요'}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">보안 설정</h4>
              <Button variant="outline" className="w-full">
                비밀번호 변경
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 사용자 유형별 추가 정보 */}
      {profile?.user_type === 'farmer' && (
        <Card>
          <CardHeader>
            <CardTitle>농가 정보</CardTitle>
            <CardDescription>
              농지 관리 및 작업 요청 현황
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm text-muted-foreground">등록 농지</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-muted-foreground">총 작업 요청</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">8</div>
                <div className="text-sm text-muted-foreground">완료된 작업</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">21.5ha</div>
                <div className="text-sm text-muted-foreground">총 관리 면적</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {profile?.user_type === 'operator' && (
        <Card>
          <CardHeader>
            <CardTitle>드론 조작자 정보</CardTitle>
            <CardDescription>
              드론 관리 및 작업 수행 현황
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">2</div>
                <div className="text-sm text-muted-foreground">보유 드론</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">15</div>
                <div className="text-sm text-muted-foreground">완료 작업</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">4.8</div>
                <div className="text-sm text-muted-foreground">평균 평점</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">156h</div>
                <div className="text-sm text-muted-foreground">총 비행시간</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}