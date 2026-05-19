const display = document.getElementById("display");
const keys = document.querySelector(".keys");

let expression = "";
let secretBuffer = "";
const secretCode = "6769";

const constants = {
  PI: Math.PI,
  E: Math.E,
};

const mathFunctions = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  sqrt: Math.sqrt,
  log10: Math.log10,
  log: Math.log,
};

function updateDisplay(value) {
  display.value = value || "0";
}

function appendToExpression(value) {
  expression += value;
  updateDisplay(expression);
}

function trackSecretInput(value) {
  if (!/^[0-9]+$/.test(value)) return;
  secretBuffer = (secretBuffer + value).slice(-secretCode.length);

  if (secretBuffer === secretCode) {
    // PASTE YOUR SECRET WEBSITE HTML INSIDE THE TEMPLATE STRING BELOW.
    const secretWebsiteHtml = `
<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Secret Website</title></head>
  <body>
    <h1>Secret Website</h1>
    <p>Replace this HTML with your real secret website HTML.</p>
  </body>
</html>`;

    const secretUrl = `data:text/html;charset=utf-8,${encodeURIComponent(secretWebsiteHtml)}`;
    window.location.href = secretUrl;
  }
}

function tokenize(input) {
  const pattern = /\s*([A-Za-z_][A-Za-z0-9_]*|\d*\.\d+|\d+\.?\d*|\*\*|[()+\-*/])\s*/g;
  const tokens = [];
  let index = 0;

  while (index < input.length) {
    pattern.lastIndex = index;
    const match = pattern.exec(input);

    if (!match || match.index !== index) {
      throw new Error("Invalid token");
    }

    tokens.push(match[1]);
    index = pattern.lastIndex;
  }

  return tokens;
}

function evaluateMathExpression(input) {
  const tokens = tokenize(input);
  let position = 0;

  function peek() {
    return tokens[position];
  }

  function consume(expected) {
    const current = tokens[position];
    if (expected && current !== expected) {
      throw new Error("Unexpected token");
    }
    position += 1;
    return current;
  }

  function parseExpression() {
    let value = parseTerm();

    while (peek() === "+" || peek() === "-") {
      const operator = consume();
      const right = parseTerm();
      value = operator === "+" ? value + right : value - right;
    }

    return value;
  }

  function parseTerm() {
    let value = parsePower();

    while (peek() === "*" || peek() === "/") {
      const operator = consume();
      const right = parsePower();
      value = operator === "*" ? value * right : value / right;
    }

    return value;
  }

  function parsePower() {
    let value = parseUnary();

    if (peek() === "**") {
      consume("**");
      value = value ** parsePower();
    }

    return value;
  }

  function parseUnary() {
    if (peek() === "+") {
      consume("+");
      return parseUnary();
    }

    if (peek() === "-") {
      consume("-");
      return -parseUnary();
    }

    return parsePrimary();
  }

  function parsePrimary() {
    const token = peek();

    if (token === "(") {
      consume("(");
      const value = parseExpression();
      consume(")");
      return value;
    }

    if (token in constants) {
      consume();
      return constants[token];
    }

    if (token in mathFunctions) {
      const fnName = consume();
      consume("(");
      const argument = parseExpression();
      consume(")");
      return mathFunctions[fnName](argument);
    }

    if (/^\d*\.?\d+$/.test(token || "")) {
      consume();
      return Number(token);
    }

    throw new Error("Invalid expression");
  }

  const result = parseExpression();

  if (position !== tokens.length) {
    throw new Error("Unexpected trailing tokens");
  }

  if (!Number.isFinite(result)) {
    throw new Error("Non-finite result");
  }

  return result;
}

function evaluateExpression() {
  try {
    const result = evaluateMathExpression(expression);
    expression = String(result);
    updateDisplay(expression);
  } catch {
    expression = "";
    updateDisplay("Error");
  }
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const { value, op, fn, action, const: constant } = button.dataset;

  if (action === "clear") {
    expression = "";
    updateDisplay(expression);
    return;
  }

  if (action === "delete") {
    expression = expression.slice(0, -1);
    updateDisplay(expression);
    return;
  }

  if (action === "equals") {
    evaluateExpression();
    return;
  }

  if (fn) {
    appendToExpression(`${fn}(`);
    return;
  }

  if (constant) {
    appendToExpression(constant);
    return;
  }

  if (op) {
    appendToExpression(op);
    return;
  }

  if (value) {
    appendToExpression(value);
    trackSecretInput(value);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    evaluateExpression();
    return;
  }

  if (event.key === "Backspace") {
    expression = expression.slice(0, -1);
    updateDisplay(expression);
    return;
  }

  if (/^[0-9()+\-*/.]$/.test(event.key)) {
    appendToExpression(event.key);
    trackSecretInput(event.key);
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Service worker registration failures are non-blocking for calculator usage.
    });
  });
}
