import React, { useState, useEffect } from 'react';
import { useGallery } from '../contexts/GalleryContext';
import PublicGalleryCard from '../components/PublicGalleryCard';
import styles from './PublicGalleryPage.module.css';

const PublicGalleryPage = () => {
  const [activeTab, setActiveTab] = useState('images');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const { publicFiles, loading, stats, loadPublicFiles, loadStats } = useGallery();
  
  const ITEMS_PER_PAGE = 18;

  // 페이지네이션을 고려한 파일 로드
  const loadFilesWithPagination = async (page = 1, type = null) => {
    console.log('페이지네이션 파일 로드:', { page, type: type || activeTab });
    try {
      const fileType = type || activeTab;
      const params = {
        type: fileType === 'images' ? 'image' : fileType === 'videos' ? 'video' : 'all',
        page,
        size: ITEMS_PER_PAGE,
        sort: 'uploadedAt',
        order: 'desc'
      };
      
      const result = await loadPublicFiles(params);
      
      if (result.success && result.data) {
        // 서버 응답에서 pagination 객체 사용
        const pagination = result.data.pagination;
        const totalPages = pagination?.totalPages || 1;
        const totalElements = pagination?.totalElements || result.data.files?.length || 0;
        
        // 페이지네이션 정보 업데이트
        setTotalPages(totalPages);
        setTotalItems(totalElements);
        setCurrentPage(page);
        
        console.log('페이지네이션 정보:', {
          currentPage: page,
          totalPages,
          totalElements,
          filesCount: result.data.files?.length
        });
      }
      
      return result;
    } catch (error) {
      console.error('파일 로드 실패:', error);
      return { success: false, error: '파일 로드 중 오류가 발생했습니다.' };
    }
  };

  // 탭 변경 핸들러
  const handleTabChange = async (newTab) => {
    if (newTab !== activeTab) {
      setActiveTab(newTab);
      setCurrentPage(1); // 탭 변경 시 첫 페이지로 리셋
      await loadFilesWithPagination(1, newTab);
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = async (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      await loadFilesWithPagination(page);
    }
  };

  // 수동 새로고침 함수
  const handleRefresh = async () => {
    console.log('공개 갤러리 수동 새로고침');
    try {
      await Promise.all([
        loadFilesWithPagination(1),
        loadStats()
      ]);
    } catch (error) {
      console.error('새로고침 실패:', error);
    }
  };

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    loadFilesWithPagination(1);
    loadStats();
  }, []); // 빈 의존성 배열로 마운트 시에만 실행

  // 서버에서 이미 필터링되고 정렬된 데이터를 사용
  // publicFiles는 현재 활성 탭에 해당하는 파일들만 포함됨
  const currentFiles = publicFiles || [];
  
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
          ? '아직 공유된 이미지가 없어요. 내 갤러리에서 첫 번째 이미지를 업로드해보세요!' 
          : '아직 공유된 영상이 없어요. 내 갤러리에서 첫 번째 영상을 업로드해보세요!'
        }
      </p>
      <button
        onClick={handleRefresh}
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? '새로고침 중...' : '새로고침'}
      </button>
    </div>
  );

  return (
    <div className={styles.publicGalleryPage}>
      <div className="container">
        <div className={styles.galleryHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>공개 갤러리</h1>
            <p className={styles.subtitle}>
              모든 사용자가 공유한 이미지와 영상을 둘러보세요
            </p>
          </div>
          <div className={styles.headerActions}>
            <button
              onClick={handleRefresh}
              className={`btn btn-outline ${styles.refreshBtn}`}
              disabled={loading}
            >
              {loading ? '새로고침 중...' : '🔄 새로고침'}
            </button>
          </div>
          <div className={styles.statsInfo}>
            <div className={styles.statBadge}>
              <span className={styles.statNumber}>
                {stats ? stats.totalFiles : totalItems}
              </span>
              <span className={styles.statLabel}>총 파일</span>
            </div>
            {stats && (
              <>
                <div className={styles.statBadge}>
                  <span className={styles.statNumber}>{stats.totalImages}</span>
                  <span className={styles.statLabel}>이미지</span>
                </div>
                <div className={styles.statBadge}>
                  <span className={styles.statNumber}>{stats.totalVideos}</span>
                  <span className={styles.statLabel}>영상</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className={styles.galleryTabs}>
          <button
            onClick={() => handleTabChange('images')}
            className={`${styles.tabBtn} ${activeTab === 'images' ? styles.activeTab : ''}`}
            disabled={loading}
          >
            이미지 {stats && `(${stats.totalImages || 0})`}
          </button>
          <button
            onClick={() => handleTabChange('videos')}
            className={`${styles.tabBtn} ${activeTab === 'videos' ? styles.activeTab : ''}`}
            disabled={loading}
          >
            영상 {stats && `(${stats.totalVideos || 0})`}
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
                    <PublicGalleryCard
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

        {/* 추가 정보 섹션 */}
        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>💡 이용 안내</h3>
            <ul className={styles.infoList}>
              <li>모든 사용자가 업로드한 콘텐츠를 볼 수 있습니다</li>
              <li>본인이 업로드한 파일만 삭제할 수 있습니다</li>
              <li>최신 업로드 순으로 정렬되어 표시됩니다</li>
              <li>부적절한 콘텐츠 발견 시 신고해주세요</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicGalleryPage;
