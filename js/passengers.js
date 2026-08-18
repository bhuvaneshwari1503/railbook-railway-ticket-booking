/* ============================================================
   passengers.js — logic for passengers.html
   ============================================================ */

const pDraft = Draft.get();
if (!pDraft || !pDraft.selectedSeats || pDraft.selectedSeats.length === 0) {
  window.location.href = "seats.html";
}

const pTrain = findTrain(pDraft.trainNo, pDraft.from, pDraft.to);

renderProgressRail(document.getElementById("progress-rail"), 3);
document.getElementById("form-sub").textContent =
  `${pTrain.name} (#${pTrain.no}) · ${COACH_CLASSES[pDraft.classCode].label} · ${pDraft.selectedSeats.length} passenger(s)`;

const cardsContainer = document.getElementById("passenger-cards");

cardsContainer.innerHTML = pDraft.selectedSeats
  .map(
    (seat, i) => `
    <div class="passenger-card">
      <h3>Passenger ${i + 1} — Seat ${seat.label} (${seat.tier})</h3>
      <div class="form-grid">
        <div class="field">
          <label for="name-${i}">Full name</label>
          <input type="text" id="name-${i}" required minlength="2" />
          <div class="field-error">Enter the passenger's full name.</div>
        </div>
        <div class="field">
          <label for="age-${i}">Age</label>
          <input type="number" id="age-${i}" min="1" max="120" required />
          <div class="field-error">Enter a valid age.</div>
        </div>
        <div class="field">
          <label for="gender-${i}">Gender</label>
          <select id="gender-${i}" required>
            <option value="">Select</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
          </select>
          <div class="field-error">Select a gender.</div>
        </div>
      </div>
    </div>`
  )
  .join("");

// Pre-fill from a previous visit to this page (back-and-forth navigation)
if (pDraft.passengers) {
  pDraft.passengers.forEach((p, i) => {
    document.getElementById(`name-${i}`).value = p.name || "";
    document.getElementById(`age-${i}`).value = p.age || "";
    document.getElementById(`gender-${i}`).value = p.gender || "";
  });
}
if (pDraft.contact) {
  document.getElementById("contact-email").value = pDraft.contact.email || "";
  document.getElementById("contact-phone").value = pDraft.contact.phone || "";
}

document.getElementById("back-btn").addEventListener("click", () => {
  window.location.href = "seats.html";
});

function markValidity(fieldEl, valid) {
  const wrapper = fieldEl.closest(".field");
  wrapper.classList.toggle("invalid", !valid);
  return valid;
}

document.getElementById("passenger-form").addEventListener("submit", (e) => {
  e.preventDefault();
  let allValid = true;
  const passengers = [];

  pDraft.selectedSeats.forEach((seat, i) => {
    const nameEl = document.getElementById(`name-${i}`);
    const ageEl = document.getElementById(`age-${i}`);
    const genderEl = document.getElementById(`gender-${i}`);

    const nameValid = nameEl.value.trim().length >= 2;
    const ageValid = ageEl.value && ageEl.value >= 1 && ageEl.value <= 120;
    const genderValid = !!genderEl.value;

    allValid = markValidity(nameEl, nameValid) && allValid;
    allValid = markValidity(ageEl, ageValid) && allValid;
    allValid = markValidity(genderEl, genderValid) && allValid;

    passengers.push({
      seatId: seat.id,
      seatLabel: seat.label,
      tier: seat.tier,
      name: nameEl.value.trim(),
      age: ageEl.value,
      gender: genderEl.value,
    });
  });

  const emailEl = document.getElementById("contact-email");
  const phoneEl = document.getElementById("contact-phone");
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim());
  const phoneValid = /^\d{10}$/.test(phoneEl.value.trim());
  allValid = markValidity(emailEl, emailValid) && allValid;
  allValid = markValidity(phoneEl, phoneValid) && allValid;

  if (!allValid) {
    showToast("Please fix the highlighted fields.");
    return;
  }

  Draft.set({
    passengers,
    contact: { email: emailEl.value.trim(), phone: phoneEl.value.trim() },
  });

  window.location.href = "payment.html";
});
