// ========================================
// Pawon Mamaraka - User Dashboard
// File: js/user.js
// ========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getFirestore, collection, getDocs, query, where, orderBy, onSnapshot 
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
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const $userOrdersContainer = document.getElementById('user-orders-container');
const $emptyOrders = document.getElementById('empty-orders');
const $orderModal = document.getElementById('order-modal');
const $orderDetailContent = document.getElementById('order-detail-content');

let currentUser = null;

// ========================================
// INITIALIZATION & EVENT LISTENERS
// ========================================

// Initialize application setelah auth ready
onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed in user dashboard:', user ? user.email : 'No user');
    
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    currentUser = user;
    initializeUserApp();
});

function initializeUserApp() {
    console.log('Initializing user application...');
    
    // Load user orders
    loadUserOrders();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Initialize Lucide icons
    lucide.createIcons();
    
    console.log('User application initialized successfully');
}

function createBakingLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'baking-loading-overlay hidden';
    overlay.id = 'baking-loading-overlay';
    
    overlay.innerHTML = `
        <div class="baking-container">
            <div class="floating-ingredient">🍞</div>
            <div class="floating-ingredient">🥖</div>
            <div class="floating-ingredient">🥐</div>
            <div class="floating-ingredient">🍰</div>
            <div class="floating-ingredient">🥨</div>
            <div class="floating-ingredient">🥯</div>
            
            <div class="central-baking">
                <div class="baking-glow"></div>
                <div class="baking-dough"></div>
            </div>
            
            <div class="baking-text">Memproses...</div>
            
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

function showBakingLoading(message = 'Memproses...', theme = 'default') {
    let overlay = document.getElementById('baking-loading-overlay');
    
    if (!overlay) {
        overlay = createBakingLoadingOverlay();
    }
    
    overlay.classList.remove('baking-loading-login', 'baking-loading-logout', 'baking-loading-processing');
    
    if (theme !== 'default') {
        overlay.classList.add(`baking-loading-${theme}`);
    }
    
    const textElement = overlay.querySelector('.baking-text');
    const progressText = overlay.querySelector('.baking-progress-text');
    
    if (textElement && message) {
        textElement.textContent = message;
    }
    
    if (progressText) {
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
}

function hideBakingLoading() {
    const overlay = document.getElementById('baking-loading-overlay');
    if (overlay) {
        overlay.classList.add('baking-success');
        
        setTimeout(() => {
            overlay.classList.add('hidden');
            overlay.classList.remove('baking-success');
            document.body.style.overflow = '';
            overlay.classList.remove('baking-loading-login', 'baking-loading-logout', 'baking-loading-processing');
        }, 800);
    }
}

function showBakingLoading(message = 'Memproses...') {
    // Implementasi sama seperti di app.js
    console.log('Loading:', message);
    // Tambahkan implementasi baking loading overlay
}

function hideBakingLoading() {
    // Implementasi sama seperti di app.js
    console.log('Loading hidden');
}

function initializeEventListeners() {
    console.log('Setting up user event listeners...');
    
    // 1. Tombol Sign Out
    const signoutButton = document.getElementById('btn-signout');
    if (signoutButton) {
        signoutButton.addEventListener('click', () => {
            showBakingLoading('Keluar dari akun...', 'logout');
            signOut(auth).then(() => {
                console.log('User signed out from dashboard');
                setTimeout(() => {
                    hideBakingLoading();
                }, 1000);
            }).catch((error) => {
                console.error('Sign out error:', error);
                hideBakingLoading();
            });
        });
    }

    // 2. Order filter buttons
    document.querySelectorAll('.order-filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const status = e.target.getAttribute('data-status');
            
            // Update active button
            document.querySelectorAll('.order-filter-btn').forEach(b => {
                b.classList.remove('bg-cyan-600', 'text-white');
                b.classList.add('border', 'border-white/10', 'bg-neutral-900', 'text-neutral-300');
            });
            
            e.target.classList.remove('border', 'border-white/10', 'bg-neutral-900', 'text-neutral-300');
            e.target.classList.add('bg-cyan-600', 'text-white');
            
            loadUserOrders(status);
        });
    });

    // 3. Close modal button
    const closeModalBtn = document.getElementById('btn-close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            $orderModal.classList.add('hidden');
        });
    }

    // 4. Close modal on outside click
    if ($orderModal) {
        $orderModal.addEventListener('click', (e) => {
            if (e.target === $orderModal) {
                $orderModal.classList.add('hidden');
            }
        });
    }

    console.log('User event listeners setup completed');
}

// ========================================
// ORDER MANAGEMENT FOR USER
// ========================================

// Load user orders with real-time updates
function loadUserOrders(statusFilter = 'all') {
    if (!currentUser) {
        console.error('No current user found');
        return;
    }

    let ordersQuery = query(
        collection(db, "orders"),
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "desc")
    );

    console.log('Loading orders for user:', currentUser.uid);

    onSnapshot(ordersQuery, async (querySnapshot) => {
        $userOrdersContainer.innerHTML = '';
        
        if (querySnapshot.empty) {
            $userOrdersContainer.classList.add('hidden');
            $emptyOrders.classList.remove('hidden');
            console.log('No orders found for user');
            return;
        }

        $userOrdersContainer.classList.remove('hidden');
        $emptyOrders.classList.add('hidden');

        const orders = [];
        
        for (const doc of querySnapshot.docs) {
            const order = doc.data();
            order.id = doc.id;
            
            // Get preorder details
            const preorderDoc = await getDocs(query(collection(db, "preorders"), where("__name__", "==", order.preorderId)));
            if (!preorderDoc.empty) {
                order.preorderData = preorderDoc.docs[0].data();
            } else {
                order.preorderData = { 
                    title: 'Pre-Order Tidak Ditemukan', 
                    price: 0,
                    estimatedDelivery: 'Tidak tersedia',
                    description: 'Produk mungkin sudah dihapus'
                };
            }
            
            orders.push(order);
        }

        // Filter by status if needed
        const filteredOrders = statusFilter === 'all' ? orders : orders.filter(order => order.status === statusFilter);
        
        if (filteredOrders.length === 0) {
            $userOrdersContainer.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-neutral-400 mb-4">Tidak ada pesanan dengan status "${statusFilter}"</div>
                </div>
            `;
            return;
        }

        filteredOrders.forEach(order => {
            const orderElement = createOrderElement(order);
            $userOrdersContainer.appendChild(orderElement);
        });

        console.log('Orders loaded:', filteredOrders.length);
        
    }, (error) => {
        console.error('Error loading user orders:', error);
        $userOrdersContainer.innerHTML = `
            <div class="col-span-full text-center py-12 text-red-400">
                Gagal memuat data pesanan
            </div>
        `;
    });
}

// Create order element for user
function createOrderElement(order) {
    const element = document.createElement('div');
    element.className = 'bg-neutral-900/60 rounded-xl border border-white/10 p-6 hover:border-white/20 transition-colors cursor-pointer';
    element.onclick = () => viewOrderDetail(order);
    
    const statusColors = {
        pending: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
        confirmed: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
        completed: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
        cancelled: 'border-red-500/30 bg-red-500/10 text-red-300'
    };

    const statusLabels = {
        pending: 'Menunggu Konfirmasi',
        confirmed: 'Dikonfirmasi',
        completed: 'Selesai',
        cancelled: 'Dibatalkan'
    };

    const statusInfo = statusColors[order.status] || 'border-neutral-500/30 bg-neutral-500/10 text-neutral-300';
    const statusLabel = statusLabels[order.status] || order.status;

    element.innerHTML = `
        <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
                <h3 class="text-lg font-semibold">${order.preorderData.title}</h3>
                <p class="text-sm text-neutral-400 mt-1">${new Date(order.createdAt?.toDate()).toLocaleString('id-ID')}</p>
            </div>
            <span class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${statusInfo}">
                ${statusLabel}
            </span>
        </div>
        
        <div class="grid grid-cols-3 gap-4 text-sm mb-4">
            <div>
                <div class="text-neutral-400">Jumlah</div>
                <div class="font-medium">${order.quantity} item</div>
            </div>
            <div>
                <div class="text-neutral-400">Total Harga</div>
                <div class="font-medium">Rp ${order.totalPrice.toLocaleString('id-ID')}</div>
            </div>
            <div>
                <div class="text-neutral-400">Estimasi Kirim</div>
                <div class="font-medium">${order.preorderData.estimatedDelivery}</div>
            </div>
        </div>
        
        ${order.specialRequest ? `
            <div class="mt-4 p-3 bg-neutral-800/50 rounded-lg border border-white/10">
                <div class="text-sm text-neutral-400 mb-1">Catatan Khusus:</div>
                <div class="text-sm line-clamp-2">${order.specialRequest}</div>
            </div>
        ` : ''}
        
        <div class="mt-4 flex justify-end">
            <span class="text-xs text-neutral-500">Klik untuk detail lengkap</span>
        </div>
    `;
    
    return element;
}

// ========================================
// ORDER DETAIL MODAL
// ========================================

// View order detail
function viewOrderDetail(order) {
    const statusLabels = {
        pending: { label: 'Menunggu Konfirmasi', class: 'text-yellow-300', desc: 'Pesanan Anda sedang menunggu konfirmasi dari admin' },
        confirmed: { label: 'Dikonfirmasi', class: 'text-blue-300', desc: 'Pesanan Anda telah dikonfirmasi dan sedang diproses' },
        completed: { label: 'Selesai', class: 'text-emerald-300', desc: 'Pesanan Anda telah selesai dan dikirim' },
        cancelled: { label: 'Dibatalkan', class: 'text-red-300', desc: 'Pesanan Anda telah dibatalkan' }
    };

    const statusInfo = statusLabels[order.status] || { label: order.status, class: 'text-neutral-300', desc: 'Status tidak diketahui' };

    $orderDetailContent.innerHTML = `
        <div class="space-y-6">
            <!-- Order Status -->
            <div class="text-center">
                <div class="inline-flex items-center gap-2 rounded-full ${statusInfo.class.replace('text-', 'bg-').replace('300', '500/10')} border ${statusInfo.class.replace('text-', 'border-').replace('300', '500/30')} px-4 py-2">
                    <i data-lucide="${getStatusIcon(order.status)}" class="h-5 w-5"></i>
                    <span class="font-semibold ${statusInfo.class}">${statusInfo.label}</span>
                </div>
                <p class="text-sm text-neutral-400 mt-2">${statusInfo.desc}</p>
            </div>

            <!-- Order Info -->
            <div class="grid grid-cols-2 gap-6">
                <div>
                    <h4 class="font-semibold text-neutral-300 mb-3">Informasi Pesanan</h4>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-neutral-400">ID Pesanan:</span>
                            <span class="font-mono">${order.id.slice(-8)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-neutral-400">Tanggal Pesan:</span>
                            <span>${order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleString('id-ID') : '-'}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-neutral-400">Terakhir Update:</span>
                            <span>${order.updatedAt?.toDate ? new Date(order.updatedAt.toDate()).toLocaleString('id-ID') : '-'}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 class="font-semibold text-neutral-300 mb-3">Informasi Pengiriman</h4>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-neutral-400">Estimasi Kirim:</span>
                            <span>${order.preorderData.estimatedDelivery}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-neutral-400">Status:</span>
                            <span class="${statusInfo.class} font-medium">${statusInfo.label}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Product Info -->
            <div>
                <h4 class="font-semibold text-neutral-300 mb-3">Detail Produk</h4>
                <div class="bg-neutral-800/50 rounded-lg p-4">
                    <div class="flex items-start gap-4">
                        <img src="${order.preorderData.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=80&auto=format&fit=crop'}" 
                             alt="${order.preorderData.title}" 
                             class="h-16 w-16 rounded-lg object-cover ring-1 ring-white/10">
                        <div class="flex-1">
                            <h5 class="font-medium">${order.preorderData.title}</h5>
                            <p class="text-sm text-neutral-400 mt-1">${order.preorderData.description || 'Tidak ada deskripsi'}</p>
                            <div class="flex items-center gap-4 mt-2 text-sm">
                                <span class="text-neutral-400">Harga: Rp ${order.preorderData.price.toLocaleString('id-ID')}</span>
                                <span class="text-neutral-400">Jumlah: ${order.quantity}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Order Summary -->
            <div>
                <h4 class="font-semibold text-neutral-300 mb-3">Ringkasan Pesanan</h4>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-neutral-400">Subtotal:</span>
                        <span>Rp ${order.totalPrice.toLocaleString('id-ID')}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-neutral-400">Biaya Layanan:</span>
                        <span>Rp 0</span>
                    </div>
                    <div class="flex justify-between border-t pt-2 font-semibold">
                        <span class="text-lg">Total:</span>
                        <span class="text-lg">Rp ${order.totalPrice.toLocaleString('id-ID')}</span>
                    </div>
                </div>
            </div>

            <!-- Special Request -->
            ${order.specialRequest ? `
            <div>
                <h4 class="font-semibold text-neutral-300 mb-3">Catatan Khusus</h4>
                <div class="bg-neutral-800/50 rounded-lg p-4">
                    <p class="text-sm">${order.specialRequest}</p>
                </div>
            </div>
            ` : ''}

            <!-- Contact Info -->
            <div class="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <h4 class="font-semibold text-cyan-300 mb-2 flex items-center gap-2">
                    <i data-lucide="help-circle" class="h-4 w-4"></i>
                    Butuh Bantuan?
                </h4>
                <p class="text-sm text-cyan-200">
                    Hubungi kami di <strong>0812-3456-7890</strong> atau email <strong>hello@pawonmamaraka.id</strong>
                </p>
            </div>
        </div>
    `;

    // Initialize Lucide icons in modal
    lucide.createIcons();
    
    // Show modal
    $orderModal.classList.remove('hidden');
}

// Helper function untuk icon status
function getStatusIcon(status) {
    const icons = {
        pending: 'clock',
        confirmed: 'check-circle',
        completed: 'package-check',
        cancelled: 'x-circle'
    };
    return icons[status] || 'help-circle';
}

// ========================================
// ERROR HANDLING
// ========================================

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error in user dashboard:', e.error);
});

// Handle authentication errors
onAuthStateChanged(auth, (user) => {
    if (!user) {
        console.log('User not authenticated, redirecting to home...');
        window.location.href = 'index.html';
    }
}, (error) => {
    console.error('Auth state change error:', error);
    alert('Terjadi masalah dengan autentikasi. Silakan login kembali.');
    window.location.href = 'index.html';
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    // Clean up any resources if needed
});

console.log('✅ user.js loaded successfully - No admin menu included');