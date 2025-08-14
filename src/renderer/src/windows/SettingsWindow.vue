<script setup>
import { ref, onMounted } from 'vue'
import windowManager from './windowManager'

const windowData = ref(null)
const activeItem = ref(null)

onMounted(() => {
  windowData.value = windowManager.createSettingsWindow()
  console.log('设置窗口数据:', windowData.value)
  if (windowData.value.settingItems.length > 0) {
    // 默认选中第一个非分隔符项目
    const firstItem = windowData.value.settingItems.find(item => !item.separator)
    if (firstItem) {
      activeItem.value = firstItem.id
    }
  }
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
  <div class="settings-window">
    <!-- 自定义标题栏 -->
    <div class="title-bar">
      <div class="window-title">程序设置</div>
      <div class="window-controls">
        <button class="control-button minimize" @click="minimizeWindow">─</button>
        <button class="control-button maximize" @click="maximizeWindow">□</button>
        <button class="control-button close" @click="closeWindow">×</button>
      </div>
    </div>
    
    <!-- 内容区域 -->
    <div class="content" v-if="windowData">
      <div class="sidebar">
        <div 
          v-for="item in windowData.settingItems" 
          :key="item.id"
          class="sidebar-item"
          :class="{ active: activeItem === item.id, separator: item.separator }"
          @click="!item.separator && (activeItem = item.id)"
        >
          <span v-if="!item.separator">{{ item.title }}</span>
          <hr v-else />
        </div>
      </div>
      
      <div class="main-content">
        <div 
          v-for="item in windowData.settingItems.filter(i => !i.separator)" 
          :key="item.id"
          v-show="activeItem === item.id"
          class="content-panel"
        >
          <h2>{{ item.title }}</h2>
          <div v-if="item.component">
            <component :is="item.component" />
          </div>
          <div v-else class="placeholder">
            <p v-if="item.id === 'market'">功能市场内容区域</p>
            <p v-else-if="item.id === 'management'">功能管理内容区域</p>
            <p v-else>插件 {{ item.title }} 的内容区域</p>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="loading">加载中...</div>
  </div>
</template>

<style scoped>
.settings-window {
  width: 100vw;
  height: 100vh;
  background-color: #fff;
  color: #333;
  display: flex;
  flex-direction: column;
}

.title-bar {
  height: 30px;
  background-color: #333;
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
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 200px;
  background-color: #f0f0f0;
  border-right: 1px solid #ddd;
  overflow-y: auto;
}

.sidebar-item {
  padding: 12px 15px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.sidebar-item:hover:not(.separator) {
  background-color: #e0e0e0;
}

.sidebar-item.active {
  background-color: #4a86e8;
  color: white;
}

.sidebar-item.separator {
  cursor: default;
  padding: 5px 0;
}

.sidebar-item.separator:hover {
  background-color: #f0f0f0;
}

.sidebar-item hr {
  margin: 0;
  border: none;
  border-top: 1px solid #ccc;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.content-panel h2 {
  margin-top: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.placeholder {
  color: #888;
  font-style: italic;
  text-align: center;
  padding: 40px 20px;
}
</style>