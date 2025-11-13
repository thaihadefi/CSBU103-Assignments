const currentDisplay = document.getElementById('display');
const historyDisplay = document.getElementById('history');
const buttons = document.querySelector('.buttons');

let currentValue = '0';
let previousValue = null;
let currentOperator = null;
let shouldReset = false;

const operations = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => (b === 0 ? NaN : a / b),
  modulo: (a, b) => (b === 0 ? NaN : a % b),
  power: (a, b) => Math.pow(a, b)
};

function updateDisplay() {
  currentDisplay.textContent = currentValue;
  const operatorSymbol = getOperatorSymbol(currentOperator);
  historyDisplay.textContent = previousValue !== null && operatorSymbol
    ? `${previousValue} ${operatorSymbol}`
    : '';
  adjustFontSize(currentValue);
}

function getOperatorSymbol(action) {
  switch (action) {
    case 'add':
      return '+';
    case 'subtract':
      return '−';
    case 'multiply':
      return '×';
    case 'divide':
      return '÷';
    case 'modulo':
      return 'mod';
    case 'power':
      return '^';
    default:
      return '';
  }
}

function handleNumber(value) {
  if (currentValue === 'Error') {
    currentValue = '0';
    previousValue = null;
    currentOperator = null;
  }

  if (shouldReset) {
    currentValue = value === '.' ? '0.' : value;
    shouldReset = false;
    updateDisplay();
    return;
  }

  if (value === '.') {
    if (!currentValue.includes('.')) {
      currentValue += '.';
    } 
  } else {
    currentValue = currentValue === '0' ? value : currentValue + value;
  }

  updateDisplay();
}

function setOperator(action) {
  if (currentValue === 'Error') {
    return;
  } 

  const numericValue = parseFloat(currentValue);
  if (previousValue === null) {
    previousValue = numericValue;
  } else if (!shouldReset) {
    const result = calculate(numericValue);
    if (result === 'Error') {
      handleError();
      return;
    }
    previousValue = result;
    currentValue = formatResult(result);
  }

  currentOperator = action;
  shouldReset = true;
  updateDisplay();
}

function calculate(secondOperand) {
  if (currentOperator && operations[currentOperator]) {
    const result = operations[currentOperator](previousValue, secondOperand);
    if (Number.isNaN(result) || !Number.isFinite(result)) {
      return 'Error';
    }
    return result;
  }
  return secondOperand;
}

function formatResult(result) {
  if (result === 'Error') {
    return 'Error';
  } 
  const rounded = Math.round(result * 1e10) / 1e10;
  return rounded.toString();
}

function adjustFontSize(value) {
  const cleanLength = value.replace('-', '').length;
  const baseSize = 2.75;
  const minSize = 1.1;
  if (cleanLength <= 10) {
    currentDisplay.style.fontSize = `${baseSize}rem`;
    return;
  }
  const extraChars = cleanLength - 10;
  const newSize = Math.max(minSize, baseSize - extraChars * 0.12);
  currentDisplay.style.fontSize = `${newSize}rem`;
}

function evaluate() {
  if (currentOperator === null || previousValue === null || shouldReset) {
    return;
  }
  const secondOperand = parseFloat(currentValue);
  const result = calculate(secondOperand);
  if (result === 'Error') {
    handleError();
    return;
  }
  currentValue = formatResult(result);
  previousValue = null;
  currentOperator = null;
  shouldReset = true;
  historyDisplay.textContent = '';
  updateDisplay();
}

function clearAll() {
  currentValue = '0';
  previousValue = null;
  currentOperator = null;
  shouldReset = false;
  updateDisplay();
}

function clearEntry() {
  if (currentValue === 'Error') {
    clearAll();
    return;
  }
  currentValue = '0';
  shouldReset = false;
  updateDisplay();
}

function handleError() {
  currentValue = 'Error';
  previousValue = null;
  currentOperator = null;
  shouldReset = true;
  historyDisplay.textContent = '';
  updateDisplay();
}

function toggleSign() {
  if (currentValue === '0' || currentValue === 'Error') {
    return;
  } 
  currentValue = currentValue.startsWith('-')
    ? currentValue.slice(1)
    : `-${currentValue}`;
  updateDisplay();
}

function applyPercent() {
  if (currentValue === 'Error') {
    return;
  } 
  const number = parseFloat(currentValue);
  if (Number.isNaN(number)) {
    currentValue = '0';
    updateDisplay();
    return;
  }
  currentValue = formatResult(number / 100);
  shouldReset = false;
  updateDisplay();
}

function handleKeyboardInput(event) {
  const { key } = event;

  if (/^[0-9]$/.test(key)) {
    event.preventDefault();
    handleNumber(key);
    return;
  }

  if (key === '.') {
    event.preventDefault();
    handleNumber('.');
    return;
  }

  if (key === '%') {
    event.preventDefault();
    applyPercent();
    return;
  }

  if (key === 'Enter' || key === '=') {
    event.preventDefault();
    evaluate();
    return;
  }

  if (key === 'Escape') {
    event.preventDefault();
    clearAll();
    return;
  }

  if (key === 'Backspace') {
    event.preventDefault();
    clearEntry();
    return;
  }

  const operatorKeyMap = {
    '+': 'add',
    '-': 'subtract',
    '*': 'multiply',
    'x': 'multiply',
    'X': 'multiply',
    '/': 'divide',
    '÷': 'divide',
    'm': 'modulo',
    'M': 'modulo',
    '^': 'power',
    'p': 'power',
    'P': 'power'
  };

  if (operatorKeyMap[key]) {
    event.preventDefault();
    setOperator(operatorKeyMap[key]);
  }
}

buttons.addEventListener('click', (event) => {
  const target = event.target;
  if (!target.classList.contains('btn')) {
    return;
  } 

  const value = target.dataset.value;
  const action = target.dataset.action;

  if (value !== undefined) {
    handleNumber(value);
    return;
  }

  switch (action) {
    case 'all-clear':
      clearAll();
      break;
    case 'clear-entry':
      clearEntry();
      break;
    case 'sign':
      toggleSign();
      break;
    case 'percent':
      applyPercent();
      break;
    case 'equals':
      evaluate();
      break;
    case 'add':
    case 'subtract':
    case 'multiply':
    case 'divide':
    case 'modulo':
    case 'power':
      if (currentValue === 'Error') {
        return;
      } 
      setOperator(action);
      break;
    default:
      break;
  }
});

updateDisplay();
document.addEventListener('keydown', handleKeyboardInput);
