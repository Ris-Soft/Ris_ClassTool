import { createRouter, createWebHashHistory } from 'vue-router'

import Home from '../views/Home.vue'
import About from '../views/About.vue'
import SuperimposedWindow from '../windows/SuperimposedWindow.vue'
import DesktopWindow from '../windows/DesktopWindow.vue'
import NormalWindow from '../windows/NormalWindow.vue'
import SettingsWindow from '../windows/SettingsWindow.vue'

const routes = [
  {
    path: '/',
    name: 'NormalWindow',
    component: NormalWindow
  },
  {
    path: '/superimposed',
    name: 'SuperimposedWindow',
    component: SuperimposedWindow
  },
  {
    path: '/desktop',
    name: 'DesktopWindow',
    component: DesktopWindow
  },
  {
    path: '/normal',
    name: 'NormalWindow',
    component: NormalWindow
  },
  {
    path: '/settings',
    name: 'SettingsWindow',
    component: SettingsWindow
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router