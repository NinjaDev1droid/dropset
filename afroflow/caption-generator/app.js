/* =====================================================
   DropSet — Social Media Caption Generator
   Pure JS, no dependencies, localStorage not required
   ===================================================== */

// ---- Platform config ----
const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: '📸', charLimit: 2200 },
  { id: 'tiktok',   label: 'TikTok',    icon: '🎵', charLimit: 2200 },
  { id: 'twitter',  label: 'Twitter/X', icon: '🐦', charLimit: 280  },
  { id: 'whatsapp', label: 'WhatsApp',  icon: '💬', charLimit: null  },
  { id: 'facebook', label: 'Facebook',  icon: '📘', charLimit: null  },
];

// ---- Caption styles ----
const STYLES = [
  { id: 'hype',         label: '🔥 Hype'         },
  { id: 'professional', label: '💼 Professional'  },
  { id: 'story',        label: '📖 Story'         },
  { id: 'minimal',      label: '✨ Minimal'       },
  { id: 'afro',         label: '🌍 Afro Vibe'    },
];

// ---- Event types ----
const EVENT_TYPES = [
  'Club Night', 'Festival', 'Rooftop Session', 'Private Event',
  'Birthday Party', 'Wedding', 'Corporate Event', 'Radio Show',
  'New Mix Release', 'Promo / Announcement', 'Throwback Set',
];

// ---- Caption templates ----
// Each template is a function(data) → string
// data: { venue, city, date, eventName, genre, extraNote, platform }

const TEMPLATES = {
  hype: [
    d => `🔥 ${d.eventName ? d.eventName.toUpperCase() + ' · ' : ''}${d.venue ? d.venue + (d.city ? ', ' + d.city : '') : d.city}\n\nWe did NOT come to play. The energy last night was on another level — ${d.genre ? 'from ' + d.genre + ' to pure madness' : 'pure fire from start to finish'}.\n\n${d.extraNote ? d.extraNote + '\n\n' : ''}If you missed it — your loss. Next time, don't sleep. 🎧⚡`,
    d => `IYKYK 🔥\n\n${d.venue ? d.venue + (d.city ? ' · ' + d.city : '') + '\n\n' : ''}The crowd was WILD. ${d.genre ? 'Hit them with ' + d.genre + ' and they lost their minds.' : 'Set was fire from first to last track.'}\n\n${d.extraNote ? d.extraNote + '\n\n' : ''}This is what we do. 🌍🎶`,
    d => `⚡ The room didn't know what hit them.\n\n${d.eventName ? '[ ' + d.eventName + ' ] · ' : ''}${d.venue ? d.venue : ''}${d.city ? ' · ' + d.city : ''}\n\n${d.genre ? d.genre + ' all night. ' : ''}${d.extraNote || 'The vibe was immaculate.'}\n\nCan't stop, won't stop. 🔥🎧`,
  ],
  professional: [
    d => `Another incredible night${d.venue ? ' at ' + d.venue : ''}${d.city ? ', ' + d.city : ''}.\n\n${d.eventName ? 'Performed at ' + d.eventName + '. ' : ''}${d.genre ? 'Curated a full ' + d.genre + ' journey for an amazing crowd.' : 'Grateful for every opportunity to share the music.'}\n\n${d.extraNote ? d.extraNote + '\n\n' : ''}Thank you to everyone who came through and to the team for making it happen. More dates coming soon — stay tuned. 🎧`,
    d => `Grateful for the stage.\n\n${d.eventName || d.venue ? (d.eventName ? d.eventName : d.venue) + (d.city ? ' · ' + d.city : '') + '\n\n' : ''}${d.genre ? 'Brought a carefully crafted ' + d.genre + ' set to a crowd that truly felt every moment.' : 'Every set is a new story — last night\'s chapter was special.'}\n\n${d.extraNote ? d.extraNote + '\n\n' : ''}Booking enquiries in bio. Let's make your next event unforgettable. 📩`,
  ],
  story: [
    d => `Let me tell you about last night... 🌙\n\n${d.venue ? 'Walked into ' + d.venue + (d.city ? ' in ' + d.city : '') + ' and the energy was already electric.' : 'The energy was already electric before the first track dropped.'}\n\n${d.genre ? 'Started with some smooth ' + d.genre + ', built the crowd slowly, then — boom. ' : 'Built it slow, then let it go. '}The moment the room locked in, time stopped.\n\n${d.extraNote ? d.extraNote + '\n\n' : ''}Nights like these are why I do this. 🎧🌍`,
    d => `I don't usually get emotional but...\n\n${d.eventName ? d.eventName + (d.city ? ' · ' + d.city : '') + '\n\n' : ''}There was this moment — maybe 45 minutes in — where every single person in the room was moving together. ${d.genre ? d.genre + ' doing what it does best.' : 'Music doing what music does.'}\n\n${d.extraNote ? d.extraNote + '\n\n' : ''}This is the job. This is the calling. 🙏`,
  ],
  minimal: [
    d => `${d.venue ? d.venue + (d.city ? ', ' + d.city : '') + '.\n' : ''}${d.eventName ? d.eventName + '.\n' : ''}${d.genre ? d.genre + '.\n' : ''}${d.extraNote ? d.extraNote + '\n' : ''}\nUntil next time. 🖤`,
    d => `Last night.\n${d.venue ? d.venue + '.\n' : ''}${d.city ? d.city + '.\n' : ''}${d.genre || ''}\n\n🎧`,
    d => `${d.eventName || d.venue || 'The set'}.\n${d.city ? d.city + '.\n' : ''}${d.genre ? d.genre + '.\n' : ''}${d.extraNote ? d.extraNote : 'You had to be there.'}`,
  ],
  afro: [
    d => `Afrobeats never lies. 🌍🔥\n\n${d.venue ? d.venue + (d.city ? ' · ' + d.city : '') + '\n\n' : ''}${d.genre ? d.genre + ' running through the speakers, the whole room moving as one.' : 'The whole room moving as one — that\'s the power of African music.'} This culture is EVERYTHING.\n\n${d.extraNote ? d.extraNote + '\n\n' : ''}Representing for the diaspora, always. 🇳🇬🌍✊`,
    d => `Continent to the world. 🌍\n\n${d.eventName ? d.eventName + (d.city ? ' · ' + d.city : '') + '\n\n' : d.venue ? d.venue + (d.city ? ' · ' + d.city : '') + '\n\n' : ''}${d.genre ? d.genre + ' in the speakers and love in the room.' : 'African music in the speakers and love in the room.'} No language barrier when the beat drops.\n\n${d.extraNote ? d.extraNote + '\n\n' : ''}Afrobeats to the world. 🎶🌍🔥`,
  ],
};

// Used when the date is in the future or the event type is a promo:
// the gig hasn't happened yet, so announce it instead of recapping it
const UPCOMING_TEMPLATES = {
  hype:         d => `🚨 ${d.eventName ? d.eventName.toUpperCase() : 'PULL UP'} 🚨\n\n${d.venue ? '📍 ' + d.venue + (d.city ? ' · ' + d.city : '') + '\n' : d.city ? '📍 ' + d.city + '\n' : ''}${d.dateLabel ? '📅 ' + d.dateLabel + '\n' : ''}\n${d.genre ? d.genre + ' all night. ' : ''}${d.extraNote ? d.extraNote + '\n\n' : '\n'}Don't hear about it the next day — be there. 🔥🎧`,
  professional: d => `Upcoming: ${d.eventName || 'live set'}${d.venue ? ' at ' + d.venue : ''}${d.city ? ', ' + d.city : ''}.\n\n${d.dateLabel ? '🗓️ ' + d.dateLabel + '\n\n' : ''}${d.genre ? 'Bringing a curated ' + d.genre + ' set. ' : ''}${d.extraNote ? d.extraNote + '\n\n' : '\n\n'}Looking forward to seeing you there. Booking enquiries in bio. 📩`,
  story:        d => `Counting down... 🌙\n\n${d.venue ? d.venue + (d.city ? ' in ' + d.city : '') : 'This one'}${d.dateLabel ? ', ' + d.dateLabel : ''}. Already planning the build — the slow start, the moment it locks in, the peak you'll talk about after.\n\n${d.genre ? d.genre + ' is on the menu. ' : ''}${d.extraNote ? d.extraNote + '\n\n' : '\n\n'}Come early. 🎧`,
  minimal:      d => `${d.eventName || d.venue || 'Next set'}.\n${d.venue && d.eventName ? d.venue + '.\n' : ''}${d.city ? d.city + '.\n' : ''}${d.dateLabel ? d.dateLabel + '.\n' : ''}${d.extraNote ? d.extraNote + '\n' : ''}\nSoon. 🖤`,
  afro:         d => `The culture is pulling up. 🌍🔥\n\n${d.venue ? d.venue + (d.city ? ' · ' + d.city : '') + '\n' : ''}${d.dateLabel ? '📅 ' + d.dateLabel + '\n' : ''}\n${d.genre ? d.genre + ' in the speakers, all night.' : 'African music in the speakers, all night.'}\n\n${d.extraNote ? d.extraNote + '\n\n' : ''}Afrobeats to the world. 🎶🌍`,
};

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// "Tel-Aviv!" → "TelAviv", "New York, NY" → "NewYork"
function cleanTag(text) {
  return text.split(',')[0].replace(/[^\p{L}\p{N}_]/gu, '');
}

// Shorten for Twitter
function shortenForTwitter(text) {
  if (text.length <= 280) return text;
  // Try to cut at a sentence
  let cut = text.substring(0, 260);
  const lastDot = cut.lastIndexOf('\n');
  if (lastDot > 180) cut = cut.substring(0, lastDot);
  return cut.trimEnd() + '... 🎧';
}

// Hashtag engine
const HASHTAG_SETS = {
  base: ['#DJ', '#DJLife', '#LiveMusic', '#NightOut', '#MusicIsLife', '#GoodVibes', '#Party'],
  afrobeats: ['#Afrobeats', '#Afropop', '#AfrobeatsDJ', '#AfricaToTheWorld', '#Afrohouse', '#Amapiano', '#AfroNation'],
  amapiano: ['#Amapiano', '#PianoMusic', '#LogDrum', '#AmapianoMix', '#SouthAfrica'],
  hiphop: ['#HipHop', '#HipHopDJ', '#Trap', '#GoldenAge', '#Rap', '#DrillMusic'],
  rnb: ['#RnB', '#NeoSoul', '#SoulMusic', '#QuietStorm', '#Motown', '#SoulfulVibes'],
  latin: ['#Reggaeton', '#Salsa', '#Dancehall', '#LatinMusic', '#Samba'],
  telAviv: ['#TelAviv', '#IsraelNightlife', '#TelAvivNightlife', '#IsraelDJ'],
  instagram: ['#InstaMusic', '#Reels', '#MusicContent'],
  tiktok: ['#fyp', '#foryoupage', '#DJTok', '#MusicTikTok', '#viral'],
  twitter: [],
  whatsapp: [],
  facebook: ['#Music', '#Event'],
};

function buildHashtags(genre, platform, city) {
  const tags = new Set(HASHTAG_SETS.base);

  // Genre tags
  if (genre) {
    const g = genre.toLowerCase();
    if (g.includes('afro')) HASHTAG_SETS.afrobeats.forEach(t => tags.add(t));
    if (g.includes('amapiano')) HASHTAG_SETS.amapiano.forEach(t => tags.add(t));
    if (g.includes('hip') || g.includes('trap') || g.includes('drill')) HASHTAG_SETS.hiphop.forEach(t => tags.add(t));
    if (g.includes('r&b') || g.includes('soul') || g.includes('neo')) HASHTAG_SETS.rnb.forEach(t => tags.add(t));
    if (g.includes('latin') || g.includes('reggaeton') || g.includes('salsa') || g.includes('dancehall')) HASHTAG_SETS.latin.forEach(t => tags.add(t));
  }

  // City tags
  if (city && city.toLowerCase().includes('tel aviv')) {
    HASHTAG_SETS.telAviv.forEach(t => tags.add(t));
  } else if (city && cleanTag(city)) {
    tags.add('#' + cleanTag(city));
  }

  // Platform-specific
  if (platform === 'tiktok') HASHTAG_SETS.tiktok.forEach(t => tags.add(t));
  if (platform === 'instagram') HASHTAG_SETS.instagram.forEach(t => tags.add(t));
  if (platform === 'facebook') HASHTAG_SETS.facebook.forEach(t => tags.add(t));

  // Limit for Twitter
  if (platform === 'twitter') {
    return [...tags].slice(0, 5);
  }

  return [...tags].slice(0, 25);
}

// ---- State ----
let selectedPlatforms = ['instagram'];
let selectedStyle    = 'hype';
let generatedCaptions = [];
let currentTags = [];

// ---- DOM refs ----
let dom = {};

function $(id) { return document.getElementById(id); }

// ---- Init ----
function init() {
  dom = {
    venue:      $('venue'),
    city:       $('city'),
    date:       $('date'),
    eventName:  $('eventName'),
    eventType:  $('eventType'),
    genre:      $('genre'),
    extraNote:  $('extraNote'),
    generateBtn:$('generateBtn'),
    results:    $('results'),
    hashtagBox: $('hashtagBox'),
    hashtagCloud:$('hashtagCloud'),
    copyAllTags: $('copyAllTags'),
    platformChips: $('platformChips'),
    styleChips: $('styleChips'),
  };

  renderPlatformChips();
  renderStyleChips();
  dom.generateBtn.addEventListener('click', generate);
  dom.copyAllTags.addEventListener('click', copyAllHashtags);

  // Set today's date
  dom.date.value = localToday();
}

// ---- Render chips ----
function renderPlatformChips() {
  dom.platformChips.innerHTML = '';
  PLATFORMS.forEach(p => {
    const chip = document.createElement('div');
    chip.className = 'chip' + (selectedPlatforms.includes(p.id) ? ' active' : '');
    chip.innerHTML = `${p.icon} ${p.label}`;
    chip.addEventListener('click', () => {
      if (selectedPlatforms.includes(p.id)) {
        if (selectedPlatforms.length === 1) return; // keep at least 1
        selectedPlatforms = selectedPlatforms.filter(x => x !== p.id);
      } else {
        selectedPlatforms.push(p.id);
      }
      renderPlatformChips();
    });
    dom.platformChips.appendChild(chip);
  });
}

function renderStyleChips() {
  dom.styleChips.innerHTML = '';
  STYLES.forEach(s => {
    const chip = document.createElement('div');
    chip.className = 'chip' + (selectedStyle === s.id ? ' active' : '');
    chip.innerHTML = s.label;
    chip.addEventListener('click', () => {
      selectedStyle = s.id;
      renderStyleChips();
    });
    dom.styleChips.appendChild(chip);
  });
}

// ---- Generate ----
function generate() {
  const data = {
    venue:     dom.venue.value.trim(),
    city:      dom.city.value.trim(),
    date:      dom.date.value,
    eventName: dom.eventName.value.trim(),
    eventType: dom.eventType.value,
    genre:     dom.genre.value.trim(),
    extraNote: dom.extraNote.value.trim(),
  };
  if (!data.eventName && data.eventType) data.eventName = data.eventType;
  data.dateLabel = data.date
    ? new Date(data.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : '';

  const upcoming = (data.date && data.date > localToday()) || data.eventType === 'Promo / Announcement';
  const templates = upcoming
    ? [UPCOMING_TEMPLATES[selectedStyle] || UPCOMING_TEMPLATES.hype]
    : TEMPLATES[selectedStyle] || TEMPLATES.hype;
  generatedCaptions = [];

  selectedPlatforms.forEach(platformId => {
    const platform = PLATFORMS.find(p => p.id === platformId);
    // Pick a template variation (rotate through)
    const tpl = templates[Math.floor(Math.random() * templates.length)];
    let text = tpl({ ...data, platform: platformId });

    // Twitter: shorten
    if (platformId === 'twitter') {
      text = shortenForTwitter(text);
    }

    // WhatsApp: strip heavy emojis at start, keep clean
    if (platformId === 'whatsapp') {
      text = text.replace(/^[\u{1F300}-\u{1FAFF}]\s*/u, '');
    }

    generatedCaptions.push({ platform, text, style: selectedStyle });
  });

  renderResults(data);
  renderHashtags(data);
}

// ---- Render results ----
function renderResults(data) {
  if (generatedCaptions.length === 0) {
    dom.results.innerHTML = emptyState();
    return;
  }

  let html = `
    <div class="results-header">
      <span class="results-title">Generated Captions</span>
      <span class="results-count">${generatedCaptions.length} caption${generatedCaptions.length > 1 ? 's' : ''}</span>
    </div>
  `;

  generatedCaptions.forEach((cap, i) => {
    const limit = cap.platform.charLimit;
    const count = cap.text.length;
    const over = limit && count > limit;
    const charLabel = limit
      ? `${count} / ${limit} chars${over ? ' ⚠️ over limit' : ''}`
      : `${count} chars`;

    const styleLabel = STYLES.find(s => s.id === cap.style)?.label || cap.style;

    html += `
      <div class="caption-card" id="card-${i}">
        <div class="caption-card-header">
          <span class="caption-platform-tag">${cap.platform.icon} ${cap.platform.label}</span>
          <span class="caption-style-tag">${styleLabel}</span>
        </div>
        <div class="caption-body" id="caption-text-${i}">${escHtml(cap.text)}</div>
        <div class="caption-footer">
          <span class="char-count${over ? ' over' : ''}">${charLabel}</span>
          <button class="copy-btn" id="copy-btn-${i}" onclick="copyCaption(${i})">
            📋 Copy
          </button>
        </div>
      </div>
    `;
  });

  dom.results.innerHTML = html;
}

// ---- Render hashtags ----
function renderHashtags(data) {
  const allTags = new Set();
  selectedPlatforms.forEach(pid => {
    buildHashtags(data.genre, pid, data.city).forEach(t => allTags.add(t));
  });

  currentTags = [...allTags];
  dom.hashtagBox.style.display = 'block';
  dom.hashtagCloud.innerHTML = currentTags.map((tag, i) =>
    `<span class="hashtag-pill" id="tag-${i}" onclick="copyTag(${i})">${escHtml(tag)}</span>`
  ).join('');
}

// ---- Copy functions ----
function copyCaption(index) {
  const text = generatedCaptions[index]?.text;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const btn = $(`copy-btn-${index}`);
    if (!btn) return;
    btn.textContent = '✅ Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = '📋 Copy';
      btn.classList.remove('copied');
    }, 2000);
  });
}

function copyTag(index) {
  const tag = currentTags[index];
  if (!tag) return;
  navigator.clipboard.writeText(tag).then(() => {
    const el = $(`tag-${index}`);
    if (!el) return;
    el.classList.add('copied-tag');
    const orig = el.textContent;
    el.textContent = '✅ ' + tag;
    setTimeout(() => {
      el.textContent = orig;
      el.classList.remove('copied-tag');
    }, 1500);
  });
}

function copyAllHashtags() {
  const pills = document.querySelectorAll('.hashtag-pill');
  const text = [...pills].map(p => p.textContent).join(' ');
  navigator.clipboard.writeText(text).then(() => {
    dom.copyAllTags.textContent = '✅ All hashtags copied!';
    setTimeout(() => { dom.copyAllTags.textContent = 'Copy All Hashtags'; }, 2000);
  });
}

// ---- Helpers ----
function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

function emptyState() {
  return `
    <div class="empty-state">
      <div class="empty-icon">✍️</div>
      <h3>No captions yet</h3>
      <p>Fill in your gig details,<br>pick platforms & style, then hit Generate.</p>
    </div>
  `;
}

// ---- Boot ----
document.addEventListener('DOMContentLoaded', init);
