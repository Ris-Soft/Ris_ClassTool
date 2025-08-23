// 计算器插件示例
let pluginWindow = null;
let context = null;

// 插件初始化函数
async function initialize(ctx) {
  context = ctx;
  console.log('计算器插件已初始化');
  
  // 监听应用启动事件
  ctx.on('app-started', (data) => {
    console.log('应用已启动，计算器插件准备就绪');
    // 不在初始化时自动创建窗口，等待用户主动打开
  });
}

// 创建计算器窗口
function createCalculatorWindow() {
  if (pluginWindow) {
    // 如果窗口已存在，尝试聚焦
    try {
      if (pluginWindow.window && !pluginWindow.window.isDestroyed()) {
        pluginWindow.window.focus();
        return pluginWindow;
      }
    } catch (error) {
      console.log('窗口已销毁，重新创建');
      pluginWindow = null;
    }
  }

  if (!context || !context.createWindow) {
    console.error('插件上下文或createWindow方法不可用');
    return null;
  }

  try {
    pluginWindow = context.createWindow({
      title: '计算器',
      width: 300,
      height: 400,
      minWidth: 250,
      minHeight: 350,
      resizable: true,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>计算器</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
          }
          .calculator {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .display {
            width: 100%;
            height: 60px;
            font-size: 24px;
            text-align: right;
            padding: 0 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            margin-bottom: 15px;
            background: #f9f9f9;
            box-sizing: border-box;
          }
          .buttons {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
          }
          button {
            height: 50px;
            font-size: 18px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          .number, .operator {
            background: #e9ecef;
          }
          .number:hover, .operator:hover {
            background: #dee2e6;
          }
          .equals {
            background: #007bff;
            color: white;
          }
          .equals:hover {
            background: #0056b3;
          }
          .clear {
            background: #dc3545;
            color: white;
          }
          .clear:hover {
            background: #c82333;
          }
          .zero {
            grid-column: span 2;
          }
        </style>
      </head>
      <body>
        <div class="calculator">
          <input type="text" class="display" id="display" readonly>
          <div class="buttons">
            <button class="clear" onclick="clearDisplay()">C</button>
            <button class="operator" onclick="appendToDisplay('/')">/</button>
            <button class="operator" onclick="appendToDisplay('*')">×</button>
            <button class="operator" onclick="deleteLast()">⌫</button>
            
            <button class="number" onclick="appendToDisplay('7')">7</button>
            <button class="number" onclick="appendToDisplay('8')">8</button>
            <button class="number" onclick="appendToDisplay('9')">9</button>
            <button class="operator" onclick="appendToDisplay('-')">-</button>
            
            <button class="number" onclick="appendToDisplay('4')">4</button>
            <button class="number" onclick="appendToDisplay('5')">5</button>
            <button class="number" onclick="appendToDisplay('6')">6</button>
            <button class="operator" onclick="appendToDisplay('+')">+</button>
            
            <button class="number" onclick="appendToDisplay('1')">1</button>
            <button class="number" onclick="appendToDisplay('2')">2</button>
            <button class="number" onclick="appendToDisplay('3')">3</button>
            <button class="equals" onclick="calculate()" style="grid-row: span 2">=</button>
            
            <button class="number zero" onclick="appendToDisplay('0')">0</button>
            <button class="number" onclick="appendToDisplay('.')">.</button>
          </div>
        </div>
        
        <script>
          let display = document.getElementById('display');
          let currentInput = '';
          
          function appendToDisplay(value) {
            currentInput += value;
            display.value = currentInput;
          }
          
          function clearDisplay() {
            currentInput = '';
            display.value = '';
          }
          
          function deleteLast() {
            currentInput = currentInput.slice(0, -1);
            display.value = currentInput;
          }
          
          function calculate() {
            try {
              // 替换显示符号为计算符号
              let expression = currentInput.replace(/×/g, '*');
              let result = eval(expression);
              display.value = result;
              currentInput = result.toString();
            } catch (error) {
              display.value = '错误';
              currentInput = '';
            }
          }
          
          // 键盘支持
          document.addEventListener('keydown', function(event) {
            const key = event.key;
            if ('0123456789+-*/.'.includes(key)) {
              appendToDisplay(key === '*' ? '×' : key);
            } else if (key === 'Enter' || key === '=') {
              calculate();
            } else if (key === 'Escape' || key === 'c' || key === 'C') {
              clearDisplay();
            } else if (key === 'Backspace') {
              deleteLast();
            }
          });
        </script>
      </body>
      </html>
    `
    });

    // 确保窗口对象存在并设置关闭事件
    if (pluginWindow && pluginWindow.window) {
      pluginWindow.window.on('closed', () => {
        pluginWindow = null;
      });
    }

    return pluginWindow;
  } catch (error) {
    console.error('创建计算器窗口失败:', error);
    return null;
  }
}

// 关闭计算器窗口
function closeCalculatorWindow() {
  if (pluginWindow) {
    try {
      if (pluginWindow.window && !pluginWindow.window.isDestroyed()) {
        pluginWindow.window.close();
      }
    } catch (error) {
      console.error('关闭窗口失败:', error);
    }
    pluginWindow = null;
  }
}

// 项目操作：打开计算器
async function openProject(params, ctx) {
  return createCalculatorWindow();
}

// 插件操作：显示关于信息
async function showAbout(params, ctx) {
  const aboutWindow = ctx.createWindow({
    title: '关于计算器',
    width: 400,
    height: 300,
    resizable: false,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>关于计算器</title>
        <style>
          body {
            margin: 0;
            padding: 30px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            text-align: center;
          }
          .about {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 {
            color: #333;
            margin-bottom: 10px;
          }
          p {
            color: #666;
            line-height: 1.6;
            margin: 10px 0;
          }
          .version {
            font-weight: bold;
            color: #007bff;
          }
        </style>
      </head>
      <body>
        <div class="about">
          <h1>🧮 计算器插件</h1>
          <p class="version">版本 1.0.0</p>
          <p>一个简单而实用的计算器工具</p>
          <p>支持基本的数学运算和键盘操作</p>
          <p>作者：课堂工具开发团队</p>
        </div>
      </body>
      </html>
    `
  });

  return aboutWindow;
}

// 导出插件方法
module.exports = {
  initialize,
  openProject,
  showAbout,
  createCalculatorWindow,
  closeCalculatorWindow
};