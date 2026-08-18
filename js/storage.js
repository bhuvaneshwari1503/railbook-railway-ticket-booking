/* ============================================================
   storage.js
   Thin wrapper around localStorage/sessionStorage so the rest
   of the app never touches the Web Storage API directly.

   - sessionStorage: the *in-progress* booking (survives page
     navigation within the flow, cleared once confirmed)
   - localStorage: the *confirmed* booking history ("My Bookings")
   ============================================================ */

const DRAFT_KEY = "rtb_draft_booking";
const HISTORY_KEY = "rtb_booking_history";

const Draft = {
  get() {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  set(data) {
    const current = Draft.get() || {};
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...current, ...data }));
  },
  clear() {
    sessionStorage.removeItem(DRAFT_KEY);
  },
};

const History = {
  all() {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  },
  add(booking) {
    const list = History.all();
    list.unshift(booking);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  },
  findByPNR(pnr) {
    return History.all().find((b) => b.pnr === pnr) || null;
  },
  cancel(pnr) {
    const list = History.all().map((b) =>
      b.pnr === pnr ? { ...b, status: "Cancelled" } : b
    );
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  },
};

function generatePNR() {
  // 10-digit numeric PNR, IRCTC-style
  let pnr = "";
  for (let i = 0; i < 10; i++) pnr += Math.floor(Math.random() * 10);
  return pnr;
}

function formatCurrency(n) {
  return "₹" + n.toLocaleString("en-IN");
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
}
