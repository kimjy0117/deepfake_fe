import api from '../config/api.js';

// 사용자 관련 API 서비스
export const userService = {
  // 내 정보 조회
  getMyInfo: async () => {
    try {
      const response = await api.get('/users/me');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: '사용자 정보 조회 중 오류가 발생했습니다.' }
      };
    }
  }
};
