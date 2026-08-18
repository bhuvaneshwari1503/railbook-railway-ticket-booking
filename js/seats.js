/* ============================================================
   seats.js — logic for seats.html
   ============================================================ */

const draft = Draft.get();
if (!draft || !draft.trainNo) {
  window.location.href = "index.html";
}

const train = findTrain(draft.trainNo, draft.from, draft.to);
if (!train) window.location.href = "index.html";

renderProgressRail(document.getElementById("progress-rail"), 2);

const trainHeading = document.getElementById("train-heading");
const trainSub = document.getElementById("train-sub");
const classTabs = document.getElementById("class-tabs");
const seatGrid = document.getElementById("seat-grid");
const passengerCountSelect = document.getElementById("passenger-count");
const selectedSeatsList = document.getElementById("selected-seats-list");
const seatCountEl = document.getElementById("seat-count");
const baseFareTotalEl = document.getElementById("base-fare-total");
const resChargeEl = document.getElementById("res-charge");
const gstAmountEl = document.getElementById("gst-amount");
const grandTotalEl = document.getElementById("grand-total");
const continueBtn = document.getElementById("continue-btn");

trainHeading.textContent = `${train.name} (#${train.no})`;
trainSub.textContent = `${stationName(train.from)} → ${stationName(train.to)} · ${formatDate(draft.date)} · Departs ${train.dep}`;

let currentClass = draft.classCode || train.classes[0];
let selectedSeats = draft.selectedSeats || [];
const RESERVATION_CHARGE = 60;

function renderClassTabs() {
  classTabs.innerHTML = train.classes
    .map(
      (c) => `<button type="button" data-class="${c}" class="${c === currentClass ? "active" : ""}">${COACH_CLASSES[c].label} · ${formatCurrency(calcFare(train, c))}</button>`
    )
    .join("");

  classTabs.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.class === currentClass) return;
      currentClass = btn.dataset.class;
      selectedSeats = []; // seat numbering differs per class/coach
      renderClassTabs();
      renderSeatGrid();
      updateSummary();
    });
  });
}

function maxPassengers() {
  return parseInt(passengerCountSelect.value, 10);
}

function renderSeatGrid() {
  const cfg = COACH_CLASSES[currentClass];
  const seats = generateSeats(train.no, draft.date, currentClass);
  seatGrid.style.setProperty("--bay", cfg.bay);

  // group by row
  const rows = {};
  seats.forEach((s) => {
    rows[s.row] = rows[s.row] || [];
    rows[s.row].push(s);
  });

  seatGrid.innerHTML = Object.keys(rows)
    .map((rowNum) => {
      const rowSeats = rows[rowNum];
      return `<div class="seat-row">${rowSeats
        .map((s) => {
          const isSelected = selectedSeats.some((sel) => sel.id === s.id);
          const status = s.status === "booked" ? "booked" : isSelected ? "selected" : "available";
          return `<button type="button" class="seat" data-id="${s.id}" data-tier="${s.tier}" data-status="${status}" title="Seat ${s.label} · ${s.tier}" ${status === "booked" ? "disabled" : ""}>${s.label}</button>`;
        })
        .join("")}</div>`;
    })
    .join("");

  seatGrid.querySelectorAll(".seat").forEach((btn) => {
    btn.addEventListener("click", () => toggleSeat(btn, seats));
  });
}

function toggleSeat(btn, seats) {
  const id = btn.dataset.id;
  const seat = seats.find((s) => s.id === id);
  const already = selectedSeats.some((s) => s.id === id);

  if (already) {
    selectedSeats = selectedSeats.filter((s) => s.id !== id);
    btn.dataset.status = "available";
  } else {
    if (selectedSeats.length >= maxPassengers()) {
      showToast(`You can select up to ${maxPassengers()} seat(s) for ${maxPassengers()} passenger(s).`);
      return;
    }
    selectedSeats.push(seat);
    btn.dataset.status = "selected";
  }
  updateSummary();
}

function updateSummary() {
  const fareEach = calcFare(train, currentClass);
  const count = selectedSeats.length;
  const base = fareEach * count;
  const resCharge = count > 0 ? RESERVATION_CHARGE * count : 0;
  const gst = Math.round((base + resCharge) * 0.05);
  const total = base + resCharge + gst;

  seatCountEl.textContent = count;
  baseFareTotalEl.textContent = formatCurrency(base);
  resChargeEl.textContent = formatCurrency(resCharge);
  gstAmountEl.textContent = formatCurrency(gst);
  grandTotalEl.textContent = formatCurrency(total);

  selectedSeatsList.innerHTML = count
    ? selectedSeats.map((s) => `<span class="seat-pill">${COACH_CLASSES[currentClass].label.split(" ")[0]} · ${s.label} (${s.tier})</span>`).join("")
    : `<span class="sub" style="margin:8px 0 0;">None yet</span>`;

  continueBtn.disabled = count === 0 || count !== maxPassengers();
  continueBtn.textContent =
    count === maxPassengers() && count > 0
      ? "Continue to Passenger Details"
      : `Select ${maxPassengers()} seat(s) to continue`;

  Draft.set({
    classCode: currentClass,
    selectedSeats,
    fareEach,
    fareBase: base,
    fareReservation: resCharge,
    fareGst: gst,
    fareTotal: total,
  });
}

passengerCountSelect.addEventListener("change", () => {
  if (selectedSeats.length > maxPassengers()) {
    selectedSeats = selectedSeats.slice(0, maxPassengers());
    renderSeatGrid();
  }
  updateSummary();
});

continueBtn.addEventListener("click", () => {
  if (continueBtn.disabled) return;
  window.location.href = "passengers.html";
});

renderClassTabs();
renderSeatGrid();
updateSummary();
