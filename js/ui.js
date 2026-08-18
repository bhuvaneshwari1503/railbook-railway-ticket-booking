/* ============================================================
   ui.js — tiny shared UI helpers reused across every page
   ============================================================ */

function showToast(message, duration = 2600) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.remove("show"), duration);
}

function populateStationSelect(selectEl, defaultCode) {
  selectEl.innerHTML = STATIONS.map(
    (s) => `<option value="${s.code}">${s.name} (${s.code})</option>`
  ).join("");
  if (defaultCode) selectEl.value = defaultCode;
}

function setMinDateToday(inputEl) {
  const today = new Date().toISOString().split("T")[0];
  inputEl.min = today;
  if (!inputEl.value) inputEl.value = today;
}

/* Renders the shared "Search > Seats > Passengers > Payment > Ticket"
   progress rail. currentStep is 1-based index. */
function renderProgressRail(container, currentStep) {
  const steps = ["Search", "Seats", "Passengers", "Payment", "Ticket"];
  container.innerHTML = steps
    .map((label, i) => {
      const n = i + 1;
      let cls = "progress-rail__step";
      if (n < currentStep) cls += " done";
      if (n === currentStep) cls += " active";
      const icon = n < currentStep ? "✓" : n;
      return `<div class="${cls}"><span class="dot">${icon}</span> ${label}</div>`;
    })
    .join("");
}
