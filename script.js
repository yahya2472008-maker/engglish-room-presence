'use strict';

/* =====================================================
   PENGATURAN
===================================================== */

const CONFIG = {
    radiusMeters: 20,        // jarak maksimal siswa dari guru untuk Hadir / Terlambat
    lowAccuracyMode: true,    // true = tetap bisa dipakai walau GPS kurang akurat (laptop / dalam ruangan); radius efektif dilonggarkan otomatis
    toleranceCapMeters: 30,  // kelonggaran radius maksimal (mode seimbang). Radius paling besar = radiusMeters + ini
    studentMaxAccuracyMeters: 100, // siswa dengan akurasi GPS lebih buruk dari ini ditolak (saat lowAccuracyMode aktif)
    teacherMaxAccuracyMeters: 100, // lokasi guru dengan akurasi lebih buruk dari ini ditolak (35-100 m disimpan dengan peringatan)
    maxAccuracyMeters: 35,   // pembacaan GPS yang lebih buruk dari ini ditolak
    teacherPasswordHash: 'cc0c2bc0704f56a746faaab587fc142706e58e3d2526e9d570cd5980d7a28e73',   // hash kata sandi guru (kata sandinya sendiri tidak disimpan di sini)
    databaseUrl: 'https://english-room-4723f-default-rtdb.asia-southeast1.firebasedatabase.app',         // alamat Firebase Realtime Database. Kosong = data hanya disimpan di perangkat ini
    refreshSeconds: 10,
    codeLength: 6,           // panjang kode pribadi siswa
    idleLockSeconds: 120,    // layar siswa terkunci otomatis setelah tidak disentuh
    afterSubmitLockSeconds: 20, // dan terkunci lebih cepat setelah absen terkirim
    // Status yang wajib berada dalam radius dari guru. Izin dan Sakit tidak dicek jaraknya.
    // Ubah menjadi ['Hadir'] jika Terlambat juga tidak perlu dicek jarak.
    locationStatuses: ['Hadir', 'Terlambat']
};

const COUNTED_STATUS = ['Hadir', 'Terlambat'];   // status yang memakai 1 pertemuan
const ALL_STATUS = ['Hadir', 'Terlambat', 'Izin', 'Sakit'];
const needsLocation = (status) => CONFIG.locationStatuses.includes(status);
const listNames = (arr) => arr.length > 1 ? arr.slice(0, -1).join(', ') + ' atau ' + arr[arr.length - 1] : (arr[0] || '');
const STATUS_CLASS = {
    Hadir: 'status-present',
    Terlambat: 'status-late',
    Izin: 'status-permission',
    Sakit: 'status-sick'
};
const OFF_SCHEDULE = 'Di luar jadwal';

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const WEEK_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/* Salinan data.json. Dipakai kalau data.json tidak bisa dibaca
   (misalnya index.html dibuka langsung dari folder). */
const DEFAULT_DATA = {
    "packageSize": 4,
    "students": [
        {
            "name": "Harits",
            "packageSize": 4,
            "cycle": 1
        },
        {
            "name": "Vino",
            "packageSize": 4,
            "cycle": 1
        },
        {
            "name": "Ikram",
            "packageSize": 4,
            "cycle": 1
        },
        {
            "name": "Dzaki",
            "packageSize": 4,
            "cycle": 1
        },
        {
            "name": "Omar",
            "packageSize": 4,
            "cycle": 1
        },
        {
            "name": "Abdul",
            "packageSize": 4,
            "cycle": 1
        },
        {
            "name": "Rizki",
            "packageSize": 4,
            "cycle": 1
        },
        {
            "name": "Affan",
            "packageSize": 4,
            "cycle": 1
        },
        {
            "name": "Raisa",
            "packageSize": 4,
            "cycle": 1
        },
        {
            "name": "Fais",
            "packageSize": 4,
            "cycle": 1
        },
        {
            "name": "Satria",
            "packageSize": 4,
            "cycle": 1
        },
        {
            "name": "Wisnu",
            "packageSize": 4,
            "cycle": 1
        },
        {
            "name": "Ryan",
            "packageSize": 4,
            "cycle": 1
        },
        {
            "name": "Fadhil",
            "packageSize": 4,
            "cycle": 1
        },
        {
            "name": "Abdil",
            "packageSize": 4,
            "cycle": 1
        },
        {
            "name": "Mumtaz",
            "packageSize": 4,
            "cycle": 1
        },
        {
            "name": "Nabil",
            "packageSize": 4,
            "cycle": 1
        },
        {
            "name": "Rizky",
            "packageSize": 4,
            "cycle": 1
        },
        {
            "name": "Rantizi",
            "packageSize": 4,
            "cycle": 1
        },
        {
            "name": "R Fadhil",
            "packageSize": 4,
            "cycle": 1
        },
        {
            "name": "Zul",
            "packageSize": 4,
            "cycle": 1
        },
        {
            "name": "Usman",
            "packageSize": 4,
            "cycle": 1
        }
    ],
    "schedule": {
        "Senin": {
            "Sore": [
                "Harits",
                "Vino",
                "Ikram",
                "Dzaki",
                "Omar"
            ],
            "Maghrib": [
                "Abdul",
                "Rizki"
            ]
        },
        "Selasa": {
            "Sore": [
                "Affan",
                "Raisa"
            ],
            "Maghrib": [
                "Fais",
                "Satria",
                "Wisnu",
                "Ryan"
            ]
        },
        "Rabu": {
            "Sore": [
                "Fadhil",
                "Dzaki",
                "Abdil",
                "Mumtaz"
            ],
            "Maghrib": [
                "Nabil",
                "Ryan"
            ]
        },
        "Kamis": {
            "Sore": [
                "Fadhil",
                "Harits",
                "Vino",
                "Ikram",
                "Omar"
            ],
            "Maghrib": [
                "Fais",
                "Satria",
                "Wisnu"
            ]
        },
        "Jumat": {
            "Sore": [
                "Abdul",
                "Abdil",
                "Rizky",
                "Mumtaz"
            ],
            "Maghrib": [
                "Rantizi",
                "Nabil",
                "R Fadhil"
            ]
        },
        "Sabtu": {
            "Full Private": [
                "Zul",
                "Usman"
            ]
        },
        "Minggu": {
            "Full Private": []
        }
    },
    "teacherLocation": null
};


/* =====================================================
   UTILITAS
===================================================== */

const $ = (id) => document.getElementById(id);

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hm = (ts) => { const d = new Date(ts); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const longDate = (d) => `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
const parseKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const shortDate = (k) => { const d = parseKey(k); return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`; };

// Kunci aman untuk database: huruf kecil, angka, dan tanda hubung.
function slug(s) {
    const t = String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return t || 'x' + Array.from(String(s)).map((c) => c.charCodeAt(0).toString(36)).join('');
}

function today() {
    const d = new Date();
    return { d, day: DAY_NAMES[d.getDay()], key: ymd(d) };
}

function distanceMeters(a, b) {
    const R = 6371000;
    const rad = (x) => (x * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat);
    const dLng = rad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
}

/* =====================================================
   KODE SISWA
   Database hanya menyimpan hash kode, bukan kodenya.
   Kode asli hanya ada di perangkat guru yang membuatnya.
===================================================== */

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // tanpa 0/O dan 1/I

function sha256(str) {
    const K = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];
    const bytes = Array.from(new TextEncoder().encode(str));
    const bitLen = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    for (let i = 7; i >= 0; i--) bytes.push(i > 3 ? 0 : (bitLen >>> (8 * i)) & 0xff);

    let h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const rotr = (x, n) => (x >>> n) | (x << (32 - n));

    for (let off = 0; off < bytes.length; off += 64) {
        const w = new Array(64);
        for (let i = 0; i < 16; i++) {
            w[i] = (bytes[off + 4 * i] << 24) | (bytes[off + 4 * i + 1] << 16) | (bytes[off + 4 * i + 2] << 8) | bytes[off + 4 * i + 3];
        }
        for (let i = 16; i < 64; i++) {
            const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
            const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
            w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
        }
        let [a, b, c, d, e, f, g, hh] = h;
        for (let i = 0; i < 64; i++) {
            const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
            const ch = (e & f) ^ (~e & g);
            const t1 = (hh + S1 + ch + K[i] + w[i]) | 0;
            const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
            const maj = (a & b) ^ (a & c) ^ (b & c);
            const t2 = (S0 + maj) | 0;
            hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
        }
        h = [(h[0] + a) | 0, (h[1] + b) | 0, (h[2] + c) | 0, (h[3] + d) | 0,
             (h[4] + e) | 0, (h[5] + f) | 0, (h[6] + g) | 0, (h[7] + hh) | 0];
    }
    return h.map((x) => (x >>> 0).toString(16).padStart(8, '0')).join('');
}

const normalizeCode = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const codeHash = (key, code) => sha256(`english-room:${key}:${normalizeCode(code)}`);

function randomCode() {
    const n = CONFIG.codeLength;
    const buf = new Uint32Array(n);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(buf);
    else for (let i = 0; i < n; i++) buf[i] = Math.floor(Math.random() * 4294967296);
    let out = '';
    for (let i = 0; i < n; i++) out += CODE_ALPHABET[buf[i] % CODE_ALPHABET.length];
    return out;
}


let toastTimer = null;
function toast(message) {
    const el = $('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

// type: 'success' | 'error' | 'info' | '' (kosongkan)
function setMessage(id, type, text) {
    const el = $(id);
    if (!el) return;
    el.className = type ? `${type}-message` : '';
    el.textContent = text || '';
}


/* =====================================================
   PENYIMPANAN
   Aman dipakai saat localStorage diblokir (pratinjau, mode privat).
===================================================== */

const memStore = {};
const makeStore = (kind) => ({
    get(k) { try { return window[kind].getItem(k); } catch (e) { return memStore[kind + k] ?? null; } },
    set(k, v) { try { window[kind].setItem(k, v); } catch (e) { memStore[kind + k] = v; } },
    del(k) { try { window[kind].removeItem(k); } catch (e) { delete memStore[kind + k]; } }
});
const local = makeStore('localStorage');
const session = makeStore('sessionStorage');

// Kode asli yang dibuat di perangkat ini. Database hanya menyimpan hash-nya.
const codeStore = {
    all() { try { return JSON.parse(local.get('er:codes') || '{}') || {}; } catch (e) { return {}; } },
    set(map) { local.set('er:codes', JSON.stringify(map)); }
};

function knownCode(st) {
    const c = codeStore.all()[st.key];
    return c && st.codeHash && codeHash(st.key, c) === st.codeHash ? c : '';
}

function studentRecord(st, patch) {
    const rec = { name: st.name, packageSize: st.packageSize, cycle: st.cycle, settled: st.settled || 0, order: st.order };
    if (st.codeHash) rec.codeHash = st.codeHash;
    return Object.assign(rec, patch || {});
}

function setPath(obj, parts, value) {
    let o = obj;
    parts.slice(0, -1).forEach((p) => {
        if (!o[p] || typeof o[p] !== 'object') o[p] = {};
        o = o[p];
    });
    const last = parts[parts.length - 1];
    if (value === null) delete o[last];
    else o[last] = value;
}

/* Bentuk data di database:
   students/{slug}      -> { name, packageSize, cycle, settled, order }
   removed/{slug}       -> true  (siswa dari data.json yang sudah dihapus)
   teacherLocation      -> { lat, lng, acc, at, date }
   attendance/{tgl_slug}-> { name, date, status, session, at, dist }   */
const db = {
    base() { return (CONFIG.databaseUrl || '').trim().replace(/\/+$/, ''); },
    remote() { return !!this.base(); },

    async read() {
        if (this.remote()) {
            const r = await fetch(`${this.base()}/.json`, { cache: 'no-store' });
            if (!r.ok) throw new Error(`Database tidak bisa dibaca (${r.status}).`);
            return (await r.json()) || {};
        }
        try { return JSON.parse(local.get('er:root') || '{}') || {}; } catch (e) { return {}; }
    },

    async write(path, value) {
        if (this.remote()) {
            const r = await fetch(`${this.base()}/${path}.json`, { method: 'PUT', body: JSON.stringify(value) });
            if (!r.ok) throw new Error(`Database menolak penyimpanan (${r.status}).`);
            return;
        }
        const root = await this.read();
        setPath(root, path.split('/'), value);
        local.set('er:root', JSON.stringify(root));
    }
};


/* =====================================================
   STATE
===================================================== */

let SEED = null;        // isi data.json
let S = { students: {}, teacherLocation: null, attendance: {}, counts: {} };
let lastSnapshot = '';

const ui = {
    page: 'student',
    teacherIn: false,
    selected: '',        // kunci (slug) siswa yang dipilih
    status: '',          // status yang dipilih siswa
    loc: { state: 'idle' },
    search: '',
    viewDate: ymd(new Date()),   // tanggal pada tabel absensi guru
    armed: null,         // tombol yang menunggu konfirmasi ketuk kedua
    offline: false
};

let armTimer = null;
let locToken = 0;

async function loadSeed() {
    try {
        const r = await fetch('data.json', { cache: 'no-store' });
        if (!r.ok) throw new Error('data.json tidak ditemukan');
        const d = await r.json();
        if (Array.isArray(d.students) && d.schedule && typeof d.schedule === 'object') return d;
    } catch (e) { /* pakai salinan bawaan */ }
    return DEFAULT_DATA;
}

function buildState(root) {
    const removed = root.removed || {};
    const saved = root.students || {};
    const students = {};
    const defaultSize = Number(SEED.packageSize) === 8 ? 8 : 4;

    SEED.students.forEach((s, i) => {
        const key = slug(s.name);
        if (removed[key]) return;
        students[key] = {
            name: s.name,
            packageSize: Number(s.packageSize) === 8 ? 8 : (Number(s.packageSize) === 4 ? 4 : defaultSize),
            cycle: Number(s.cycle) || 1,
            settled: 0,
            order: i
        };
    });

    Object.entries(saved).forEach(([key, v]) => {
        if (!v || !v.name) return;
        const merged = Object.assign({ cycle: 1, settled: 0, packageSize: defaultSize, order: 1000 }, students[key] || {}, v);
        merged.packageSize = Number(merged.packageSize) === 8 ? 8 : 4;
        students[key] = merged;
    });

    const attendance = root.attendance || {};
    const counts = {};
    Object.values(attendance).forEach((r) => {
        if (r && COUNTED_STATUS.includes(r.status)) {
            const k = slug(r.name);
            counts[k] = (counts[k] || 0) + 1;
        }
    });

    S = { students, teacherLocation: root.teacherLocation || null, attendance, counts, removed,
          teacherHash: (root.teacherAuth && typeof root.teacherAuth.hash === 'string') ? root.teacherAuth.hash : '' };
}

const studentList = () => Object.entries(S.students)
    .map(([key, st]) => ({ key, ...st }))
    .sort((a, b) => (a.order - b.order) || a.name.localeCompare(b.name));

// Pertemuan terpakai = jumlah Hadir/Terlambat dikurangi pertemuan yang sudah dilunasi (paket yang di-reset).
// Kelebihan pertemuan otomatis terbawa ke paket berikutnya.
function pkgInfo(st) {
    const total = S.counts[slug(st.name)] || 0;
    const used = Math.max(0, total - (st.settled || 0));
    const size = st.packageSize;
    return {
        size,
        used,
        shown: Math.min(used, size),
        extra: Math.max(0, used - size),
        left: Math.max(0, size - used),
        due: used >= size,
        pct: Math.min(100, Math.round((used / size) * 100)),
        leftPct: Math.round((Math.max(0, size - used) / size) * 100)
    };
}

function activeTeacherLoc() {
    const t = S.teacherLocation;
    return t && t.date === today().key ? t : null;
}

function weekOf(name) {
    const k = slug(name);
    const out = [];
    WEEK_ORDER.forEach((day) => {
        Object.entries(SEED.schedule[day] || {}).forEach(([sess, list]) => {
            if ((list || []).some((n) => slug(n) === k)) out.push({ day, session: sess });
        });
    });
    return out;
}

const sessionsToday = (name, day) => weekOf(name).filter((x) => x.day === day).map((x) => x.session);
const recKey = (date, name) => `${date}_${slug(name)}`;
const todayRecord = (name) => S.attendance[recKey(today().key, name)] || null;


/* =====================================================
   MUAT ULANG DATA
===================================================== */

function renderAll() {
    renderHeader();
    renderStudent();
    if (ui.page === 'teacher') renderTeacher();
}

async function refresh(force) {
    let root;
    try {
        root = await db.read();
    } catch (e) {
        if (!ui.offline) {
            ui.offline = true;
            toast('Tidak bisa terhubung ke database. Data terakhir tetap ditampilkan.');
        }
        return;
    }
    if (ui.offline) { ui.offline = false; toast('Terhubung kembali.'); }
    const snap = JSON.stringify(root);
    if (snap === lastSnapshot && !force) return;
    lastSnapshot = snap;
    buildState(root);
    renderAll();
}

// Tulis ke database lalu muat ulang. Mengembalikan true jika berhasil.
async function save(writes) {
    try {
        for (const [path, value] of writes) await db.write(path, value);
    } catch (e) {
        toast(e.message || 'Gagal menyimpan data.');
        return false;
    }
    await refresh(true);
    return true;
}


/* =====================================================
   LOKASI
===================================================== */

function geoMessage(e) {
    if (e && e.code === 1 && window.isSecureContext === false) {
        return 'Lokasi hanya bisa dipakai lewat alamat HTTPS atau localhost.';
    }
    switch (e && e.code) {
        case 1: return 'Izin lokasi ditolak. Izinkan lokasi untuk situs ini di pengaturan browser, lalu coba lagi.';
        case 2: return 'Lokasi tidak tersedia. Nyalakan GPS lalu coba lagi.';
        case 3: return 'GPS terlalu lama merespons. Coba lagi di tempat terbuka.';
        default: return (e && e.message) || 'Lokasi tidak bisa dibaca. Coba lagi.';
    }
}

// Ambil pembacaan GPS paling akurat. Siswa: maks 7 detik. Guru: lebih lama agar GPS sempat "mengunci".
function getPosition(opts) {
    const o = Object.assign({ ms: 7000, goodAcc: 10, onProgress: null }, opts || {});
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Browser ini tidak mendukung lokasi.'));
            return;
        }
        let best = null;
        let done = false;
        let watchId = null;
        let timer = null;

        const finish = (err) => {
            if (done) return;
            done = true;
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
            clearTimeout(timer);
            if (best) resolve(best);
            else reject(new Error(geoMessage(err || { code: 3 })));
        };

        watchId = navigator.geolocation.watchPosition(
            (p) => {
                if (!best || p.coords.accuracy < best.coords.accuracy) best = p;
                if (o.onProgress) o.onProgress(best.coords.accuracy);
                if (best.coords.accuracy <= o.goodAcc) finish();
            },
            (e) => finish(e),
            { enableHighAccuracy: true, maximumAge: 0, timeout: Math.max(15000, o.ms) }
        );
        timer = setTimeout(() => finish(), o.ms);
    });
}

// Radius efektif: radius normal + kelonggaran bila GPS guru dan/atau siswa kurang akurat.
function effectiveRadius(tlAcc, acc) {
    const R = CONFIG.radiusMeters;
    if (!CONFIG.lowAccuracyMode) return R;
    const extra = Math.max(0, (Number(tlAcc) || 0) - 20) + Math.max(0, (Number(acc) || 0) - 20);
    return Math.round(R + Math.min(CONFIG.toleranceCapMeters, extra));
}

function accuracyLimit() {
    return CONFIG.lowAccuracyMode ? CONFIG.studentMaxAccuracyMeters : CONFIG.maxAccuracyMeters;
}

// Bandingkan posisi siswa dengan lokasi guru. Melempar Error berisi pesan untuk siswa.
async function measureToTeacher() {
    const tl = activeTeacherLoc();
    if (!tl) throw new Error('Guru belum mengatur lokasi hari ini.');
    const pos = await getPosition();
    const acc = pos.coords.accuracy;
    const dist = distanceMeters(
        { lat: pos.coords.latitude, lng: pos.coords.longitude },
        { lat: tl.lat, lng: tl.lng }
    );
    return { dist, acc, radius: effectiveRadius(tl.acc, acc) };
}


/* =====================================================
   NAVIGASI
===================================================== */

function showPage(page) {
    ui.page = page;
    $('studentPage').classList.toggle('hidden', page !== 'student');
    $('teacherPage').classList.toggle('hidden', page !== 'teacher');
    $('studentNav').classList.toggle('active', page === 'student');
    $('teacherNav').classList.toggle('active', page === 'teacher');
    if (page === 'teacher') renderTeacher();
}


/* =====================================================
   TAMPILAN SISWA
===================================================== */

function renderHeader() {
    const t = today();
    $('studentDay').textContent = t.day;
    $('studentDate').textContent = longDate(t.d);
    $('teacherDay').textContent = t.day;
    $('teacherDate').textContent = longDate(t.d);
}

function renderTodaySchedule() {
    const t = today();
    const entries = Object.entries(SEED.schedule[t.day] || {});
    if (!entries.length) {
        $('todaySchedule').innerHTML = `<div class="empty-state">Tidak ada jadwal hari ini (${esc(t.day)}).</div>`;
        return;
    }
    $('todaySchedule').innerHTML = entries.map(([sess, list]) => {
        const names = (list || []).filter((n) => S.students[slug(n)]);
        const chips = names.length
            ? names.map((n) => `<span class="schedule-student">${esc(n)}</span>`).join('')
            : '<small class="muted-note">Belum ada siswa terjadwal</small>';
        return `<div class="schedule-item">
            <div class="schedule-time">${esc(t.day)} · ${esc(sess)}</div>
            <div class="schedule-students">${chips}</div>
        </div>`;
    }).join('');
}

function renderStudent() {
    renderTodaySchedule();

    if (ui.selected && !S.students[ui.selected]) ui.selected = '';
    const st = ui.selected ? S.students[ui.selected] : null;
    $('codeEntry').classList.toggle('hidden', !!st);
    ['studentInfo', 'studentProgressCard', 'attendanceCard', 'weeklyScheduleCard', 'historyCard']
        .forEach((id) => $(id).classList.toggle('hidden', !st));
    if (!st) return;

    const info = pkgInfo(st);
    const week = weekOf(st.name);
    const t = today();

    // Identitas
    $('studentAvatar').textContent = st.name.charAt(0).toUpperCase();
    $('selectedStudentName').textContent = st.name;
    $('selectedStudentPackage').textContent = `Paket ${st.packageSize} Pertemuan · paket ke-${st.cycle}`;
    $('selectedStudentSchedule').textContent = 'Jadwal: ' +
        (week.length ? week.map((w) => `${w.day} ${w.session}`).join(', ') : '-');

    // Progress paket
    $('studentProgressText').textContent = `${info.left} / ${info.size}`;
    $('studentProgressNumber').textContent = info.used;
    const bar = $('studentProgressBar');
    bar.style.width = `${info.leftPct}%`;
    bar.classList.toggle('due', info.left <= 1);
    const ps = $('packageStatus');
    ps.classList.toggle('is-due', info.left <= 1);
    if (info.due) {
        ps.textContent = 'Pertemuan habis. Hubungi guru untuk pembayaran dan reset paket.' +
            (info.extra ? ` ${info.extra} pertemuan di luar paket akan terbawa ke paket berikutnya.` : '');
    } else if (info.left === 1) {
        ps.textContent = 'Tinggal 1 pertemuan lagi. Hubungi guru untuk paket berikutnya.';
    } else {
        ps.textContent = `Paket aktif · sisa ${info.left} pertemuan`;
    }

    // Absensi
    const mine = sessionsToday(st.name, t.day);
    $('studentScheduleToday').textContent = mine.length
        ? `Jadwal hari ini: ${mine.join(', ')}`
        : 'Jadwal hari ini: tidak ada. Absen akan dicatat sebagai di luar jadwal.';
    renderStatusButtons();
    renderLocationBox();
    renderAttendanceNote();

    // Jadwal mingguan
    $('studentWeeklySchedule').innerHTML = week.length
        ? week.map((w) => `<div class="weekly-schedule-item${w.day === t.day ? ' today-schedule' : ''}">
            <strong>${esc(w.day)}</strong><span>${esc(w.session)}</span>${w.day === t.day ? '<small>Hari ini</small>' : ''}
        </div>`).join('')
        : '<div class="empty-state">Belum ada jadwal untuk siswa ini.</div>';

    // Riwayat
    const history = Object.values(S.attendance)
        .filter((r) => r && slug(r.name) === ui.selected)
        .sort((a, b) => b.date.localeCompare(a.date) || (b.at - a.at))
        .slice(0, 12);
    $('studentHistory').innerHTML = history.length
        ? `<div class="history-list">${history.map((r) => `<div class="history-item">
            <div>
                <strong><span class="status-badge ${STATUS_CLASS[r.status] || 'status-empty'}">${esc(r.status)}</span></strong>
                <small>${esc(longDate(parseKey(r.date)))} · ${esc(hm(r.at))}</small>
                ${r.note ? `<em class="hist-note">Keterangan: ${esc(r.note)}</em>` : ''}
                ${r.tnote ? `<em class="hist-note teacher">Catatan guru: ${esc(r.tnote)}</em>` : ''}
            </div>
            <span>${esc(r.session)}${r.dist != null ? ` · ${Math.round(r.dist)} m` : ''}</span>
        </div>`).join('')}</div>`
        : '<div class="empty-state">Belum ada riwayat absensi.</div>';
}

function renderStatusButtons() {
    document.querySelectorAll('.attendance-option').forEach((b) => {
        const status = b.dataset.status;
        b.classList.toggle('selected', status === ui.status);
        const hint = b.querySelector('small');
        if (hint) {
            const rule = needsLocation(status) ? `Harus dalam ${CONFIG.radiusMeters} m dari guru` : 'Tanpa cek jarak';
            const cost = COUNTED_STATUS.includes(status) ? 'Mengurangi 1 pertemuan' : 'Tidak mengurangi pertemuan';
            hint.innerHTML = `${esc(rule)}<br>${esc(cost)}`;
        }
    });
}

function renderAttendanceNote() {
    const st = ui.selected ? S.students[ui.selected] : null;
    const rec = st ? todayRecord(st.name) : null;
    const btn = $('submitAttendance');
    if (!rec) {
        btn.disabled = false;
        if ($('attendanceMessage').className === 'info-message') setMessage('attendanceMessage', '', '');
        return;
    }
    const locked = COUNTED_STATUS.includes(rec.status);
    btn.disabled = locked;
    setMessage('attendanceMessage', 'info',
        locked
            ? `Kamu sudah absen hari ini: ${rec.status} pukul ${hm(rec.at)}.`
            : `Hari ini tercatat ${rec.status}. Kalau ternyata hadir, pilih Hadir atau Terlambat lalu kirim lagi.`);
}

function renderLocationBox() {
    const box = $('locationStudentInfo');
    const recheck = '<button type="button" class="secondary-btn" data-act="recheck">Cek ulang</button>';
    const R = CONFIG.radiusMeters;
    const need = needsLocation(ui.status);
    const freeNames = ALL_STATUS.filter((x) => !needsLocation(x));
    let html;

    if (!ui.status) {
        html = `<div>Pilih status untuk memulai. ${esc(listNames(CONFIG.locationStatuses))} harus dalam ${R} m dari guru. ${esc(listNames(freeNames))} tanpa cek jarak.</div>`;
    } else if (!need) {
        html = `<div>${esc(ui.status)} tidak memerlukan lokasi. Jarak ke guru tidak dicek.</div>`;
    } else if (!activeTeacherLoc()) {
        html = `<div><span class="location-danger">✕ Lokasi guru belum diatur hari ini.</span>${esc(listNames(CONFIG.locationStatuses))} baru bisa dikirim setelah guru mengatur lokasi.</div>${recheck}`;
    } else {
        const l = ui.loc;
        if (l.state === 'checking') {
            html = '<div>Memeriksa lokasi...</div>';
        } else if (l.state === 'ok') {
            html = `<div><span class="location-ok">✓ Dalam jangkauan</span>${Math.round(l.dist)} m dari guru (maks. ${l.radius || R} m${(l.radius || R) > R ? ', GPS kurang akurat jadi dilonggarkan' : ''})</div>${recheck}`;
        } else if (l.state === 'far') {
            html = `<div><span class="location-danger">✕ Terlalu jauh</span>${Math.round(l.dist)} m dari guru. Maksimal ${l.radius || R} m.</div>${recheck}`;
        } else if (l.state === 'weak') {
            html = `<div><span class="location-danger">✕ Sinyal GPS lemah</span>Akurasi ±${Math.round(l.acc)} m. Coba di tempat terbuka.</div>${recheck}`;
        } else if (l.state === 'error') {
            html = `<div><span class="location-danger">✕ Lokasi gagal</span>${esc(l.msg)}</div>${recheck}`;
        } else {
            html = `<div>Lokasi belum diperiksa.</div>${recheck}`;
        }
    }
    box.innerHTML = html;
}

async function checkLocation() {
    const my = ++locToken;
    if (!activeTeacherLoc()) { ui.loc = { state: 'idle' }; renderLocationBox(); return; }
    ui.loc = { state: 'checking' };
    renderLocationBox();
    try {
        const { dist, acc, radius } = await measureToTeacher();
        if (my !== locToken) return;
        if (acc > accuracyLimit()) ui.loc = { state: 'weak', acc };
        else if (dist > radius) ui.loc = { state: 'far', dist, acc, radius };
        else ui.loc = { state: 'ok', dist, acc, radius };
    } catch (e) {
        if (my !== locToken) return;
        ui.loc = { state: 'error', msg: e.message };
    }
    renderLocationBox();
}

const codeGuard = { fails: 0, lockedUntil: 0 };
let lockTimer = null;

function armLock(seconds) {
    clearTimeout(lockTimer);
    if (!ui.selected) return;
    lockTimer = setTimeout(
        () => lockStudent('Layar dikunci otomatis. Masukkan kode lagi untuk melanjutkan.'),
        seconds * 1000
    );
}

function lockStudent(message) {
    clearTimeout(lockTimer);
    ui.selected = '';
    ui.status = '';
    ui.loc = { state: 'idle' };
    locToken++;
    $('studentNote').value = '';
    $('studentCode').value = '';
    setMessage('attendanceMessage', '', '');
    setMessage('studentCodeMessage', message ? 'info' : '', message || '');
    renderStudent();
}

function findByCode(code) {
    return studentList().find((s) => s.codeHash && s.codeHash === codeHash(s.key, code));
}

async function verifyCode() {
    const now = Date.now();
    if (now < codeGuard.lockedUntil) {
        const sec = Math.ceil((codeGuard.lockedUntil - now) / 1000);
        setMessage('studentCodeMessage', 'error', `Terlalu banyak percobaan. Coba lagi dalam ${sec} detik.`);
        return;
    }
    const code = normalizeCode($('studentCode').value);
    if (code.length !== CONFIG.codeLength) {
        setMessage('studentCodeMessage', 'error', `Kode terdiri dari ${CONFIG.codeLength} huruf atau angka.`);
        return;
    }

    let match = findByCode(code);
    if (!match) {
        await refresh(true);          // mungkin kode baru dibuat guru
        match = findByCode(code);
    }
    if (!match) {
        codeGuard.fails += 1;
        if (codeGuard.fails >= 5) {
            codeGuard.fails = 0;
            codeGuard.lockedUntil = Date.now() + 60000;
            setMessage('studentCodeMessage', 'error', 'Terlalu banyak kode salah. Tunggu 1 menit lalu coba lagi.');
        } else {
            setMessage('studentCodeMessage', 'error', 'Kode tidak dikenali. Periksa lagi atau tanya guru.');
        }
        return;
    }

    codeGuard.fails = 0;
    ui.selected = match.key;
    ui.status = '';
    ui.loc = { state: 'idle' };
    locToken++;
    $('studentCode').value = '';
    $('studentNote').value = '';
    setMessage('studentCodeMessage', '', '');
    setMessage('attendanceMessage', '', '');
    armLock(CONFIG.idleLockSeconds);
    renderStudent();
}

function onStatusClick(status) {
    ui.status = status;
    if (needsLocation(status) && ui.loc.state !== 'checking' && ui.loc.state !== 'ok') checkLocation();
    renderStatusButtons();
    renderLocationBox();
}

async function submitAttendance() {
    const st = ui.selected ? S.students[ui.selected] : null;
    if (!st) { setMessage('attendanceMessage', 'error', 'Masukkan kode kamu dulu.'); return; }
    if (!ui.status) { setMessage('attendanceMessage', 'error', 'Pilih status kehadiran dulu.'); return; }

    const btn = $('submitAttendance');
    btn.disabled = true;
    try {
        await refresh(true);
        if (ui.offline) throw new Error('Tidak bisa terhubung ke database. Coba lagi sebentar lagi.');

        const t = today();
        const key = recKey(t.key, st.name);
        const existing = S.attendance[key];
        if (existing && COUNTED_STATUS.includes(existing.status)) {
            throw new Error(`Kamu sudah absen hari ini: ${existing.status} pukul ${hm(existing.at)}.`);
        }

        let dist = null;
        if (needsLocation(ui.status)) {
            setMessage('attendanceMessage', 'info', 'Memeriksa lokasi...');
            const m = await measureToTeacher();
            if (m.acc > accuracyLimit()) {
                throw new Error(`Sinyal GPS kurang akurat (±${Math.round(m.acc)} m). Coba lagi di tempat terbuka atau dekat jendela.`);
            }
            if (m.dist > m.radius) {
                throw new Error(`Kamu ${Math.round(m.dist)} m dari guru. Maksimal ${m.radius} m, jadi belum bisa absen ${ui.status}.`);
            }
            dist = Math.round(m.dist * 10) / 10;
        }

        const rec = {
            name: st.name,
            date: t.key,
            status: ui.status,
            session: sessionsToday(st.name, t.day)[0] || OFF_SCHEDULE,
            at: Date.now(),
            dist
        };
        const note = $('studentNote').value.trim().replace(/\s+/g, ' ').slice(0, 160);
        if (note) rec.note = note;
        if (existing && existing.tnote) rec.tnote = existing.tnote;
        if (!(await save([[`attendance/${key}`, rec]]))) throw new Error('Absensi belum tersimpan. Coba lagi.');

        const info = pkgInfo(S.students[ui.selected] || st);
        let text = `Absensi ${rec.status} tercatat pukul ${hm(rec.at)}.`;
        if (dist != null) text += ` Kamu ${Math.round(dist)} m dari guru.`;
        if (COUNTED_STATUS.includes(rec.status)) {
            text += info.due
                ? ' Pertemuan kamu sudah habis, hubungi guru.'
                : ` Pertemuan berkurang 1, sisa ${info.left} dari ${info.size}.`;
        }
        ui.status = '';
        ui.loc = { state: 'idle' };
        $('studentNote').value = '';
        renderStudent();
        setMessage('attendanceMessage', 'success', text);
        toast('Absensi tersimpan');
        armLock(CONFIG.afterSubmitLockSeconds);
    } catch (e) {
        setMessage('attendanceMessage', 'error', e.message);
    } finally {
        const cur = ui.selected ? S.students[ui.selected] : null;
        const rec = cur ? todayRecord(cur.name) : null;
        btn.disabled = !!(rec && COUNTED_STATUS.includes(rec.status));
    }
}


/* =====================================================
   TAMPILAN GURU
===================================================== */

function renderTeacher() {
    $('teacherLogin').classList.toggle('hidden', ui.teacherIn);
    $('teacherDashboard').classList.toggle('hidden', !ui.teacherIn);
    if (!ui.teacherIn) return;

    renderStats();
    renderTeacherLocation();
    renderAttendanceTable();
    renderStudentTable();
    $('resetPackageBtn').textContent = ui.armed === 'all' ? 'Yakin? Ketuk lagi untuk reset' : 'Reset Paket Siswa';
}

function renderStats() {
    const t = today();
    const recs = Object.values(S.attendance).filter((r) => r && r.date === t.key);
    const list = studentList();
    $('totalStudents').textContent = list.length;
    $('presentStudents').textContent = recs.filter((r) => r.status === 'Hadir').length;
    $('lateStudents').textContent = recs.filter((r) => r.status === 'Terlambat').length;
    $('absentStudents').textContent = list.filter((s) =>
        sessionsToday(s.name, t.day).length && !todayRecord(s.name)).length;
}

function renderTeacherLocation() {
    const el = $('teacherLocationStatus');
    const tl = S.teacherLocation;
    if (!tl) {
        el.textContent = 'Lokasi guru belum diatur.';
    } else if (tl.date !== today().key) {
        el.innerHTML = `<span class="location-danger">✕ Lokasi sudah kedaluwarsa</span>Terakhir diatur ${esc(shortDate(tl.date))}. Atur ulang untuk hari ini.`;
    } else {
        if (tl.acc > CONFIG.maxAccuracyMeters) {
            el.innerHTML = `<span class="location-danger">⚠ Lokasi aktif, akurasi rendah</span>Diatur pukul ${esc(hm(tl.at))}, akurasi ±${esc(tl.acc)} m. ${CONFIG.lowAccuracyMode ? `Radius absen otomatis dilonggarkan menjadi ${effectiveRadius(tl.acc, 0)} m.` : `Radius tetap ${CONFIG.radiusMeters} m (mode ketat), jadi siswa yang dekat pun bisa tertolak.`} Untuk hasil paling tepat, atur ulang dari HP dengan GPS menyala di tempat terbuka.`;
        } else {
            el.innerHTML = `<span class="location-ok">✓ Lokasi aktif</span>Diatur pukul ${esc(hm(tl.at))}, akurasi ±${esc(tl.acc)} m. Radius absen ${CONFIG.radiusMeters} m.`;
        }
    }
}

function matchesSearch(name) {
    const q = ui.search.trim().toLowerCase();
    return !q || name.toLowerCase().includes(q);
}

function renderAttendanceTable() {
    const date = ui.viewDate;
    const d = parseKey(date);
    const day = DAY_NAMES[d.getDay()];
    const sessionOrder = Object.keys(SEED.schedule[day] || {});
    $('attendanceTableDate').textContent = longDate(d) + (date === today().key ? ' · hari ini' : '');
    $('attendanceDateInput').value = date;

    const rows = studentList()
        .map((s) => ({
            s,
            sess: sessionsToday(s.name, day),
            rec: S.attendance[recKey(date, s.name)] || null
        }))
        .filter((r) => (r.sess.length || r.rec) && matchesSearch(r.s.name))
        .sort((a, b) => {
            const ia = a.sess.length ? sessionOrder.indexOf(a.sess[0]) : 99;
            const ib = b.sess.length ? sessionOrder.indexOf(b.sess[0]) : 99;
            return (ia - ib) || (a.s.order - b.s.order);
        });

    $('attendanceTableBody').innerHTML = rows.length
        ? rows.map((r, i) => {
            const label = r.sess.length ? r.sess.join(', ') : OFF_SCHEDULE;
            const badge = r.rec
                ? `<span class="status-badge ${STATUS_CLASS[r.rec.status] || 'status-empty'}">${esc(r.rec.status)}</span>`
                : '<span class="status-badge status-empty">Belum absen</span>';
            const notes = [];
            if (r.rec && r.rec.note) notes.push(`<span class="note-line"><b>Siswa</b>${esc(r.rec.note)}</span>`);
            if (r.rec && r.rec.tnote) notes.push(`<span class="note-line"><b>Guru</b>${esc(r.rec.tnote)}</span>`);
            const where = !r.rec ? '-'
                : r.rec.dist != null ? `${Math.round(r.rec.dist)} m dari guru`
                : r.rec.by === 'guru' ? 'Dicatat guru' : '-';
            const action = r.rec
                ? `<button type="button" class="small-btn" data-act="edit" data-key="${esc(r.s.key)}">Edit</button>`
                : `<button type="button" class="small-btn accent" data-act="edit" data-key="${esc(r.s.key)}">Hadirkan</button>`;
            return `<tr>
                <td>${i + 1}</td>
                <td><strong>${esc(r.s.name)}</strong></td>
                <td>${esc(label)}</td>
                <td>${badge}</td>
                <td>${r.rec ? esc(hm(r.rec.at)) : '-'}</td>
                <td>${esc(where)}</td>
                <td class="note-cell">${notes.join('') || '-'}</td>
                <td class="cell-actions">${action}</td>
            </tr>`;
        }).join('')
        : `<tr><td colspan="8"><div class="empty-state">${ui.search ? 'Tidak ada siswa yang cocok.' : 'Tidak ada siswa terjadwal pada tanggal ini.'}</div></td></tr>`;
}

function renderStudentTable() {
    const rows = studentList().filter((s) => matchesSearch(s.name));
    $('studentTableBody').innerHTML = rows.length
        ? rows.map((s, i) => {
            const info = pkgInfo(s);
            const week = weekOf(s.name);
            const sched = week.length
                ? week.map((w) => `<div class="student-schedule-row">${esc(w.day)}<span>|</span>${esc(w.session)}</div>`).join('')
                : '<div class="student-schedule-row muted">Belum ada jadwal</div>';
            const resetLabel = ui.armed === `reset:${s.key}` ? 'Yakin?' : 'Reset';
            const delLabel = ui.armed === `delete:${s.key}` ? 'Yakin?' : 'Hapus';
            const known = knownCode(s);
            const codeLabel = ui.armed === `code:${s.key}` ? 'Yakin?' : (s.codeHash ? 'Kode baru' : 'Buat kode');
            return `<tr>
                <td>${i + 1}</td>
                <td><strong>${esc(s.name)}</strong><span class="table-subtext">Paket ke-${s.cycle}</span></td>
                <td><div class="schedule-cell">${sched}</div></td>
                <td>
                    <select class="package-select" data-act="size" data-key="${esc(s.key)}">
                        <option value="4"${s.packageSize === 4 ? ' selected' : ''}>4 Pertemuan</option>
                        <option value="8"${s.packageSize === 8 ? ' selected' : ''}>8 Pertemuan</option>
                    </select>
                </td>
                <td>
                    <div class="table-progress">
                        <div class="mini-progress"><div class="${info.left <= 1 ? 'due' : ''}" style="width:${info.leftPct}%"></div></div>
                        <span>${info.left}/${info.size}</span>
                    </div>
                </td>
                <td>${info.due ? '<span class="status-badge status-late">Habis</span>' : '<span class="status-badge status-present">Aktif</span>'}${info.extra ? `<span class="table-subtext">+${info.extra} terbawa</span>` : ''}</td>
                <td>
                    <div class="code-cell">
                        ${known ? `<code class="code-chip">${esc(known)}</code>` : (s.codeHash ? '<span class="status-badge status-empty">Tersembunyi</span>' : '<span class="status-badge status-late">Belum ada</span>')}
                        <button type="button" class="small-btn" data-act="newcode" data-key="${esc(s.key)}">${codeLabel}</button>
                    </div>
                </td>
                <td>
                    <button type="button" class="small-danger-btn" data-act="reset" data-key="${esc(s.key)}"${info.due ? '' : ' disabled'}>${resetLabel}</button>
                    <button type="button" class="small-danger-btn" data-act="delete" data-key="${esc(s.key)}">${delLabel}</button>
                </td>
            </tr>`;
        }).join('')
        : `<tr><td colspan="8"><div class="empty-state">${ui.search ? 'Tidak ada siswa yang cocok.' : 'Belum ada siswa.'}</div></td></tr>`;
}

// Ketukan pertama menandai tombol, ketukan kedua (dalam 4 detik) mengonfirmasi.
function confirmTap(id) {
    if (ui.armed === id) {
        clearTimeout(armTimer);
        ui.armed = null;
        return true;
    }
    ui.armed = id;
    clearTimeout(armTimer);
    armTimer = setTimeout(() => { ui.armed = null; renderTeacher(); }, 4000);
    renderTeacher();
    return false;
}

const teacherHash = (pw) => {
    let x = sha256('english-room-guru:' + pw);
    for (let i = 0; i < 2000; i++) x = sha256(x + pw);
    return x;
};
let loginFails = 0;
let loginBlockedUntil = 0;

function teacherLogin() {
    const pin = $('teacherPin').value;
    const wait = Math.ceil((loginBlockedUntil - Date.now()) / 1000);
    if (wait > 0) {
        setMessage('loginMessage', 'error', `Terlalu banyak percobaan. Coba lagi ${wait} detik lagi.`);
        return;
    }
    if (pin && teacherHash(pin) === ((S && S.teacherHash) || CONFIG.teacherPasswordHash)) {
        loginFails = 0;
        ui.teacherIn = true;
        session.set('er:teacher', '1');
        $('teacherPin').value = '';
        setMessage('loginMessage', '', '');
        renderTeacher();
    } else {
        loginFails += 1;
        if (loginFails >= 5) {
            loginFails = 0;
            loginBlockedUntil = Date.now() + 60000;
            setMessage('loginMessage', 'error', 'Kata sandi salah 5 kali. Coba lagi 60 detik lagi.');
        } else {
            setMessage('loginMessage', 'error', 'Kata sandi salah.');
        }
    }
}

function openPassword() {
    ['pwOld', 'pwNew', 'pwNew2'].forEach((id) => { $(id).value = ''; });
    setMessage('pwMessage', '', '');
    const dlg = $('passwordDialog');
    if (dlg.open) return;
    if (typeof dlg.showModal === 'function') dlg.showModal();
    else dlg.setAttribute('open', '');
}

function closePassword() {
    const dlg = $('passwordDialog');
    if (typeof dlg.close === 'function') dlg.close();
    else dlg.removeAttribute('open');
    ['pwOld', 'pwNew', 'pwNew2'].forEach((id) => { $(id).value = ''; });
}

async function savePassword() {
    const oldPw = $('pwOld').value;
    const n1 = $('pwNew').value;
    const n2 = $('pwNew2').value;
    const current = (S && S.teacherHash) || CONFIG.teacherPasswordHash;
    if (!oldPw || teacherHash(oldPw) !== current) return setMessage('pwMessage', 'error', 'Kata sandi lama salah.');
    if (n1.length < 8) return setMessage('pwMessage', 'error', 'Kata sandi baru minimal 8 karakter.');
    if (n1 !== n2) return setMessage('pwMessage', 'error', 'Pengulangan kata sandi tidak sama.');
    if (n1 === oldPw) return setMessage('pwMessage', 'error', 'Kata sandi baru harus berbeda dari yang lama.');
    $('pwSave').disabled = true;
    const ok = await save([['teacherAuth', { hash: teacherHash(n1), at: Date.now() }]]);
    $('pwSave').disabled = false;
    if (ok) { closePassword(); toast('Kata sandi guru berhasil diganti.'); }
    else setMessage('pwMessage', 'error', 'Gagal menyimpan. Coba lagi.');
}

function teacherLogout() {
    ui.teacherIn = false;
    ui.armed = null;
    session.del('er:teacher');
    renderTeacher();
}

async function setTeacherLocation() {
    const btn = $('setTeacherLocationBtn');
    const el = $('teacherLocationStatus');
    btn.disabled = true;
    el.textContent = 'Mencari lokasi... (sampai 20 detik, tunggu ya)';
    try {
        const pos = await getPosition({
            ms: 20000,
            goodAcc: 15,
            onProgress: (a) => { el.textContent = `Mencari lokasi... akurasi sekarang ±${Math.round(a)} m`; }
        });
        const acc = pos.coords.accuracy;
        if (acc > CONFIG.teacherMaxAccuracyMeters) {
            throw new Error(`Akurasi lokasi hanya ±${Math.round(acc)} m, terlalu jauh meleset (biasanya perangkat membaca lokasi dari internet, bukan GPS). Nyalakan GPS atau Lokasi di perangkat, coba dari HP, dekat jendela atau di luar ruangan.`);
        }
        const loc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            acc: Math.round(acc),
            at: Date.now(),
            date: today().key
        };
        if (await save([['teacherLocation', loc]])) {
            toast(acc > CONFIG.maxAccuracyMeters
                ? `Lokasi disimpan, tapi akurasi ±${loc.acc} m kurang baik. Sebaiknya ulangi dari HP di tempat terbuka.`
                : 'Lokasi guru disimpan');
        } else {
            renderTeacherLocation();
        }
    } catch (e) {
        renderTeacherLocation();
        el.innerHTML = `<span class="location-danger">✕ Gagal</span>${esc(e.message)}`;
    } finally {
        btn.disabled = false;
    }
}

async function clearTeacherLocation() {
    if (await save([['teacherLocation', null]])) toast('Lokasi guru dihapus');
}

async function addStudent() {
    const name = $('newStudentName').value.trim().replace(/\s+/g, ' ');
    const size = Number($('newStudentPackage').value) === 8 ? 8 : 4;
    if (!name) { setMessage('addStudentMessage', 'error', 'Nama siswa tidak boleh kosong.'); return; }
    if (name.length > 30) { setMessage('addStudentMessage', 'error', 'Nama maksimal 30 karakter.'); return; }
    const key = slug(name);
    if (S.students[key]) { setMessage('addStudentMessage', 'error', `${name} sudah ada di daftar siswa.`); return; }

    const order = studentList().reduce((m, s) => Math.max(m, s.order), 0) + 1;
    const writes = [[`students/${key}`, { name, packageSize: size, cycle: 1, settled: 0, order }]];
    if (S.removed && S.removed[key]) writes.push([`removed/${key}`, null]);

    if (await save(writes)) {
        $('newStudentName').value = '';
        setMessage('addStudentMessage', 'success', `${name} ditambahkan dengan paket ${size} pertemuan. Jadwal diatur lewat data.json.`);
        toast('Siswa ditambahkan');
    } else {
        setMessage('addStudentMessage', 'error', 'Siswa belum tersimpan. Coba lagi.');
    }
}

async function resetStudents(keys) {
    const writes = [];
    let carry = 0;
    keys.forEach((key) => {
        const st = S.students[key];
        if (!st) return;
        const info = pkgInfo(st);
        if (!info.due) return;
        carry += info.extra;
        writes.push([`students/${key}`, studentRecord(st, {
            cycle: st.cycle + 1,
            settled: (st.settled || 0) + st.packageSize
        })]);
    });
    if (!writes.length) { toast('Belum ada paket yang habis.'); return; }
    if (await save(writes)) {
        toast(writes.length === 1
            ? `Paket di-reset.${carry ? ` ${carry} pertemuan terbawa.` : ''}`
            : `${writes.length} paket di-reset.${carry ? ` ${carry} pertemuan terbawa.` : ''}`);
    }
}

async function deleteStudent(key) {
    const st = S.students[key];
    if (!st) return;
    const writes = [[`students/${key}`, null], [`removed/${key}`, true]];
    Object.entries(S.attendance).forEach(([k, r]) => {
        if (r && slug(r.name) === key) writes.push([`attendance/${k}`, null]);
    });
    if (ui.selected === key) lockStudent();
    if (await save(writes)) {
        const cs = codeStore.all();
        delete cs[key];
        codeStore.set(cs);
        toast(`${st.name} dihapus`);
    }
}

async function changePackageSize(key, size) {
    const st = S.students[key];
    if (!st || ![4, 8].includes(size)) return;
    await save([[`students/${key}`, studentRecord(st, { packageSize: size })]]);
}


/* =====================================================
   KODE SISWA OLEH GURU
===================================================== */

async function generateCodes(keys) {
    const list = keys.filter((k) => S.students[k]).map((k) => Object.assign({ key: k }, S.students[k]));
    if (!list.length) return null;

    const batch = {};
    const writes = [];
    const clash = (code, ownKey) =>
        studentList().some((o) => o.key !== ownKey && o.codeHash && o.codeHash === codeHash(o.key, code)) ||
        Object.entries(batch).some(([k, c]) => k !== ownKey && c === code);

    list.forEach((st) => {
        let code;
        let tries = 0;
        do { code = randomCode(); tries += 1; } while (tries < 50 && clash(code, st.key));
        batch[st.key] = code;
        writes.push([`students/${st.key}`, studentRecord(st, { codeHash: codeHash(st.key, code) })]);
    });

    const before = codeStore.all();
    codeStore.set(Object.assign({}, before, batch));
    if (!(await save(writes))) {
        codeStore.set(before);
        renderTeacher();
        return null;
    }
    return batch;
}

function codesText() {
    return studentList()
        .map((s) => { const c = knownCode(s); return c ? `${s.name}: ${c}` : ''; })
        .filter(Boolean)
        .join('\n');
}

function refreshCodesDialog() {
    const list = studentList();
    const missing = list.filter((s) => !s.codeHash).length;
    const hidden = list.filter((s) => s.codeHash && !knownCode(s)).length;
    const shown = list.length - missing - hidden;
    $('codesText').value = codesText() || 'Belum ada kode yang tersimpan di perangkat ini.';
    $('codesInfo').textContent = `${shown} kode tampil di sini` +
        (missing ? `, ${missing} siswa belum punya kode` : '') +
        (hidden ? `, ${hidden} dibuat di perangkat lain` : '') + '.';
    $('codesGenerate').disabled = missing === 0;
    $('codesCopy').disabled = shown === 0;
}

function openCodes() {
    refreshCodesDialog();
    const dlg = $('codesDialog');
    if (dlg.open) return;
    if (typeof dlg.showModal === 'function') dlg.showModal();
    else dlg.setAttribute('open', '');
}

function closeCodes() {
    const dlg = $('codesDialog');
    if (typeof dlg.close === 'function') dlg.close();
    else dlg.removeAttribute('open');
}

async function copyCodes() {
    const text = codesText();
    if (!text) return;
    try {
        await navigator.clipboard.writeText(text);
        toast('Daftar kode disalin');
    } catch (e) {
        const ta = $('codesText');
        ta.focus();
        ta.select();
        toast('Teks sudah dipilih. Salin secara manual.');
    }
}


/* =====================================================
   EDIT ABSENSI OLEH GURU
===================================================== */

const editState = { key: '', date: '', armed: false };
let editArmTimer = null;

function openEdit(key) {
    const st = S.students[key];
    if (!st) return;
    const date = ui.viewDate;
    const rec = S.attendance[recKey(date, st.name)] || null;
    editState.key = key;
    editState.date = date;
    editState.armed = false;
    clearTimeout(editArmTimer);

    $('editTitle').textContent = st.name;
    $('editSubtitle').textContent = longDate(parseKey(date)) + (rec ? '' : ' · belum ada absensi');
    $('editStatus').value = rec ? rec.status : 'Hadir';
    $('editStudentNote').textContent = rec && rec.note ? rec.note : 'Tidak ada keterangan.';
    $('editTeacherNote').value = rec && rec.tnote ? rec.tnote : '';
    $('editDelete').classList.toggle('hidden', !rec);
    $('editDelete').textContent = 'Hapus absen';
    $('editSave').textContent = rec ? 'Simpan' : 'Catat hadir';
    setMessage('editMessage', '', '');

    const dlg = $('editDialog');
    if (dlg.open) return;
    if (typeof dlg.showModal === 'function') dlg.showModal();
    else dlg.setAttribute('open', '');
}

function closeEdit() {
    const dlg = $('editDialog');
    clearTimeout(editArmTimer);
    if (typeof dlg.close === 'function') dlg.close();
    else dlg.removeAttribute('open');
}

async function saveEdit() {
    const st = S.students[editState.key];
    if (!st) { closeEdit(); return; }

    const status = $('editStatus').value;
    if (!STATUS_CLASS[status]) { setMessage('editMessage', 'error', 'Status tidak valid.'); return; }

    const key = recKey(editState.date, st.name);
    const old = S.attendance[key];
    const day = DAY_NAMES[parseKey(editState.date).getDay()];
    const isToday = editState.date === today().key;

    const rec = Object.assign({
        name: st.name,
        date: editState.date,
        session: sessionsToday(st.name, day)[0] || OFF_SCHEDULE,
        at: isToday ? Date.now() : parseKey(editState.date).getTime() + 12 * 3600 * 1000,
        dist: null,
        by: 'guru'
    }, old || {});
    rec.status = status;
    const tnote = $('editTeacherNote').value.trim().replace(/\s+/g, ' ').slice(0, 300);
    if (tnote) rec.tnote = tnote; else delete rec.tnote;

    const btn = $('editSave');
    btn.disabled = true;
    const ok = await save([[`attendance/${key}`, rec]]);
    btn.disabled = false;
    if (ok) { closeEdit(); toast(`Absensi ${st.name} disimpan`); }
    else setMessage('editMessage', 'error', 'Belum tersimpan. Coba lagi.');
}

async function deleteEditRecord() {
    const st = S.students[editState.key];
    if (!st) return;
    const btn = $('editDelete');
    if (!editState.armed) {
        editState.armed = true;
        btn.textContent = 'Yakin? Ketuk lagi';
        clearTimeout(editArmTimer);
        editArmTimer = setTimeout(() => { editState.armed = false; btn.textContent = 'Hapus absen'; }, 4000);
        return;
    }
    clearTimeout(editArmTimer);
    editState.armed = false;
    if (await save([[`attendance/${recKey(editState.date, st.name)}`, null]])) {
        closeEdit();
        toast('Absensi dihapus');
    }
}


/* =====================================================
   EVENT
===================================================== */

function bindEvents() {
    $('studentNav').addEventListener('click', () => showPage('student'));
    $('teacherNav').addEventListener('click', () => showPage('teacher'));

    $('studentCodeBtn').addEventListener('click', verifyCode);
    $('studentCode').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); verifyCode(); }
    });
    $('studentCode').addEventListener('input', (e) => {
        e.target.value = normalizeCode(e.target.value).slice(0, CONFIG.codeLength);
    });
    $('studentLogout').addEventListener('click', () => lockStudent());
    ['click', 'keydown', 'input', 'touchstart'].forEach((ev) => {
        $('studentPage').addEventListener(ev, () => { if (ui.selected) armLock(CONFIG.idleLockSeconds); }, true);
    });

    $('codesBtn').addEventListener('click', openCodes);
    $('passwordBtn').addEventListener('click', openPassword);
    $('pwCancel').addEventListener('click', closePassword);
    $('pwSave').addEventListener('click', savePassword);
    $('codesClose').addEventListener('click', closeCodes);
    $('codesCopy').addEventListener('click', copyCodes);
    $('codesDialog').addEventListener('click', (e) => { if (e.target === $('codesDialog')) closeCodes(); });
    $('codesGenerate').addEventListener('click', async () => {
        const keys = studentList().filter((s) => !s.codeHash).map((s) => s.key);
        const made = await generateCodes(keys);
        if (made) toast(`${Object.keys(made).length} kode dibuat`);
        refreshCodesDialog();
    });
    document.querySelectorAll('.attendance-option').forEach((b) => {
        b.addEventListener('click', () => onStatusClick(b.dataset.status));
    });
    $('submitAttendance').addEventListener('click', submitAttendance);
    $('locationStudentInfo').addEventListener('click', (e) => {
        if (e.target.closest('[data-act="recheck"]')) checkLocation();
    });

    $('teacherLoginBtn').addEventListener('click', teacherLogin);
    $('teacherPin').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); teacherLogin(); }
    });
    $('teacherLogout').addEventListener('click', teacherLogout);

    $('setTeacherLocationBtn').addEventListener('click', setTeacherLocation);
    $('clearTeacherLocationBtn').addEventListener('click', clearTeacherLocation);

    $('addStudentBtn').addEventListener('click', addStudent);
    $('newStudentName').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addStudent(); }
    });

    $('teacherSearch').addEventListener('input', (e) => {
        ui.search = e.target.value;
        renderAttendanceTable();
        renderStudentTable();
    });
    $('refreshDashboard').addEventListener('click', async () => {
        await refresh(true);
        toast('Data diperbarui');
    });
    $('resetPackageBtn').addEventListener('click', () => {
        if (confirmTap('all')) resetStudents(studentList().map((s) => s.key));
    });

    $('attendanceTableBody').addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-act="edit"]');
        if (btn) openEdit(btn.dataset.key);
    });
    $('attendanceDateInput').addEventListener('change', (e) => {
        ui.viewDate = e.target.value || today().key;
        renderAttendanceTable();
    });
    $('attendanceTodayBtn').addEventListener('click', () => {
        ui.viewDate = today().key;
        renderAttendanceTable();
    });
    $('editSave').addEventListener('click', saveEdit);
    $('editDelete').addEventListener('click', deleteEditRecord);
    $('editCancel').addEventListener('click', closeEdit);
    $('editDialog').addEventListener('click', (e) => { if (e.target === $('editDialog')) closeEdit(); });

    $('studentTableBody').addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-act]');
        if (!btn || btn.disabled) return;
        const key = btn.dataset.key;
        if (btn.dataset.act === 'reset' && confirmTap(`reset:${key}`)) resetStudents([key]);
        if (btn.dataset.act === 'delete' && confirmTap(`delete:${key}`)) deleteStudent(key);
        if (btn.dataset.act === 'newcode') {
            const st = S.students[key];
            if (st && (!st.codeHash || confirmTap(`code:${key}`))) {
                generateCodes([key]).then((made) => { if (made) toast(`Kode ${st.name}: ${made[key]}`); });
            }
        }
    });
    $('studentTableBody').addEventListener('change', (e) => {
        const sel = e.target.closest('select[data-act="size"]');
        if (sel) changePackageSize(sel.dataset.key, Number(sel.value));
    });

    // Data berubah dari tab lain (mode lokal) atau tab kembali aktif
    window.addEventListener('storage', () => refresh(false));
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(false); });
}


/* =====================================================
   MULAI
===================================================== */

(async function init() {
    try {
        SEED = await loadSeed();
        ui.teacherIn = session.get('er:teacher') === '1';
        bindEvents();
        showPage('student');
        await refresh(true);
        renderHeader();
        setInterval(() => refresh(false), Math.max(3, CONFIG.refreshSeconds) * 1000);
    } catch (e) {
        document.body.insertAdjacentHTML('afterbegin',
            `<div class="error-message" style="margin:16px">Aplikasi gagal dimuat: ${esc(e.message)}</div>`);
    }
})();