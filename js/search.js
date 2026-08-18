/* ============================================================
   search.js — logic for index.html
   ============================================================ */

const fromSelect = document.getElementById("from");
const toSelect = document.getElementById("to");
const dateInput = document.getElementById("date");
const form = document.getElementById("search-form");
const resultsSection = document.getElementById("results");
const resultsMeta = document.getElementById("results-meta");
const resultsList = document.getElementById("results-list");

populateStationSelect(fromSelect, "NDLS");
populateStationSelect(toSelect, "BCT");
setMinDateToday(dateInput);

// Selected class per train number, kept in memory while browsing results
const selectedClassByTrain = {};

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (fromSelect.value === toSelect.value) {
    showToast("Origin and destination can't be the same station.");
    return;
  }

  const matches = getTrainsForRoute(fromSelect.value, toSelect.value);

  resultsSection.hidden = false;
  resultsMeta.textContent = `${matches.length} train${matches.length !== 1 ? "s" : ""} from ${stationName(fromSelect.value)} to ${stationName(toSelect.value)} on ${formatDate(dateInput.value)}`;

  if (matches.length === 0) {
    // Defensive fallback — getTrainsForRoute always synthesizes results
    // for distinct stations, so this should be unreachable in practice.
    resultsList.innerHTML = `
      <div class="empty-state">
        <p><strong>No direct trains found on this route.</strong></p>
        <p>Try a different journey date or station pair.</p>
      </div>`;
    return;
  }

  resultsList.innerHTML = matches.map(renderTrainCard).join("");
  matches.forEach((t) => attachCardHandlers(t));

  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

function renderTrainCard(train) {
  const defaultClass = train.classes[0];
  selectedClassByTrain[train.no] = selectedClassByTrain[train.no] || defaultClass;
  const activeClass = selectedClassByTrain[train.no];
  const fare = calcFare(train, activeClass);

  return `
    <article class="train-card" data-train="${train.no}">
      <div>
        <div class="train-card__id">Train No. ${train.no}</div>
        <h3 class="train-card__name">${train.name}</h3>
        <div class="train-card__route">
          <strong>${train.dep}</strong> ${train.from}
          <span>→ ${train.dur} →</span>
          <strong>${train.arr}</strong> ${train.to}
        </div>
      </div>
      <div class="train-card__classes">
        ${train.classes
          .map(
            (c) => `<button type="button" class="class-chip ${c === activeClass ? "selected" : ""}" data-class="${c}">${COACH_CLASSES[c].label}</button>`
          )
          .join("")}
      </div>
      <div class="train-card__price">
        <span class="label">Starting fare</span>
        <div class="amount" data-fare>${formatCurrency(fare)}</div>
        <button type="button" class="btn btn-primary" data-select-seats>Select Seats</button>
      </div>
    </article>
  `;
}

function attachCardHandlers(train) {
  const card = resultsList.querySelector(`[data-train="${train.no}"]`);

  card.querySelectorAll(".class-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      selectedClassByTrain[train.no] = chip.dataset.class;
      card.querySelectorAll(".class-chip").forEach((c) => c.classList.remove("selected"));
      chip.classList.add("selected");
      const fare = calcFare(train, chip.dataset.class);
      card.querySelector("[data-fare]").textContent = formatCurrency(fare);
    });
  });

  card.querySelector("[data-select-seats]").addEventListener("click", () => {
    Draft.clear();
    Draft.set({
      trainNo: train.no,
      trainName: train.name,
      from: fromSelect.value,
      to: toSelect.value,
      date: dateInput.value,
      classCode: selectedClassByTrain[train.no],
    });
    window.location.href = "seats.html";
  });
}
