/* =============================================
   The Guide to Pittsburgh Golf — App Logic
   ============================================= */

// ── Admin Auth ──────────────────────────────────
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'pgolf2024';
const SESSION_KEY = 'pgolf_admin';

function isAdminLoggedIn()        { return sessionStorage.getItem(SESSION_KEY) === 'true'; }
function adminLogin(u, p)         { if (u===ADMIN_USER && p===ADMIN_PASS){ sessionStorage.setItem(SESSION_KEY,'true'); return true; } return false; }
function adminLogout()            { sessionStorage.removeItem(SESSION_KEY); }

// ── Course directory (~60-mile radius of Pittsburgh) ──
const DEFAULT_COURSES = [
  // ── Public ──────────────────────────────────────────────────────────────────
  { id:1,  name:'Oakmont Country Club',            location:'Oakmont, PA',            dist:'~17 mi NE',  type:'Private' },
  { id:2,  name:'Fox Chapel Golf Club',            location:'Fox Chapel, PA',         dist:'~8 mi NE',   type:'Private' },
  { id:3,  name:'Pittsburgh Field Club',           location:'Fox Chapel, PA',         dist:'~8 mi NE',   type:'Private' },
  { id:4,  name:'Allegheny Country Club',          location:'Sewickley, PA',          dist:'~14 mi NW',  type:'Private' },
  { id:5,  name:'South Hills Country Club',        location:'Pittsburgh, PA',         dist:'~6 mi S',    type:'Private' },
  { id:6,  name:'Shannopin Country Club',          location:'Pittsburgh, PA',         dist:'~5 mi NW',   type:'Private' },
  { id:7,  name:'Chartiers Country Club',          location:'Pittsburgh, PA',         dist:'~7 mi W',    type:'Private' },
  { id:8,  name:'Pittsburgh Country Club',         location:'Verona, PA',             dist:'~11 mi NE',  type:'Private' },
  { id:9,  name:'Longue Vue Club',                 location:'Verona, PA',             dist:'~11 mi NE',  type:'Private' },
  { id:10, name:'Edgewood Club of Sewickley',      location:'Edgewood, PA',           dist:'~6 mi E',    type:'Private' },
  { id:11, name:'Duquesne Country Club',           location:'Duquesne, PA',           dist:'~11 mi SE',  type:'Private' },
  { id:12, name:'Westmoreland Country Club',       location:'Delmont, PA',            dist:'~28 mi E',   type:'Private' },
  { id:13, name:'Youghiogheny Country Club',       location:'McKeesport, PA',         dist:'~15 mi SE',  type:'Private' },
  { id:14, name:'North Park Golf Course',          location:'Allison Park, PA',       dist:'~12 mi N',   type:'Public'  },
  { id:15, name:'South Park Golf Course',          location:'Library, PA',            dist:'~12 mi S',   type:'Public'  },
  { id:16, name:'Quicksilver Golf Club',           location:'Midway, PA',             dist:'~26 mi SW',  type:'Public'  },
  { id:17, name:'Cranberry Highlands Golf Course', location:'Cranberry Township, PA', dist:'~25 mi N',   type:'Public'  },
  { id:18, name:'Wildwood Golf Club',              location:'Allison Park, PA',       dist:'~13 mi N',   type:'Public'  },
  { id:19, name:'Butler\'s Golf Course',           location:'Elizabeth, PA',          dist:'~14 mi SE',  type:'Public'  },
  { id:20, name:'Deer Lakes Golf Course',          location:'Cheswick, PA',           dist:'~16 mi NE',  type:'Public'  },
  { id:21, name:'Cedarbrook Golf Course',          location:'Belle Vernon, PA',       dist:'~26 mi S',   type:'Public'  },
  { id:22, name:'Olde Stonewall Golf Club',        location:'Ellwood City, PA',       dist:'~35 mi NW',  type:'Public'  },
  { id:23, name:'Tom\'s Run Golf Course',          location:'Blairsville, PA',        dist:'~40 mi E',   type:'Public'  },
  { id:24, name:'Linden Hall Golf Club',           location:'Dawson, PA',             dist:'~44 mi S',   type:'Public'  },
  { id:25, name:'Nemacolin Woodlands Resort',      location:'Farmington, PA',         dist:'~58 mi S',   type:'Public'  },
  { id:26, name:'Seven Springs Mountain Resort',   location:'Champion, PA',           dist:'~55 mi E',   type:'Public'  },
  { id:27, name:'Diamond Run Golf Club',           location:'Sewickley, PA',          dist:'~16 mi NW',  type:'Public'  },
  { id:28, name:'Scenic Valley Golf Course',       location:'Scenery Hill, PA',       dist:'~30 mi SW',  type:'Public'  },
  { id:29, name:'Chestnut Ridge Golf Club',        location:'Blairsville, PA',        dist:'~42 mi E',   type:'Public'  },
  { id:30, name:'White Oak Golf Course',           location:'White Oak, PA',          dist:'~12 mi SE',  type:'Public'  },
];

const COURSES_KEY = 'pgolf_courses';

function getCourses() {
  const s = localStorage.getItem(COURSES_KEY);
  if (s) return JSON.parse(s);
  localStorage.setItem(COURSES_KEY, JSON.stringify(DEFAULT_COURSES));
  return DEFAULT_COURSES;
}
function saveCourseList(list)         { localStorage.setItem(COURSES_KEY, JSON.stringify(list)); }
function addCourseToDirectory(c)      { const l=getCourses(); l.push({id:Date.now(),...c}); saveCourseList(l); }
function removeCourseFromDirectory(id){ saveCourseList(getCourses().filter(c=>c.id!==id)); }
// Link or unlink a review post to a course in the directory
function linkReviewToCourse(courseId, postId) {
  const list = getCourses();
  const idx = list.findIndex(c => c.id === courseId);
  if (idx !== -1) { list[idx].postId = postId; saveCourseList(list); }
}

// ── Review posts ─────────────────────────────────
const POSTS_KEY = 'pgolf_posts';

function getPosts()     { return JSON.parse(localStorage.getItem(POSTS_KEY) || '[]'); }
function getPost(id)    { return getPosts().find(p => p.id === id); }
function savePosts(arr) { localStorage.setItem(POSTS_KEY, JSON.stringify(arr)); }

function savePost(data) {
  const posts = getPosts();
  const idx   = posts.findIndex(p => p.id === data.id);
  if (idx !== -1) {
    posts[idx] = { ...posts[idx], ...data };
  } else {
    posts.unshift({ id: Date.now(), ...data });
  }
  savePosts(posts);
  return data.id || posts[0].id;
}

function deletePost(id) {
  savePosts(getPosts().filter(p => p.id !== id));
}

function getPublishedPosts() {
  return getPosts().filter(p => p.status === 'published').sort((a,b) => new Date(b.dateReviewed) - new Date(a.dateReviewed));
}

// ── Helpers ──────────────────────────────────────
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function renderStars(n) {
  let s = '';
  for (let i=1;i<=5;i++) s += i<=n ? '★' : '<span style="opacity:.3">★</span>';
  return s;
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
}

// Turn plain textarea text into <p> tags
function renderBody(text) {
  if (!text) return '';
  return text.split(/\n\n+/).map(p => `<p>${escapeHtml(p.trim()).replace(/\n/g,'<br>')}</p>`).join('');
}

// ── Meter gauges ─────────────────────────────────
function renderMeterSVG(value) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const r = 40, cx = 55, cy = 55;
  const fullCirc = 2 * Math.PI * r;   // ≈ 251.3
  const arcSpan  = fullCirc * 0.75;   // 270° arc ≈ 188.5
  const gap      = fullCirc - arcSpan;
  const fillLen  = (v / 100) * arcSpan;
  const col = v < 35 ? '#c0392b' : v < 65 ? '#c8900a' : '#1e6b3a';
  return `<svg viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#e8e2d8" stroke-width="9"
            stroke-dasharray="${arcSpan.toFixed(1)} ${gap.toFixed(1)}"
            stroke-linecap="round" transform="rotate(135 ${cx} ${cy})"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${col}" stroke-width="9"
            stroke-dasharray="${fillLen.toFixed(1)} ${(fullCirc - fillLen).toFixed(1)}"
            stroke-linecap="round" transform="rotate(135 ${cx} ${cy})"/>
    <text x="${cx}" y="${cy + 8}" text-anchor="middle"
          font-family="'Playfair Display',Georgia,serif"
          font-size="22" font-weight="700" fill="#1c1c18">${v}</text>
  </svg>`;
}

function renderMeters(meters) {
  if (!meters || !meters.length) return '';
  const overall = Math.round(meters.reduce((s, m) => s + (Number(m.value) || 0), 0) / meters.length);
  return `
    <div class="meters-section">
      <h3 class="meters-heading">Course Ratings</h3>
      <div class="meters-grid">
        <div class="meter-card meter-card-overall">
          <div class="meter-svg-wrap">${renderMeterSVG(overall)}</div>
          <div class="meter-label meter-label-overall">Overall Score</div>
        </div>
        ${meters.map(m => `
          <div class="meter-card">
            <div class="meter-svg-wrap">${renderMeterSVG(m.value)}</div>
            <div class="meter-label">${escapeHtml(m.label)}</div>
          </div>`).join('')}
      </div>
    </div>`;
}

// ── Toast ─────────────────────────────────────────
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

// ── Nav ───────────────────────────────────────────
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });
}

function updateAdminNav() {
  const btn = document.getElementById('adminNavBtn');
  if (!btn) return;
  if (isAdminLoggedIn()) {
    btn.textContent = 'admin ·';
    btn.onclick = (e) => {
      e.preventDefault();
      adminLogout(); updateAdminNav();
      if (typeof onAdminStateChange === 'function') onAdminStateChange(false);
      showToast('Logged out.');
    };
  } else {
    btn.textContent = 'admin';
    btn.onclick = (e) => { e.preventDefault(); openLoginModal(); };
  }
}

// ── Login modal ───────────────────────────────────
function openLoginModal() {
  document.getElementById('loginModal')?.classList.add('open');
}
function closeLoginModal() {
  const m = document.getElementById('loginModal');
  if (!m) return;
  m.classList.remove('open');
  const a = document.getElementById('loginAlert');
  if (a) { a.className='alert'; a.textContent=''; }
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
}
function handleLoginSubmit(e) {
  e.preventDefault();
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value;
  const a = document.getElementById('loginAlert');
  if (adminLogin(u, p)) {
    closeLoginModal(); updateAdminNav();
    if (typeof onAdminStateChange === 'function') onAdminStateChange(true);
    showToast('Welcome back!');
  } else {
    a.className = 'alert error';
    a.textContent = 'Incorrect username or password.';
  }
}

// ── Init ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  updateAdminNav();
  document.getElementById('loginModal')?.addEventListener('click', e => { if (e.target.id==='loginModal') closeLoginModal(); });
  document.getElementById('loginForm')?.addEventListener('submit', handleLoginSubmit);

  // Mobile nav toggle
  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      toggle.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.textContent = '☰';
      });
    });
  }
});
