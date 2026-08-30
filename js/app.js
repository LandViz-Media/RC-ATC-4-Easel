// Responsibility: Main UI controller. Connects file input, operation editing, settings, and G-code generation.
import { parseEaselFile, stripEaselFooter } from "./parser.js";
import { buildJob } from "./generator.js";
import { getRapidChangeCall } from "./rapidchange.js";
import { loadSettings, saveSettings } from "./settings.js";
import { renderOperations } from "./ui.js";

const state = {
  operations: [],
  settings: loadSettings()
};

const fileInput = document.querySelector("#fileInput");
const operationList = document.querySelector("#operationList");
const generateButton = document.querySelector("#generateButton");
const status = document.querySelector("#status");

function refresh() {
  renderOperations(operationList, state.operations, {
    onChange: (index, patch) => {
      Object.assign(state.operations[index], patch);
      saveSettings(state.settings);
      refresh();
    },
    onRemove: (index) => {
      state.operations.splice(index, 1);
      refresh();
    },
    onMove: (index, direction) => {
      const target = index + direction;
      if (target < 0 || target >= state.operations.length) return;
      [state.operations[index], state.operations[target]] =
        [state.operations[target], state.operations[index]];
      refresh();
    }
  });
  generateButton.disabled = state.operations.length === 0;
}

fileInput.addEventListener("change", async (event) => {
  for (const file of event.target.files) {
    const text = await file.text();
    const parsed = parseEaselFile(text);
    state.operations.push({
      fileName: file.name,
      source: text,
      body: stripEaselFooter(parsed.body),
      tool: 1,
      description: parsed.toolDescription || ""
    });
  }
  status.textContent = `Loaded ${state.operations.length} operation(s).`;
  refresh();
});

for (const id of ["parkX", "parkY", "parkZ", "setterX", "setterY", "dustShoeEnabled"]) {
  const element = document.querySelector(`#${id}`);
  element.value = state.settings[id];
  element.addEventListener("change", () => {
    state.settings[id] = element.type === "checkbox" ? element.checked : Number(element.value);
    saveSettings(state.settings);
  });
}

generateButton.addEventListener("click", () => {
  try {
    const job = buildJob(state.operations, state.settings);
    const blob = new Blob([job], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "combined-masso-rapidchange.nc";
    link.click();
    URL.revokeObjectURL(url);
    status.textContent = "Combined G-code generated.";
  } catch (error) {
    console.error(error);
    status.textContent = `ERROR: ${error.message}`;
  }
});

refresh();
