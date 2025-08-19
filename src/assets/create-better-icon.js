const fs = require('fs');
const path = require('path');

// 创建一个更标准的16x16 ICO文件
// 这是一个有效的ICO文件头和数据
const icoHeader = Buffer.from([
  0x00, 0x00, // Reserved
  0x01, 0x00, // Type: ICO
  0x01, 0x00, // Number of images: 1
  
  // Image directory entry
  0x10,       // Width: 16
  0x10,       // Height: 16
  0x00,       // Color count: 0 (256 colors)
  0x00,       // Reserved
  0x01, 0x00, // Color planes: 1
  0x20, 0x00, // Bits per pixel: 32
  0x00, 0x04, 0x00, 0x00, // Image size: 1024 bytes
  0x16, 0x00, 0x00, 0x00  // Image offset: 22 bytes
]);

// 创建一个简单的蓝色16x16图标数据
const imageData = Buffer.alloc(1024); // 16*16*4 bytes for RGBA + some padding

// 填充RGBA数据 (蓝色图标)
for (let y = 0; y < 16; y++) {
  for (let x = 0; x < 16; x++) {
    const offset = (y * 16 + x) * 4;
    if (x >= 2 && x <= 13 && y >= 2 && y <= 13) {
      // 内部蓝色
      imageData[offset] = 0xFF;     // Blue
      imageData[offset + 1] = 0x90; // Green
      imageData[offset + 2] = 0x00; // Red
      imageData[offset + 3] = 0xFF; // Alpha
    } else if (x >= 1 && x <= 14 && y >= 1 && y <= 14) {
      // 边框深蓝色
      imageData[offset] = 0x80;     // Blue
      imageData[offset + 1] = 0x40; // Green
      imageData[offset + 2] = 0x00; // Red
      imageData[offset + 3] = 0xFF; // Alpha
    } else {
      // 透明
      imageData[offset] = 0x00;
      imageData[offset + 1] = 0x00;
      imageData[offset + 2] = 0x00;
      imageData[offset + 3] = 0x00;
    }
  }
}

// 合并头部和数据
const fullIcon = Buffer.concat([icoHeader, imageData]);

// 写入文件
const iconPath = path.join(__dirname, 'tray-icon.ico');
fs.writeFileSync(iconPath, fullIcon);

console.log('改进的托盘图标已创建:', iconPath);