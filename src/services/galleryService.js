import api from '../config/api.js';

// 갤러리 관련 API 서비스
export const galleryService = {
  // 갤러리 통계 조회
  getStats: async () => {
    try {
      const response = await api.get('/gallery/stats');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: '갤러리 통계 조회 중 오류가 발생했습니다.' }
      };
    }
  }
};
