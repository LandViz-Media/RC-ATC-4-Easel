// Responsibility: Render and manage the ordered operation list.

export function renderOperations(container, operations, handlers) {
  container.innerHTML = "";

  if (!operations.length) {
    container.innerHTML = '<p class="empty">No files added yet.</p>';
    return;
  }

  operations.forEach((operation, index) => {
    const row = document.createElement("div");
    row.className = "operation";

    const name = document.createElement("strong");
    name.textContent = `${index + 1}. ${operation.fileName}`;

    const tool = document.createElement("select");
    for (let t = 1; t <= 8; t++) {
      const option = document.createElement("option");
      option.value = t;
      option.textContent = `Tool ${t}`;
      option.selected = Number(operation.tool) === t;
      tool.appendChild(option);
    }
    tool.addEventListener("change", () => handlers.onChange(index, { tool: Number(tool.value) }));

    const up = document.createElement("button");
    up.textContent = "↑";
    up.title = "Move up";
    up.addEventListener("click", () => handlers.onMove(index, -1));

    const down = document.createElement("button");
    down.textContent = "↓";
    down.title = "Move down";
    down.addEventListener("click", () => handlers.onMove(index, 1));

    const remove = document.createElement("button");
    remove.textContent = "×";
    remove.title = "Remove";
    remove.addEventListener("click", () => handlers.onRemove(index));

    const controls = document.createElement("span");
    controls.append(up, down, remove);

    row.append(name, tool, controls);
    container.appendChild(row);
  });
}
