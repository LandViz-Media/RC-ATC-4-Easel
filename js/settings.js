// Responsibility: Store and retrieve local machine/job-composer settings using browser localStorage.

const KEY = "easel-masso-atc-settings";

const defaults = {
  parkX: 0,
  parkY: 0,
  parkZ: 2,
  setterX: 0.315,
  setterY: 0.273,
  dustShoeEnabled: true
};

export function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return { ...defaults, ...(saved || {}) };
  } catch {
    return { ...defaults };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(KEY, JSON.stringify(settings));
}
