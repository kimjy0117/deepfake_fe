import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 회원가입 완료 후 리디렉션 시 메시지 처리
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // 이메일이 전달된 경우 자동으로 입력
      if (location.state.email) {
        setFormData(prev => ({ ...prev, email: location.state.email }));
      }
      // 상태 정리 (뒤로가기 시 메시지가 다시 나타나지 않도록)
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        navigate('/gallery');
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: '로그인 중 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <h1 className={styles.title}>로그인</h1>
            <p className={styles.subtitle}>
              계정에 로그인하여 갤러리를 이용해보세요
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className={styles.loginForm}>
            {successMessage && (
              <div className={styles.successMessage}>
                {successMessage}
              </div>
            )}
            {errors.general && (
              <div className={styles.errorMessage}>
                {errors.general}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? styles.inputError : ''}`}
                placeholder="이메일을 입력하세요"
                disabled={loading}
              />
              {errors.email && (
                <span className={styles.fieldError}>{errors.email}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? styles.inputError : ''}`}
                placeholder="비밀번호를 입력하세요"
                disabled={loading}
              />
              {errors.password && (
                <span className={styles.fieldError}>{errors.password}</span>
              )}
            </div>
            
            <button
              type="submit"
              className={`btn btn-primary ${styles.loginBtn}`}
              disabled={loading}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
          
          <div className={styles.loginFooter}>
            <p className={styles.signupPrompt}>
              계정이 없으신가요?{' '}
              <Link to="/register" className={styles.signupLink}>
                회원가입
              </Link>
            </p>
          </div>
          
          <div className={styles.demoInfo}>
            <h4>데모 계정</h4>
            <p>이메일: test@test.com</p>
            <p>비밀번호: test1234!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
