import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './RegisterPage.module.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

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
    
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '이름은 최소 2자 이상이어야 합니다.';
    }
    
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
    
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
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
      const result = await register(formData.email, formData.password, formData.name);
      
      if (result.success) {
        // 회원가입 성공 시 로그인 페이지로 이동
        navigate('/login', { 
          state: { 
            message: '회원가입이 완료되었습니다. 로그인해주세요.',
            email: formData.email 
          } 
        });
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: '회원가입 중 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerPage}>
      <div className={styles.registerContainer}>
        <div className={styles.registerCard}>
          <div className={styles.registerHeader}>
            <h1 className={styles.title}>회원가입</h1>
            <p className={styles.subtitle}>
              새 계정을 만들어 갤러리 서비스를 시작하세요
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className={styles.registerForm}>
            {errors.general && (
              <div className={styles.errorMessage}>
                {errors.general}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                이름
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? styles.inputError : ''}`}
                placeholder="이름을 입력하세요"
                disabled={loading}
              />
              {errors.name && (
                <span className={styles.fieldError}>{errors.name}</span>
              )}
            </div>
            
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
            
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                비밀번호 확인
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input ${errors.confirmPassword ? styles.inputError : ''}`}
                placeholder="비밀번호를 다시 입력하세요"
                disabled={loading}
              />
              {errors.confirmPassword && (
                <span className={styles.fieldError}>{errors.confirmPassword}</span>
              )}
            </div>
            
            <button
              type="submit"
              className={`btn btn-primary ${styles.registerBtn}`}
              disabled={loading}
            >
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </form>
          
          <div className={styles.registerFooter}>
            <p className={styles.loginPrompt}>
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className={styles.loginLink}>
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
