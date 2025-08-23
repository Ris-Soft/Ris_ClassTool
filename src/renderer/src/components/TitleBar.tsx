import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { MinusOutlined, BorderOutlined, CloseOutlined, AppstoreOutlined } from '@ant-design/icons';

const TitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // 检查初始最大化状态
    const checkMaximized = async () => {
      if (window.electronAPI?.window?.isMaximized) {
        const maximized = await window.electronAPI.window.isMaximized();
        setIsMaximized(maximized);
      }
    };
    
    checkMaximized();

    // 监听窗口状态变化
    if (window.electronAPI?.on) {
      window.electronAPI.on('window-maximized', () => setIsMaximized(true));
      window.electronAPI.on('window-unmaximized', () => setIsMaximized(false));
    }
  }, []);

  const handleMinimize = () => {
    if (window.electronAPI?.window?.minimize) {
      window.electronAPI.window.minimize();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI?.window?.maximize) {
      window.electronAPI.window.maximize();
    }
  };

  const handleClose = () => {
    if (window.electronAPI?.window?.closeApp) {
      window.electronAPI.window.closeApp();
    }
  };

  return (
    <div className="title-bar">
      <div className="title-bar-content">
        <div className="title-bar-left">
          <div className="app-logo">
            <AppstoreOutlined />
            <span className="app-name">LessonPlugin</span>
          </div>
        </div>
        
        <div className="title-bar-center">
          <div className="title-bar-drag-region" />
        </div>
        
        <div className="title-bar-right">
          <Button
            type="text"
            size="small"
            icon={<MinusOutlined />}
            className="title-bar-button minimize-button"
            onClick={handleMinimize}
          />
          <Button
            type="text"
            size="small"
            icon={<BorderOutlined />}
            className="title-bar-button maximize-button"
            onClick={handleMaximize}
          />
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            className="title-bar-button close-button"
            onClick={handleClose}
          />
        </div>
      </div>
    </div>
  );
};

export default TitleBar;