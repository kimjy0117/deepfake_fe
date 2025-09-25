import api from '../config/api.js';

// 파일 관련 API 서비스
export const fileService = {
  // 파일 업로드
  uploadFiles: async (files, titles) => {
    try {
      const formData = new FormData();
      
      // 파일들 추가
      files.forEach((file) => {
        formData.append('files', file);
      });
      
      // 제목들 추가
      titles.forEach((title) => {
        formData.append('titles', title);
      });

      console.log('파일 업로드 요청:', { fileCount: files.length, titles });

      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 파일 업로드는 시간이 오래 걸릴 수 있으므로 타임아웃 증가
      });

      console.log('파일 업로드 응답:', response.data);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('파일 업로드 에러:', error);
      console.error('에러 응답:', error.response?.data);
      return {
        success: false,
        error: error.response?.data || { message: '파일 업로드 중 오류가 발생했습니다.' }
      };
    }
  },

  // 내 파일 목록 조회
  getMyFiles: async (params = {}) => {
    try {
      const {
        type = 'all',
        page = 1,
        size = 20,
        sort = 'uploadedAt',
        order = 'desc'
      } = params;

      console.log('내 파일 목록 조회 요청:', { type, page, size, sort, order });

      const response = await api.get('/files/my', {
        params: { type, page, size, sort, order }
      });

      console.log('내 파일 목록 응답:', response.data);

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('내 파일 목록 조회 에러:', error);
      console.error('에러 응답:', error.response?.data);
      return {
        success: false,
        error: error.response?.data || { message: '파일 목록 조회 중 오류가 발생했습니다.' }
      };
    }
  },

  // 공개 파일 목록 조회
  getPublicFiles: async (params = {}) => {
    try {
      const {
        type = 'all',
        page = 1,
        size = 20,
        sort = 'uploadedAt',
        order = 'desc'
      } = params;

      console.log('공개 파일 목록 조회 요청:', { type, page, size, sort, order });

      const response = await api.get('/files/public', {
        params: { type, page, size, sort, order }
      });

      console.log('공개 파일 목록 응답:', {
        filesCount: response.data.data?.files?.length || response.data.files?.length,
        totalPages: response.data.data?.pagination?.totalPages,
        totalElements: response.data.data?.pagination?.totalElements
      });

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('공개 파일 목록 조회 에러:', error);
      console.error('에러 응답:', error.response?.data);
      return {
        success: false,
        error: error.response?.data || { message: '공개 파일 목록 조회 중 오료가 발생했습니다.' }
      };
    }
  },

  // 파일 검색
  searchFiles: async (query, params = {}) => {
    try {
      const {
        type = 'all',
        page = 1,
        size = 20
      } = params;

      console.log('파일 검색 요청:', { query, type, page, size });

      const response = await api.get('/files/search', {
        params: { q: query, type, page, size }
      });

      console.log('파일 검색 응답:', response.data);

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('파일 검색 에러:', error);
      console.error('에러 응답:', error.response?.data);
      return {
        success: false,
        error: error.response?.data || { message: '파일 검색 중 오류가 발생했습니다.' }
      };
    }
  },

  // 파일 상세 정보 조회
  getFileDetail: async (fileId) => {
    try {
      console.log('파일 상세 정보 조회 요청:', fileId);

      const response = await api.get(`/files/${fileId}`);

      console.log('파일 상세 정보 응답:', response.data);

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('파일 상세 정보 조회 에러:', error);
      console.error('에러 응답:', error.response?.data);
      return {
        success: false,
        error: error.response?.data || { message: '파일 정보 조회 중 오류가 발생했습니다.' }
      };
    }
  },

  // 파일 정보 수정
  updateFile: async (fileId, updateData) => {
    try {
      console.log('파일 정보 수정 요청:', { fileId, updateData });

      const response = await api.put(`/files/${fileId}`, updateData);

      console.log('파일 정보 수정 응답:', response.data);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('파일 정보 수정 에러:', error);
      console.error('에러 응답:', error.response?.data);
      return {
        success: false,
        error: error.response?.data || { message: '파일 정보 수정 중 오류가 발생했습니다.' }
      };
    }
  },

  // 파일 삭제
  deleteFile: async (fileId) => {
    try {
      console.log('파일 삭제 요청:', fileId);

      const response = await api.delete(`/files/${fileId}`);

      console.log('파일 삭제 응답:', response.data);

      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('파일 삭제 에러:', error);
      console.error('에러 응답:', error.response?.data);
      return {
        success: false,
        error: error.response?.data || { message: '파일 삭제 중 오류가 발생했습니다.' }
      };
    }
  },

  // 파일 다운로드 URL 생성
  getDownloadUrl: (fileId) => {
    return `${api.defaults.baseURL}/files/${fileId}/download`;
  },

  // 파일 스트리밍 URL 생성
  getStreamUrl: (fileId) => {
    return `${api.defaults.baseURL}/files/${fileId}/stream`;
  },

  // 파일 다운로드
  downloadFile: async (fileId, filename) => {
    try {
      const response = await api.get(`/files/${fileId}/download`, {
        responseType: 'blob'
      });

      // 파일 다운로드 처리
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'download');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: '파일 다운로드가 시작되었습니다.'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: '파일 다운로드 중 오류가 발생했습니다.' }
      };
    }
  }
};
