# RailBook — Railway Ticket Booking (Front-End Prototype)

A multi-page railway ticket booking simulation built with **vanilla HTML, CSS
and JavaScript** — no frameworks, no backend. It reproduces a realistic
IRCTC-style booking flow: search trains → pick a class → choose exact seats
on a visual coach map → enter passenger details → pay → get an e-ticket with
a PNR and QR code → manage bookings later.

## Features

- **Train search** across 8 stations / 7 trains with class-wise live fares
- **Visual seat map** per coach class (Sleeper, AC 3-Tier, AC 2-Tier, AC Chair
  Car), each with correct berth layout (Lower/Middle/Upper/Side) and a
  deterministic "already booked" pattern per train/date/class
- **Seat-limit logic** tied to passenger count, with running fare summary
  (base fare + reservation charge + GST)
- **Multi-passenger form** with per-field validation (name, age, gender,
  email, 10-digit phone)
- **Mock payment gateway** — UPI / Card / Net Banking tabs, field validation,
  simulated processing delay
- **E-ticket** styled as a perforated paper ticket stub with a generated PNR
  and scannable QR code
- **My Bookings** page backed by `localStorage` — view past tickets or cancel
  them, persists across browser sessions
- Fully responsive (desktop → tablet → mobile), keyboard-focus visible,
  respects `prefers-reduced-motion`

## Tech / concepts demonstrated

- DOM manipulation & event delegation without any framework
- Multi-page app state handoff via `sessionStorage` (in-progress booking) and
  `localStorage` (confirmed booking history)
- A seeded pseudo-random generator (`mulberry32`) so seat availability is
  reproducible instead of re-randomizing on every render
- Client-side form validation patterns
- CSS custom properties for a design-token based theme
- Responsive CSS Grid / Flexbox layouts

## Project structure

```
railway-ticket-booking/
├── index.html          # Search trains
├── seats.html           # Seat selection (coach map)
├── passengers.html      # Passenger details form
├── payment.html         # Mock payment
├── confirmation.html    # E-ticket
├── bookings.html        # Booking history
├── css/
│   └── style.css        # All styling (design tokens at top)
└── js/
    ├── data.js           # Train/station/fare data + seat generator
    ├── storage.js        # localStorage/sessionStorage helpers, PNR generator
    ├── ui.js              # Shared UI helpers (toast, progress rail, selects)
    ├── search.js          # index.html logic
    ├── seats.js            # seats.html logic
    ├── passengers.js       # passengers.html logic
    ├── payment.js          # payment.html logic
    ├── confirmation.js      # confirmation.html logic
    └── bookings.js          # bookings.html logic
```

## How to run it (VS Code)

1. Unzip the project and open the `railway-ticket-booking` folder in VS Code
   (`File → Open Folder…`).
2. Install the **Live Server** extension (by Ritwick Dey) from the
   Extensions panel (`Ctrl+Shift+X`, search "Live Server").
3. Right-click `index.html` in the file explorer → **"Open with Live Server"**.
   Your browser opens the app at something like `http://127.0.0.1:5500`.
4. Try the flow: search **New Delhi → Mumbai Central**, pick a class, select
   as many seats as passengers, fill the form, "pay", and view your e-ticket.
   Check **My Bookings** afterwards — it persists even after closing the tab.

   *(Alternative without the extension: run `python3 -m http.server 5500`
   inside the folder and open `http://localhost:5500`. Opening `index.html`
   directly via `file://` also works for this project since there's no
   backend, but a local server is recommended.)*

## Ideas to extend it further (good for interview follow-up questions)

- Swap `localStorage` for a real backend (Node/Express + MongoDB or
  Firebase) and turn this into a full-stack project
- Add login/signup and tie bookings to a user account
- Add a real payment gateway sandbox (Razorpay/Stripe test mode)
- Add filters (departure time, price range) and sorting to search results
- Add tatkal/waitlist simulation logic

## Suggested résumé bullet points

- Built **RailBook**, a responsive railway ticket booking web app (HTML,
  CSS, vanilla JavaScript) simulating the full IRCTC booking flow: train
  search, interactive seat-map selection, passenger form, mock payment, and
  QR-coded e-ticket generation.
- Designed an interactive coach seat map with class-specific berth layouts
  (Sleeper/AC 2-Tier/AC 3-Tier/Chair Car) and real-time fare calculation
  (base fare, reservation charge, GST).
- Implemented client-side state management across a 5-step booking flow
  using `sessionStorage`/`localStorage`, including a persistent booking
  history with cancellation support.
- Wrote deterministic seat-availability simulation using a seeded PRNG to
  produce realistic, reproducible "already booked" seat patterns.
