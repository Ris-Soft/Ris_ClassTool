<script setup>
import { onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import pluginManager from './plugins/pluginManager'
import samplePlugin from './plugins/samplePlugin'

const router = useRouter()

// 在组件挂载前注册示例插件
onBeforeMount(() => {
  console.log('注册插件:', samplePlugin)
  pluginManager.registerPlugin(samplePlugin.id, samplePlugin)
  console.log('注册后插件管理器状态:')
  console.log('超级置顶组件:', pluginManager.getSuperimposedComponents())
  console.log('桌面层组件:', pluginManager.getDesktopComponents())
  console.log('设置项:', pluginManager.getSettingItems())

  // 监听系统托盘事件
  window.electron.ipcRenderer.on('open-settings', () => {
    router.push('/settings')
  })
})

const openWindow = (path) => {
  // 通过IPC调用主进程创建窗口
  switch(path) {
    case '/superimposed':
      window.electron.ipcRenderer.send('create-superimposed-window')
      break
    case '/desktop':
      window.electron.ipcRenderer.send('create-desktop-window')
      break
    case '/settings':
      window.electron.ipcRenderer.send('open-settings')
      break
    default:
      router.push(path)
  }
}
</script>

<template>
  <div v-if="$route.name === 'NormalWindow' || $route.name === null" class="window-selector">
    <h1>课堂辅助程序</h1>
    <div class="window-options">
      <button @click="openWindow('/superimposed')">超级置顶窗口</button>
      <button @click="openWindow('/desktop')">桌面层窗口</button>
      <button @click="openWindow('/normal')">普通窗口</button>
      <button @click="openWindow('/settings')">程序设置</button>
    </div>
  </div>
  <RouterView v-else />
</template>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  overflow: hidden; /* 隐藏默认滚动条 */
}

/* 隐藏默认滚动条但保持功能 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}

.window-selector {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
}

.window-selector h1 {
  margin-bottom: 30px;
  color: #333;
}

.window-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.window-options button {
  padding: 12px 24px;
  font-size: 16px;
  background-color: #4a86e8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.window-options button:hover {
  background-color: #3a76d8;
}
</style>