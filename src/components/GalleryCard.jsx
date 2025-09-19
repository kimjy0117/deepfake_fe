import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGallery } from '../contexts/GalleryContext';
import { fileService } from '../services';
import styles from './GalleryCard.module.css';

const GalleryCard = ({ item, type }) => {
  const [imageError, setImageError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();
  const { deleteFile } = useGallery();

  const handleDelete = () => {
    deleteFile(item.id, type);
    setShowDeleteModal(false);
  };

  const handleCardClick = (e) => {
    // 삭제 버튼 클릭 시에는 상세 페이지로 이동하지 않음
    if (e.target.closest(`.${styles.deleteBtn}`) || e.target.closest(`.${styles.modal}`)) {
      return;
    }
    navigate(`/file/${type}/${item.id}`);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <>
      <div className={styles.galleryCard} onClick={handleCardClick}>
        <div className={styles.mediaContainer}>
          {type === 'image' ? (
            imageError ? (
              <div className={styles.errorPlaceholder}>
                <span className={styles.errorIcon}>🖼️</span>
                <p>이미지를 불러올 수 없습니다</p>
              </div>
            ) : (
              <img
                src={item.url || fileService.getStreamUrl(item.id)}
                alt={item.name}
                className={styles.media}
                onError={handleImageError}
                loading="lazy"
              />
            )
          ) : (
            <video
              src={item.url || fileService.getStreamUrl(item.id)}
              className={styles.media}
              controls
              preload="metadata"
              muted
              playsInline
              onError={(e) => {
                console.error('Video error:', e);
                console.log('Video src:', e.target.src);
              }}
            >
              브라우저가 비디오를 지원하지 않습니다.
            </video>
          )}
          
          <div className={styles.overlay}>
            <button
              onClick={() => setShowDeleteModal(true)}
              className={styles.deleteBtn}
              title="삭제"
            >
              🗑️
            </button>
          </div>
        </div>
        
        <div className={styles.cardInfo}>
          <h4 className={styles.fileTitle} title={item.title}>
            {item.title}
          </h4>
          <p className={styles.fileName} title={item.name}>
            {item.name}
          </p>
          <div className={styles.fileDetails}>
            <span className={styles.fileSize}>{formatFileSize(item.size)}</span>
            <span className={styles.uploadDate}>{formatDate(item.uploadedAt)}</span>
          </div>
          <div className={styles.fileType}>
            {type === 'image' ? '이미지' : '영상'}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>파일 삭제</h3>
            <p className={styles.modalMessage}>
              "{item.name}" 파일을 삭제하시겠습니까?<br />
              이 작업은 되돌릴 수 없습니다.
            </p>
            <div className={styles.modalActions}>
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`btn btn-secondary ${styles.cancelBtn}`}
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className={`btn ${styles.deleteConfirmBtn}`}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryCard;
