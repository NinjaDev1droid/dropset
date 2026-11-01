// Runs the Setlist Generator against every genre / vibe / crowd / duration
// combination without a browser, and checks the sets it builds.
// Run with: npm test   (from this folder)
const fs = require("fs");
const path = require("path");

const src = fs.readFileSync(path.resolve(__dirname, "../afroflow/setlist-generator/app.js"), "utf8");

// Minimal stand-ins for the page so app.js can run in Node
let formValues = {};
let lastRender = null;
const stubEl = () => ({ value: "", innerHTML: "", style: {}, scrollIntoView() {} });
const stubs = {};
globalThis.document = {
  getElementById: id => (id in formValues ? { value: formValues[id] } : (stubs[id] ||= stubEl())),
};
globalThis.window = { scrollTo() {}, addEventListener() {} };
let savedLibrary = [];
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: { getItem: () => JSON.stringify(savedLibrary), setItem() {} },
});
(0, eval)(src.replace("const TRACK_DATABASE", "globalThis.TRACK_DATABASE"));
globalThis.renderSetlist = (tracks, curve, eventType, duration, vibe, genre, crowd, requested) => {
  lastRender = { tracks, requested };
};

function generate(values) {
  formValues = { eventType: "club", duration: "120", vibe: "mixed", genre: "mix", crowd: "mixed", opener: "", closer: "", source: "builtin", ...values };
  generateSetlist();
  return lastRender;
}

let failures = 0;
const check = (name, ok, info = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${info ? "  — " + info : ""}`);
};

// Every track in the database has the fields the generator needs
const bad = TRACK_DATABASE.everything.filter(t =>
  !t.name || !t.artist || typeof t.bpm !== "number" || !(t.energy >= 1 && t.energy <= 10) ||
  !Array.isArray(t.vibe) || !Array.isArray(t.crowd) || !Array.isArray(t.tags));
check("track database: every track is complete", bad.length === 0, bad.map(t => t.name).join(", "));

// Every combination fills the set as far as the genre allows, with no repeats
const uniqueCount = genre => new Set(TRACK_DATABASE[genre].map(t => `${t.name}|${t.artist}`.toLowerCase())).size;
const problems = [];
let combos = 0;
for (const genre of Object.keys(TRACK_DATABASE))
  for (const vibe of ["hype", "mixed", "smooth", "dance"])
    for (const crowd of ["young", "mixed", "mature"])
      for (const duration of ["60", "90", "120", "180", "240"]) {
        combos++;
        const { tracks, requested } = generate({ genre, vibe, crowd, duration });
        const expected = Math.min(requested, uniqueCount(genre));
        const names = tracks.map(t => `${t.name}|${t.artist}`);
        if (tracks.length !== expected) problems.push(`${genre}/${vibe}/${crowd}/${duration}m: ${tracks.length} tracks, expected ${expected}`);
        if (new Set(names).size !== names.length) problems.push(`${genre}/${vibe}/${crowd}/${duration}m: repeated song`);
      }
check(`all ${combos} combinations fill the set with no repeats`, problems.length === 0, problems.slice(0, 5).join(" | "));

// Custom opener / closer parsing
const withOpener = text => generate({ opener: text }).tracks[0];
let t = withOpener("Burna Boy - Last Last");
check("opener with a normal hyphen", t.artist === "Burna Boy" && t.name === "Last Last", `${t.artist} / ${t.name}`);
t = withOpener("Wizkid – Essence");
check("opener with an en dash", t.artist === "Wizkid" && t.name === "Essence", `${t.artist} / ${t.name}`);
t = withOpener("Jay-Z - Empire State of Mind");
check("hyphen inside a name is not split", t.artist === "Jay-Z" && t.name === "Empire State of Mind", `${t.artist} / ${t.name}`);
t = withOpener("Just A Song Title");
check("opener with no artist", t.name === "Just A Song Title" && t.artist === "Custom", `${t.artist} / ${t.name}`);
const closed = generate({ closer: "Wizkid - Essence" }).tracks;
check("closer goes last", closed.at(-1).name === "Essence");

// ── Building sets from your library ──
const libTrack = (title, genre, extra = {}) =>
  ({ id: title, title, artist: "Me", genre, bpm: 110, energy: 7, vibe: ["hype"], crowd: ["young"], ...extra });

savedLibrary = [];
check("empty library → My Library gives no tracks", generate({ source: "library", genre: "afrobeats" }).tracks.length === 0);

savedLibrary = [libTrack("Mine 1", "Afrobeats"), libTrack("Mine 2", "Afrobeats"), libTrack("Mine 3", "Amapiano"),
                libTrack("Mine 4", "Trap"), libTrack("Untagged", "Afrobeats", { vibe: [], crowd: [] }),
                libTrack("Odd One", "Custom")];
let set = generate({ source: "library", genre: "afrobeats", duration: "60" }).tracks;
check("My Library uses only library tracks of that genre",
  set.length === 3 && set.every(t => t.fromLibrary && t.tags[0] === "Afrobeats"), set.map(t => t.name).join(", "));
set = generate({ source: "library", genre: "afrobeats", vibe: "smooth", crowd: "mature" }).tracks;
check("library track with no vibe/crowd ticked fits any vibe/crowd", set[0]?.name === "Untagged", set.map(t => t.name).join(", "));
set = generate({ source: "library", genre: "mix" }).tracks;
check("library genres roll up into groups (Full African Mix)", set.length === 4, set.map(t => t.name).join(", "));
set = generate({ source: "library", genre: "everything" }).tracks;
check("'Custom' library tracks appear under Everything", set.some(t => t.name === "Odd One"), `${set.length} tracks`);

set = generate({ source: "both", genre: "afrobeats", duration: "60" }).tracks;
const mine = set.filter(t => t.fromLibrary).map(t => t.name).sort();
check("Library + DropSet DB fills the set and always includes your tracks",
  set.length === 15 && JSON.stringify(mine) === '["Mine 1","Mine 2","Untagged"]', `${set.length} tracks, yours: ${mine.join(", ")}`);

savedLibrary = [{ id: "x", title: "Last Last", artist: "Burna Boy", genre: "Afrobeats", bpm: 999, energy: 7, vibe: [], crowd: [] }];
set = generate({ source: "both", genre: "afrobeats", duration: "240" }).tracks;
const lastLast = set.filter(t => t.name === "Last Last");
check("song in both library and DB appears once, with your version", lastLast.length === 1 && lastLast[0].bpm === 999,
  `${lastLast.length} copies, bpm ${lastLast[0]?.bpm}`);

savedLibrary = [];
console.log(failures ? `\n${failures} failed` : "\nall passed");
process.exit(failures ? 1 : 0);
