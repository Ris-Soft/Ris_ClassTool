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