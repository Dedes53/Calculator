const inputField = document.getElementById('display');
const decimalDotButton = document.getElementById('decimal-dot');

const allowedOperators = ['+', '-', '*', '/'];

if (!inputField) {
    console.error("Elemento #display non trovato nel DOM.");
} else {
    setupKeyboardInput();
    setupButtonInput(); // <- importante per i click
    syncDecimalDotState();
}

function setupKeyboardInput() {
    document.addEventListener('keydown', handleKeyboardInput);
}

// Collega i pulsanti se usi onclick HTML o data attributes
function setupButtonInput() {
    if (decimalDotButton) {
        decimalDotButton.addEventListener('click', insertDot);
    }
}

function handleKeyboardInput(e) {
    const key = e.key;

    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (['Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return;

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

    if (key === 'Escape') {
        e.preventDefault();
        clearCalculation();
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
        insertDot();
        return;
    }

    e.preventDefault();
}

function isOperator(value) {
    return allowedOperators.includes(value);
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

function syncDecimalDotState() {
    if (!decimalDotButton) return;
    decimalDotButton.disabled = getCurrentToken().includes('.');
}

function populate(toPopulate) {
    inputField.value += toPopulate;
    syncDecimalDotState();
}

function insertDot() {
    const current = inputField.value;
    const lastChar = current.slice(-1);

    if (current === '' || isOperator(lastChar)) {
        inputField.value += '0.';
    } else {
        const token = getCurrentToken();
        if (token.includes('.')) return;
        inputField.value += '.';
    }

    syncDecimalDotState();
}

function operate(operator) {
    let current = inputField.value;
    const last = current.slice(-1);
    const secondLast = current.slice(-2, -1);

    if (current === '') {
        if (operator === '-') populate('-');
        return;
    }

    // Caso: già "op-": es. 5*-  e inserisci altro operatore
    if (isOperator(secondLast) && last === '-') {
        if (operator === '-') {
            // mantiene op- (non aggiunge altro)
            return;
        } else {
            // sostituisce "op-" con "nuovoOp"
            inputField.value = current.slice(0, -2) + operator;
            syncDecimalDotState();
            return;
        }
    }

    if (isOperator(last)) {
        if (operator === '-' && last !== '-') {
            // Consenti secondo meno: 5- -> 5-- ; 5* -> 5*-
            inputField.value += '-';
            syncDecimalDotState();
            return;
        }
        // sostituzione operatore singolo
        inputField.value = current.slice(0, -1) + operator;
        syncDecimalDotState();
        return;
    }

    // Se è già presente un'espressione completa, calcola prima
    if (getOperationFromInputField() !== undefined) {
        calculate();
        current = inputField.value;
    }

    inputField.value = current + operator;
    syncDecimalDotState();
}

function clearCalculation() {
    inputField.value = '';
    syncDecimalDotState();
}

function deleteLast() {
    inputField.value = inputField.value.slice(0, -1);
    syncDecimalDotState();
}

function addition(a, b) { return a + b; }
function subtraction(a, b) { return a - b; }
function multiplication(a, b) { return a * b; }

function division(a, b) {
    if (b === 0) {
        alert('Errore: divisione per zero non consentita.');
        clearCalculation();
        return undefined;
    }
    return a / b;
}

function getOperationFromInputField() {
    const value = inputField.value.trim();
    // supporta 5--2, 5+-2, 5*-2, 5/-2
    const match = value.match(/^(-?\d*\.?\d+)([+\-*/])(-?\d*\.?\d+)$/);
    return match ? match[2] : undefined;
}

function formatResult(result) {
    return String(Number(result.toFixed(10)));
}

function calculate() {
    const expr = inputField.value.trim();
    if (!expr) return;

    // Trova l'operatore BINARIO (+ - * /), ignorando il primo carattere
    // così il "-" iniziale di un numero negativo non viene preso come operatore.
    let opIndex = -1;
    for (let i = 1; i < expr.length; i++) {
        const ch = expr[i];
        if (ch === '+' || ch === '*' || ch === '/') {
            opIndex = i;
            break;
        }
        if (ch === '-') {
            // è operatore solo se il char precedente NON è operatore
            // quindi in "5--2" il primo "-" è operatore, il secondo è segno del numero
            if (!isOperator(expr[i - 1])) {
                opIndex = i;
                break;
            }
        }
    }

    if (opIndex === -1) {
        alert('Operazione non valida.');
        return;
    }

    const left = expr.slice(0, opIndex);
    const op = expr[opIndex];
    const right = expr.slice(opIndex + 1);

    // right può essere negativo (es: "-2"), ma non vuoto
    if (!left || !right) {
        alert('Operazione non valida.');
        return;
    }

    const num1 = Number(left);
    const num2 = Number(right);

    if (!Number.isFinite(num1) || !Number.isFinite(num2)) {
        alert('Operazione non valida.');
        return;
    }

    let result;
    switch (op) {
        case '+': result = addition(num1, num2); break;
        case '-': result = subtraction(num1, num2); break;
        case '*': result = multiplication(num1, num2); break;
        case '/': result = division(num1, num2); break;
        default:
            alert('Operatore non valido.');
            return;
    }

    if (result === undefined || !Number.isFinite(result)) return;

    inputField.value = formatResult(result);
    syncDecimalDotState();
}