/* ============================================================
   confirmation.js — logic for confirmation.html
   ============================================================ */

const lastPNR = sessionStorage.getItem("rtb_last_booking_pnr");
const booking = lastPNR ? History.findByPNR(lastPNR) : null;

if (!booking) {
  window.location.href = "bookings.html";
}

renderProgressRail(document.getElementById("progress-rail"), 5);

const ticketEl = document.getElementById("ticket");

ticketEl.innerHTML = `
  <div class="ticket__main">
    <div class="ticket__row">
      <div class="ticket__pnr">PNR NUMBER<br><strong>${booking.pnr}</strong></div>
      <div class="ticket__status ${booking.status === "Cancelled" ? "cancelled" : ""}">${booking.status}</div>
    </div>

    <div class="ticket__route">
      <div class="ticket__station">${booking.from}<small>${stationName(booking.from)} · ${booking.dep}</small></div>
      <div class="ticket__line"></div>
      <div class="ticket__station">${booking.to}<small>${stationName(booking.to)} · ${booking.arr}</small></div>
    </div>

    <div class="ticket__grid">
      <div><span>Train</span><strong>${booking.trainName}</strong></div>
      <div><span>Train No.</span><strong>${booking.trainNo}</strong></div>
      <div><span>Class</span><strong>${COACH_CLASSES[booking.classCode].label}</strong></div>
      <div><span>Journey date</span><strong>${formatDate(booking.date)}</strong></div>
      <div><span>Booked on</span><strong>${new Date(booking.bookedAt).toLocaleDateString("en-IN")}</strong></div>
      <div><span>Payment</span><strong>${booking.paymentMethod.toUpperCase()}</strong></div>
    </div>

    <table class="passenger-table">
      <thead>
        <tr><th>Passenger</th><th>Age/Gender</th><th>Seat</th><th>Berth</th></tr>
      </thead>
      <tbody>
        ${booking.passengers
          .map(
            (p) => `<tr>
              <td>${p.name}</td>
              <td>${p.age} / ${p.gender}</td>
              <td>${p.seatLabel}</td>
              <td>${p.tier}</td>
            </tr>`
          )
          .join("")}
      </tbody>
    </table>
  </div>

  <div class="ticket__perforation"></div>

  <div class="ticket__stub">
    <div>
      <span style="font-family:var(--font-mono); font-size:11px; color:var(--slate); text-transform:uppercase;">Amount paid</span>
      <div class="fare">${formatCurrency(booking.fareTotal)}</div>
    </div>
    <div class="ticket__qr" id="qr-code"></div>
  </div>
`;

// Render QR code encoding the PNR + train info (works fully offline once the
// script itself has loaded once; degrades gracefully to plain text if the
// CDN library didn't load — e.g. no internet access).
try {
  // eslint-disable-next-line no-undef
  new QRCode(document.getElementById("qr-code"), {
    text: `PNR:${booking.pnr}|TRAIN:${booking.trainNo}|DATE:${booking.date}`,
    width: 88,
    height: 88,
    colorDark: "#1B1B1D",
    colorLight: "#ffffff",
  });
} catch (err) {
  document.getElementById("qr-code").textContent = booking.pnr;
}

document.getElementById("print-btn").addEventListener("click", () => window.print());
