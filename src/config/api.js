import axios from 'axios';

// API 기본 설정
const API_BASE_URL = 'http://192.168.3.115:8080/api/v1';
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
