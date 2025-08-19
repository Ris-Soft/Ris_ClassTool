// 简单的测试脚本来验证应用功能
const { app, BrowserWindow } = require('electron');
const path = require('path');

console.log('测试Electron应用启动...');
console.log('React构建文件路径:', path.join(__dirname, 'src/renderer/build/index.html'));
console.log('插件目录:', path.join(require('os').homedir(), 'AppData/Roaming/ris-classtool/plugins'));

// 检查文件是否存在
const fs = require('fs');
const buildPath = path.join(__dirname, 'src/renderer/build/index.html');
const pluginPath = path.join(require('os').homedir(), 'AppData/Roaming/ris-classtool/plugins');

console.log('React构建文件存在:', fs.existsSync(buildPath));
console.log('插件目录存在:', fs.existsSync(pluginPath));

if (fs.existsSync(pluginPath)) {
  const plugins = fs.readdirSync(pluginPath);
  console.log('已安装的插件:', plugins);
}