import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fileService } from '../services';
import styles from './FileDetailPage.module.css';

const FileDetailPage = () => {
  const { fileId, type } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 파일 상세 정보 로드
  useEffect(() => {
    const loadFileDetail = async () => {
      try {
        setLoading(true);
        const result = await fileService.getFileDetail(fileId);
        
        if (result.success) {
          setFile(result.data);
        } else {
          setError(result.error.message || '파일 정보를 불러올 수 없습니다.');
        }
      } catch (err) {
        setError('파일 정보를 불러오는 중 오류가 발생했습니다.');
        console.error('파일 상세 정보 로드 에러:', err);
      } finally {
        setLoading(false);
      }
    };

    if (fileId) {
      loadFileDetail();
    }
  }, [fileId]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className="container">
          <div className={styles.loadingContent}>
            <div className={styles.spinner}></div>
            <p>파일 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className={styles.notFound}>
        <div className="container">
          <div className={styles.notFoundContent}>
            <h1 className={styles.notFoundTitle}>파일을 찾을 수 없습니다</h1>
            <p className={styles.notFoundMessage}>
              {error || '요청하신 파일이 존재하지 않거나 삭제되었을 수 있습니다.'}
            </p>
            <Link to="/public-gallery" className="btn btn-primary">
              공개 갤러리로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 파일 타입 확인 (백엔드에서 IMAGE/VIDEO enum 또는 mimeType 사용)
  const isImage = file.type === 'IMAGE' || file.mimeType?.startsWith('image/') || 
                  (typeof file.type === 'string' && file.type.toLowerCase().includes('image'));
  const isVideo = file.type === 'VIDEO' || file.mimeType?.startsWith('video/') || 
                  (typeof file.type === 'string' && file.type.toLowerCase().includes('video'));

  return (
    <div className={styles.detailPage}>
      <div className="container">
        {/* 브레드크럼 네비게이션 */}
        <nav className={styles.breadcrumb}>
          <Link to="/" className={styles.breadcrumbLink}>홈</Link>
          <span className={styles.breadcrumbSeparator}>›</span>
          <Link to="/public-gallery" className={styles.breadcrumbLink}>공개 갤러리</Link>
          <span className={styles.breadcrumbSeparator}>›</span>
          <span className={styles.breadcrumbCurrent}>{file.title}</span>
        </nav>

        {/* 뒤로가기 버튼 */}
        <div className={styles.backButton}>
          <button 
            onClick={() => navigate(-1)} 
            className={`btn btn-outline ${styles.backBtn}`}
          >
            ← 뒤로가기
          </button>
        </div>

        <div className={styles.detailContent}>
          {/* 미디어 섹션 */}
          <div className={styles.mediaSection}>
            <div className={styles.mediaContainer}>
              {isImage ? (
                <img 
                  src={file.url || fileService.getStreamUrl(file.id)} 
                  alt={file.title}
                  className={styles.mediaImage}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : isVideo ? (
                <video 
                  src={file.url || fileService.getStreamUrl(file.id)} 
                  controls
                  className={styles.mediaVideo}
                  muted
                  playsInline
                  preload="metadata"
                  onError={(e) => {
                    console.error('Video error:', e);
                    console.log('Video src:', e.target.src);
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                >
                  브라우저에서 비디오를 지원하지 않습니다.
                </video>
              ) : null}
              
              {/* 에러 플레이스홀더 */}
              <div className={styles.errorPlaceholder} style={{ display: 'none' }}>
                <div className={styles.errorIcon}>
                  {isImage ? '🖼️' : '🎬'}
                </div>
                <p className={styles.errorText}>
                  {isImage ? '이미지를 불러올 수 없습니다' : '영상을 불러올 수 없습니다'}
                </p>
              </div>
            </div>
          </div>

          {/* 정보 섹션 */}
          <div className={styles.infoSection}>
            <div className={styles.infoCard}>
              <div className={styles.infoHeader}>
                <h1 className={styles.fileTitle}>{file.title}</h1>
                <div className={styles.fileType}>
                  <span className={`${styles.typeBadge} ${isImage ? styles.imageBadge : styles.videoBadge}`}>
                    {isImage ? '이미지' : '영상'}
                  </span>
                </div>
              </div>

              <div className={styles.infoBody}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>업로더</span>
                  <span className={styles.infoValue}>{file.userName}</span>
                </div>
                
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>업로드 날짜</span>
                  <span className={styles.infoValue}>{formatDate(file.uploadedAt)}</span>
                </div>
                
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>파일명</span>
                  <span className={styles.infoValue}>{file.name}</span>
                </div>
                
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>파일 크기</span>
                  <span className={styles.infoValue}>{formatFileSize(file.size)}</span>
                </div>
                
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>파일 형식</span>
                  <span className={styles.infoValue}>{file.mimeType || file.type}</span>
                </div>
              </div>

              <div className={styles.infoFooter}>
                <Link 
                  to="/public-gallery" 
                  className="btn btn-primary"
                >
                  공개 갤러리로 돌아가기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileDetailPage;
