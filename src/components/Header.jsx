import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './Header.module.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerContainer}`}>
        <Link to="/" className={styles.logo}>
          <h1>DeepFake Gallery</h1>
        </Link>
        
        <nav className={styles.nav}>
          {isAuthenticated && (
            <Link to="/public-gallery" className={styles.navLink}>
              공개 갤러리
            </Link>
          )}
          {isAuthenticated ? (
            <>
              <Link to="/gallery" className={styles.navLink}>
                내 갤러리
              </Link>
              <div className={styles.userMenu}>
                <span className={styles.userName}>
                  안녕하세요, {user?.name}님
                </span>
                <button 
                  onClick={handleLogout}
                  className={`btn btn-outline ${styles.logoutBtn}`}
                >
                  로그아웃
                </button>
              </div>
            </>
          ) : (
            <div className={styles.authLinks}>
              <Link to="/login" className={`btn btn-outline ${styles.authBtn}`}>
                로그인
              </Link>
              <Link to="/register" className={`btn btn-primary ${styles.authBtn}`}>
                회원가입
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <button className={styles.mobileMenuBtn}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
