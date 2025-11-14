import { Button } from '@/components/ui/button';
import { Plane, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  showHomeButton?: boolean;
  onHomeClick?: () => void;
}

export default function Header({ showHomeButton = true, onHomeClick }: HeaderProps) {
  const { user } = useAuth();

  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick();
    } else {
      // 기본 동작: 홈으로 이동
      window.location.href = '/';
    }
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleHomeClick}>
          <img 
            src="/logo.png" 
            alt="AGRISKY 로고" 
            className="h-12 w-auto object-contain"
            onError={(e) => {
              // 로고 로드 실패 시 jpg 시도
              const target = e.target as HTMLImageElement;
              if (target.src.endsWith('.png')) {
                target.src = '/logo.jpg';
              }
            }}
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900">아그리스카이</h1>
            <p className="text-xs text-gray-600">지능형 방제 작업 플랫폼</p>
          </div>
        </div>
        {showHomeButton && (
          <Button 
            onClick={handleHomeClick} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            홈으로
          </Button>
        )}
      </div>
    </header>
  );
}

