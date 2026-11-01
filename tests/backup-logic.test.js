// Checks the Backup & Restore logic (reading backup files and merging)
// without a browser. Run with: npm test   (from this folder)
const fs = require("fs");
const path = require("path");

const src = fs.readFileSync(path.resolve(__dirname, "../afroflow/backup.js"), "utf8");
(0, eval)(src.replace(/^const /gm, "var "));

let failures = 0;
const check = (name, ok, info = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${info ? "  — " + info : ""}`);
};
const throwsMessage = fn => { try { fn(); return null; } catch (e) { return e.message; } };

const library = [{ id: "t1", title: "Last Last", artist: "Burna Boy", energy: 7 }];
const gigs    = [{ id: "g1", venue: "Club Lagos", date: "2026-09-01", pay: 500 }];

// Round trip
const file = JSON.stringify(buildBackup(library, gigs, new Date("2026-10-29T10:00:00Z")));
const back = parseBackup(file);
check("backup → restore gives the same tracks and gigs",
  JSON.stringify(back.library) === JSON.stringify(library) && JSON.stringify(back.gigs) === JSON.stringify(gigs));
check("backup remembers when it was made", back.exportedAt === "2026-10-29T10:00:00.000Z");

// Bad files
check("rejects a file that isn't JSON", /isn't a DropSet backup/.test(throwsMessage(() => parseBackup("hello"))));
check("rejects JSON that isn't a DropSet backup", /isn't a DropSet backup/.test(throwsMessage(() => parseBackup('{"foo":1}'))));
check("rejects a backup from a newer version", /newer version/.test(throwsMessage(() => parseBackup('{"app":"DropSet","version":99}'))));

// Damaged entries are skipped, missing ids are filled in
const messy = parseBackup(JSON.stringify({ app: "DropSet", version: 1,
  library: [{ title: "No ID", artist: "A" }, { title: "", artist: "B" }, null, "junk"],
  gigs: [{ venue: "V", date: "2026-01-01" }, { venue: "No date" }] }));
check("damaged entries are skipped and counted", messy.library.length === 1 && messy.gigs.length === 1 && messy.skipped === 4, `skipped ${messy.skipped}`);
check("entries without an id get one", typeof messy.library[0].id === "string" && messy.library[0].id.length > 5);
check("backup with only a library still restores", parseBackup('{"app":"DropSet","version":1,"library":[]}').gigs.length === 0);

// Merging
const current = [{ id: "t1", title: "Last Last", artist: "Burna Boy", energy: 9 }, { id: "t2", title: "Mine", artist: "Me" }];
const incoming = [
  { id: "t1", title: "Last Last", artist: "Burna Boy", energy: 7 },   // same id
  { id: "zz", title: "MINE", artist: "me" },                          // same song, different id
  { id: "t3", title: "New One", artist: "X" },
  { id: "t3", title: "New One", artist: "X" },                        // listed twice in the file
];
const merged = mergeLists(current, incoming, trackKey);
check("merge adds only missing items", merged.added === 1 && merged.list.length === 3, `added ${merged.added}`);
check("merge never changes what you already had", merged.list[0].energy === 9);
const mg = mergeLists([{ id: "a", venue: "Club", date: "2026-01-01" }], [{ id: "b", venue: "club", date: "2026-01-01" }, { id: "c", venue: "Club", date: "2026-02-01" }], gigKey);
check("gigs match on venue + date", mg.added === 1 && mg.list.at(-1).id === "c");

// Press kit
const kit = { name: "DJ Nova", bio: "", mixes: [], videos: [], contact: { email: "" } };
const withKit = parseBackup(JSON.stringify(buildBackup([], [], new Date(), kit)));
check("press kit goes into the backup and comes back", withKit.epk?.name === "DJ Nova");
check("an empty press kit isn't saved in the backup", !("epk" in buildBackup([], [], new Date(), { name: " ", contact: {} })));
check("old backups without a press kit still restore", parseBackup(file).epk === null);

console.log(failures ? `\n${failures} failed` : "\nall passed");
process.exit(failures ? 1 : 0);
