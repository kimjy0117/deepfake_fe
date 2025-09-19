import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGallery } from '../contexts/GalleryContext';
import styles from './UploadForm.module.css';

const UploadForm = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  const { uploadFile, uploading } = useGallery();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
      // 파일 입력 필드 초기화 (같은 파일을 다시 선택할 수 있도록)
      e.target.value = '';
    }
  };

  const handleFiles = (files) => {
    const validFiles = [];
    const newErrors = [];
    
    // 기존 파일명들을 확인하여 중복 방지
    const existingFileNames = selectedFiles.map(file => file.name);
    
    files.forEach((file, index) => {
      // Check for duplicate files
      if (existingFileNames.includes(file.name)) {
        newErrors.push(`${file.name}: 이미 선택된 파일입니다.`);
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        newErrors.push(`${file.name}: 이미지 또는 영상 파일만 업로드 가능합니다.`);
        return;
      }
      
      // Check file size (50MB limit)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        newErrors.push(`${file.name}: 파일 크기는 50MB 이하여야 합니다.`);
        return;
      }
      
      validFiles.push(file);
    });
    
    setErrors(newErrors);
    // 기존 파일들과 새로운 파일들을 병합
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setErrors(['업로드할 파일을 선택해주세요.']);
      return;
    }
    
    try {
      // 파일명에서 확장자를 제거한 기본 제목 생성
      const titles = selectedFiles.map(file => 
        file.name.replace(/\.[^/.]+$/, "")
      );
      
      const uploadPromises = selectedFiles.map((file, index) => 
        uploadFile(file, user.id, titles[index])
      );
      
      const results = await Promise.all(uploadPromises);
      const failedUploads = results.filter(result => !result.success);
      
      if (failedUploads.length > 0) {
        setErrors(failedUploads.map(result => result.error));
      } else {
        setSelectedFiles([]);
        setErrors([]);
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      }
    } catch (error) {
      setErrors(['업로드 중 오류가 발생했습니다.']);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={styles.uploadForm}>
      <div className={styles.uploadHeader}>
        <h3 className={styles.title}>파일 업로드</h3>
        <p className={styles.description}>
          이미지나 영상을 드래그하거나 클릭하여 업로드하세요
        </p>
      </div>
      
      <div
        className={`${styles.dropZone} ${dragActive ? styles.dragActive : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className={styles.dropZoneContent}>
          <div className={styles.uploadIcon}>📁</div>
          <p className={styles.dropText}>
            <strong>여러 파일을 한번에</strong> 드래그하거나 아래 버튼을 클릭하여 선택하세요
          </p>
          <p className={styles.supportText}>
            지원 형식: JPG, PNG, GIF, MP4, MOV, AVI (각 파일 최대 50MB)<br />
            이미지와 영상을 함께 선택할 수 있습니다<br />
            <em>파일을 추가로 선택하면 기존 파일과 함께 업로드됩니다</em>
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`btn btn-primary ${styles.selectBtn}`}
            type="button"
          >
            📁 파일 선택
          </button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className={styles.fileInput}
        />
      </div>
      
      {errors.length > 0 && (
        <div className={styles.errorList}>
          {errors.map((error, index) => (
            <div key={index} className={styles.errorItem}>
              {error}
            </div>
          ))}
        </div>
      )}
      
      {selectedFiles.length > 0 && (
        <div className={styles.fileList}>
          <div className={styles.fileListHeader}>
            <h4 className={styles.fileListTitle}>선택된 파일 ({selectedFiles.length}개)</h4>
            <p className={styles.fileListDescription}>
              선택된 파일들이 업로드됩니다. 파일명이 제목으로 사용됩니다.
            </p>
          </div>
          
          <div className={styles.filesContainer}>
            {selectedFiles.map((file, index) => (
              <div key={index} className={styles.fileItem}>
                <div className={styles.filePreview}>
                  <div className={styles.fileIcon}>
                    {file.type.startsWith('image/') ? '🖼️' : '🎬'}
                  </div>
                  <div className={styles.fileInfo}>
                    <span className={styles.fileName}>{file.name}</span>
                    <div className={styles.fileMetadata}>
                      <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
                      <span className={styles.fileType}>
                        {file.type.startsWith('image/') ? '이미지' : '영상'}
                      </span>
                    </div>
                    <div className={styles.titlePreview}>
                      제목: {file.name.replace(/\.[^/.]+$/, "")}
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className={styles.removeBtn}
                    type="button"
                    title="파일 제거"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className={styles.uploadSection}>
            <div className={styles.uploadActions}>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`btn btn-outline ${styles.addMoreBtn}`}
                type="button"
              >
                + 파일 더 추가
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className={`btn btn-primary ${styles.uploadBtn}`}
              >
                {uploading ? '업로드 중...' : `${selectedFiles.length}개 파일 업로드`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
