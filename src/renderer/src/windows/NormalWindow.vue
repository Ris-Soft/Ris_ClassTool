<script setup>
// 窗口控制函数
const minimizeWindow = () => {
  window.electron.ipcRenderer.send('window-minimize')
}

const maximizeWindow = () => {
  window.electron.ipcRenderer.send('window-maximize')
}

const closeWindow = () => {
  window.electron.ipcRenderer.send('window-close')
}

const openSettings = () => {
  window.electron.ipcRenderer.send('open-settings')
}
</script>

<template>
  <div class="normal-window">
    <!-- 自定义标题栏 -->
    <div class="title-bar">
      <div class="window-title">普通窗口</div>
      <div class="window-controls">
        <button class="control-button settings" @click="openSettings">⚙️</button>
        <button class="control-button minimize" @click="minimizeWindow">─</button>
        <button class="control-button maximize" @click="maximizeWindow">□</button>
        <button class="control-button close" @click="closeWindow">×</button>
      </div>
    </div>
    
    <!-- 内容区域 -->
    <div class="content">
      <h1>课堂辅助程序</h1>
      <p>这是一个基于Vue和Electron的课堂辅助程序</p>
      <div class="features">
        <h2>功能特点：</h2>
        <ul>
          <li>支持多种窗口类型</li>
          <li>插件化架构设计</li>
          <li>超级置顶窗口</li>
          <li>桌面层窗口</li>
          <li>系统托盘管理</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.normal-window {
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;
  color: #333;
  display: flex;
  flex-direction: column;
}

.title-bar {
  height: 30px;
  background-color: #4a86e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  -webkit-app-region: drag;
}

.window-title {
  font-size: 14px;
  font-weight: bold;
  color: white;
}

.window-controls {
  -webkit-app-region: no-drag;
  display: flex;
}

.control-button {
  width: 25px;
  height: 25px;
  border: none;
  background: transparent;
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.content {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

.features {
  margin-top: 20px;
}

.features ul {
  padding-left: 20px;
}

.features li {
  margin-bottom: 10px;
}
</style>