import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, userService } from '../services';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // 초기 상태를 동기적으로 설정
    if (authService.isAuthenticated()) {
      const currentUser = authService.getCurrentUser();
      console.log('초기 상태 설정 - 사용자:', currentUser);
      return currentUser;
    }
    console.log('초기 상태 설정 - 인증되지 않음');
    return null;
  });
  const [loading, setLoading] = useState(false); // 초기 로딩을 false로 변경

  // 백그라운드에서 서버 정보 동기화 (옵션)
  useEffect(() => {
    const syncWithServer = async () => {
      console.log('=== 서버 동기화 시작 ===');
      
      // 사용자가 이미 설정되어 있고 토큰이 유효한 경우에만 서버 동기화
      if (user && authService.isAuthenticated()) {
        console.log('서버 사용자 정보 동기화 시도...');
        try {
          const result = await userService.getMyInfo();
          console.log('서버 사용자 정보 조회 결과:', result);
          
          if (result.success && result.data) {
            console.log('서버 정보로 업데이트:', result.data);
            setUser(result.data);
            localStorage.setItem('user', JSON.stringify(result.data));
          } else {
            console.warn('서버 응답에 사용자 데이터가 없음:', result);
          }
        } catch (serverError) {
          console.warn('서버 동기화 실패 (무시됨):', serverError);
          // 서버 동기화 실패는 무시 (로컬 상태 유지)
        }
      }
    };

    // 초기 마운트 후 1초 뒤에 서버 동기화 시도
    const timer = setTimeout(syncWithServer, 1000);
    
    return () => clearTimeout(timer);
  }, []); // 한 번만 실행

  const login = async (email, password) => {
    try {
      setLoading(true);
      
      const result = await authService.login({ email, password });
      
      if (result.success) {
        setUser(result.data.user);
        return { success: true, user: result.data.user };
      } else {
        return { success: false, error: result.error.message };
      }
    } catch (error) {
      return { success: false, error: '로그인 중 오류가 발생했습니다.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name) => {
    try {
      setLoading(true);
      
      const result = await authService.register({ email, password, name });
      
      if (result.success) {
        // 자동 로그인 제거 - 회원가입만 처리하고 사용자 상태는 설정하지 않음
        return { success: true, user: result.data.user };
      } else {
        return { success: false, error: result.error.message };
      }
    } catch (error) {
      return { success: false, error: '회원가입 중 오류가 발생했습니다.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    authService.logout();
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user // 사용자 정보가 있으면 인증된 것으로 처리
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
