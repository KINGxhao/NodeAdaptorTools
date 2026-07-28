const sampleText = `*18982728* ,*18982740* ,*18982748*`;

const sourceInput = document.querySelector("#sourceInput");
const lineOutput = document.querySelector("#lineOutput");
const targetOutput = document.querySelector("#targetOutput");
const totalCount = document.querySelector("#totalCount");
const uniqueCount = document.querySelector("#uniqueCount");
const duplicateCount = document.querySelector("#duplicateCount");
const statusText = document.querySelector("#statusText");
const processButton = document.querySelector("#processButton");
const clearInput = document.querySelector("#clearInput");
const loadSample = document.querySelector("#loadSample");
const copyButtons = document.querySelectorAll("[data-copy]");

function extractNumbers(text) {
  return text.match(/\d+/g) || [];
}

function uniqueInOrder(items) {
  const seen = new Set();
  const result = [];

  for (const item of items) {
    if (!seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  }

  return result;
}

function formatTarget(items) {
  return items.map((item) => `*${item}*`).join(" ,");
}

function renderResult() {
  const numbers = extractNumbers(sourceInput.value);
  const uniqueNumbers = uniqueInOrder(numbers);
  const duplicateTotal = numbers.length - uniqueNumbers.length;

  lineOutput.value = uniqueNumbers.join("\n");
  targetOutput.value = formatTarget(uniqueNumbers);
  totalCount.textContent = numbers.length;
  uniqueCount.textContent = uniqueNumbers.length;
  duplicateCount.textContent = duplicateTotal;

  if (numbers.length === 0) {
    statusText.textContent = "没有提取到数字。";
    return;
  }

  statusText.textContent = `已提取 ${numbers.length} 个编号，去重后 ${uniqueNumbers.length} 个。`;
}

async function copyTextFrom(id, button) {
  const target = document.querySelector(`#${id}`);
  const text = target.value;

  if (!text) {
    statusText.textContent = "没有可复制的内容。";
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    const oldText = button.textContent;
    button.textContent = "已复制";
    statusText.textContent = "已复制到剪贴板。";
    window.setTimeout(() => {
      button.textContent = oldText;
    }, 1200);
  } catch {
    target.select();
    document.execCommand("copy");
    statusText.textContent = "已尝试复制，若失败请手动复制选中内容。";
  }
}

sourceInput.addEventListener("input", renderResult);
processButton.addEventListener("click", renderResult);

clearInput.addEventListener("click", () => {
  sourceInput.value = "";
  renderResult();
  sourceInput.focus();
});

loadSample.addEventListener("click", () => {
  sourceInput.value = sampleText;
  renderResult();
  sourceInput.focus();
});

copyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    copyTextFrom(button.dataset.copy, button);
  });
});

renderResult();
