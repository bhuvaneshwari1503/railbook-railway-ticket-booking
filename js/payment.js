/* ============================================================
   payment.js — logic for payment.html
   ============================================================ */

const payDraft = Draft.get();
if (!payDraft || !payDraft.passengers) {
  window.location.href = "passengers.html";
}

const payTrain = findTrain(payDraft.trainNo, payDraft.from, payDraft.to);

renderProgressRail(document.getElementById("progress-rail"), 4);
document.getElementById("payment-sub").textContent =
  `${payTrain.name} (#${payTrain.no}) · PNR will be generated after payment`;

document.getElementById("s-base").textContent = formatCurrency(payDraft.fareBase);
document.getElementById("s-res").textContent = formatCurrency(payDraft.fareReservation);
document.getElementById("s-gst").textContent = formatCurrency(payDraft.fareGst);
document.getElementById("s-total").textContent = formatCurrency(payDraft.fareTotal);

let method = "upi";
const methodFields = document.getElementById("method-fields");

const FIELD_TEMPLATES = {
  upi: `
    <div class="field">
      <label for="upi-id">UPI ID</label>
      <input type="text" id="upi-id" placeholder="yourname@bank" required />
      <div class="field-error">Enter a UPI ID like name@bank.</div>
    </div>`,
  card: `
    <div class="form-grid" style="grid-template-columns: 2fr 1fr 1fr;">
      <div class="field">
        <label for="card-number">Card number</label>
        <input type="text" id="card-number" maxlength="19" placeholder="1234 5678 9012 3456" required />
        <div class="field-error">Enter a 16-digit card number.</div>
      </div>
      <div class="field">
        <label for="card-expiry">Expiry (MM/YY)</label>
        <input type="text" id="card-expiry" maxlength="5" placeholder="MM/YY" required />
        <div class="field-error">Enter a valid expiry.</div>
      </div>
      <div class="field">
        <label for="card-cvv">CVV</label>
        <input type="password" id="card-cvv" maxlength="3" required />
        <div class="field-error">Enter CVV.</div>
      </div>
    </div>`,
  netbanking: `
    <div class="field">
      <label for="bank-select">Select bank</label>
      <select id="bank-select" required>
        <option value="">Choose your bank</option>
        <option>State Bank of India</option>
        <option>HDFC Bank</option>
        <option>ICICI Bank</option>
        <option>Axis Bank</option>
        <option>Punjab National Bank</option>
      </select>
      <div class="field-error">Select a bank.</div>
    </div>`,
};

function renderMethodFields() {
  methodFields.innerHTML = FIELD_TEMPLATES[method];
}
renderMethodFields();

document.querySelectorAll(".pay-method").forEach((btn) => {
  btn.addEventListener("click", () => {
    method = btn.dataset.method;
    document.querySelectorAll(".pay-method").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderMethodFields();
  });
});

document.getElementById("back-btn").addEventListener("click", () => {
  window.location.href = "passengers.html";
});

function validatePaymentFields() {
  if (method === "upi") {
    const el = document.getElementById("upi-id");
    const valid = /^[\w.]+@[\w]+$/.test(el.value.trim());
    el.closest(".field").classList.toggle("invalid", !valid);
    return valid;
  }
  if (method === "card") {
    const num = document.getElementById("card-number");
    const exp = document.getElementById("card-expiry");
    const cvv = document.getElementById("card-cvv");
    const numValid = num.value.replace(/\s/g, "").length === 16;
    const expValid = /^\d{2}\/\d{2}$/.test(exp.value.trim());
    const cvvValid = /^\d{3}$/.test(cvv.value.trim());
    num.closest(".field").classList.toggle("invalid", !numValid);
    exp.closest(".field").classList.toggle("invalid", !expValid);
    cvv.closest(".field").classList.toggle("invalid", !cvvValid);
    return numValid && expValid && cvvValid;
  }
  if (method === "netbanking") {
    const el = document.getElementById("bank-select");
    const valid = !!el.value;
    el.closest(".field").classList.toggle("invalid", !valid);
    return valid;
  }
  return false;
}

document.getElementById("payment-form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validatePaymentFields()) {
    showToast("Please check your payment details.");
    return;
  }

  const overlay = document.getElementById("processing-overlay");
  overlay.classList.add("show");

  // Simulate a real payment-gateway round trip
  setTimeout(() => {
    const booking = {
      pnr: generatePNR(),
      status: "Confirmed",
      bookedAt: new Date().toISOString(),
      trainNo: payTrain.no,
      trainName: payTrain.name,
      from: payDraft.from,
      to: payDraft.to,
      date: payDraft.date,
      dep: payTrain.dep,
      arr: payTrain.arr,
      classCode: payDraft.classCode,
      seats: payDraft.selectedSeats,
      passengers: payDraft.passengers,
      contact: payDraft.contact,
      fareBase: payDraft.fareBase,
      fareReservation: payDraft.fareReservation,
      fareGst: payDraft.fareGst,
      fareTotal: payDraft.fareTotal,
      paymentMethod: method,
    };

    History.add(booking);
    sessionStorage.setItem("rtb_last_booking_pnr", booking.pnr);
    Draft.clear();

    window.location.href = "confirmation.html";
  }, 1600);
});
