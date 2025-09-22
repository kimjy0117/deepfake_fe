import axios from 'axios';

/**
 * API 기본 설정
 * 
 * 환경변수 VITE_API_BASE_URL을 사용하여 API 서버 URL을 설정합니다.
 * 
 * Netlify 배포 시 환경변수 설정 방법:
 * 1. Netlify 대시보드 → Site settings → Environment variables
 * 2. Key: VITE_API_BASE_URL
 * 3. Value: https://your-api-server.com/api/v1 (실제 API 서버 URL)
 * 
 * 로컬 개발 시 .env 파일에 다음과 같이 설정:
 * VITE_API_BASE_URL=http://localhost:8080/api/v1
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://deepfake-be.onrender.com/api/v1';

// 개발 환경에서 환경변수 확인을 위한 로그
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL);
}
// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 토큰 만료 시 자동 갱신
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 토큰 갱신을 시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken: refreshToken
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          
          // 새로운 토큰 저장
          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // 원래 요청에 새 토큰 적용
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.warn('토큰 갱신 실패:', refreshError);
        
        // 토큰 갱신 실패 시에만 토큰 제거 (사용자 정보는 유지)
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // 강제 리다이렉트 대신 에러를 반환하여 컴포넌트에서 처리하도록 함
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
