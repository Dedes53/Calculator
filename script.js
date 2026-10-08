const inputField = document.getElementById('currentNumber');

const allowedOperators = ['+', '-', '*', '/'];

setupKeyboardInput();

function setupKeyboardInput() {
    document.addEventListener('keydown', handleKeyboardInput);
}

function handleKeyboardInput(e) {
    const key = e.key;

    if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculate();
        return;
    }

    if (key === 'Backspace') {
        e.preventDefault();
        deleteLast();
        return;
    }

    if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        populate(key);
        return;
    }

    if (isOperator(key)) {
        e.preventDefault();
        operate(key);
        return;
    }

    if (key === '.') {
        e.preventDefault();

        const currentToken = getCurrentToken();
        if (!currentToken.includes('.')) {
            disableDot();
        }
        return;
    }

    e.preventDefault();
}

function getCurrentToken() {
    const value = inputField.value;
    if (value === '') return '';

    let opIndex = -1;
    for (let i = 1; i < value.length; i++) {
        const ch = value[i];

        if (ch === '+' || ch === '*' || ch === '/') {
            opIndex = i;
        } else if (ch === '-') {
            const prev = value[i - 1];
            if (!isOperator(prev)) opIndex = i;
        }
    }

    return opIndex === -1 ? value : value.slice(opIndex + 1);
}

function disableDot() {
    const current = inputField.value;
    const lastChar = current.slice(-1);

    if (current === '' || isOperator(lastChar)) {
        inputField.value += '0.';
    } else {
        inputField.value += '.';
    }

    document.getElementById('decimal-dot').disabled = true;
}

function populate(toPopulate) {
    inputField.value += toPopulate;
    return inputField;
}

function getOperationFromInputField() {
    const value = inputField.value.trim();

    const match = value.match(/^(-?\d*\.?\d+)([+\-*/])(-?\d*\.?\d+)$/);
    if (!match) return undefined;

    return match[2];
}

function isOperator(value) {
    return ['+', '-', '*', '/'].includes(value);
}

function operate(operator) {
    let current = inputField.value;
    const last = current.slice(-1);
    const secondLast = current.slice(-2, -1);

    if (current === '') {
        if (operator === '-') populate('-');
        return;
    }

    if (isOperator(secondLast) && last === '-') {
        if (operator === '-') {
            inputField.value = current.slice(0, -2) + operator + '-';
        } else {
            inputField.value = current.slice(0, -2) + operator;
        }
        document.getElementById('decimal-dot').disabled = false;
        return;
    }

    if (isOperator(last)) {
        if (operator === '-' && last !== '-') {
            inputField.value += '-';
            return;
        }

        inputField.value = current.slice(0, -1) + operator;
        return;
    }

    if (getOperationFromInputField() !== undefined) {
        calculate();
        current = inputField.value;
    }

    inputField.value = current + operator;
    document.getElementById('decimal-dot').disabled = false;
}

function clearCalculation() {
    inputField.value = '';
    document.getElementById('decimal-dot').disabled = false;
}

function deleteLast() {
    inputField.value = inputField.value.slice(0, -1);

    const currentToken = getCurrentToken();
    if (!currentToken.includes('.')) {
        document.getElementById('decimal-dot').disabled = false;
    }
}

function adition(num1, num2) {
    return num1 + num2;
}

function subtraction(num1, num2) {
    return num1 - num2;
}

function division(num1, num2) {
    if (num2 === 0) {
        alert("Error: Division by zero is not allowed.");
        clearCalculation();
        return undefined;
    }
    return num1 / num2;
}

function multiplication(num1, num2) {
    return num1 * num2;
}

function calculate() {
    const expr = inputField.value.trim();
    if (expr === '') return;

    const match = expr.match(/^(-?\d*\.?\d+)([+\-*/])(-?\d*\.?\d+)$/);

    if (!match) {
        alert("Invalid operation");
        return;
    }

    const num1 = parseFloat(match[1]);
    const operation = match[2];
    const num2 = parseFloat(match[3]);

    if (Number.isNaN(num1) || Number.isNaN(num2)) {
        alert("Invalid operation");
        return;
    }

    let result;
    switch (operation) {
        case '+':
            result = adition(num1, num2);
            break;
        case '-':
            result = subtraction(num1, num2);
            break;
        case '*':
            result = multiplication(num1, num2);
            break;
        case '/':
            result = division(num1, num2);
            break;
        default:
            alert("Error: Invalid operation.");
            return;
    }

    if (result === undefined || Number.isNaN(result)) return;

    if (!Number.isInteger(result)) {
        result = Number(result.toFixed(2));
    }

    inputField.value = String(result);
    document.getElementById('decimal-dot').disabled = false;
}