// ========================================
// Pawon Mamaraka - Main Application (FIXED)
// File: js/app.js
// ========================================

// Initialize Lucide Icons
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons({ 
        attrs: { 
            stroke: 'currentColor', 
            'stroke-width': 1.5 
        } 
    });
});

// ========================================
// FIREBASE CONFIGURATION
// ========================================

// Import Firebase SDKs from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics, isSupported as analyticsSupported } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getFirestore, collection, getDocs, addDoc, updateDoc, doc,
    query, where, orderBy, onSnapshot, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDRrKuCao6L7Rmm_VfLmdkgIgBM8sdhP4g",
    authDomain: "pawonmamaraka-117a8.firebaseapp.com",
    projectId: "pawonmamaraka-117a8",
    storageBucket: "pawonmamaraka-117a8.firebasestorage.app",
    messagingSenderId: "603376116648",
    appId: "1:603376116648:web:5b1507151f1b06bd09f39d",
    measurementId: "G-T7RFLVP6WF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (if supported)
try {
    if (await analyticsSupported()) {
        getAnalytics(app);
        console.log('Firebase Analytics initialized');
    }
} catch (e) {
    console.warn('Analytics not supported in this environment');
}

// ========================================
// FIRESTORE INITIALIZATION
// ========================================

const db = getFirestore(app);

// ========================================
// BAKING LOADING ANIMATION SYSTEM
// ========================================

// Create baking loading overlay
function createBakingLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'baking-loading-overlay hidden';
    overlay.id = 'baking-loading-overlay';
    
    overlay.innerHTML = `
        <div class="baking-container">
            <!-- Enhanced Floating Ingredients -->
            <div class="floating-ingredient">🍞</div>
            <div class="floating-ingredient">🥖</div>
            <div class="floating-ingredient">🥐</div>
            <div class="floating-ingredient">🍰</div>
            <div class="floating-ingredient">🥨</div>
            <div class="floating-ingredient">🥯</div>
            
            <!-- Central Baking Animation - Simplified -->
            <div class="central-baking">
                <div class="baking-glow"></div>
                <div class="baking-dough"></div>
            </div>
            
            <!-- Loading Text -->
            <div class="baking-text">Memanggang pesanan Anda</div>
            
            <!-- Enhanced Progress Bar -->
            <div class="baking-progress-container">
                <div class="baking-progress-text">Sedang memproses...</div>
                <div class="baking-progress">
                    <div class="baking-progress-bar"></div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    return overlay;
}

// Show baking loading
function showBakingLoading(message = 'Memanggang pesanan Anda', theme = 'default') {
    let overlay = document.getElementById('baking-loading-overlay');
    
    if (!overlay) {
        overlay = createBakingLoadingOverlay();
    }
    
    // Remove previous theme classes
    overlay.classList.remove('baking-loading-login', 'baking-loading-logout', 'baking-loading-processing');
    
    // Add theme class
    if (theme !== 'default') {
        overlay.classList.add(`baking-loading-${theme}`);
    }
    
    // Update message
    const textElement = overlay.querySelector('.baking-text');
    const progressText = overlay.querySelector('.baking-progress-text');
    
    if (textElement && message) {
        textElement.textContent = message;
    }
    
    if (progressText) {
        // Update progress text based on theme
        const progressMessages = {
            'login': 'Mempersiapkan sesi Anda...',
            'logout': 'Membersihkan sesi...',
            'processing': 'Memproses permintaan...',
            'default': 'Sedang memproses...'
        };
        progressText.textContent = progressMessages[theme] || progressMessages.default;
    }
    
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    console.log(`🍞 Baking loading shown: ${message}`);
}

// Hide baking loading
function hideBakingLoading() {
    const overlay = document.getElementById('baking-loading-overlay');
    if (overlay) {
        // Add success animation before hiding
        overlay.classList.add('baking-success');
        
        setTimeout(() => {
            overlay.classList.add('hidden');
            overlay.classList.remove('baking-success');
            document.body.style.overflow = '';
            
            // Reset theme classes
            overlay.classList.remove('baking-loading-login', 'baking-loading-logout', 'baking-loading-processing');
        }, 800);
        
        console.log('✅ Baking loading hidden with success animation');
    }
}

// ========================================
// AUTHENTICATION (UPDATED WITH BAKING ANIMATION)
// ========================================

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// DOM Elements
const $signin = document.getElementById('btn-signin');
const $signout = document.getElementById('btn-signout');
const $userChip = document.getElementById('user-chip');
const $userName = document.getElementById('user-name');
const $userEmail = document.getElementById('user-email');
const $userPhoto = document.getElementById('user-photo');
const $ctaAuth = document.getElementById('cta-auth');
const $ctaAuth2 = document.getElementById('cta-auth-2');

let isLoggedIn = false;
let currentUser = null;

// Admin emails (configure these with your admin emails)
const ADMIN_EMAILS = ['pandeecp6@gmail.com', 'desidesi4321@gmail.com'];

// Check if user is admin
function isAdmin(user) {
    return ADMIN_EMAILS.includes(user.email);
}

// Sign in with Google (UPDATED VERSION)
const startSignIn = async () => {
    showBakingLoading('Mempersiapkan dapur Pawon Mamaraka...', 'login');
    try {
        await signInWithPopup(auth, provider);
        console.log('Sign in successful');
    } catch (err) {
        console.error('Sign in error:', err);
        alert('Gagal masuk: ' + (err?.message || 'Tidak diketahui'));
    } finally {
        setTimeout(hideBakingLoading, 1200);
    }
};

const handleSignOut = async () => {
    showBakingLoading('Membersihkan dapur...', 'logout');
    try {
        await signOut(auth);
        console.log('Sign out successful');
    } catch (e) {
        console.error('Sign out error:', e);
    } finally {
        setTimeout(hideBakingLoading, 1000);
    }
};

// Update navigation based on user role
function updateNavigation(user) {
    const nav = document.querySelector('nav');
    if (!nav) return;

    if (user && isAdmin(user)) {
        // Add admin link to navigation
        if (!document.querySelector('#admin-link')) {
            const adminLink = document.createElement('a');
            adminLink.id = 'admin-link';
            adminLink.href = 'admin.html';
            adminLink.className = 'text-neutral-300 hover:text-white transition-colors';
            adminLink.innerHTML = '<i data-lucide="settings" class="h-4 w-4 mr-1"></i>Admin';
            nav.appendChild(adminLink);
            lucide.createIcons();
        }
        
        // Add user orders link
        if (!document.querySelector('#user-orders-link')) {
            const userLink = document.createElement('a');
            userLink.id = 'user-orders-link';
            userLink.href = 'user.html';
            userLink.className = 'text-neutral-300 hover:text-white transition-colors';
            userLink.innerHTML = '<i data-lucide="shopping-bag" class="h-4 w-4 mr-1"></i>Pesanan Saya';
            nav.appendChild(userLink);
            lucide.createIcons();
        }
    } else if (user) {
        // Add user orders link for regular users
        if (!document.querySelector('#user-orders-link')) {
            const userLink = document.createElement('a');
            userLink.id = 'user-orders-link';
            userLink.href = 'user.html';
            userLink.className = 'text-neutral-300 hover:text-white transition-colors';
            userLink.innerHTML = '<i data-lucide="shopping-bag" class="h-4 w-4 mr-1"></i>Pesanan Saya';
            nav.appendChild(userLink);
            lucide.createIcons();
        }
        
        // Remove admin link if exists
        const adminLink = document.querySelector('#admin-link');
        if (adminLink) adminLink.remove();
    } else {
        // Remove both links when logged out
        const adminLink = document.querySelector('#admin-link');
        const userLink = document.querySelector('#user-orders-link');
        if (adminLink) adminLink.remove();
        if (userLink) userLink.remove();
    }
}

// Attach event listeners
[$ctaAuth, $ctaAuth2].forEach(btn => {
    btn?.addEventListener('click', startSignIn);
});
$signin?.addEventListener('click', startSignIn);
$signout?.addEventListener('click', handleSignOut);

// Auth state observer
onAuthStateChanged(auth, (user) => {
    isLoggedIn = !!user;
    currentUser = user;
    
    if (user) {
        // User is signed in
        $signin?.classList.add('hidden');
        $userChip?.classList.remove('hidden');
        $userChip?.classList.add('flex');
        $ctaAuth?.classList.add('hidden');
        $ctaAuth2?.classList.add('hidden');

        const name = user.displayName || 'Pengguna';
        const email = user.email || '';
        const photo = user.photoURL || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=80&auto=format&fit=crop';

        $userName.textContent = name;
        $userEmail.textContent = email;
        $userPhoto.src = photo;
        
        // Update navigation based on role
        updateNavigation(user);
        
        console.log('User logged in:', name, isAdmin(user) ? '(Admin)' : '(User)');
    } else {
        // User is signed out
        $signin?.classList.remove('hidden');
        $userChip?.classList.add('hidden');
        $userChip?.classList.remove('flex');
        $ctaAuth?.classList.remove('hidden');
        $ctaAuth2?.classList.remove('hidden');
        
        // Update navigation
        updateNavigation(null);
        
        console.log('User logged out');
    }
    
    updatePOButtons();
});

// ========================================
// COUNTDOWN TIMER (Server Time)
// ========================================

// DOM Elements
const els = {
    dd: document.getElementById('dd'),
    hh: document.getElementById('hh'),
    mm: document.getElementById('mm'),
    ss: document.getElementById('ss'),
    syncBadge: document.getElementById('sync-badge'),
    targetReadable: document.getElementById('target-readable'),
    tzLabel: document.getElementById('tz-label'),
    resync: document.getElementById('btn-resync'),
};

// Target event (null = auto set to +3 days from server time)
let eventIsoJkt = null;

// Sync variables
let basePerf = 0;
let baseServerMs = 0;
let synced = false;
let tickTimer = null;
let resyncTimer = null;

// Update sync badge
const setSyncBadge = (ok) => {
    if (ok) {
        els.syncBadge.classList.remove('border-red-500/30','bg-red-500/10','text-red-300');
        els.syncBadge.classList.add('border-emerald-500/30','bg-emerald-500/10','text-emerald-300');
        els.syncBadge.innerHTML = '<i data-lucide="wifi" class="h-3.5 w-3.5"></i>Disinkronkan';
    } else {
        els.syncBadge.classList.remove('border-emerald-500/30','bg-emerald-500/10','text-emerald-300');
        els.syncBadge.classList.add('border-red-500/30','bg-red-500/10','text-red-300');
        els.syncBadge.innerHTML = '<i data-lucide="wifi-off" class="h-3.5 w-3.5"></i>Tidak sinkron';
    }
    lucide.createIcons({ attrs: { stroke: 'currentColor', 'stroke-width': 1.5 } });
};

// Fetch server time from WorldTimeAPI
const fetchServerNowJKT = async () => {
    try {
        const res = await fetch('https://worldtimeapi.org/api/timezone/Asia/Jakarta', { 
            cache: 'no-store' 
        });
        
        if (!res.ok) throw new Error('Failed to fetch server time');
        
        const data = await res.json();
        const serverNowMs = Date.parse(data.datetime);
        
        console.log('Server time synced:', new Date(serverNowMs).toLocaleString('id-ID'));
        return serverNowMs;
    } catch (error) {
        console.error('Error fetching server time:', error);
        throw error;
    }
};

// Set countdown target
const ensureTarget = async (serverNowMs) => {
    if (!eventIsoJkt) {
        // Auto-set to +3 days from server time
        const plus3 = new Date(serverNowMs + 3 * 24 * 60 * 60 * 1000);
        const y = plus3.getFullYear();
        const m = String(plus3.getMonth() + 1).padStart(2, '0');
        const d = String(plus3.getDate()).padStart(2, '0');
        eventIsoJkt = `${y}-${m}-${d}T09:00:00+07:00`;
        
        console.log('Target date set:', eventIsoJkt);
    }
    
    const readable = new Date(eventIsoJkt).toLocaleString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Jakarta',
    });
    
    els.targetReadable.textContent = readable + ' WIB';
    els.tzLabel.textContent = 'Asia/Jakarta';
};

// Sync with server (UPDATED VERSION)
const syncServer = async () => {
    try {
        const now = performance.now();
        const serverMs = await fetchServerNowJKT();
        
        basePerf = now;
        baseServerMs = serverMs;
        synced = true;
        
        setSyncBadge(true);
        await ensureTarget(serverMs);
        
        // Gunakan retry mechanism
        await loadPreordersWithRetry(serverMs);
        
        console.log('Sync successful');
    } catch (e) {
        console.error('Sync failed:', e);
        synced = false;
        setSyncBadge(false);
    }
};

// Get current server time (calculated from last sync)
const getServerNowMs = () => {
    if (!synced) return Date.now(); // Fallback to client time
    const delta = performance.now() - basePerf;
    return baseServerMs + delta;
};

// Update countdown display
const updateCountdown = () => {
    const nowMs = getServerNowMs();
    const targetMs = Date.parse(eventIsoJkt);
    let diff = targetMs - nowMs;

    if (diff <= 0) {
        els.dd.textContent = '00';
        els.hh.textContent = '00';
        els.mm.textContent = '00';
        els.ss.textContent = '00';
    } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        diff -= d * (1000 * 60 * 60 * 24);
        const h = Math.floor(diff / (1000 * 60 * 60));
        diff -= h * (1000 * 60 * 60);
        const m = Math.floor(diff / (1000 * 60));
        diff -= m * (1000 * 60);
        const s = Math.floor(diff / 1000);

        els.dd.textContent = String(d).padStart(2, '0');
        els.hh.textContent = String(h).padStart(2, '0');
        els.mm.textContent = String(m).padStart(2, '0');
        els.ss.textContent = String(s).padStart(2, '0');
    }

    // Also update pre-order items
    updatePOs();
};

// Start countdown timer
const start = async () => {
    await syncServer();
    
    if (tickTimer) clearInterval(tickTimer);
    tickTimer = setInterval(updateCountdown, 1000);
    updateCountdown();

    if (resyncTimer) clearInterval(resyncTimer);
    // Resync every 5 minutes
    resyncTimer = setInterval(syncServer, 5 * 60 * 1000);
    
    console.log('Countdown started');
};

// Manual resync button
els.resync?.addEventListener('click', async () => {
    console.log('Manual resync triggered');
    await syncServer();
    updateCountdown();
});

// ========================================
// PRE-ORDER SYSTEM (Firestore Integration)
// ========================================

const poCards = Array.from(document.querySelectorAll('[data-po]'));
const poButtons = Array.from(document.querySelectorAll('[data-po-btn]'));

// Retry mechanism untuk load preorders
let retryCount = 0;
const maxRetries = 3;

async function loadPreordersWithRetry(serverNowMs) {
    try {
        await loadPreordersFromFirestore(serverNowMs);
        retryCount = 0; // Reset on success
    } catch (error) {
        console.error(`❌ Failed to load preorders (attempt ${retryCount + 1}/${maxRetries}):`, error);
        
        if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(() => loadPreordersWithRetry(serverNowMs), 2000); // Retry after 2 seconds
        }
    }
}

// Load preorders from Firestore (UPDATED VERSION)
async function loadPreordersFromFirestore(serverNowMs) {
    try {
        console.log('🔄 Memuat pre-order dari Firestore...');
        
        // Query untuk pre-order aktif, diurutkan oleh displayOrder dan featured
        const preordersQuery = query(
            collection(db, "preorders"), 
            where("isActive", "==", true),
            orderBy("isFeatured", "desc"),
            orderBy("displayOrder", "asc"),
            orderBy("deadline", "asc")
        );
        
        const querySnapshot = await getDocs(preordersQuery);
        const preordersContainer = document.querySelector('#preorder .grid');
        
        if (!preordersContainer) {
            console.error('❌ Pre-orders container tidak ditemukan');
            return;
        }

        console.log(`📦 Ditemukan ${querySnapshot.size} pre-order aktif`);

        // Clear existing pre-order items
        const existingPoItems = preordersContainer.querySelectorAll('[data-po]');
        existingPoItems.forEach(item => item.remove());

        if (querySnapshot.empty) {
            // Tampilkan coming soon section
            showComingSoonSection(preordersContainer);
            return;
        }

        // Filter dan sort pre-orders
        const now = new Date(serverNowMs);
        const upcomingPreorders = [];
        const availablePreorders = [];
        
        querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const deadline = new Date(data.deadline);
            const timeDiff = deadline - now;
            const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
            
            const preorderData = {
                id: docSnapshot.id,
                data: data,
                deadline: deadline,
                daysUntil: daysDiff
            };
            
            // Kategorikan pre-order
            if (daysDiff > 1) { // Lebih dari 1 hari lagi
                upcomingPreorders.push(preorderData);
            } else if (daysDiff > 0) { // Dalam 1 hari ke depan
                availablePreorders.push(preorderData);
            }
            // Yang sudah lewat deadline tidak ditampilkan
        });

        console.log(`✅ Available: ${availablePreorders.length}, Upcoming: ${upcomingPreorders.length}`);

        // Tampilkan available pre-orders
        if (availablePreorders.length > 0) {
            availablePreorders.forEach(preorder => {
                const preorderElement = createPreorderElement(preorder.id, preorder.data, serverNowMs);
                preordersContainer.appendChild(preorderElement);
            });
        }

        // Tampilkan upcoming pre-orders sebagai "Coming Soon"
        if (upcomingPreorders.length > 0) {
            showComingSoonSection(preordersContainer, upcomingPreorders, serverNowMs);
        }

        // Jika tidak ada pre-order sama sekali
        if (availablePreorders.length === 0 && upcomingPreorders.length === 0) {
            showComingSoonSection(preordersContainer);
        }

        console.log('✅ Pre-order berhasil dimuat dari Firestore');
        
        // Re-attach event listeners to new buttons
        updatePreorderButtonHandlers();
        
    } catch (error) {
        console.error('❌ Error loading preorders:', error);
        showComingSoonSection(document.querySelector('#preorder .grid'));
    }
}

// Create preorder element from Firestore data
function createPreorderElement(id, data, serverNowMs) {
    const element = document.createElement('article');
    element.className = 'relative rounded-xl border border-white/10 bg-neutral-900/60 p-5 hover:border-white/20 transition-colors';
    element.setAttribute('data-po', '');
    element.setAttribute('data-po-id', id);
    
    // Calculate deadline offset from now
    const deadlineMs = Date.parse(data.deadline);
    const offsetMins = Math.floor((deadlineMs - serverNowMs) / (1000 * 60));
    element.setAttribute('data-po-offset-mins', offsetMins);
    element.setAttribute('data-po-target-ms', deadlineMs);
    
    const statusBadge = data.isActive ? 
        'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 
        'border-red-500/30 bg-red-500/10 text-red-300';
    
    const badgeText = data.isActive ? 'Tutup dalam' : 'Ditutup';

    element.innerHTML = `
        <div class="flex items-start gap-4">
            <img src="${data.imageUrl}" alt="${data.title}" class="h-16 w-16 rounded-lg object-cover ring-1 ring-white/10">
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                    <h3 class="text-lg font-semibold tracking-tight truncate">${data.title}</h3>
                    <span class="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] ${statusBadge}" data-po-badge>
                        <i data-lucide="timer" class="h-3.5 w-3.5"></i>
                        <span data-po-badge-text>${badgeText}</span>
                    </span>
                </div>
                <p class="mt-1 text-sm text-neutral-400 line-clamp-2">${data.description}</p>
                <div class="mt-2 flex items-center gap-4 text-sm text-neutral-400">
                    <span class="text-cyan-300 font-semibold">Rp ${data.price.toLocaleString('id-ID')}</span>
                    <span>Stok: ${data.currentQuantity}/${data.maxQuantity}</span>
                </div>
            </div>
        </div>

        <div class="mt-4 rounded-lg border border-white/10 bg-black/20 p-3">
            <div class="flex items-center justify-between text-xs text-neutral-400">
                <div class="flex items-center gap-1.5">
                    <i data-lucide="calendar" class="h-3.5 w-3.5"></i>
                    Tutup pada: <span class="text-neutral-200" data-po-deadline-readable>${new Date(data.deadline).toLocaleString('id-ID', { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false 
                    })} WIB</span>
                </div>
                <span class="hidden sm:inline">Asia/Jakarta</span>
            </div>
            <div class="mt-3 grid grid-cols-4 gap-2 text-center">
                <div class="rounded-md border border-white/10 bg-neutral-950/60 p-2">
                    <div class="text-2xl font-semibold tracking-tight tabular-nums" data-po-dd>--</div>
                    <div class="mt-0.5 text-[11px] text-neutral-400">Hari</div>
                </div>
                <div class="rounded-md border border-white/10 bg-neutral-950/60 p-2">
                    <div class="text-2xl font-semibold tracking-tight tabular-nums" data-po-hh>--</div>
                    <div class="mt-0.5 text-[11px] text-neutral-400">Jam</div>
                </div>
                <div class="rounded-md border border-white/10 bg-neutral-950/60 p-2">
                    <div class="text-2xl font-semibold tracking-tight tabular-nums" data-po-mm>--</div>
                    <div class="mt-0.5 text-[11px] text-neutral-400">Menit</div>
                </div>
                <div class="rounded-md border border-white/10 bg-neutral-950/60 p-2">
                    <div class="text-2xl font-semibold tracking-tight tabular-nums" data-po-ss>--</div>
                    <div class="mt-0.5 text-[11px] text-neutral-400">Detik</div>
                </div>
            </div>
        </div>

        <div class="mt-4 flex items-center justify-between gap-3">
            <div class="text-xs text-neutral-400 flex items-center gap-1.5">
                <i data-lucide="truck" class="h-3.5 w-3.5"></i>
                Estimasi kirim: ${data.estimatedDelivery}
            </div>
            <button data-po-btn class="inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium border border-white/10 bg-neutral-950 hover:bg-neutral-900 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-cyan-500">
                <i data-lucide="shopping-bag" class="h-4 w-4"></i>
                <span data-po-btn-text>Masuk untuk Pre-Order</span>
            </button>
        </div>
    `;
    
    return element;
}

// Function untuk menampilkan coming soon section
function showComingSoonSection(container, upcomingPreorders = [], serverNowMs = Date.now()) {
    if (upcomingPreorders.length > 0) {
        // Ada pre-order yang akan datang
        const comingSoonHTML = `
            <div class="col-span-full">
                <div class="text-center mb-8">
                    <h3 class="text-2xl font-semibold text-cyan-300 mb-2">Pre-Order Akan Datang</h3>
                    <p class="text-neutral-400">Menu spesial yang akan segera tersedia untuk pre-order</p>
                </div>
                
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${upcomingPreorders.map(preorder => `
                        <div class="bg-neutral-900/40 rounded-xl border border-cyan-500/20 p-6 text-center group hover:border-cyan-500/40 transition-all duration-500">
                            <div class="relative mb-4">
                                <img src="${preorder.data.imageUrl}" alt="${preorder.data.title}" 
                                     class="w-full h-32 object-cover rounded-lg opacity-60 group-hover:opacity-80 transition-opacity">
                                <div class="absolute inset-0 bg-cyan-500/10 rounded-lg"></div>
                                <div class="absolute top-2 right-2">
                                    <span class="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 px-2 py-1 text-xs text-cyan-300 border border-cyan-500/30">
                                        <i data-lucide="clock" class="h-3 w-3"></i>
                                        Soon
                                    </span>
                                </div>
                            </div>
                            
                            <h4 class="font-semibold text-lg mb-2 text-cyan-100">${preorder.data.title}</h4>
                            <p class="text-sm text-neutral-400 mb-3 line-clamp-2">${preorder.data.description}</p>
                            
                            <div class="space-y-2 text-xs">
                                <div class="flex justify-between text-cyan-300">
                                    <span>Mulai:</span>
                                    <span class="font-medium">${formatCountdownStart(preorder.deadline, serverNowMs)}</span>
                                </div>
                                <div class="flex justify-between text-neutral-400">
                                    <span>Estimasi:</span>
                                    <span>${preorder.data.estimatedDelivery}</span>
                                </div>
                            </div>
                            
                            ${preorder.data.tags && preorder.data.tags.length > 0 ? `
                                <div class="mt-3 flex flex-wrap gap-1 justify-center">
                                    ${preorder.data.tags.map(tag => `
                                        <span class="inline-block bg-neutral-800/50 text-neutral-300 text-xs px-2 py-1 rounded-full border border-neutral-700">
                                            ${tag}
                                        </span>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        container.innerHTML += comingSoonHTML;
    } else {
        // Tidak ada pre-order sama sekali
        container.innerHTML = `
            <div class="col-span-full text-center py-16">
                <div class="max-w-md mx-auto">
                    <div class="text-cyan-300 mb-4">
                        <i data-lucide="chef-hat" class="h-16 w-16 mx-auto opacity-50"></i>
                    </div>
                    <h3 class="text-2xl font-semibold text-cyan-300 mb-2">Pre-Order Segera Hadir</h3>
                    <p class="text-neutral-400 mb-6">
                        Kami sedang mempersiapkan menu spesial untuk Anda. Pantau terus halaman ini untuk informasi pre-order terbaru.
                    </p>
                    <div class="flex items-center justify-center gap-4 text-sm text-neutral-500">
                        <div class="flex items-center gap-1">
                            <i data-lucide="clock" class="h-4 w-4"></i>
                            <span>Aktif dalam:</span>
                        </div>
                        <div class="flex gap-2">
                            <span class="bg-neutral-800 px-2 py-1 rounded">--</span>
                            <span>:</span>
                            <span class="bg-neutral-800 px-2 py-1 rounded">--</span>
                            <span>:</span>
                            <span class="bg-neutral-800 px-2 py-1 rounded">--</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Initialize Lucide icons
    lucide.createIcons();
}

function formatCountdownStart(deadline, serverNowMs) {
    const now = new Date(serverNowMs);
    const deadlineDate = new Date(deadline);
    const diffMs = deadlineDate - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
        return `${diffDays} hari lagi`;
    } else if (diffHours > 0) {
        return `${diffHours} jam lagi`;
    } else {
        return 'Segera';
    }
}

// Update preorder button handlers for dynamic content
function updatePreorderButtonHandlers() {
    const allPoButtons = document.querySelectorAll('[data-po-btn]');
    
    allPoButtons.forEach(btn => {
        // Remove existing listeners to prevent duplicates
        btn.replaceWith(btn.cloneNode(true));
    });

    // Re-select buttons and attach new listeners
    document.querySelectorAll('[data-po-btn]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const card = e.currentTarget.closest('[data-po]');
            const closed = card?.getAttribute('data-po-closed') === 'true';
            const preorderId = card?.getAttribute('data-po-id');
            
            if (closed) {
                alert('Pre-order sudah ditutup');
                return;
            }
            
            if (!isLoggedIn) {
                console.log('User not logged in, triggering sign in');
                startSignIn();
                return;
            }
            
            // Get preorder data and show order modal
            try {
                const preorderQuery = query(
                    collection(db, "preorders"),
                    where("__name__", "==", preorderId)
                );
                const querySnapshot = await getDocs(preorderQuery);
                
                if (!querySnapshot.empty) {
                    const preorderData = querySnapshot.docs[0].data();
                    preorderData.id = querySnapshot.docs[0].id;
                    showPreorderModal(preorderData);
                } else {
                    alert('Pre-order tidak ditemukan');
                }
            } catch (error) {
                console.error('Error fetching preorder:', error);
                alert('Terjadi kesalahan. Silakan coba lagi.');
            }
        });
    });
}

// Show pre-order modal
function showPreorderModal(preorderData) {
    // Create modal HTML
    const modalHTML = `
        <div id="preorder-detail-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-neutral-900 rounded-xl border border-white/10 p-6 w-full max-w-md">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-semibold">Pre-Order</h3>
                    <button id="close-preorder-modal" class="text-neutral-400 hover:text-white">
                        <i data-lucide="x" class="h-5 w-5"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <div class="flex items-center gap-4">
                        <img src="${preorderData.imageUrl}" alt="${preorderData.title}" class="h-16 w-16 rounded-lg object-cover ring-1 ring-white/10">
                        <div>
                            <h4 class="font-semibold">${preorderData.title}</h4>
                            <p class="text-sm text-neutral-400">Rp ${preorderData.price.toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-neutral-300 mb-2">Jumlah</label>
                        <div class="flex items-center gap-3">
                            <button id="decrease-qty" class="h-8 w-8 rounded border border-white/10 bg-neutral-800 flex items-center justify-center hover:bg-neutral-700">-</button>
                            <input type="number" id="order-quantity" min="1" max="${preorderData.maxQuantity - preorderData.currentQuantity}" value="1" class="h-8 w-20 text-center rounded border border-white/10 bg-neutral-800">
                            <button id="increase-qty" class="h-8 w-8 rounded border border-white/10 bg-neutral-800 flex items-center justify-center hover:bg-neutral-700">+</button>
                        </div>
                        <div class="text-xs text-neutral-400 mt-1">Stok tersedia: ${preorderData.maxQuantity - preorderData.currentQuantity}</div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-neutral-300 mb-2">Catatan Khusus (opsional)</label>
                        <textarea id="order-notes" rows="3" class="w-full rounded-md border border-white/10 bg-neutral-800 px-3 py-2 text-sm" placeholder="Contoh: Tidak pedas, tambah sambal, dll."></textarea>
                    </div>
                    
                    <div class="pt-4 border-t border-white/10">
                        <div class="flex justify-between items-center mb-4">
                            <span class="text-neutral-400">Total</span>
                            <span id="order-total" class="text-lg font-semibold">Rp ${preorderData.price.toLocaleString('id-ID')}</span>
                        </div>
                        <button id="confirm-preorder" class="w-full rounded-md px-4 py-2.5 text-sm font-medium bg-cyan-600 text-white hover:bg-cyan-700 transition-colors">
                            Konfirmasi Pre-Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Initialize Lucide icons in modal
    lucide.createIcons();
    
    // Get modal elements
    const modal = document.getElementById('preorder-detail-modal');
    const closeBtn = document.getElementById('close-preorder-modal');
    const quantityInput = document.getElementById('order-quantity');
    const decreaseBtn = document.getElementById('decrease-qty');
    const increaseBtn = document.getElementById('increase-qty');
    const orderTotal = document.getElementById('order-total');
    const confirmBtn = document.getElementById('confirm-preorder');
    
    // Update total when quantity changes
    function updateTotal() {
        const quantity = parseInt(quantityInput.value) || 1;
        const total = quantity * preorderData.price;
        orderTotal.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    }
    
    // Quantity controls
    decreaseBtn.addEventListener('click', () => {
        const current = parseInt(quantityInput.value) || 1;
        if (current > 1) {
            quantityInput.value = current - 1;
            updateTotal();
        }
    });
    
    increaseBtn.addEventListener('click', () => {
        const current = parseInt(quantityInput.value) || 1;
        const max = preorderData.maxQuantity - preorderData.currentQuantity;
        if (current < max) {
            quantityInput.value = current + 1;
            updateTotal();
        }
    });
    
    quantityInput.addEventListener('input', updateTotal);
    
    // Confirm order (UPDATED WITH BAKING ANIMATION)
    confirmBtn.addEventListener('click', async () => {
        const quantity = parseInt(quantityInput.value) || 1;
        const notes = document.getElementById('order-notes').value;
        
        if (quantity < 1) {
            alert('Jumlah harus minimal 1');
            return;
        }
        
        if (quantity > (preorderData.maxQuantity - preorderData.currentQuantity)) {
            alert('Jumlah melebihi stok yang tersedia');
            return;
        }
        
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Memproses...';
        
        try {
            const success = await createPreorder({
                preorderId: preorderData.id,
                quantity: quantity,
                specialRequest: notes,
                totalPrice: quantity * preorderData.price
            });
            
            if (success) {
                alert('Pre-order berhasil dibuat! Silakan cek halaman "Pesanan Saya" untuk melihat status.');
                modal.remove();
                
                // Redirect to user orders page
                window.location.href = 'user.html';
            } else {
                throw new Error('Failed to create order');
            }
        } catch (error) {
            console.error('Error creating preorder:', error);
            alert('Gagal membuat pre-order. Silakan coba lagi.');
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Konfirmasi Pre-Order';
        }
    });
    
    // Close modal
    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    // Initialize total
    updateTotal();
}

// Create pre-order in Firestore (UPDATED WITH BAKING ANIMATION)
async function createPreorder(orderData) {
    showBakingLoading('Memproses pre-order Anda...', 'processing');
    
    try {
        const orderDoc = {
            ...orderData,
            userId: currentUser.uid,
            userEmail: currentUser.email,
            userName: currentUser.displayName,
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        
        await addDoc(collection(db, "orders"), orderDoc);
        
        // Update preorder current quantity
        const preorderRef = doc(db, "preorders", orderData.preorderId);
        await updateDoc(preorderRef, {
            currentQuantity: orderData.quantity
        });
        
        console.log('Pre-order created successfully');
        return true;
    } catch (error) {
        console.error('Error creating preorder:', error);
        return false;
    } finally {
        setTimeout(hideBakingLoading, 1500);
    }
}

// Initialize pre-order items countdown
function initPOItems(serverNowMs) {
    const allPoCards = document.querySelectorAll('[data-po]');
    
    allPoCards.forEach(card => {
        const offsetMins = Number(card.getAttribute('data-po-offset-mins') || '0');
        const targetMs = serverNowMs + offsetMins * 60 * 1000;
        card.setAttribute('data-po-target-ms', String(targetMs));
        
        const readable = new Date(targetMs).toLocaleString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Jakarta',
        });
        
        const elReadable = card.querySelector('[data-po-deadline-readable]');
        if (elReadable) elReadable.textContent = readable + ' WIB';
    });
}

// Update pre-order countdowns
function updatePOs() {
    const nowMs = getServerNowMs();
    const allPoCards = document.querySelectorAll('[data-po]');
    
    allPoCards.forEach(card => {
        const targetMs = Number(card.getAttribute('data-po-target-ms') || '0');
        if (!targetMs) return;
        
        let diff = targetMs - nowMs;

        const dd = card.querySelector('[data-po-dd]');
        const hh = card.querySelector('[data-po-hh]');
        const mm = card.querySelector('[data-po-mm]');
        const ss = card.querySelector('[data-po-ss]');
        const badge = card.querySelector('[data-po-badge]');
        const badgeText = card.querySelector('[data-po-badge-text]');

        if (diff <= 0) {
            // Pre-order closed
            if (dd) dd.textContent = '00';
            if (hh) hh.textContent = '00';
            if (mm) mm.textContent = '00';
            if (ss) ss.textContent = '00';
            card.setAttribute('data-po-closed', 'true');
            
            if (badge) {
                badge.className = 'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] border-red-500/30 bg-red-500/10 text-red-300';
            }
            if (badgeText) badgeText.textContent = 'Ditutup';
        } else {
            // Pre-order still open
            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            diff -= d * (1000 * 60 * 60 * 24);
            const h = Math.floor(diff / (1000 * 60 * 60));
            diff -= h * (1000 * 60 * 60);
            const m = Math.floor(diff / (1000 * 60));
            diff -= m * (1000 * 60);
            const s = Math.floor(diff / 1000);

            if (dd) dd.textContent = String(d).padStart(2, '0');
            if (hh) hh.textContent = String(h).padStart(2, '0');
            if (mm) mm.textContent = String(m).padStart(2, '0');
            if (ss) ss.textContent = String(s).padStart(2, '0');

            card.setAttribute('data-po-closed', 'false');
            
            if (badge) {
                badge.className = 'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
            }
            if (badgeText) badgeText.textContent = 'Tutup dalam';
        }
    });
    
    updatePOButtons();
}

// Update pre-order button states
function updatePOButtons() {
    const allPoButtons = document.querySelectorAll('[data-po-btn]');
    
    allPoButtons.forEach(btn => {
        const card = btn.closest('[data-po]');
        const closed = card?.getAttribute('data-po-closed') === 'true';
        const textEl = btn.querySelector('[data-po-btn-text]');
        
        if (closed) {
            btn.setAttribute('disabled', 'true');
            btn.classList.add('opacity-50','cursor-not-allowed');
            if (textEl) textEl.textContent = 'Ditutup';
        } else {
            btn.removeAttribute('disabled');
            btn.classList.remove('opacity-50','cursor-not-allowed');
            if (textEl) {
                textEl.textContent = isLoggedIn ? 'Pre-Order Sekarang' : 'Masuk untuk Pre-Order';
            }
        }
    });
}

// ========================================
// FOOTER YEAR
// ========================================

document.getElementById('y').textContent = String(new Date().getFullYear());

// ========================================
// START APPLICATION
// ========================================

console.log('Pawon Mamaraka application starting...');
start();
console.log('Application initialized successfully');