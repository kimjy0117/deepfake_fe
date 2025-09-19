import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGallery } from '../contexts/GalleryContext';
import UploadForm from '../components/UploadForm';
import GalleryCard from '../components/GalleryCard';
import styles from './GalleryPage.module.css';

const GalleryPage = () => {
  const [activeTab, setActiveTab] = useState('images');
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  const { user } = useAuth();
  const { myFiles, loading } = useGallery();

  // 내 파일에서 타입별로 필터링
  const userImages = myFiles.filter(file => 
    file.type === 'IMAGE' || 
    file.type === 'image' || 
    (file.mimeType && file.mimeType.startsWith('image/'))
  );
  
  const userVideos = myFiles.filter(file => 
    file.type === 'VIDEO' || 
    file.type === 'video' || 
    (file.mimeType && file.mimeType.startsWith('video/'))
  );

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
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
            onClick={() => setActiveTab('images')}
            className={`${styles.tabBtn} ${activeTab === 'images' ? styles.activeTab : ''}`}
          >
            이미지 ({userImages.length})
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`${styles.tabBtn} ${activeTab === 'videos' ? styles.activeTab : ''}`}
          >
            영상 ({userVideos.length})
          </button>
        </div>

        <div className={styles.galleryContent}>
          {activeTab === 'images' ? (
            userImages.length > 0 ? (
              <div className={styles.galleryGrid}>
                {userImages.map((image) => (
                  <GalleryCard
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
            userVideos.length > 0 ? (
              <div className={styles.galleryGrid}>
                {userVideos.map((video) => (
                  <GalleryCard
                    key={video.id}
                    item={video}
                    type="video"
                  />
                ))}
              </div>
            ) : (
              renderEmptyState('videos')
            )
          )}
        </div>

        {/* Stats */}
        <div className={styles.galleryStats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{userImages.length}</span>
            <span className={styles.statLabel}>이미지</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{userVideos.length}</span>
            <span className={styles.statLabel}>영상</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{userImages.length + userVideos.length}</span>
            <span className={styles.statLabel}>전체 파일</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryPage;
