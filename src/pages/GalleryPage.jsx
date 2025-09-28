import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGallery } from '../contexts/GalleryContext';
import UploadForm from '../components/UploadForm';
import GalleryCard from '../components/GalleryCard';
import styles from './GalleryPage.module.css';

const GalleryPage = () => {
  const [activeTab, setActiveTab] = useState('images');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const { user } = useAuth();
  const { myFiles, loading, loadMyFiles } = useGallery();
  
  const ITEMS_PER_PAGE = 20;

  // 페이지네이션을 고려한 내 파일 로드
  const loadMyFilesWithPagination = async (page = 1, type = null) => {
    console.log('내 갤러리 페이지네이션 파일 로드:', { page, type: type || activeTab });
    try {
      const fileType = type || activeTab;
      const params = {
        type: fileType === 'images' ? 'image' : fileType === 'videos' ? 'video' : 'all',
        page,
        size: ITEMS_PER_PAGE,
        sort: 'uploadedAt',
        order: 'desc'
      };
      
      const result = await loadMyFiles(params);
      
      if (result.success && result.data) {
        // 서버 응답에서 pagination 객체 사용
        const pagination = result.data.pagination;
        const totalPages = pagination?.totalPages || 1;
        const totalElements = pagination?.totalElements || result.data.files?.length || 0;
        
        // 페이지네이션 정보 업데이트
        setTotalPages(totalPages);
        setTotalItems(totalElements);
        setCurrentPage(page);
        
        console.log('내 갤러리 페이지네이션 정보:', {
          currentPage: page,
          totalPages,
          totalElements,
          filesCount: result.data.files?.length
        });
      }
      
      return result;
    } catch (error) {
      console.error('내 파일 로드 실패:', error);
      return { success: false, error: '파일 로드 중 오류가 발생했습니다.' };
    }
  };

  // 탭 변경 핸들러
  const handleTabChange = async (newTab) => {
    if (newTab !== activeTab) {
      setActiveTab(newTab);
      setCurrentPage(1); // 탭 변경 시 첫 페이지로 리셋
      await loadMyFilesWithPagination(1, newTab);
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = async (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      await loadMyFilesWithPagination(page);
    }
  };

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    loadMyFilesWithPagination(1);
  }, []); // 빈 의존성 배열로 마운트 시에만 실행

  // 서버에서 이미 필터링되고 정렬된 데이터를 사용
  const currentFiles = myFiles || [];

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    // 업로드 성공 후 현재 페이지 새로고침
    loadMyFilesWithPagination(currentPage);
  };

  // 페이지네이션 컴포넌트
  const renderPagination = () => {    
    if (totalPages <= 1) {
      return null;
    }

    const pages = [];
    const maxVisiblePages = 5;
    
    // 시작과 끝 페이지 계산
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // 끝에서부터 역산해서 시작 페이지 조정
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // 이전 페이지 버튼
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className={`${styles.pageBtn} ${styles.navBtn}`}
          disabled={loading}
        >
          이전
        </button>
      );
    }

    // 첫 페이지 (필요한 경우)
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={styles.pageBtn}
          disabled={loading}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className={styles.ellipsis}>...</span>);
      }
    }

    // 페이지 번호들
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`${styles.pageBtn} ${i === currentPage ? styles.activePage : ''}`}
          disabled={loading}
        >
          {i}
        </button>
      );
    }

    // 마지막 페이지 (필요한 경우)
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" className={styles.ellipsis}>...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={styles.pageBtn}
          disabled={loading}
        >
          {totalPages}
        </button>
      );
    }

    // 다음 페이지 버튼
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className={`${styles.pageBtn} ${styles.navBtn}`}
          disabled={loading}
        >
          다음
        </button>
      );
    }

    return (
      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          <span className={styles.pageInfo}>
            {currentPage} / {totalPages} 페이지 (총 {totalItems}개)
          </span>
        </div>
        <div className={styles.paginationButtons}>
          {pages}
        </div>
      </div>
    );
  };

  const renderEmptyState = (type) => (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        {type === 'images' ? '🖼️' : '🎬'}
      </div>
      <h3 className={styles.emptyTitle}>
        {type === 'images' ? '업로드된 이미지가 없습니다' : '업로드된 영상이 없습니다'}
      </h3>
      <p className={styles.emptyDescription}>
        {type === 'images' 
          ? '첫 번째 이미지를 업로드해보세요!' 
          : '첫 번째 영상을 업로드해보세요!'
        }
      </p>
      <button
        onClick={() => setShowUploadForm(true)}
        className="btn btn-primary"
      >
        파일 업로드
      </button>
    </div>
  );

  return (
    <div className={styles.galleryPage}>
      <div className="container">
        <div className={styles.galleryHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>내 갤러리</h1>
            <p className={styles.subtitle}>
              업로드한 이미지와 영상을 관리하세요
            </p>
          </div>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className={`btn btn-primary ${styles.uploadToggleBtn}`}
          >
            {showUploadForm ? '업로드 닫기' : '파일 업로드'}
          </button>
        </div>

        {showUploadForm && (
          <UploadForm onUploadSuccess={handleUploadSuccess} />
        )}

        <div className={styles.galleryTabs}>
          <button
            onClick={() => handleTabChange('images')}
            className={`${styles.tabBtn} ${activeTab === 'images' ? styles.activeTab : ''}`}
            disabled={loading}
          >
            이미지 {totalItems > 0 && activeTab === 'images' && `(${totalItems})`}
          </button>
          <button
            onClick={() => handleTabChange('videos')}
            className={`${styles.tabBtn} ${activeTab === 'videos' ? styles.activeTab : ''}`}
            disabled={loading}
          >
            영상 {totalItems > 0 && activeTab === 'videos' && `(${totalItems})`}
          </button>
        </div>

        <div className={styles.galleryContent}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>파일 목록을 불러오는 중...</p>
            </div>
          ) : (
            currentFiles.length > 0 ? (
              <>
                <div className={styles.galleryGrid}>
                  {currentFiles.map((file) => (
                    <GalleryCard
                      key={file.id}
                      item={file}
                      type={activeTab === 'images' ? 'image' : 'video'}
                    />
                  ))}
                </div>
                {renderPagination()}
              </>
            ) : (
              renderEmptyState(activeTab)
            )
          )}
        </div>

        {/* Stats */}
        <div className={styles.galleryStats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>
              {activeTab === 'images' ? totalItems : '?'}
            </span>
            <span className={styles.statLabel}>이미지</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>
              {activeTab === 'videos' ? totalItems : '?'}
            </span>
            <span className={styles.statLabel}>영상</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{totalItems}</span>
            <span className={styles.statLabel}>현재 탭</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryPage;
