// ============================================
//  DropSet – Setlist Generator Logic
//  Edit the TRACK_DATABASE below to add your
//  own songs. Each track has:
//    name, artist, genre, bpm, energy (1-10),
//    tags (array), vibe (array)
// ============================================

const TRACK_DATABASE = {
  afrobeats: [
    { name: "Last Last",         artist: "Burna Boy",         bpm: 106, energy: 7, tags: ["Afrobeats"], vibe: ["mixed","smooth","dance"], crowd: ["young","mixed"] },
    { name: "Essence",           artist: "Wizkid ft. Tems",   bpm: 100, energy: 6, tags: ["Afrobeats"], vibe: ["smooth","mixed"],         crowd: ["young","mixed","mature"] },
    { name: "Ginger",            artist: "Wizkid ft. Burna",  bpm: 104, energy: 8, tags: ["Afrobeats"], vibe: ["hype","dance","mixed"],    crowd: ["young","mixed"] },
    { name: "Ye",                artist: "Burna Boy",          bpm: 98,  energy: 6, tags: ["Afrobeats"], vibe: ["smooth","mixed"],         crowd: ["mixed","mature"] },
    { name: "Bad to Me",         artist: "Rema",               bpm: 112, energy: 8, tags: ["Afrobeats"], vibe: ["hype","dance"],           crowd: ["young","mixed"] },
    { name: "Calm Down",         artist: "Rema",               bpm: 107, energy: 8, tags: ["Afrobeats"], vibe: ["hype","dance","mixed"],   crowd: ["young","mixed"] },
    { name: "Mon Bebe",          artist: "Kcee ft. Sarkodie",  bpm: 96,  energy: 6, tags: ["Afrobeats"], vibe: ["smooth","mixed"],         crowd: ["mixed","mature"] },
    { name: "Ojuelegba",         artist: "Wizkid",             bpm: 94,  energy: 5, tags: ["Afrobeats"], vibe: ["smooth"],                 crowd: ["mixed","mature"] },
    { name: "FEM",               artist: "Davido",             bpm: 108, energy: 8, tags: ["Afrobeats"], vibe: ["hype","dance"],           crowd: ["young","mixed"] },
    { name: "Fall",              artist: "Davido",             bpm: 100, energy: 7, tags: ["Afrobeats"], vibe: ["mixed","dance"],          crowd: ["young","mixed","mature"] },
    { name: "Stand Strong",      artist: "Davido",             bpm: 96,  energy: 6, tags: ["Afrobeats"], vibe: ["smooth","mixed"],         crowd: ["mixed","mature"] },
    { name: "Sungba",            artist: "Asake ft. Burna",    bpm: 110, energy: 9, tags: ["Afrobeats"], vibe: ["hype","dance"],           crowd: ["young","mixed"] },
    { name: "Joha",              artist: "Asake",              bpm: 108, energy: 8, tags: ["Afrobeats"], vibe: ["hype","dance"],           crowd: ["young"] },
    { name: "Woman",             artist: "Rema",               bpm: 104, energy: 7, tags: ["Afrobeats"], vibe: ["mixed","dance"],          crowd: ["young","mixed"] },
    { name: "Anybody",          artist: "Dbanj",              bpm: 112, energy: 9, tags: ["Afrobeats"], vibe: ["hype","dance"],           crowd: ["young","mixed"] },
    { name: "Oliver Twist",      artist: "Dbanj",              bpm: 118, energy: 9, tags: ["Afrobeats"], vibe: ["hype","dance"],           crowd: ["young","mixed"] },
    { name: "Johnny",           artist: "Yemi Alade",         bpm: 102, energy: 7, tags: ["Afrobeats"], vibe: ["mixed","dance"],          crowd: ["young","mixed","mature"] },
    { name: "Deja Vu",          artist: "WizKid",             bpm: 98,  energy: 6, tags: ["Afrobeats"], vibe: ["smooth","mixed"],         crowd: ["mixed","mature"] },
    { name: "Running",          artist: "Tiwa Savage",        bpm: 100, energy: 7, tags: ["Afrobeats"], vibe: ["mixed","dance"],          crowd: ["mixed","mature"] },
  ],
  amapiano: [
    { name: "Asibe Happy",       artist: "Kabza De Small",     bpm: 114, energy: 8, tags: ["Amapiano"], vibe: ["hype","dance","mixed"],    crowd: ["young","mixed"] },
    { name: "Siyathandana",      artist: "Kabza & Ami Faku",   bpm: 112, energy: 7, tags: ["Amapiano"], vibe: ["mixed","dance"],          crowd: ["young","mixed"] },
    { name: "John Vuli Gate",    artist: "Mapara A Jazz",      bpm: 110, energy: 8, tags: ["Amapiano"], vibe: ["hype","dance"],           crowd: ["young","mixed"] },
    { name: "Ke Star",           artist: "Focalistic",         bpm: 116, energy: 9, tags: ["Amapiano"], vibe: ["hype","dance"],           crowd: ["young"] },
    { name: "Superstar",         artist: "DJ Melzi",           bpm: 108, energy: 7, tags: ["Amapiano"], vibe: ["mixed","dance"],          crowd: ["young","mixed"] },
    { name: "Bayeke",            artist: "Nomcebo Zikode",     bpm: 105, energy: 6, tags: ["Amapiano"], vibe: ["smooth","mixed"],         crowd: ["mixed","mature"] },
    { name: "Umlilo",            artist: "Reece Madlisa",      bpm: 112, energy: 8, tags: ["Amapiano"], vibe: ["hype","dance"],           crowd: ["young","mixed"] },
    { name: "Ngeke Balunge",     artist: "MFR Souls",          bpm: 107, energy: 7, tags: ["Amapiano"], vibe: ["mixed","dance"],          crowd: ["young","mixed"] },
    { name: "Midnight Sun",      artist: "DJ Lag",             bpm: 115, energy: 8, tags: ["Amapiano"], vibe: ["hype","dance"],           crowd: ["young","mixed"] },
    { name: "Izolo",             artist: "DJ Maphorisa",       bpm: 110, energy: 7, tags: ["Amapiano"], vibe: ["mixed","dance"],          crowd: ["young","mixed"] },
  ],
  afropop: [
    { name: "Yeke Yeke",         artist: "Mory Kanté",         bpm: 118, energy: 9, tags: ["Afro-Pop"], vibe: ["hype","dance"],           crowd: ["young","mixed","mature"] },
    { name: "Waka Waka",         artist: "Shakira",            bpm: 119, energy: 9, tags: ["Afro-Pop"], vibe: ["hype","dance"],           crowd: ["young","mixed","mature"] },
    { name: "Mama",              artist: "Sauti Sol",          bpm: 96,  energy: 5, tags: ["Afro-Pop"], vibe: ["smooth"],                 crowd: ["mixed","mature"] },
    { name: "Diana",             artist: "Nyashinski",         bpm: 100, energy: 6, tags: ["Afro-Pop"], vibe: ["smooth","mixed"],         crowd: ["mixed","mature"] },
    { name: "Stamina",           artist: "Kizz Daniel",        bpm: 104, energy: 7, tags: ["Afro-Pop"], vibe: ["mixed","dance"],          crowd: ["young","mixed"] },
    { name: "Buga",              artist: "Kizz Daniel",        bpm: 106, energy: 8, tags: ["Afro-Pop"], vibe: ["hype","dance","mixed"],   crowd: ["young","mixed","mature"] },
    { name: "Overdose",          artist: "Oxlade",             bpm: 102, energy: 7, tags: ["Afro-Pop"], vibe: ["mixed","smooth"],         crowd: ["mixed","mature"] },
    { name: "KPK",               artist: "Rexxie ft. Mohbad",  bpm: 115, energy: 9, tags: ["Afro-Pop"], vibe: ["hype","dance"],           crowd: ["young","mixed"] },
    { name: "Soso",              artist: "Omah Lay",           bpm: 94,  energy: 5, tags: ["Afro-Pop"], vibe: ["smooth"],                 crowd: ["mixed","mature"] },
    { name: "Holy Ghost",        artist: "Omah Lay",           bpm: 100, energy: 6, tags: ["Afro-Pop"], vibe: ["smooth","mixed"],         crowd: ["mixed","mature"] },
  ],
  afrohouse: [
    { name: "Superman",          artist: "Black Coffee",       bpm: 122, energy: 9, tags: ["Afro House"], vibe: ["hype","dance"],         crowd: ["young","mixed"] },
    { name: "Drive",             artist: "Black Coffee",       bpm: 118, energy: 8, tags: ["Afro House"], vibe: ["hype","dance","mixed"], crowd: ["young","mixed"] },
    { name: "We Dance Again",    artist: "Naughty Boy ft. Nile",bpm:120, energy: 8, tags: ["Afro House"], vibe: ["hype","dance"],         crowd: ["young","mixed"] },
    { name: "You Need Me",       artist: "Black Coffee",       bpm: 116, energy: 7, tags: ["Afro House"], vibe: ["mixed","dance"],        crowd: ["mixed"] },
    { name: "Wish You Were Here",artist: "Black Coffee",       bpm: 114, energy: 7, tags: ["Afro House"], vibe: ["mixed","smooth"],       crowd: ["mixed","mature"] },
    { name: "10 Missed Calls",   artist: "Black Coffee",       bpm: 118, energy: 8, tags: ["Afro House"], vibe: ["hype","dance"],         crowd: ["young","mixed"] },
    { name: "Uyankenteza",       artist: "Black Motion",       bpm: 112, energy: 7, tags: ["Afro House"], vibe: ["mixed","dance"],        crowd: ["young","mixed"] },
    { name: "Sfuna Abantu",      artist: "Black Motion",       bpm: 116, energy: 8, tags: ["Afro House"], vibe: ["hype","dance"],         crowd: ["young","mixed"] },
  ],


  // ── HIP-HOP ──────────────────────────────────────────────────────
  trap: [
    { name: "SICKO MODE",          artist: "Travis Scott",          bpm: 155, energy: 9, tags: ["Trap"],        vibe: ["hype","dance"],         crowd: ["young","mixed"] },
    { name: "Jumpman",             artist: "Drake & Future",         bpm: 130, energy: 8, tags: ["Trap"],        vibe: ["hype","dance","mixed"], crowd: ["young","mixed"] },
    { name: "Bad and Boujee",      artist: "Migos",                  bpm: 130, energy: 9, tags: ["Trap"],        vibe: ["hype","dance"],         crowd: ["young","mixed"] },
    { name: "Mask Off",            artist: "Future",                 bpm: 130, energy: 8, tags: ["Trap"],        vibe: ["hype","dance","mixed"], crowd: ["young","mixed"] },
    { name: "XO TOUR Llif3",       artist: "Lil Uzi Vert",           bpm: 130, energy: 8, tags: ["Trap"],        vibe: ["hype","dance"],         crowd: ["young"] },
    { name: "Rockstar",            artist: "Post Malone ft. 21",     bpm: 160, energy: 8, tags: ["Trap"],        vibe: ["hype","dance","mixed"], crowd: ["young","mixed"] },
    { name: "Congratulations",     artist: "Post Malone",            bpm: 123, energy: 7, tags: ["Trap"],        vibe: ["mixed","smooth"],       crowd: ["young","mixed"] },
    { name: "Antidote",            artist: "Travis Scott",           bpm: 130, energy: 8, tags: ["Trap"],        vibe: ["hype","dance"],         crowd: ["young","mixed"] },
    { name: "No Role Modelz",      artist: "J. Cole",                bpm: 138, energy: 8, tags: ["Trap"],        vibe: ["hype","dance","mixed"], crowd: ["young","mixed"] },
    { name: "goosebumps",          artist: "Travis Scott",           bpm: 130, energy: 8, tags: ["Trap"],        vibe: ["hype","dance"],         crowd: ["young","mixed"] },
    { name: "Money Trees",         artist: "Kendrick Lamar",         bpm: 89,  energy: 7, tags: ["Trap"],        vibe: ["smooth","mixed"],       crowd: ["young","mixed"] },
    { name: "Way 2 Sexy",          artist: "Drake",                  bpm: 104, energy: 8, tags: ["Trap"],        vibe: ["hype","dance"],         crowd: ["young","mixed"] },
  ],

  oldschool: [
    { name: "Nuthin' But a G Thang",artist: "Dr. Dre",              bpm: 100, energy: 8, tags: ["Old School"],  vibe: ["hype","dance","mixed"], crowd: ["mixed","mature"] },
    { name: "California Love",      artist: "2Pac ft. Dr. Dre",     bpm: 100, energy: 9, tags: ["Old School"],  vibe: ["hype","dance"],         crowd: ["mixed","mature"] },
    { name: "Hypnotize",            artist: "Biggie",                bpm: 95,  energy: 8, tags: ["Old School"],  vibe: ["hype","dance","mixed"], crowd: ["mixed","mature"] },
    { name: "Juicy",                artist: "The Notorious B.I.G.",  bpm: 92,  energy: 7, tags: ["Old School"],  vibe: ["smooth","mixed"],       crowd: ["mixed","mature"] },
    { name: "Lose Yourself",        artist: "Eminem",                bpm: 171, energy: 10,tags: ["Old School"],  vibe: ["hype","dance"],         crowd: ["young","mixed","mature"] },
    { name: "Stan",                 artist: "Eminem",                bpm: 75,  energy: 6, tags: ["Old School"],  vibe: ["smooth","mixed"],       crowd: ["mixed","mature"] },
    { name: "In Da Club",           artist: "50 Cent",               bpm: 90,  energy: 9, tags: ["Old School"],  vibe: ["hype","dance"],         crowd: ["mixed","mature"] },
    { name: "HUMBLE.",              artist: "Kendrick Lamar",        bpm: 150, energy: 9, tags: ["Old School"],  vibe: ["hype","dance"],         crowd: ["young","mixed"] },
    { name: "N.Y. State of Mind",   artist: "Nas",                   bpm: 94,  energy: 8, tags: ["Old School"],  vibe: ["mixed","smooth"],       crowd: ["mixed","mature"] },
    { name: "Shook Ones Pt. II",    artist: "Mobb Deep",             bpm: 94,  energy: 9, tags: ["Old School"],  vibe: ["hype"],                 crowd: ["mixed","mature"] },
    { name: "C.R.E.A.M.",           artist: "Wu-Tang Clan",          bpm: 92,  energy: 7, tags: ["Old School"],  vibe: ["mixed","smooth"],       crowd: ["mixed","mature"] },
    { name: "Killing Me Softly",    artist: "Fugees",                bpm: 85,  energy: 6, tags: ["Old School"],  vibe: ["smooth","mixed"],       crowd: ["mixed","mature"] },
    { name: "Ms. Jackson",          artist: "OutKast",               bpm: 96,  energy: 7, tags: ["Old School"],  vibe: ["smooth","mixed"],       crowd: ["mixed","mature"] },
    { name: "Hey Ya!",              artist: "OutKast",               bpm: 160, energy: 9, tags: ["Old School"],  vibe: ["hype","dance"],         crowd: ["young","mixed","mature"] },
  ],

  drill: [
    { name: "Body Bag",             artist: "Pop Smoke",             bpm: 140, energy: 9, tags: ["Drill"],       vibe: ["hype","dance"],         crowd: ["young","mixed"] },
    { name: "Welcome to the Party", artist: "Pop Smoke",             bpm: 140, energy: 10,tags: ["Drill"],       vibe: ["hype","dance"],         crowd: ["young","mixed"] },
    { name: "For the Night",        artist: "Pop Smoke",             bpm: 140, energy: 9, tags: ["Drill"],       vibe: ["hype","dance","mixed"], crowd: ["young","mixed"] },
    { name: "Shake the Room",       artist: "Pop Smoke",             bpm: 140, energy: 9, tags: ["Drill"],       vibe: ["hype","dance"],         crowd: ["young","mixed"] },
    { name: "Taste (feat. Offset)", artist: "Tyga",                  bpm: 130, energy: 8, tags: ["Drill"],       vibe: ["hype","dance"],         crowd: ["young","mixed"] },
    { name: "War",                  artist: "Central Cee",           bpm: 140, energy: 9, tags: ["Drill"],       vibe: ["hype","dance"],         crowd: ["young"] },
    { name: "Loading",              artist: "Central Cee",           bpm: 140, energy: 8, tags: ["Drill"],       vibe: ["hype","dance"],         crowd: ["young","mixed"] },
    { name: "Robbery",              artist: "Juice WRLD",            bpm: 75,  energy: 6, tags: ["Drill"],       vibe: ["smooth","mixed"],       crowd: ["young","mixed"] },
    { name: "Lucid Dreams",         artist: "Juice WRLD",            bpm: 84,  energy: 7, tags: ["Drill"],       vibe: ["smooth","mixed"],       crowd: ["young","mixed"] },
  ],

  conscious: [
    { name: "Alright",              artist: "Kendrick Lamar",        bpm: 89,  energy: 8, tags: ["Conscious"],   vibe: ["hype","mixed","dance"], crowd: ["young","mixed","mature"] },
    { name: "King's Dead",          artist: "Kendrick Lamar",        bpm: 150, energy: 9, tags: ["Conscious"],   vibe: ["hype"],                 crowd: ["young","mixed"] },
    { name: "Crocodile Tears",      artist: "Kendrick Lamar",        bpm: 92,  energy: 8, tags: ["Conscious"],   vibe: ["hype","mixed"],         crowd: ["young","mixed"] },
    { name: "Glory",                artist: "John Legend & Common",  bpm: 76,  energy: 7, tags: ["Conscious"],   vibe: ["smooth","mixed"],       crowd: ["mixed","mature"] },
    { name: "The Message",          artist: "Grandmaster Flash",     bpm: 101, energy: 6, tags: ["Conscious"],   vibe: ["smooth","mixed"],       crowd: ["mixed","mature"] },
    { name: "Fight the Power",      artist: "Public Enemy",          bpm: 109, energy: 9, tags: ["Conscious"],   vibe: ["hype","dance"],         crowd: ["mixed","mature"] },
    { name: "Changes",              artist: "2Pac",                  bpm: 95,  energy: 6, tags: ["Conscious"],   vibe: ["smooth","mixed"],       crowd: ["mixed","mature"] },
    { name: "New Slaves",           artist: "Kanye West",            bpm: 130, energy: 8, tags: ["Conscious"],   vibe: ["hype","mixed"],         crowd: ["young","mixed"] },
    { name: "All Falls Down",       artist: "Kanye West",            bpm: 87,  energy: 6, tags: ["Conscious"],   vibe: ["smooth","mixed"],       crowd: ["mixed","mature"] },
    { name: "Blessings",            artist: "Big Sean ft. Drake",    bpm: 70,  energy: 6, tags: ["Conscious"],   vibe: ["smooth","mixed"],       crowd: ["mixed","mature"] },
  ],

  // ── R&B & SOUL ───────────────────────────────────────────────────
  rnb: [
    { name: "No Scrubs",            artist: "TLC",                   bpm: 90,  energy: 7, tags: ["R&B"],         vibe: ["mixed","dance"],        crowd: ["mixed","mature"] },
    { name: "Say My Name",          artist: "Destiny's Child",       bpm: 110, energy: 8, tags: ["R&B"],         vibe: ["hype","dance","mixed"], crowd: ["young","mixed","mature"] },
    { name: "Crazy in Love",        artist: "Beyoncé ft. Jay-Z",     bpm: 99,  energy: 9, tags: ["R&B"],         vibe: ["hype","dance"],         crowd: ["young","mixed","mature"] },
    { name: "Deja Vu",              artist: "Beyoncé",               bpm: 100, energy: 8, tags: ["R&B"],         vibe: ["hype","dance","mixed"], crowd: ["mixed","mature"] },
    { name: "Drunk in Love",        artist: "Beyoncé",               bpm: 130, energy: 8, tags: ["R&B"],         vibe: ["hype","dance","mixed"], crowd: ["mixed","mature"] },
    { name: "Pony",                 artist: "Ginuwine",              bpm: 94,  energy: 8, tags: ["R&B"],         vibe: ["hype","dance"],         crowd: ["mixed","mature"] },
    { name: "Let's Get It On",      artist: "Marvin Gaye",           bpm: 75,  energy: 5, tags: ["R&B"],         vibe: ["smooth"],               crowd: ["mixed","mature"] },
    { name: "No One",               artist: "Alicia Keys",           bpm: 80,  energy: 6, tags: ["R&B"],         vibe: ["smooth","mixed"],       crowd: ["mixed","mature"] },
    { name: "Adorn",                artist: "Miguel",                bpm: 92,  energy: 6, tags: ["R&B"],         vibe: ["smooth","mixed"],       crowd: ["mixed","mature"] },
    { name: "Come Through",         artist: "H.E.R.",                bpm: 75,  energy: 5, tags: ["R&B"],         vibe: ["smooth"],               crowd: ["mixed","mature"] },
    { name: "Damage",               artist: "H.E.R.",                bpm: 70,  energy: 5, tags: ["R&B"],         vibe: ["smooth"],               crowd: ["mature"] },
    { name: "Leave the Door Open",  artist: "Silk Sonic",            bpm: 95,  energy: 6, tags: ["R&B"],         vibe: ["smooth","mixed"],       crowd: ["mixed","mature"] },
    { name: "Put It in a Love Song",artist: "Alicia Keys & Beyoncé", bpm: 113, energy: 8, tags: ["R&B"],         vibe: ["hype","dance","mixed"], crowd: ["mixed","mature"] },
  ],

  neosoul: [
    { name: "On & On",              artist: "Erykah Badu",           bpm: 92,  energy: 5, tags: ["Neo-Soul"],    vibe: ["smooth"],               crowd: ["mixed","mature"] },
    { name: "Bag Lady",             artist: "Erykah Badu",           bpm: 84,  energy: 5, tags: ["Neo-Soul"],    vibe: ["smooth"],               crowd: ["mixed","mature"] },
    { name: "Brown Skin Girl",      artist: "Beyoncé",               bpm: 80,  energy: 5, tags: ["Neo-Soul"],    vibe: ["smooth","mixed"],       crowd: ["mixed","mature"] },
    { name: "Golden",               artist: "Jill Scott",            bpm: 86,  energy: 6, tags: ["Neo-Soul"],    vibe: ["smooth","mixed"],       crowd: ["mixed","mature"] },
    { name: "He Loves Me",          artist: "Jill Scott",            bpm: 78,  energy: 5, tags: ["Neo-Soul"],    vibe: ["smooth"],               crowd: ["mature"] },
    { name: "Blessed",              artist: "Jamila Woods",          bpm: 82,  energy: 5, tags: ["Neo-Soul"],    vibe: ["smooth"],               crowd: ["mixed","mature"] },
    { name: "The Light",            artist: "Common",                bpm: 95,  energy: 6, tags: ["Neo-Soul"],    vibe: ["smooth","mixed"],       crowd: ["mixed","mature"] },
    { name: "Overprotected",        artist: "D'Angelo",              bpm: 88,  energy: 6, tags: ["Neo-Soul"],    vibe: ["smooth","mixed"],       crowd: ["mixed","mature"] },
    { name: "Untitled (How Does It Feel)", artist: "D'Angelo",       bpm: 72,  energy: 5, tags: ["Neo-Soul"],    vibe: ["smooth"],               crowd: ["mature"] },
    { name: "Electric Feel",        artist: "MGMT (Neo-Soul remix)", bpm: 108, energy: 7, tags: ["Neo-Soul"],    vibe: ["smooth","mixed"],       crowd: ["young","mixed"] },
    { name: "Really Love",          artist: "D'Angelo",              bpm: 80,  energy: 5, tags: ["Neo-Soul"],    vibe: ["smooth"],               crowd: ["mature"] },
  ],

  quietstorm: [
    { name: "A Song for You",       artist: "Donny Hathaway",        bpm: 68,  energy: 4, tags: ["Quiet Storm"], vibe: ["smooth"],               crowd: ["mature"] },
    { name: "Always and Forever",   artist: "Heatwave",              bpm: 72,  energy: 4, tags: ["Quiet Storm"], vibe: ["smooth"],               crowd: ["mature"] },
    { name: "Reasons",              artist: "Earth Wind & Fire",     bpm: 76,  energy: 5, tags: ["Quiet Storm"], vibe: ["smooth"],               crowd: ["mature"] },
    { name: "Knocks Me Off My Feet",artist: "Stevie Wonder",         bpm: 72,  energy: 4, tags: ["Quiet Storm"], vibe: ["smooth"],               crowd: ["mature"] },
    { name: "Ribbon in the Sky",    artist: "Stevie Wonder",         bpm: 66,  energy: 4, tags: ["Quiet Storm"], vibe: ["smooth"],               crowd: ["mature"] },
    { name: "Sweetest Taboo",       artist: "Sade",                  bpm: 96,  energy: 5, tags: ["Quiet Storm"], vibe: ["smooth"],               crowd: ["mature"] },
    { name: "No Ordinary Love",     artist: "Sade",                  bpm: 72,  energy: 4, tags: ["Quiet Storm"], vibe: ["smooth"],               crowd: ["mature"] },
    { name: "Smooth Operator",      artist: "Sade",                  bpm: 96,  energy: 5, tags: ["Quiet Storm"], vibe: ["smooth","mixed"],       crowd: ["mature"] },
    { name: "I'd Rather",           artist: "Luther Vandross",       bpm: 72,  energy: 4, tags: ["Quiet Storm"], vibe: ["smooth"],               crowd: ["mature"] },
    { name: "Never Too Much",       artist: "Luther Vandross",       bpm: 110, energy: 7, tags: ["Quiet Storm"], vibe: ["smooth","mixed"],       crowd: ["mature"] },
    { name: "Endless Love",         artist: "Diana Ross & Lionel",   bpm: 66,  energy: 4, tags: ["Quiet Storm"], vibe: ["smooth"],               crowd: ["mature"] },
  ],

  motown: [
    { name: "Dancing in the Street",artist: "Martha & Vandellas",    bpm: 145, energy: 9, tags: ["Motown"],      vibe: ["hype","dance"],         crowd: ["young","mixed","mature"] },
    { name: "My Girl",              artist: "The Temptations",       bpm: 102, energy: 7, tags: ["Motown"],      vibe: ["smooth","mixed"],       crowd: ["mixed","mature"] },
    { name: "Ain't No Mountain High",artist:"Marvin Gaye & Tammi",   bpm: 132, energy: 8, tags: ["Motown"],      vibe: ["hype","dance","mixed"], crowd: ["young","mixed","mature"] },
    { name: "I Heard It Through the Grapevine",artist:"Marvin Gaye", bpm: 108, energy: 7, tags: ["Motown"],      vibe: ["mixed","dance"],        crowd: ["mixed","mature"] },
    { name: "Stop! In the Name of Love",artist:"The Supremes",       bpm: 132, energy: 8, tags: ["Motown"],      vibe: ["hype","dance"],         crowd: ["young","mixed","mature"] },
    { name: "Signed, Sealed, Delivered",artist:"Stevie Wonder",      bpm: 110, energy: 9, tags: ["Motown"],      vibe: ["hype","dance"],         crowd: ["young","mixed","mature"] },
    { name: "Superstition",         artist: "Stevie Wonder",         bpm: 100, energy: 9, tags: ["Motown"],      vibe: ["hype","dance"],         crowd: ["young","mixed","mature"] },
    { name: "I Want You Back",      artist: "The Jackson 5",         bpm: 118, energy: 9, tags: ["Motown"],      vibe: ["hype","dance"],         crowd: ["young","mixed","mature"] },
    { name: "ABC",                  artist: "The Jackson 5",         bpm: 110, energy: 9, tags: ["Motown"],      vibe: ["hype","dance"],         crowd: ["young","mixed","mature"] },
    { name: "Reach Out (I'll Be There)",artist:"Four Tops",          bpm: 130, energy: 8, tags: ["Motown"],      vibe: ["hype","dance"],         crowd: ["mixed","mature"] },
  ],

  // ── REGGAE & LATIN ───────────────────────────────────────────────
  reggaeton: [
    { name: "Despacito",            artist: "Luis Fonsi ft. Daddy Yankee",bpm:89,energy:8,tags: ["Reggaeton"],   vibe: ["hype","dance","mixed"], crowd: ["young","mixed","mature"] },
    { name: "Mi Gente",             artist: "J Balvin & Willy William",bpm: 100,energy:9,tags: ["Reggaeton"],   vibe: ["hype","dance"],         crowd: ["young","mixed"] },
    { name: "Dura",                 artist: "Daddy Yankee",            bpm: 94, energy:9,tags: ["Reggaeton"],   vibe: ["hype","dance"],         crowd: ["young","mixed"] },
    { name: "Con Calma",            artist: "Daddy Yankee & Snow",     bpm: 96, energy:9,tags: ["Reggaeton"],   vibe: ["hype","dance"],         crowd: ["young","mixed","mature"] },
    { name: "Gasolina",             artist: "Daddy Yankee",            bpm: 100,energy:9,tags: ["Reggaeton"],   vibe: ["hype","dance"],         crowd: ["young","mixed","mature"] },
    { name: "Te Boté",              artist: "Nio Garcia ft. Bad Bunny", bpm: 96,energy:9,tags: ["Reggaeton"],   vibe: ["hype","dance"],         crowd: ["young","mixed"] },
    { name: "Taki Taki",            artist: "DJ Snake ft. Ozuna",      bpm: 96, energy:9,tags: ["Reggaeton"],   vibe: ["hype","dance"],         crowd: ["young","mixed"] },
    { name: "Callaita",             artist: "Bad Bunny",               bpm: 80, energy:6,tags: ["Reggaeton"],   vibe: ["smooth","mixed"],       crowd: ["young","mixed"] },
    { name: "Hawái",                artist: "Maluma",                  bpm: 96, energy:7,tags: ["Reggaeton"],   vibe: ["mixed","dance"],        crowd: ["young","mixed"] },
    { name: "Lean On",              artist: "Major Lazer ft. MØ",      bpm: 98, energy:8,tags: ["Reggaeton"],   vibe: ["hype","dance","mixed"], crowd: ["young","mixed"] },
    { name: "MIA",                  artist: "Bad Bunny ft. Drake",     bpm: 88, energy:8,tags: ["Reggaeton"],   vibe: ["hype","dance"],         crowd: ["young","mixed"] },
  ],

  salsa: [
    { name: "Vivir Mi Vida",        artist: "Marc Anthony",           bpm: 170, energy: 9, tags: ["Salsa"],     vibe: ["hype","dance"],         crowd: ["young","mixed","mature"] },
    { name: "Valió la Pena",        artist: "Marc Anthony",           bpm: 162, energy: 8, tags: ["Salsa"],     vibe: ["hype","dance"],         crowd: ["mixed","mature"] },
    { name: "El Cantante",          artist: "Héctor Lavoe",           bpm: 176, energy: 9, tags: ["Salsa"],     vibe: ["hype","dance"],         crowd: ["mixed","mature"] },
    { name: "Pedro Navaja",         artist: "Rubén Blades",           bpm: 160, energy: 8, tags: ["Salsa"],     vibe: ["hype","dance"],         crowd: ["mixed","mature"] },
    { name: "La Vida Es Un Carnaval",artist:"Celia Cruz",             bpm: 174, energy: 9, tags: ["Salsa"],     vibe: ["hype","dance"],         crowd: ["young","mixed","mature"] },
    { name: "Quimbara",             artist: "Celia Cruz",             bpm: 168, energy: 9, tags: ["Salsa"],     vibe: ["hype","dance"],         crowd: ["mixed","mature"] },
    { name: "Oye Como Va",          artist: "Santana",                bpm: 122, energy: 8, tags: ["Salsa"],     vibe: ["hype","dance","mixed"], crowd: ["young","mixed","mature"] },
    { name: "Suavemente",           artist: "Elvis Crespo",           bpm: 130, energy: 9, tags: ["Salsa"],     vibe: ["hype","dance"],         crowd: ["young","mixed","mature"] },
    { name: "No Me Dejes Solo",     artist: "Wisin & Yandel",         bpm: 96,  energy: 8, tags: ["Salsa"],     vibe: ["hype","dance"],         crowd: ["young","mixed"] },
    { name: "Lamento Borincano",    artist: "Various",                bpm: 100, energy: 5, tags: ["Salsa"],     vibe: ["smooth","mixed"],       crowd: ["mature"] },
  ],

  samba: [
    { name: "Mas Que Nada",         artist: "Sergio Mendes",          bpm: 120, energy: 8, tags: ["Samba"],     vibe: ["hype","dance"],         crowd: ["young","mixed","mature"] },
    { name: "The Girl from Ipanema",artist: "Astrud Gilberto",        bpm: 130, energy: 6, tags: ["Samba"],     vibe: ["smooth","mixed"],       crowd: ["mixed","mature"] },
    { name: "Aquarela do Brasil",   artist: "João Gilberto",          bpm: 108, energy: 6, tags: ["Samba"],     vibe: ["smooth","mixed"],       crowd: ["mixed","mature"] },
    { name: "Tico-Tico no Fubá",    artist: "Carmen Miranda",         bpm: 170, energy: 9, tags: ["Samba"],     vibe: ["hype","dance"],         crowd: ["young","mixed","mature"] },
    { name: "Corcovado",            artist: "Stan Getz",              bpm: 96,  energy: 5, tags: ["Samba"],     vibe: ["smooth"],               crowd: ["mature"] },
    { name: "Garota de Ipanema",    artist: "Various",                bpm: 120, energy: 6, tags: ["Samba"],     vibe: ["smooth","mixed"],       crowd: ["mixed","mature"] },
    { name: "Minha Menina",         artist: "Os Mutantes",            bpm: 128, energy: 7, tags: ["Samba"],     vibe: ["mixed","dance"],        crowd: ["mixed","mature"] },
    { name: "País Tropical",        artist: "Wilson Simonal",         bpm: 112, energy: 7, tags: ["Samba"],     vibe: ["mixed","dance"],        crowd: ["mixed","mature"] },
  ],

  dancehall: [
    { name: "Temperature",          artist: "Sean Paul",              bpm: 102, energy: 9, tags: ["Dancehall"],  vibe: ["hype","dance"],         crowd: ["young","mixed","mature"] },
    { name: "Cheap Thrills",        artist: "Sia",                    bpm: 93,  energy: 8, tags: ["Dancehall"],  vibe: ["hype","dance"],         crowd: ["young","mixed","mature"] },
    { name: "One Dance",            artist: "Drake ft. Rihanna",      bpm: 104, energy: 8, tags: ["Dancehall"],  vibe: ["hype","dance","mixed"], crowd: ["young","mixed"] },
    { name: "Work",                 artist: "Rihanna ft. Drake",      bpm: 92,  energy: 8, tags: ["Dancehall"],  vibe: ["hype","dance"],         crowd: ["young","mixed"] },
    { name: "Informer",             artist: "Snow",                   bpm: 100, energy: 8, tags: ["Dancehall"],  vibe: ["hype","dance"],         crowd: ["mixed","mature"] },
    { name: "Boom Bye Bye",         artist: "Buju Banton",            bpm: 98,  energy: 7, tags: ["Dancehall"],  vibe: ["mixed","dance"],        crowd: ["mixed","mature"] },
    { name: "Murder She Wrote",     artist: "Chaka Demus & Pliers",   bpm: 96,  energy: 8, tags: ["Dancehall"],  vibe: ["hype","dance","mixed"], crowd: ["mixed","mature"] },
    { name: "Heads High",           artist: "Mr. Vegas",              bpm: 98,  energy: 9, tags: ["Dancehall"],  vibe: ["hype","dance"],         crowd: ["young","mixed"] },
    { name: "Hot This Year",        artist: "Popcaan",                bpm: 100, energy: 8, tags: ["Dancehall"],  vibe: ["hype","dance"],         crowd: ["young","mixed"] },
    { name: "Clarks",               artist: "Vybz Kartel",            bpm: 96,  energy: 8, tags: ["Dancehall"],  vibe: ["hype","dance"],         crowd: ["young","mixed"] },
    { name: "Romping Shop",         artist: "Vybz Kartel & Spice",    bpm: 100, energy: 8, tags: ["Dancehall"],  vibe: ["hype","dance"],         crowd: ["young","mixed"] },
    { name: "No No No",             artist: "Dawn Penn",              bpm: 88,  energy: 6, tags: ["Dancehall"],  vibe: ["smooth","mixed"],       crowd: ["mixed","mature"] },
  ],
};

// Combined genres, e.g. "Full African Mix" = afrobeats + amapiano + afropop + afrohouse
const GENRE_GROUPS = {
  mix:        ["afrobeats", "amapiano", "afropop", "afrohouse"],
  hiphop_all: ["trap", "oldschool", "drill", "conscious"],
  rnb_all:    ["rnb", "neosoul", "quietstorm", "motown"],
  latin_all:  ["reggaeton", "salsa", "samba", "dancehall"],
};

function addGenreGroups(db) {
  for (const [group, genres] of Object.entries(GENRE_GROUPS)) {
    db[group] = genres.flatMap(g => db[g] || []);
  }
  // Everything together (plus anything without a known genre, e.g. "Custom")
  db.everything = [...Object.values(GENRE_GROUPS).flatMap(gs => gs.flatMap(g => db[g] || [])), ...(db.other || [])];
  return db;
}

addGenreGroups(TRACK_DATABASE);

// ── Your Library (saved by the Library Manager) ──────────────────

const LIBRARY_KEY = "dropset_library";

// Library Manager genre names → setlist genre keys
const LIBRARY_GENRES = {
  "Afrobeats": "afrobeats", "Amapiano": "amapiano", "Afro-Pop": "afropop", "Afro House": "afrohouse",
  "Trap": "trap", "Old School": "oldschool", "Drill": "drill", "Conscious": "conscious",
  "R&B": "rnb", "Neo-Soul": "neosoul", "Quiet Storm": "quietstorm", "Motown": "motown",
  "Reggaeton": "reggaeton", "Salsa": "salsa", "Samba": "samba", "Dancehall": "dancehall",
};

function loadLibraryTracks() {
  try { return JSON.parse(localStorage.getItem(LIBRARY_KEY)) || []; }
  catch { return []; }
}

// Library tracks in the same shape and genre buckets as TRACK_DATABASE.
// A track with no vibe or crowd ticked is treated as fitting any vibe / crowd.
function buildLibraryDatabase() {
  const db = {};
  for (const t of loadLibraryTracks()) {
    if (!t.title || !t.artist) continue;
    const key = LIBRARY_GENRES[t.genre] || "other";
    (db[key] ||= []).push({
      name:   t.title,
      artist: t.artist,
      bpm:    t.bpm || "?",
      energy: Number(t.energy) || 5,
      tags:   [t.genre || "Custom"],
      vibe:   t.vibe?.length  ? t.vibe  : ["hype", "dance", "mixed", "smooth"],
      crowd:  t.crowd?.length ? t.crowd : ["young", "mixed", "mature"],
      fromLibrary: true,
    });
  }
  return addGenreGroups(db);
}

function updateSourceHint() {
  const count = loadLibraryTracks().length;
  document.getElementById("sourceHint").innerHTML = count
    ? `📚 ${count} track${count === 1 ? "" : "s"} in your library`
    : `Your library is empty — <a href="../library-manager/index.html">add or import tracks</a> to build sets from your own music.`;
}

function initSourcePicker() {
  // Default to your own library once it has tracks in it
  document.getElementById("source").value = loadLibraryTracks().length ? "library" : "builtin";
  updateSourceHint();
}

// Energy color mapping
function energyColor(level) {
  if (level <= 3) return "#3a86ff";
  if (level <= 5) return "#06d6a0";
  if (level <= 7) return "#f5a623";
  return "#e05c00";
}

function energyLabel(level) {
  if (level <= 3) return "Low";
  if (level <= 5) return "Medium";
  if (level <= 7) return "High";
  return "Peak";
}

// Build an energy curve based on vibe setting
function buildEnergyCurve(vibe, trackCount) {
  const curves = {
    hype:   (i, n) => Math.min(10, 7 + Math.round(i / n * 3)),
    smooth: (i, n) => Math.max(3, 7 - Math.round(i / n * 4)),
    mixed:  (i, n) => {
      const phase = i / n;
      if (phase < 0.2) return 5 + Math.round(phase * 10);
      if (phase < 0.6) return 7 + Math.round((phase - 0.2) * 7.5);
      if (phase < 0.8) return 9;
      return 7 - Math.round((phase - 0.8) * 10);
    },
    dance:  (i, n) => 8 + (i % 3 === 0 ? -1 : 0),
  };
  return Array.from({ length: trackCount }, (_, i) =>
    Math.min(10, Math.max(1, (curves[vibe] || curves.mixed)(i, trackCount)))
  );
}

function generateSetlist() {
  const eventType = document.getElementById("eventType").value;
  const duration  = parseInt(document.getElementById("duration").value);
  const vibe      = document.getElementById("vibe").value;
  const genre     = document.getElementById("genre").value;
  const crowd     = document.getElementById("crowd").value;
  const opener    = document.getElementById("opener").value.trim();
  const closer    = document.getElementById("closer").value.trim();
  const source    = document.getElementById("source").value;

  // Estimate track count (avg ~4 min per track)
  const trackCount = Math.round(duration / 4);

  // Genre pool from the chosen source. Library tracks go first, so when
  // a song is in both, your own tags win.
  const library = source === "builtin" ? [] : (buildLibraryDatabase()[genre] || []);
  const builtIn = source === "library" ? [] : (TRACK_DATABASE[genre] || TRACK_DATABASE.mix);
  const seen = new Set();
  const genrePool = [...library, ...builtIn].filter(t => {
    const key = `${t.name}|${t.artist}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const vibeKey = vibe.split(" ")[0].toLowerCase();
  const crowdOk = t => crowd === "mixed" || t.crowd.includes(crowd);
  const vibeOk  = t => vibeKey === "mixed" || t.vibe.includes(vibeKey);

  // Best matches first; if there aren't enough, loosen the vibe filter,
  // then the crowd filter, so the set still fills its time slot
  const tiers = [
    genrePool.filter(t => crowdOk(t) && vibeOk(t)),
    genrePool.filter(crowdOk),
    genrePool,
  ];
  const pool = [];
  for (const tier of tiers) {
    // Within each tier, your library tracks are picked before built-in ones
    const fresh = tier.filter(t => !pool.includes(t));
    const extra = [...shuffle(fresh.filter(t => t.fromLibrary)), ...shuffle(fresh.filter(t => !t.fromLibrary))];
    pool.push(...extra.slice(0, trackCount - pool.length));
    if (pool.length >= trackCount) break;
  }

  // Build curve
  const curve = buildEnergyCurve(vibeKey, trackCount);

  // Pick tracks matching curve energy approximately
  const selected = [];
  const used = new Set();

  for (let i = 0; i < trackCount; i++) {
    const targetEnergy = curve[i];
    // Sort remaining pool by how close their energy is to target
    const remaining = pool.filter((_, idx) => !used.has(idx));
    remaining.sort((a, b) => Math.abs(a.energy - targetEnergy) - Math.abs(b.energy - targetEnergy));
    const pick = remaining[0];
    if (pick) {
      const origIdx = pool.indexOf(pick);
      used.add(origIdx);
      selected.push({ ...pick, targetEnergy });
    }
  }

  // Inject custom opener / closer if provided
  if (opener && selected.length > 0) {
    selected[0] = { ...parseCustomTrack(opener), energy: 5, targetEnergy: curve[0] };
  }
  if (closer && selected.length > 0) {
    const last = selected.length - 1;
    selected[last] = { ...parseCustomTrack(closer), energy: 6, targetEnergy: curve[last] };
  }

  renderSetlist(selected, curve.slice(0, selected.length), eventType, duration, vibe, genre, crowd, trackCount, source);
}

// "Burna Boy – Last Last" or "Burna Boy - Last Last" → artist + name.
// Needs spaces around the dash so names like "Jay-Z" stay intact.
function parseCustomTrack(text) {
  const parts = text.split(/\s+[-–—]\s+/);
  const track = { bpm: "?", tags: ["Custom"], vibe: [] };
  if (parts.length >= 2) {
    track.artist = parts[0].trim();
    track.name   = parts.slice(1).join(" – ").trim();
  } else {
    track.artist = "Custom";
    track.name   = text;
  }
  return track;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function escHtml(str) {
  return String(str ?? "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function trackNote(index, total, vibe) {
  if (index === 0)               return "🔊 Opening track – set the mood";
  if (index === total - 1)       return "🎤 Closing – send them home happy";
  if (vibe === "hype" && index === Math.round(total * 0.5)) return "🔥 Peak moment – drop it!";
  if (vibe === "mixed" && index === Math.round(total * 0.65)) return "🔥 Peak moment – drop it!";
  if (index === Math.round(total * 0.25)) return "📈 Building energy";
  if (index === Math.round(total * 0.8))  return "📉 Start winding down";
  return "";
}

function renderSetlist(tracks, curve, eventType, duration, vibe, genre, crowd, requested, source) {
  // Meta
  const genreLabels = {
    afrobeats:"Afrobeats 🇳🇬", amapiano:"Amapiano 🇿🇦", afropop:"Afro-Pop", afrohouse:"Afro House", mix:"Full African Mix 🌍",
    trap:"Trap 🎤", oldschool:"Old School / Golden Age 🎤", drill:"Drill 🎤", conscious:"Conscious Hip-Hop 🎤", hiphop_all:"All Hip-Hop 🎤",
    rnb:"Contemporary R&B 🎵", neosoul:"Neo-Soul 🎵", quietstorm:"Quiet Storm 🎵", motown:"Motown 🎵", rnb_all:"All R&B & Soul 🎵",
    reggaeton:"Reggaeton 🌴", salsa:"Salsa 🌴", samba:"Samba 🌴", dancehall:"Dancehall 🌴", latin_all:"All Reggae & Latin 🌴",
    everything:"All Genres 🔀",
  };
  const eventLabels = { club:"Club Night", wedding:"Wedding / Private Party", festival:"Festival", lounge:"Lounge / Rooftop", birthday:"Birthday Party", corporate:"Corporate Event" };
  const sourceLabels = { library:"📚 My Library", both:"📚 Library + DropSet DB", builtin:"🎧 DropSet DB" };
  const shortTip = source === "library"
    ? `Add more ${genreLabels[genre]} tracks in the <a href="../library-manager/index.html">Library Manager</a>, or switch Track Source to "My Library + DropSet DB".`
    : "Pick a wider genre or add more tracks to your library.";
  document.getElementById("outputMeta").innerHTML =
    `${eventLabels[eventType]} &nbsp;|&nbsp; ${duration} min &nbsp;|&nbsp; ${genreLabels[genre]}<br>${tracks.length} tracks &nbsp;|&nbsp; Vibe: ${vibe} &nbsp;|&nbsp; ${sourceLabels[source]}` +
    (tracks.length < requested
      ? `<br><span class="short-warning">⚠️ Only ${tracks.length} songs available for this genre (~${tracks.length * 4} of ${duration} min). ${shortTip}</span>`
      : "");

  // Energy bar
  const barEl = document.getElementById("energyBar");
  barEl.innerHTML = curve.map(e =>
    `<div class="energy-segment" style="background:${energyColor(e)};opacity:${0.4 + e * 0.06}" title="Energy ${e}"></div>`
  ).join("");

  // Table
  const tbody = document.getElementById("setlistBody");
  tbody.innerHTML = tracks.map((t, i) => {
    const color = energyColor(t.targetEnergy);
    const note  = trackNote(i, tracks.length, vibe);
    return `
      <tr>
        <td class="track-number">${i + 1}</td>
        <td>
          <div class="track-name">${escHtml(t.name)}</div>
          <div class="track-artist">${escHtml(t.artist)}</div>
        </td>
        <td>${t.fromLibrary ? '<span class="lib-mark" title="From your library">📚</span>' : ""}<span class="tag">${escHtml(t.tags[0])}</span></td>
        <td>${escHtml(t.bpm)}</td>
        <td>
          <span class="energy-pill" style="background:${color}"></span>
          ${energyLabel(t.targetEnergy)}
        </td>
        <td class="note-text">${note}</td>
      </tr>`;
  }).join("");

  // Show output
  document.getElementById("outputSection").style.display = "block";
  document.getElementById("outputSection").scrollIntoView({ behavior: "smooth" });
}

function copySetlist() {
  const rows = document.querySelectorAll(".setlist-table tbody tr");
  const lines = ["#\tTrack\tArtist\tGenre\tBPM\tEnergy"];
  rows.forEach((row, i) => {
    const cells = row.querySelectorAll("td");
    lines.push([
      i + 1,
      cells[1].querySelector(".track-name").innerText,
      cells[1].querySelector(".track-artist").innerText,
      cells[2].querySelector(".tag").innerText,
      cells[3].innerText,
      cells[4].innerText.trim(),
    ].join("\t"));
  });
  navigator.clipboard.writeText(lines.join("\n")).then(() => {
    const fb = document.getElementById("copyFeedback");
    fb.style.display = "block";
    setTimeout(() => fb.style.display = "none", 2500);
  });
}

function printSetlist() {
  window.print();
}

function resetForm() {
  document.getElementById("outputSection").style.display = "none";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Library changes made in another tab show up without a reload
window.addEventListener("storage", e => { if (e.key === LIBRARY_KEY) updateSourceHint(); });
window.addEventListener("pageshow", updateSourceHint);

initSourcePicker();
