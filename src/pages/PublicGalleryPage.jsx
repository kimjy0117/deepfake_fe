import React, { useState } from 'react';
import { useGallery } from '../contexts/GalleryContext';
import PublicGalleryCard from '../components/PublicGalleryCard';
import styles from './PublicGalleryPage.module.css';

const PublicGalleryPage = () => {
  const [activeTab, setActiveTab] = useState('images');
  const { publicFiles, loading, stats } = useGallery();

  // 파일 타입별로 필터링 (백엔드 FileType enum 고려)
  const allImages = publicFiles.filter(file => 
    file.type === 'IMAGE' || 
    file.type === 'image' || 
    (file.mimeType && file.mimeType.startsWith('image/'))
  );
  
  const allVideos = publicFiles.filter(file => 
    file.type === 'VIDEO' || 
    file.type === 'video' || 
    (file.mimeType && file.mimeType.startsWith('video/'))
  );

  // 최신 업로드 순으로 정렬
  const sortedImages = [...allImages].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  const sortedVideos = [...allVideos].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

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
          ? '아직 공유된 이미지가 없어요. 첫 번째 이미지를 업로드해보세요!' 
          : '아직 공유된 영상이 없어요. 첫 번째 영상을 업로드해보세요!'
        }
      </p>
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
          <div className={styles.statsInfo}>
            <div className={styles.statBadge}>
              <span className={styles.statNumber}>
                {stats ? stats.totalFiles : (allImages.length + allVideos.length)}
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
            onClick={() => setActiveTab('images')}
            className={`${styles.tabBtn} ${activeTab === 'images' ? styles.activeTab : ''}`}
          >
            이미지 ({sortedImages.length})
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`${styles.tabBtn} ${activeTab === 'videos' ? styles.activeTab : ''}`}
          >
            영상 ({sortedVideos.length})
          </button>
        </div>

        <div className={styles.galleryContent}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>파일 목록을 불러오는 중...</p>
            </div>
          ) : (
            activeTab === 'images' ? (
              sortedImages.length > 0 ? (
                <div className={styles.galleryGrid}>
                  {sortedImages.map((image) => (
                    <PublicGalleryCard
                      key={image.id}
                      item={image}
                      type="image"
                    />
                  ))}
                </div>
              ) : (
                renderEmptyState('images')
              )
            ) : (
              sortedVideos.length > 0 ? (
                <div className={styles.galleryGrid}>
                  {sortedVideos.map((video) => (
                    <PublicGalleryCard
                      key={video.id}
                      item={video}
                      type="video"
                    />
                  ))}
                </div>
              ) : (
                renderEmptyState('videos')
              )
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
