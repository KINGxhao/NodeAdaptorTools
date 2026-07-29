const sampleText = `*18982728* ,*JF7766-100* ,*18982748*`;

const sourceInput = document.querySelector("#sourceInput");
const lineOutput = document.querySelector("#lineOutput");
const targetOutput = document.querySelector("#targetOutput");
const splunkOutput = document.querySelector("#splunkOutput");
const totalCount = document.querySelector("#totalCount");
const uniqueCount = document.querySelector("#uniqueCount");
const duplicateCount = document.querySelector("#duplicateCount");
const statusText = document.querySelector("#statusText");
const processButton = document.querySelector("#processButton");
const clearInput = document.querySelector("#clearInput");
const loadSample = document.querySelector("#loadSample");
const copyButtons = document.querySelectorAll("[data-copy]");
const targetSeparatorButtons = document.querySelectorAll("[data-target-separator]");
let targetSeparator = "comma";

function extractIdentifiers(text) {
  return (text.match(/[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*/g) || []).filter((item) => /\d/.test(item));
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

function formatTarget(items, separator = targetSeparator) {
  const separatorText = separator === "or" ? " OR " : " ,";

  return items.map((item) => `*${item}*`).join(separatorText);
}

function formatSplunk(items, separator = targetSeparator) {
  if (items.length === 0) {
    return "";
  }

  if (separator === "or") {
    return `logEvent="PUBLISHER_RECEIVED"\n${formatTarget(items, separator)}`;
  }

  return `logEvent="Delivered"\nbusinessKeyValue IN (${formatTarget(items)} )`;
}

function renderResult() {
  const identifiers = extractIdentifiers(sourceInput.value);
  const uniqueIdentifiers = uniqueInOrder(identifiers);
  const duplicateTotal = identifiers.length - uniqueIdentifiers.length;

  lineOutput.value = uniqueIdentifiers.join("\n");
  targetOutput.value = formatTarget(uniqueIdentifiers);
  splunkOutput.value = formatSplunk(uniqueIdentifiers);
  totalCount.textContent = identifiers.length;
  uniqueCount.textContent = uniqueIdentifiers.length;
  duplicateCount.textContent = duplicateTotal;

  if (identifiers.length === 0) {
    statusText.textContent = "没有提取到编号。";
    return;
  }

  statusText.textContent = `已提取 ${identifiers.length} 个编号，去重后 ${uniqueIdentifiers.length} 个。`;
}

function updateTargetSeparator(nextSeparator) {
  targetSeparator = nextSeparator;

  targetSeparatorButtons.forEach((button) => {
    const isActive = button.dataset.targetSeparator === targetSeparator;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  renderResult();
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

targetSeparatorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    updateTargetSeparator(button.dataset.targetSeparator);
  });
});

renderResult();
