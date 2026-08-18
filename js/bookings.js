/* ============================================================
   bookings.js — logic for bookings.html
   ============================================================ */

const listEl = document.getElementById("bookings-list");

function render() {
  const bookings = History.all();

  if (bookings.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        <p><strong>No bookings yet.</strong></p>
        <p>Search for a train and complete a booking to see it appear here.</p>
        <a class="btn btn-primary" href="index.html" style="margin-top:12px; display:inline-flex;">Search Trains</a>
      </div>`;
    return;
  }

  listEl.innerHTML = bookings.map(renderBookingCard).join("");

  listEl.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      sessionStorage.setItem("rtb_last_booking_pnr", btn.dataset.view);
      window.location.href = "confirmation.html";
    });
  });

  listEl.querySelectorAll("[data-cancel]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (confirm(`Cancel booking ${btn.dataset.cancel}? This cannot be undone.`)) {
        History.cancel(btn.dataset.cancel);
        showToast("Booking cancelled.");
        render();
      }
    });
  });
}

function renderBookingCard(b) {
  const cancelled = b.status === "Cancelled";
  return `
    <div class="booking-summary-card">
      <div>
        <div class="train">${b.trainName}</div>
        <div class="meta">#${b.trainNo} · ${COACH_CLASSES[b.classCode].label}</div>
      </div>
      <div class="meta">
        ${stationName(b.from)} → ${stationName(b.to)}<br>
        ${formatDate(b.date)} · PNR ${b.pnr}
      </div>
      <div class="meta" style="text-align:right;">
        <span class="ticket__status ${cancelled ? "cancelled" : ""}" style="display:inline-block;">${b.status}</span><br>
        <strong style="font-family:var(--font-display); font-size:16px;">${formatCurrency(b.fareTotal)}</strong>
      </div>
      <div style="display:flex; gap:8px; flex-direction:column;">
        <button class="btn btn-secondary" data-view="${b.pnr}" style="padding:8px 12px; font-size:12px;">View Ticket</button>
        ${!cancelled ? `<button class="btn btn-danger" data-cancel="${b.pnr}" style="padding:8px 12px; font-size:12px;">Cancel</button>` : ""}
      </div>
    </div>`;
}

render();
