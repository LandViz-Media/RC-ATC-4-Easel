// Responsibility: Main UI controller for importing Easel files and generating the combined job.
import { parseEaselFile, stripEaselFooter } from "./parser.js";
import { buildJob } from "./generator.js";
import { loadSettings, saveSettings } from "./settings.js";
import { renderOperations } from "./ui.js";

const state = { operations: [], settings: loadSettings() };
const fileInput = document.querySelector("#fileInput");
const list = document.querySelector("#operationList");
const generate = document.querySelector("#generateButton");
const status = document.querySelector("#status");
const startingTool = document.querySelector("#startingTool");
const startupStatus = document.querySelector("#startupStatus");

startingTool.value = String(state.settings.startingTool);

function updateStartupStatus() {
  const tool = Number(startingTool.value);
  state.settings.startingTool = tool;
  saveSettings(state.settings);
  startupStatus.textContent = tool === 0
    ? "Starting state: spindle is empty. The first operation will require a tool change."
    : `Starting state: Tool ${tool} is confirmed in the spindle. If the first operation uses Tool ${tool}, no initial tool change will be generated.`;
}
startingTool.addEventListener("change", updateStartupStatus);

function refresh() {
  renderOperations(list, state.operations, {
    onChange: (i, p) => { Object.assign(state.operations[i], p); refresh(); },
    onRemove: i => { state.operations.splice(i, 1); refresh(); },
    onMove: (i, d) => {
      const j = i + d;
      if (j < 0 || j >= state.operations.length) return;
      [state.operations[i], state.operations[j]] = [state.operations[j], state.operations[i]];
      refresh();
    }
  });
  generate.disabled = !state.operations.length;
}

fileInput.addEventListener("change", async e => {
  for (const file of e.target.files) {
    const source = await file.text();
    const parsed = parseEaselFile(source);
    state.operations.push({
      fileName: file.name,
      source,
      body: stripEaselFooter(parsed.body),
      tool: 1,
      description: parsed.toolDescription || ""
    });
  }
  status.textContent = `Loaded ${state.operations.length} operation(s).`;
  refresh();
  e.target.value = "";
});

for (const id of ["parkX","parkY","parkZ","setterX","setterY","dustShoeEnabled"]) {
  const el = document.querySelector("#" + id);
  el.value = state.settings[id];
  el.addEventListener("change", () => {
    state.settings[id] = el.type === "checkbox" ? el.checked : Number(el.value);
    saveSettings(state.settings);
  });
}

generate.addEventListener("click", () => {
  try {
    const job = buildJob(state.operations, state.settings);
    const blob = new Blob([job], {type:"text/plain"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "combined-masso-rapidchange.nc";
    a.click();
    URL.revokeObjectURL(url);
    status.textContent = "Combined G-code generated.";
  } catch (err) {
    console.error(err);
    status.textContent = `ERROR: ${err.message}`;
  }
});

updateStartupStatus();
refresh();