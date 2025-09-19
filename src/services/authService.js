import api from '../config/api.js';

// 인증 관련 API 서비스
export const authService = {
  // 회원가입
  register: async (registerData) => {
    try {
      const response = await api.post('/auth/register', registerData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: '회원가입 중 오류가 발생했습니다.' }
      };
    }
  },

  // 로그인
  login: async (loginData) => {
    try {
      const response = await api.post('/auth/login', loginData);
      const { user, tokens } = response.data.data;
      
      // 토큰과 사용자 정보를 로컬 스토리지에 저장
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      return {
        success: true,
        data: { user, tokens },
        message: response.data.message
      };
    } catch (error) {
      console.error('로그인 에러:', error);
      console.error('에러 응답:', error.response);
      console.error('에러 데이터:', error.response?.data);
      return {
        success: false,
        error: error.response?.data || { message: '로그인 중 오류가 발생했습니다.' }
      };
    }
  },

  // 토큰 갱신
  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      const tokens = response.data.data;
      
      // 새로운 토큰 저장
      localStorage.setItem('accessToken', tokens.accessToken);
      if (tokens.refreshToken) {
        localStorage.setItem('refreshToken', tokens.refreshToken);
      }
      
      return {
        success: true,
        data: tokens
      };
    } catch (error) {
      // 토큰 갱신 실패 시 로그아웃 처리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      return {
        success: false,
        error: error.response?.data || { message: '토큰 갱신 중 오류가 발생했습니다.' }
      };
    }
  },

  // 로그아웃
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    return {
      success: true,
      message: '로그아웃되었습니다.'
    };
  },

  // 현재 로그인 상태 확인
  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    
    console.log('=== isAuthenticated 체크 ===');
    console.log('토큰 존재:', !!token);
    console.log('사용자 정보 존재:', !!user);
    
    // 토큰과 사용자 정보가 모두 있는지 확인
    if (!token || !user) {
      console.log('토큰 또는 사용자 정보 없음 → false');
      return false;
    }
    
    // 토큰이 만료되었는지 간단히 체크 (JWT 디코딩)
    try {
      // JWT 토큰 구조 검증
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.log('잘못된 JWT 토큰 형식 → false');
        return false;
      }
      
      const payload = JSON.parse(atob(tokenParts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      console.log('토큰 만료 시간:', payload.exp ? new Date(payload.exp * 1000) : '없음');
      console.log('현재 시간:', new Date(currentTime * 1000));
      
      // 토큰에 만료 시간이 있고 만료되었으면 false 반환
      if (payload.exp && payload.exp < currentTime) {
        console.log('토큰이 만료됨 → false');
        // 만료된 토큰 정리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return false;
      }
      
      console.log('인증 상태 유효 → true');
      return true;
    } catch (error) {
      console.error('토큰 검증 중 오류:', error);
      console.log('토큰 파싱 실패 → false');
      // 잘못된 토큰 정리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return false;
    }
  },

  // 현재 사용자 정보 가져오기
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    console.log('getCurrentUser - 로컬 스토리지 user:', userStr);
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('파싱된 사용자 정보:', user);
        return user;
      } catch (error) {
        console.error('사용자 정보 파싱 오류:', error);
        return null;
      }
    }
    console.log('로컬 스토리지에 사용자 정보 없음');
    return null;
  },

  // 토큰 가져오기
  getTokens: () => {
    return {
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken')
    };
  }
};
