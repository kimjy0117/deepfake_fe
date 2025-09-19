import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>DeepFake Gallery</h3>
            <p className={styles.footerDescription}>
              안전하고 편리한 이미지 및 영상 갤러리 서비스
            </p>
          </div>
          
          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>서비스</h4>
            <ul className={styles.footerLinks}>
              <li><a href="#" className={styles.footerLink}>이미지 업로드</a></li>
              <li><a href="#" className={styles.footerLink}>영상 업로드</a></li>
              <li><a href="#" className={styles.footerLink}>갤러리 관리</a></li>
            </ul>
          </div>
          
          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>고객지원</h4>
            <ul className={styles.footerLinks}>
              <li><a href="#" className={styles.footerLink}>도움말</a></li>
              <li><a href="#" className={styles.footerLink}>문의하기</a></li>
              <li><a href="#" className={styles.footerLink}>개인정보처리방침</a></li>
            </ul>
          </div>
          
          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>연락처</h4>
            <div className={styles.contactInfo}>
              <p>이메일: support@deepfakegallery.com</p>
              <p>전화: 02-1234-5678</p>
            </div>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>
            © {currentYear} DeepFake Gallery. All rights reserved.
          </p>
          <div className={styles.socialLinks}>
            <a href="#" className={styles.socialLink} aria-label="Facebook">
              <span>Facebook</span>
            </a>
            <a href="#" className={styles.socialLink} aria-label="Twitter">
              <span>Twitter</span>
            </a>
            <a href="#" className={styles.socialLink} aria-label="Instagram">
              <span>Instagram</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
