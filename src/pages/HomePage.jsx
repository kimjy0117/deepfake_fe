import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './HomePage.module.css';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className={styles.homePage}>
      <div className="container">
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              DeepFake Gallery에 오신 것을 환영합니다
            </h1>
            <p className={styles.heroDescription}>
              편리한 이미지 및 영상 갤러리 서비스로<br />
              소중한 추억을 관리하고 공유하세요
            </p>
            
            {isAuthenticated ? (
              <div className={styles.welcomeBack}>
                <p className={styles.welcomeMessage}>
                  안녕하세요, <strong>{user?.name}</strong>님!
                </p>
                <div className={styles.heroActions}>
                  <Link to="/gallery" className="btn btn-primary btn-lg">
                    내 갤러리 보기
                  </Link>
                  <Link to="/public-gallery" className="btn btn-outline btn-lg">
                    공개 갤러리 둘러보기
                  </Link>
                </div>
              </div>
            ) : (
              <div className={styles.heroActions}>
                <Link to="/register" className="btn btn-primary btn-lg">
                  시작하기
                </Link>
                <Link to="/public-gallery" className="btn btn-outline btn-lg">
                  공개 갤러리 둘러보기
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  로그인
                </Link>
              </div>
            )}
          </div>
          
          <div className={styles.heroImage}>
            <div className={styles.imageGrid}>
              <div className={styles.imageCard}>🖼️</div>
              <div className={styles.imageCard}>🎬</div>
              <div className={styles.imageCard}>📸</div>
              <div className={styles.imageCard}>🎥</div>
            </div>
          </div>
        </div>

        <div className={styles.features}>
          <h2 className={styles.featuresTitle}>주요 기능</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📤</div>
              <h3 className={styles.featureTitle}>간편한 업로드</h3>
              <p className={styles.featureDescription}>
                드래그 앤 드롭으로 이미지와 영상을 쉽게 업로드하세요
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🗂️</div>
              <h3 className={styles.featureTitle}>체계적인 관리</h3>
              <p className={styles.featureDescription}>
                이미지와 영상을 카테고리별로 깔끔하게 정리하세요
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📱</div>
              <h3 className={styles.featureTitle}>반응형 디자인</h3>
              <p className={styles.featureDescription}>
                모든 디바이스에서 최적화된 사용자 경험을 제공합니다
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🔒</div>
              <h3 className={styles.featureTitle}>안전한 보관</h3>
              <p className={styles.featureDescription}>
                개인 계정으로 안전하게 파일을 보관하고 관리하세요
              </p>
            </div>
          </div>
        </div>

        <div className={styles.cta}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>지금 시작해보세요!</h2>
            <p className={styles.ctaDescription}>
              무료로 계정을 만들고 나만의 갤러리를 구성해보세요
            </p>
            {!isAuthenticated && (
              <Link to="/register" className="btn btn-primary btn-lg">
                무료 회원가입
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
