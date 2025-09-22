import React, { createContext, useContext, useState, useEffect } from 'react';
import { fileService, galleryService } from '../services';
import { useAuth } from './AuthContext';

const GalleryContext = createContext();

export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
};

export const GalleryProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [myFiles, setMyFiles] = useState([]);
  const [publicFiles, setPublicFiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // 내 파일 목록 로드
  const loadMyFiles = async (params = {}) => {
    if (!isAuthenticated) return { success: false, error: '로그인이 필요합니다.' };

    try {
      setLoading(true);
      const result = await fileService.getMyFiles(params);
      
      if (result.success) {
        setMyFiles(result.data.files);
        return result;
      } else {
        return result;
      }
    } catch (error) {
      return { success: false, error: '파일 목록 로드 중 오류가 발생했습니다.' };
    } finally {
      setLoading(false);
    }
  };

  // 공개 파일 목록 로드
  const loadPublicFiles = async (params = {}) => {
    try {
      setLoading(true);
      const result = await fileService.getPublicFiles(params);
      
      if (result.success) {
        setPublicFiles(result.data.files);
        return result;
      } else {
        return result;
      }
    } catch (error) {
      return { success: false, error: '공개 파일 목록 로드 중 오류가 발생했습니다.' };
    } finally {
      setLoading(false);
    }
  };

  // 갤러리 통계 로드
  const loadStats = async () => {
    try {
      const result = await galleryService.getStats();
      
      if (result.success) {
        setStats(result.data);
        return result;
      } else {
        return result;
      }
    } catch (error) {
      return { success: false, error: '통계 로드 중 오류가 발생했습니다.' };
    }
  };

  // 파일 업로드
  const uploadFiles = async (files, titles) => {
    if (!isAuthenticated) return { success: false, error: '로그인이 필요합니다.' };

    try {
      setUploading(true);
      const result = await fileService.uploadFiles(files, titles);
      
      if (result.success) {
        // 업로드 성공 후 내 파일 목록 새로고침
        await loadMyFiles();
        // 공개 파일 목록도 새로고침
        await loadPublicFiles();
        return result;
      } else {
        return result;
      }
    } catch (error) {
      return { success: false, error: '파일 업로드 중 오류가 발생했습니다.' };
    } finally {
      setUploading(false);
    }
  };

  // 파일 삭제
  const deleteFile = async (fileId) => {
    if (!isAuthenticated) return { success: false, error: '로그인이 필요합니다.' };

    try {
      const result = await fileService.deleteFile(fileId);
      
      if (result.success) {
        // 삭제 성공 후 파일 목록에서 제거
        setMyFiles(prev => prev.filter(file => file.id !== fileId));
        setPublicFiles(prev => prev.filter(file => file.id !== fileId));
        return result;
      } else {
        return result;
      }
    } catch (error) {
      return { success: false, error: '파일 삭제 중 오류가 발생했습니다.' };
    }
  };

  // 파일 검색
  const searchFiles = async (query, params = {}) => {
    try {
      setLoading(true);
      const result = await fileService.searchFiles(query, params);
      return result;
    } catch (error) {
      return { success: false, error: '파일 검색 중 오류가 발생했습니다.' };
    } finally {
      setLoading(false);
    }
  };

  // 파일 상세 정보 조회
  const getFileDetail = async (fileId) => {
    try {
      const result = await fileService.getFileDetail(fileId);
      return result;
    } catch (error) {
      return { success: false, error: '파일 정보 조회 중 오류가 발생했습니다.' };
    }
  };

  // 파일 정보 수정
  const updateFile = async (fileId, updateData) => {
    if (!isAuthenticated) return { success: false, error: '로그인이 필요합니다.' };

    try {
      const result = await fileService.updateFile(fileId, updateData);
      
      if (result.success) {
        // 수정 성공 후 파일 목록 업데이트
        setMyFiles(prev => prev.map(file => 
          file.id === fileId ? { ...file, ...result.data } : file
        ));
        setPublicFiles(prev => prev.map(file => 
          file.id === fileId ? { ...file, ...result.data } : file
        ));
        return result;
      } else {
        return result;
      }
    } catch (error) {
      return { success: false, error: '파일 정보 수정 중 오류가 발생했습니다.' };
    }
  };

  // 파일 다운로드
  const downloadFile = async (fileId, filename) => {
    try {
      const result = await fileService.downloadFile(fileId, filename);
      return result;
    } catch (error) {
      return { success: false, error: '파일 다운로드 중 오류가 발생했습니다.' };
    }
  };

  // 로그인 상태 변경 시 모든 데이터 로드
  useEffect(() => {
    console.log('GalleryContext - 인증 상태 변경:', isAuthenticated);
    
    if (isAuthenticated) {
      console.log('인증됨 - 모든 데이터 로드 시도');
      // 약간의 지연을 두어 AuthContext 초기화가 완료된 후 API 호출
      setTimeout(() => {
        // 공개 파일, 통계, 내 파일 모두 로드
        Promise.all([
          loadPublicFiles().catch(error => {
            console.warn('공개 파일 로드 실패 (무시됨):', error);
          }),
          loadStats().catch(error => {
            console.warn('통계 로드 실패 (무시됨):', error);
          }),
          loadMyFiles().catch(error => {
            console.warn('내 파일 로드 실패 (무시됨):', error);
          })
        ]);
      }, 100);
    } else {
      console.log('인증되지 않음 - 모든 데이터 초기화');
      setMyFiles([]);
      setPublicFiles([]);
      setStats(null);
    }
  }, [isAuthenticated]);

  const value = {
    // 상태
    myFiles,
    publicFiles,
    stats,
    uploading,
    loading,
    
    // API 함수들
    loadMyFiles,
    loadPublicFiles,
    loadStats,
    uploadFiles,
    deleteFile,
    searchFiles,
    getFileDetail,
    updateFile,
    downloadFile,
    
    // 유틸리티 함수들
    getDownloadUrl: fileService.getDownloadUrl,
    getStreamUrl: fileService.getStreamUrl,
    
    // 호환성을 위한 레거시 함수들 (기존 컴포넌트에서 사용 중인 경우)
    images: publicFiles.filter(file => 
      file.type === 'IMAGE' || file.type === 'image' || 
      (typeof file.type === 'string' && file.type.toLowerCase() === 'image')
    ),
    videos: publicFiles.filter(file => 
      file.type === 'VIDEO' || file.type === 'video' || 
      (typeof file.type === 'string' && file.type.toLowerCase() === 'video')
    ),
    getAllFiles: (type) => {
      if (type === 'all') return publicFiles;
      const normalizedType = type.toUpperCase();
      return publicFiles.filter(file => 
        file.type === normalizedType || 
        file.type === type || 
        (typeof file.type === 'string' && file.type.toLowerCase() === type.toLowerCase())
      );
    },
    getUserFiles: (userId, type) => {
      let filtered = myFiles;
      if (userId) {
        filtered = filtered.filter(file => file.userId === userId);
      }
      if (type !== 'all') {
        const normalizedType = type.toUpperCase();
        filtered = filtered.filter(file => 
          file.type === normalizedType || 
          file.type === type || 
          (typeof file.type === 'string' && file.type.toLowerCase() === type.toLowerCase())
        );
      }
      return filtered;
    },
    uploadFile: async (file, userId, title = '') => {
      // 단일 파일 업로드를 위한 래퍼 함수
      const defaultTitle = title || file.name.replace(/\.[^/.]+$/, "");
      return uploadFiles([file], [defaultTitle]);
    }
  };

  return (
    <GalleryContext.Provider value={value}>
      {children}
    </GalleryContext.Provider>
  );
};
