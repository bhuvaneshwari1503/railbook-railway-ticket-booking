/* ============================================================
   data.js
   Static "backend" data for the prototype: stations, trains,
   coach classes, pricing, and a seeded random generator so
   seat availability is consistent for the same train+date+class
   instead of re-randomizing on every click.
   ============================================================ */

const STATIONS = [
  { code: "NDLS", name: "New Delhi" },
  { code: "BCT",  name: "Mumbai Central" },
  { code: "MAS",  name: "Chennai Central" },
  { code: "HWH",  name: "Howrah (Kolkata)" },
  { code: "SBC",  name: "Bengaluru" },
  { code: "PUNE", name: "Pune" },
  { code: "ADI",  name: "Ahmedabad" },
  { code: "JP",   name: "Jaipur" },
];

/* Coach classes available across trains, with per-class fare
   multiplier and physical layout used by the seat map renderer. */
const COACH_CLASSES = {
  SL:  { label: "Sleeper (SL)",         baseFare: 480,  layout: "sleeper", rows: 9,  bay: 8  },
  AC3: { label: "AC 3-Tier (3A)",       baseFare: 1150, layout: "sleeper", rows: 8,  bay: 8  },
  AC2: { label: "AC 2-Tier (2A)",       baseFare: 1780, layout: "twotier", rows: 6,  bay: 6  },
  CC:  { label: "AC Chair Car (CC)",    baseFare: 850,  layout: "chair",   rows: 12, bay: 5  },
};

/* Trains. Distance drives duration + fare scaling. */
const TRAINS = [
  { no: "12951", name: "Mumbai Rajdhani Express",   from: "NDLS", to: "BCT",  dep: "16:25", arr: "08:35", dur: "16h 10m", classes: ["AC2", "AC3", "CC"] },
  { no: "12259", name: "Sealdah Duronto Express",    from: "NDLS", to: "HWH",  dep: "16:50", arr: "10:05", dur: "17h 15m", classes: ["AC3", "AC2", "SL"] },
  { no: "12621", name: "Tamil Nadu Express",         from: "NDLS", to: "MAS",  dep: "22:30", arr: "07:15", dur: "32h 45m", classes: ["SL", "AC3", "AC2"] },
  { no: "12628", name: "Karnataka Express",          from: "NDLS", to: "SBC",  dep: "19:15", arr: "04:40", dur: "33h 25m", classes: ["SL", "AC3", "CC"] },
  { no: "12009", name: "Shatabdi Express",           from: "NDLS", to: "JP",   dep: "06:05", arr: "10:40", dur: "4h 35m",  classes: ["CC", "AC3"] },
  { no: "12933", name: "Gujarat Mail",                from: "BCT",  to: "ADI",  dep: "21:40", arr: "05:55", dur: "8h 15m",  classes: ["SL", "AC3", "AC2"] },
  { no: "11302", name: "Udyan Express",               from: "PUNE", to: "SBC",  dep: "20:40", arr: "13:15", dur: "16h 35m", classes: ["SL", "AC3"] },
];

/* Approx real-world rail distances (km) between every station pair.
   Used to synthesize realistic duration/fare for routes that don't
   have a hand-authored train in TRAINS above. */
const DISTANCE_PAIRS = {
  "NDLS-BCT": 1384, "NDLS-MAS": 2180, "NDLS-HWH": 1450, "NDLS-SBC": 2150,
  "NDLS-PUNE": 1470, "NDLS-ADI": 934,  "NDLS-JP": 308,
  "BCT-MAS": 1279,   "BCT-HWH": 1968,  "BCT-SBC": 984,   "BCT-PUNE": 149,
  "BCT-ADI": 493,    "BCT-JP": 1149,
  "MAS-HWH": 1663,   "MAS-SBC": 362,   "MAS-PUNE": 1180, "MAS-ADI": 1854,
  "MAS-JP": 2058,
  "HWH-SBC": 1871,   "HWH-PUNE": 1965, "HWH-ADI": 1876,  "HWH-JP": 1546,
  "SBC-PUNE": 840,   "SBC-ADI": 1495,  "SBC-JP": 2064,
  "PUNE-ADI": 656,   "PUNE-JP": 1198,
  "ADI-JP": 636,
};

function getDistance(a, b) {
  if (a === b) return 0;
  return DISTANCE_PAIRS[`${a}-${b}`] ?? DISTANCE_PAIRS[`${b}-${a}`] ?? 1000;
}

/* Short, headline-friendly city names used to build synthetic train names. */
const SHORT_NAMES = {
  NDLS: "Delhi", BCT: "Mumbai", MAS: "Chennai", HWH: "Howrah",
  SBC: "Bengaluru", PUNE: "Pune", ADI: "Ahmedabad", JP: "Jaipur",
};

const TRAIN_NAME_TEMPLATES = [
  (dest) => `${dest} Express`,
  (dest) => `${dest} Superfast Express`,
  (dest) => `${dest} SF Express`,
  (dest) => `${dest} Mail`,
  (dest) => `${dest} Intercity Express`,
  (dest) => `${dest} Garib Rath Express`,
  (dest) => `${dest} Jan Shatabdi Express`,
];

function minutesToHHMM(mins) {
  const wrapped = ((mins % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(wrapped / 60).toString().padStart(2, "0");
  const m = (wrapped % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/* ---- Seeded PRNG so the same train/date/class always shows the
   same "already booked" seats instead of reshuffling on reload. ---- */
function seedFromString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Deterministically synthesizes 2-4 plausible trains for a route that
   has no hand-authored entry in TRAINS, so every station pair returns
   real-looking results instead of "no trains found". Same route always
   produces the same trains (seeded on "from-to"), just like seat maps
   are seeded on train/date/class. */
function generateSyntheticTrains(from, to, excludeNumbers = new Set()) {
  const distance = getDistance(from, to);
  const rng = mulberry32(seedFromString(`route-${from}-${to}`));
  const count = 2 + Math.floor(rng() * 3); // 2–4 trains
  const destShort = SHORT_NAMES[to] || stationName(to);
  const trains = [];
  const usedNumbers = new Set(excludeNumbers);

  for (let i = 0; i < count; i++) {
    let no;
    do {
      no = String(20000 + Math.floor(rng() * 9999));
    } while (usedNumbers.has(no));
    usedNumbers.add(no);

    const speedKmh = 50 + rng() * 25; // 50–75 km/h express average
    const durHoursExact = Math.max(1, distance / speedKmh);
    const durH = Math.floor(durHoursExact);
    const durM = Math.round((durHoursExact - durH) * 60);
    const dur = `${durH}h ${String(durM).padStart(2, "0")}m`;

    const depMinutes = Math.floor(rng() * 24 * 60);
    const dep = minutesToHHMM(depMinutes);
    const arr = minutesToHHMM(depMinutes + Math.round(durHoursExact * 60));

    const nameFn = TRAIN_NAME_TEMPLATES[Math.floor(rng() * TRAIN_NAME_TEMPLATES.length)];
    const name = nameFn(destShort);

    let classes;
    if (distance < 400) {
      classes = rng() < 0.5 ? ["CC", "AC3"] : ["CC", "AC3", "SL"];
    } else if (distance < 1000) {
      classes = ["SL", "AC3", "CC"];
    } else {
      classes = rng() < 0.5 ? ["SL", "AC3", "AC2"] : ["SL", "AC3", "AC2", "CC"];
    }

    trains.push({ no, name, from, to, dep, arr, dur, classes, synthetic: true });
  }

  return trains;
}

/* Public lookup used by search.js: hand-authored trains for the route
   (if any) plus enough synthetic ones to always return real results. */
function getTrainsForRoute(from, to) {
  const explicit = TRAINS.filter((t) => t.from === from && t.to === to);
  const explicitNumbers = new Set(explicit.map((t) => t.no));
  const synthetic = generateSyntheticTrains(from, to, explicitNumbers);
  return [...explicit, ...synthetic];
}

/* Looks up a train by number regardless of whether it's hand-authored
   (in TRAINS) or synthetic. Synthetic trains are deterministic per
   route (seeded on "from-to"), so regenerating the route's list finds
   the exact same train object back — no need to persist it separately. */
function findTrain(no, from, to) {
  let t = TRAINS.find((x) => x.no === no);
  if (t) return t;
  if (from && to) {
    t = generateSyntheticTrains(from, to).find((x) => x.no === no);
  }
  return t;
}

/* Returns an array of seat objects for a given train/date/class:
   { id, label, status: 'available' | 'booked', tier } */
function generateSeats(trainNo, date, classCode) {
  const cfg = COACH_CLASSES[classCode];
  const rng = mulberry32(seedFromString(`${trainNo}-${date}-${classCode}`));
  const seats = [];
  const tiersByLayout = {
    sleeper: ["Lower", "Middle", "Upper", "Side Lower", "Side Upper"],
    twotier: ["Lower", "Upper", "Side Lower", "Side Upper"],
    chair:   ["Window", "Middle", "Aisle"],
  };
  const tiers = tiersByLayout[cfg.layout];

  let counter = 1;
  for (let row = 1; row <= cfg.rows; row++) {
    for (let seatInBay = 1; seatInBay <= cfg.bay; seatInBay++) {
      const tier = tiers[seatInBay % tiers.length];
      const booked = rng() < 0.38; // ~38% pre-booked, gives a realistic busy coach
      seats.push({
        id: `${classCode}-${counter}`,
        label: `${counter}`,
        row,
        tier,
        status: booked ? "booked" : "available",
      });
      counter++;
    }
  }
  return seats;
}

/* Fare = base fare * distance-tier factor (approximated via duration) */
function calcFare(train, classCode) {
  const cfg = COACH_CLASSES[classCode];
  const hours = parseFloat(train.dur);
  const distanceFactor = Math.max(1, hours / 8);
  return Math.round(cfg.baseFare * distanceFactor);
}

function stationName(code) {
  const s = STATIONS.find((x) => x.code === code);
  return s ? s.name : code;
}
