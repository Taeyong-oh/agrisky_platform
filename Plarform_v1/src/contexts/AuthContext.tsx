import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  user_type: 'farmer' | 'operator';
  full_name: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: { user_type: string; full_name: string; phone?: string; address?: string }) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // 초기 사용자 정보 가져오기
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const data = await authApi.getMe();
      setUser(data.user);
      setProfile(data.profile);
    } catch (error) {
      console.error('인증 확인 오류:', error);
      localStorage.removeItem('auth_token');
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: { user_type: string; full_name: string; phone?: string; address?: string }) => {
    try {
      const data = await authApi.signUp(email, password, userData);
      
      setUser(data.user);
      setProfile(data.profile || null);

      toast({
        title: "회원가입 성공",
        description: "회원가입이 완료되었습니다.",
      });

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "회원가입 실패",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const data = await authApi.signIn(email, password);
      
      setUser(data.user);
      setProfile(data.profile || null);

      toast({
        title: "로그인 성공",
        description: "아그리스카이 플랫폼에 오신 것을 환영합니다!",
      });

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "로그인 실패",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      authApi.signOut();
      setUser(null);
      setProfile(null);

      toast({
        title: "로그아웃",
        description: "성공적으로 로그아웃되었습니다.",
      });
    } catch (error: any) {
      toast({
        title: "로그아웃 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('사용자가 로그인되어 있지 않습니다.');

      // TODO: 프로필 업데이트 API 엔드포인트 추가 필요
      // 현재는 로컬 상태만 업데이트
      setProfile(prev => prev ? { ...prev, ...updates } : null);

      toast({
        title: "프로필 업데이트",
        description: "프로필이 성공적으로 업데이트되었습니다.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "프로필 업데이트 실패",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

