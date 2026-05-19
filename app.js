const display = document.getElementById("display");
const keys = document.querySelector(".keys");

let expression = "";
let secretBuffer = "";
const secretCode = "6769";

const safeMath = {
  PI: Math.PI,
  E: Math.E,
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

    const secretUrl = URL.createObjectURL(new Blob([secretWebsiteHtml], { type: "text/html" }));
    window.location.href = secretUrl;
  }
}

function evaluateExpression() {
  try {
    const result = Function("Math", `with (Math) { return ${expression}; }`)(safeMath);
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
