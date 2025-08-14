<script setup>
import { ref, onMounted } from 'vue'
import windowManager from './windowManager'

const windowData = ref(null)

onMounted(() => {
  // 从 windowManager 获取桌面窗口数据，包含插件组件信息
  windowData.value = windowManager.createDesktopWindow()
  console.log('桌面层窗口数据:', windowData.value)
})

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
</script>

<template>
  <div class="desktop-window">
    <!-- 自定义标题栏 -->
    <div class="title-bar">
      <div class="window-title">桌面层窗口</div>
      <div class="window-controls">
        <button class="control-button minimize" @click="minimizeWindow">─</button>
        <button class="control-button maximize" @click="maximizeWindow">□</button>
        <button class="control-button close" @click="closeWindow">×</button>
      </div>
    </div>
    
    <!-- 内容区域 -->
    <div class="content">
      <div v-if="windowData" class="components-container">
        <div 
          v-for="component in windowData.components" 
          :key="component.id"
          class="plugin-component"
        >
          <component :is="component.component" />
        </div>
        <div v-if="windowData.components.length === 0" class="no-components">
          没有插件组件
        </div>
      </div>
      <div v-else class="loading">加载中...</div>
    </div>
  </div>
</template>

<style scoped>
.desktop-window {
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 50, 0, 0.7);
  color: white;
  display: flex;
  flex-direction: column;
}

.title-bar {
  height: 30px;
  background-color: rgba(30, 80, 30, 0.9);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  -webkit-app-region: drag;
}

.window-title {
  font-size: 14px;
  font-weight: bold;
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
  padding: 10px;
}

.components-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.plugin-component {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  padding: 10px;
}

.no-components {
  color: #aaa;
  font-style: italic;
  padding: 20px;
  text-align: center;
}
</style>