// ========================================
// Pawon Mamaraka - Admin Panel (FULL VERSION)
// File: js/admin.js
// ========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
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
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const $preordersList = document.getElementById('preorders-list');
const $ordersContainer = document.getElementById('orders-container');
const $preorderModal = document.getElementById('preorder-modal');
const $preorderForm = document.getElementById('preorder-form');
const $orderStatusFilter = document.getElementById('order-status-filter');

// Admin emails
const ADMIN_EMAILS = ['pandeecp6@gmail.com', 'desidesi432@gmail.com'];

// Check if user is admin
function isAdmin(user) {
    return ADMIN_EMAILS.includes(user.email);
}

// ========================================
// EVENT LISTENERS & INITIALIZATION
// ========================================

// Initialize application setelah auth ready
onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed:', user ? user.email : 'No user');
    
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    if (!isAdmin(user)) {
        alert('Anda tidak memiliki akses ke halaman admin');
        window.location.href = 'index.html';
        return;
    }

    // User is admin, initialize app
    initializeAdminApp();
});

function initializeAdminApp() {
    console.log('Initializing admin application...');
    
    // Load data
    loadPreorders();
    loadOrders();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Initialize Lucide icons
    lucide.createIcons();
    
    console.log('Admin application initialized successfully');
}

function initializeEventListeners() {
    console.log('Setting up event listeners...');
    
    // 1. Tombol Tambah Pre-Order
    const addButton = document.getElementById('btn-add-preorder');
    if (addButton) {
        console.log('✅ Tombol tambah pre-order ditemukan');
        addButton.addEventListener('click', openPreorderModal);
    } else {
        console.error('❌ Tombol tambah pre-order TIDAK DITEMUKAN');
    }

    // 2. Tombol Cancel Modal
    const cancelButton = document.getElementById('btn-cancel-modal');
    if (cancelButton) {
        cancelButton.addEventListener('click', closePreorderModal);
    }

    // 3. Tombol Sign Out
    const signoutButton = document.getElementById('btn-signout');
    if (signoutButton) {
        signoutButton.addEventListener('click', () => {
            signOut(auth).then(() => {
                console.log('Admin signed out');
            });
        });
    }

    // 4. Order Filter
    if ($orderStatusFilter) {
        $orderStatusFilter.addEventListener('change', (e) => {
            loadOrders(e.target.value);
        });
    }

    // 5. Pre-order Form
    if ($preorderForm) {
        $preorderForm.addEventListener('submit', handlePreorderSubmit);
    }

    // 6. Close modal on outside click
    if ($preorderModal) {
        $preorderModal.addEventListener('click', (e) => {
            if (e.target === $preorderModal) {
                closePreorderModal();
            }
        });
    }

    console.log('Event listeners setup completed');
}

// ========================================
// MODAL FUNCTIONS
// ========================================

function openPreorderModal() {
    console.log('🔄 Membuka modal tambah pre-order');
    
    const modal = document.getElementById('preorder-modal');
    const form = document.getElementById('preorder-form');
    
    if (!modal || !form) {
        console.error('❌ Modal atau form tidak ditemukan');
        return;
    }

    // Reset form dan set default values
    form.reset();
    document.getElementById('preorder-id').value = '';
    document.getElementById('modal-title').textContent = 'Tambah Pre-Order';
    
    // Set default deadline (2 hari dari sekarang)
    const now = new Date();
    now.setDate(now.getDate() + 2);
    const deadlineString = now.toISOString().slice(0, 16);
    document.getElementById('preorder-deadline').value = deadlineString;
    
    // Set default values untuk field baru
    document.getElementById('preorder-active').checked = true;
    document.getElementById('preorder-featured').checked = false;
    document.getElementById('preorder-display-order').value = '0';
    document.getElementById('preorder-tags').value = '';
    
    // Show modal
    modal.classList.remove('hidden');
    console.log('✅ Modal berhasil dibuka');
}

function closePreorderModal() {
    console.log('🔄 Menutup modal pre-order');
    const modal = document.getElementById('preorder-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

async function handlePreorderSubmit(e) {
    e.preventDefault();
    console.log('🔄 Memproses form pre-order');
    
    try {
        const formData = {
            title: document.getElementById('preorder-title').value.trim(),
            description: document.getElementById('preorder-description').value.trim(),
            imageUrl: document.getElementById('preorder-image').value.trim(),
            price: parseInt(document.getElementById('preorder-price').value),
            deadline: document.getElementById('preorder-deadline').value + ':00+07:00',
            estimatedDelivery: document.getElementById('preorder-delivery').value.trim(),
            maxQuantity: parseInt(document.getElementById('preorder-maxqty').value),
            isActive: document.getElementById('preorder-active').checked,
            isFeatured: document.getElementById('preorder-featured').checked,
            displayOrder: parseInt(document.getElementById('preorder-display-order').value) || 0,
            tags: document.getElementById('preorder-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
            updatedAt: serverTimestamp()
        };

        // Validation
        if (!formData.title || !formData.description || !formData.imageUrl) {
            alert('Harap isi semua field yang wajib diisi');
            return;
        }

        const preorderId = document.getElementById('preorder-id').value;

        if (preorderId) {
            // Update existing
            await updateDoc(doc(db, "preorders", preorderId), formData);
            console.log('✅ Pre-order updated:', preorderId);
        } else {
            // Add new
            formData.createdAt = serverTimestamp();
            formData.currentQuantity = 0;
            await addDoc(collection(db, "preorders"), formData);
            console.log('✅ Pre-order baru ditambahkan');
        }
        
        closePreorderModal();
        loadPreorders();
        
    } catch (error) {
        console.error('❌ Error saving preorder:', error);
        alert('Gagal menyimpan pre-order: ' + error.message);
    }
}

// ========================================
// PRE-ORDER MANAGEMENT
// ========================================

// Load preorders
async function loadPreorders() {
    try {
        const querySnapshot = await getDocs(collection(db, "preorders"));
        $preordersList.innerHTML = '';

        if (querySnapshot.empty) {
            $preordersList.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-neutral-400 mb-4">Belum ada pre-order</div>
                    <button id="btn-add-first-preorder" class="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium bg-cyan-600 text-white hover:bg-cyan-700 transition-colors">
                        + Tambah Pre-Order Pertama
                    </button>
                </div>
            `;
            
            // Add event listener to the new button
            document.getElementById('btn-add-first-preorder')?.addEventListener('click', openPreorderModal);
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const preorderElement = createPreorderElement(doc.id, data);
            $preordersList.appendChild(preorderElement);
        });
        
        console.log('✅ Preorders loaded:', querySnapshot.size);
    } catch (error) {
        console.error('❌ Error loading preorders:', error);
        $preordersList.innerHTML = `
            <div class="col-span-full text-center py-12 text-red-400">
                Gagal memuat data pre-order
            </div>
        `;
    }
}

// Create preorder element
function createPreorderElement(id, data) {
    const element = document.createElement('div');
    element.className = 'bg-neutral-900/60 rounded-xl border border-white/10 p-6';
    element.innerHTML = `
        <div class="flex items-start gap-4">
            <img src="${data.imageUrl}" alt="${data.title}" class="h-20 w-20 rounded-lg object-cover ring-1 ring-white/10">
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-2">
                    <h3 class="text-lg font-semibold">${data.title}</h3>
                    <span class="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs ${
                        data.isActive ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/10 text-red-300 border border-red-500/30'
                    }">
                        ${data.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                </div>
                <p class="text-sm text-neutral-400 mb-2">${data.description}</p>
                <div class="flex items-center gap-4 text-sm text-neutral-400">
                    <span>Harga: Rp ${data.price.toLocaleString('id-ID')}</span>
                    <span>Stok: ${data.currentQuantity}/${data.maxQuantity}</span>
                    <span>Deadline: ${new Date(data.deadline).toLocaleString('id-ID')}</span>
                </div>
            </div>
        </div>
        <div class="flex gap-2 mt-4">
            <button onclick="editPreorder('${id}')" class="edit-btn rounded-md px-3 py-2 text-sm font-medium border border-white/10 bg-neutral-800 hover:bg-neutral-700 transition-colors">
                Edit
            </button>
            <button onclick="togglePreorder('${id}', ${!data.isActive})" class="rounded-md px-3 py-2 text-sm font-medium border ${
                data.isActive ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
            } hover:opacity-80 transition-colors">
                ${data.isActive ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
            <button onclick="deletePreorder('${id}')" class="rounded-md px-3 py-2 text-sm font-medium border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors">
                Hapus
            </button>
        </div>
    `;
    return element;
}

// Edit preorder
window.editPreorder = async function(id) {
    const docRef = doc(db, "preorders", id);
    const docSnap = await getDocs(query(collection(db, "preorders"), where("__name__", "==", id)));
    
    if (!docSnap.empty) {
        const data = docSnap.docs[0].data();
        document.getElementById('preorder-id').value = id;
        document.getElementById('preorder-title').value = data.title;
        document.getElementById('preorder-description').value = data.description;
        document.getElementById('preorder-image').value = data.imageUrl;
        document.getElementById('preorder-price').value = data.price;
        
        // Format datetime-local
        const deadlineDate = new Date(data.deadline);
        const timezoneOffset = deadlineDate.getTimezoneOffset() * 60000;
        const localISOTime = new Date(deadlineDate - timezoneOffset).toISOString().slice(0, 16);
        
        document.getElementById('preorder-deadline').value = localISOTime;
        document.getElementById('preorder-delivery').value = data.estimatedDelivery;
        document.getElementById('preorder-maxqty').value = data.maxQuantity;
        document.getElementById('preorder-active').checked = data.isActive;
        
        // Set values untuk field baru
        document.getElementById('preorder-featured').checked = data.isFeatured || false;
        document.getElementById('preorder-display-order').value = data.displayOrder || 0;
        document.getElementById('preorder-tags').value = data.tags ? data.tags.join(', ') : '';
        
        document.getElementById('modal-title').textContent = 'Edit Pre-Order';
        $preorderModal.classList.remove('hidden');
    }
};

// Toggle preorder active status
window.togglePreorder = async function(preorderId, isActive) {
    try {
        await updateDoc(doc(db, "preorders", preorderId), {
            isActive: isActive,
            updatedAt: serverTimestamp()
        });
        loadPreorders();
        console.log(`✅ Pre-order ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
    } catch (error) {
        console.error('❌ Error toggling preorder:', error);
        alert('Gagal mengubah status pre-order');
    }
};

// Delete preorder
window.deletePreorder = async function(preorderId) {
    if (confirm('Apakah Anda yakin ingin menghapus pre-order ini?')) {
        try {
            await deleteDoc(doc(db, "preorders", preorderId));
            loadPreorders();
            console.log('✅ Pre-order dihapus');
        } catch (error) {
            console.error('❌ Error deleting preorder:', error);
            alert('Gagal menghapus pre-order');
        }
    }
};

// ========================================
// ORDER MANAGEMENT
// ========================================

// Load orders with real-time updates
function loadOrders(statusFilter = 'all') {
    let ordersQuery = collection(db, "orders");
    
    if (statusFilter !== 'all') {
        ordersQuery = query(ordersQuery, where("status", "==", statusFilter));
    }
    
    ordersQuery = query(ordersQuery, orderBy("createdAt", "desc"));

    onSnapshot(ordersQuery, (querySnapshot) => {
        $ordersContainer.innerHTML = '';
        
        if (querySnapshot.empty) {
            $ordersContainer.innerHTML = `
                <div class="p-8 text-center text-neutral-400">
                    <i data-lucide="package" class="h-12 w-12 mx-auto mb-4 text-neutral-600"></i>
                    <div>Tidak ada pesanan</div>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        querySnapshot.forEach(async (doc) => {
            const order = doc.data();
            const orderElement = await createOrderElement(doc.id, order);
            $ordersContainer.appendChild(orderElement);
        });
        
        console.log('✅ Orders loaded:', querySnapshot.size);
    }, (error) => {
        console.error('❌ Error loading orders:', error);
        $ordersContainer.innerHTML = `
            <div class="p-8 text-center text-red-400">
                Gagal memuat data pesanan
            </div>
        `;
    });
}

// Create order element
async function createOrderElement(id, order) {
    // Get preorder details
    const preorderDoc = await getDocs(query(collection(db, "preorders"), where("__name__", "==", order.preorderId)));
    let preorderTitle = "Pre-Order Tidak Ditemukan";
    
    if (!preorderDoc.empty) {
        preorderTitle = preorderDoc.docs[0].data().title;
    }

    const element = document.createElement('div');
    element.className = 'grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-sm items-center hover:bg-neutral-800/20 transition-colors';
    element.innerHTML = `
        <div class="col-span-2">
            <div class="font-medium">${preorderTitle}</div>
            <div class="text-xs text-neutral-400">${order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleString('id-ID') : 'Tanggal tidak tersedia'}</div>
        </div>
        <div class="col-span-2">
            <div class="font-medium">${order.userName}</div>
            <div class="text-xs text-neutral-400">${order.userEmail}</div>
        </div>
        <div class="col-span-1 text-center">${order.quantity}</div>
        <div class="col-span-2 font-medium">Rp ${order.totalPrice.toLocaleString('id-ID')}</div>
        <div class="col-span-2">
            <select onchange="updateOrderStatus('${id}', this.value)" class="w-full rounded border border-white/10 bg-neutral-800 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Dikonfirmasi</option>
                <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Selesai</option>
                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Dibatalkan</option>
            </select>
        </div>
        <div class="col-span-3 flex gap-2">
            <button onclick="viewOrderDetail('${id}')" class="flex-1 rounded px-2 py-1 text-xs border border-white/10 bg-neutral-800 hover:bg-neutral-700 transition-colors flex items-center justify-center gap-1">
                <i data-lucide="eye" class="h-3 w-3"></i>
                Detail
            </button>
            <button onclick="printInvoice('${id}')" class="flex-1 rounded px-2 py-1 text-xs border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-colors flex items-center justify-center gap-1">
                <i data-lucide="receipt" class="h-3 w-3"></i>
                Invoice
            </button>
        </div>
    `;
    return element;
}

// Update order status
window.updateOrderStatus = async function(orderId, status) {
    try {
        await updateDoc(doc(db, "orders", orderId), {
            status: status,
            updatedAt: serverTimestamp()
        });
        console.log(`✅ Order status updated to: ${status}`);
    } catch (error) {
        console.error('❌ Error updating order status:', error);
        alert('Gagal mengupdate status pesanan');
    }
};

// View order detail
window.viewOrderDetail = async function(orderId) {
    try {
        const orderDoc = await getDocs(query(collection(db, "orders"), where("__name__", "==", orderId)));
        if (orderDoc.empty) {
            alert('Data pesanan tidak ditemukan');
            return;
        }

        const order = orderDoc.docs[0].data();
        order.id = orderDoc.docs[0].id;

        // Get preorder data
        const preorderDoc = await getDocs(query(collection(db, "preorders"), where("__name__", "==", order.preorderId)));
        const preorderData = preorderDoc.empty ? { title: 'Produk Tidak Ditemukan', price: 0 } : preorderDoc.docs[0].data();

        showOrderDetailModal(order, preorderData);
        
    } catch (error) {
        console.error('Error viewing order detail:', error);
        alert('Gagal memuat detail pesanan');
    }
};

// Show order detail modal
function showOrderDetailModal(order, preorderData) {
    const statusLabels = {
        pending: { label: 'Menunggu Pembayaran', class: 'text-yellow-300' },
        confirmed: { label: 'Dikonfirmasi', class: 'text-blue-300' },
        completed: { label: 'Selesai', class: 'text-emerald-300' },
        cancelled: { label: 'Dibatalkan', class: 'text-red-300' }
    };

    const statusInfo = statusLabels[order.status] || { label: order.status, class: 'text-neutral-300' };

    const modalHTML = `
        <div id="order-detail-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-neutral-900 rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden">
                <div class="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 class="text-xl font-semibold">Detail Pesanan</h3>
                    <button id="close-order-detail-modal" class="text-neutral-400 hover:text-white">
                        <i data-lucide="x" class="h-5 w-5"></i>
                    </button>
                </div>
                <div class="p-6 overflow-auto max-h-[calc(90vh-80px)]">
                    <div class="space-y-6">
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
                                        <span class="text-neutral-400">Tanggal:</span>
                                        <span>${order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleString('id-ID') : '-'}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-neutral-400">Status:</span>
                                        <span class="${statusInfo.class} font-medium">${statusInfo.label}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 class="font-semibold text-neutral-300 mb-3">Informasi Customer</h4>
                                <div class="space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-neutral-400">Nama:</span>
                                        <span>${order.userName}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-neutral-400">Email:</span>
                                        <span>${order.userEmail}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-neutral-400">User ID:</span>
                                        <span class="font-mono text-xs">${order.userId.slice(-8)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Product Info -->
                        <div>
                            <h4 class="font-semibold text-neutral-300 mb-3">Detail Produk</h4>
                            <div class="bg-neutral-800/50 rounded-lg p-4">
                                <div class="flex items-center gap-4">
                                    <div class="flex-1">
                                        <h5 class="font-medium">${preorderData.title}</h5>
                                        <p class="text-sm text-neutral-400 mt-1">${preorderData.description || 'Tidak ada deskripsi'}</p>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-sm text-neutral-400">Harga Satuan</div>
                                        <div class="font-medium">Rp ${preorderData.price.toLocaleString('id-ID')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Order Summary -->
                        <div>
                            <h4 class="font-semibold text-neutral-300 mb-3">Ringkasan Pesanan</h4>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-neutral-400">Jumlah:</span>
                                    <span>${order.quantity} item</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-neutral-400">Total Harga:</span>
                                    <span class="font-semibold">Rp ${order.totalPrice.toLocaleString('id-ID')}</span>
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

                        <!-- Actions -->
                        <div class="flex gap-3 pt-4 border-t border-white/10">
                            <button onclick="printInvoice('${order.id}')" class="flex-1 flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-colors">
                                <i data-lucide="receipt" class="h-4 w-4"></i>
                                Cetak Invoice
                            </button>
                            <button id="close-detail-modal" class="flex-1 rounded-md px-4 py-2.5 text-sm font-medium border border-white/10 bg-neutral-800 hover:bg-neutral-700 transition-colors">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Initialize Lucide icons
    lucide.createIcons();

    // Get modal elements
    const modal = document.getElementById('order-detail-modal');
    const closeBtn = document.getElementById('close-order-detail-modal');
    const closeDetailBtn = document.getElementById('close-detail-modal');

    // Close modal
    const closeModal = () => modal.remove();
    closeBtn.addEventListener('click', closeModal);
    closeDetailBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

// ========================================
// INVOICE SYSTEM
// ========================================

// Fungsi untuk generate invoice
window.printInvoice = async function(orderId) {
    try {
        console.log('🔄 Generating invoice for order:', orderId);
        
        // Get order data
        const orderDoc = await getDocs(query(collection(db, "orders"), where("__name__", "==", orderId)));
        if (orderDoc.empty) {
            alert('Data pesanan tidak ditemukan');
            return;
        }

        const order = orderDoc.docs[0].data();
        order.id = orderDoc.docs[0].id;

        // Get preorder data
        const preorderDoc = await getDocs(query(collection(db, "preorders"), where("__name__", "==", order.preorderId)));
        const preorderData = preorderDoc.empty ? { title: 'Produk Tidak Ditemukan', price: 0 } : preorderDoc.docs[0].data();

        // Generate invoice HTML
        const invoiceHTML = generateInvoiceHTML(order, preorderData);
        
        // Show invoice modal
        showInvoiceModal(invoiceHTML);
        
    } catch (error) {
        console.error('❌ Error generating invoice:', error);
        alert('Gagal generate invoice: ' + error.message);
    }
};

// Generate invoice HTML
function generateInvoiceHTML(order, preorderData) {
    const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
    const invoiceNumber = `INV-${order.id.slice(-8).toUpperCase()}`;
    
    const statusLabels = {
        pending: 'Menunggu Pembayaran',
        confirmed: 'Dikonfirmasi',
        completed: 'Selesai',
        cancelled: 'Dibatalkan'
    };

    return `
        <div class="bg-white text-gray-800 p-6 max-w-2xl mx-auto" id="invoice-content">
            <!-- Header -->
            <div class="text-center mb-8 border-b pb-4">
                <h1 class="text-2xl font-bold text-gray-900">PAWON MAMARAKA</h1>
                <p class="text-gray-600">Invoice</p>
                <p class="text-sm text-gray-500">Specialty Home-cooked Food</p>
                <p class="text-sm text-gray-500">Telp: 0812-3456-7890 | Email: hello@pawonmamaraka.id</p>
            </div>

            <!-- Invoice Info -->
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <h3 class="font-semibold text-gray-900 border-b pb-1 mb-2">Informasi Invoice</h3>
                    <p class="text-sm mb-1"><strong>No. Invoice:</strong> ${invoiceNumber}</p>
                    <p class="text-sm mb-1"><strong>Tanggal:</strong> ${orderDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p class="text-sm mb-1"><strong>Status:</strong> ${statusLabels[order.status] || order.status}</p>
                </div>
                <div>
                    <h3 class="font-semibold text-gray-900 border-b pb-1 mb-2">Informasi Customer</h3>
                    <p class="text-sm mb-1"><strong>Nama:</strong> ${order.userName}</p>
                    <p class="text-sm mb-1"><strong>Email:</strong> ${order.userEmail}</p>
                    <p class="text-sm mb-1"><strong>ID Customer:</strong> ${order.userId.slice(-8)}</p>
                </div>
            </div>

            <!-- Order Details -->
            <div class="mb-6">
                <h3 class="font-semibold text-gray-900 border-b pb-1 mb-3">Detail Pesanan</h3>
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span class="text-sm"><strong>Produk:</strong></span>
                        <span class="text-sm">${preorderData.title}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-sm"><strong>Harga Satuan:</strong></span>
                        <span class="text-sm">Rp ${preorderData.price.toLocaleString('id-ID')}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-sm"><strong>Jumlah:</strong></span>
                        <span class="text-sm">${order.quantity}</span>
                    </div>
                    <div class="flex justify-between border-t pt-2 mt-2">
                        <span class="text-sm font-semibold"><strong>Total Harga:</strong></span>
                        <span class="text-sm font-semibold">Rp ${order.totalPrice.toLocaleString('id-ID')}</span>
                    </div>
                </div>
            </div>

            <!-- Special Request -->
            ${order.specialRequest ? `
            <div class="mb-6">
                <h3 class="font-semibold text-gray-900 border-b pb-1 mb-3">Catatan Khusus</h3>
                <p class="text-sm bg-gray-50 p-3 rounded border">${order.specialRequest}</p>
            </div>
            ` : ''}

            <!-- Payment Summary -->
            <div class="border-t pt-4 mb-6">
                <h3 class="font-semibold text-gray-900 mb-3">Ringkasan Pembayaran</h3>
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span>Subtotal:</span>
                        <span>Rp ${order.totalPrice.toLocaleString('id-ID')}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Biaya Layanan:</span>
                        <span>Rp 0</span>
                    </div>
                    <div class="flex justify-between border-t pt-2 font-semibold">
                        <span class="text-lg">TOTAL:</span>
                        <span class="text-lg">Rp ${order.totalPrice.toLocaleString('id-ID')}</span>
                    </div>
                </div>
            </div>

            <!-- Payment Instructions -->
            <div class="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 class="font-semibold text-yellow-800 mb-2">Instruksi Pembayaran:</h4>
                <p class="text-sm text-yellow-700">
                    1. Transfer ke BCA 258-239-4963 a.n. Desi Alfiah Lukman<br>
                    2. Jumlah transfer: <strong>Rp ${order.totalPrice.toLocaleString('id-ID')}</strong><br>
                    3. Konfirmasi pembayaran via WhatsApp 0812-2827-3034<br>
                    4. Cantumkan kode: <strong>${invoiceNumber}</strong>
                </p>
            </div>

            <!-- Footer -->
            <div class="text-center mt-8 pt-4 border-t">
                <p class="text-sm text-gray-500">Terima kasih atas pesanan Anda</p>
                <p class="text-xs text-gray-400 mt-1">Invoice ini generated otomatis pada ${new Date().toLocaleString('id-ID')}</p>
            </div>
        </div>
    `;
}

// Show invoice modal
function showInvoiceModal(invoiceHTML) {
    const modalHTML = `
        <div id="invoice-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-neutral-900 rounded-xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div class="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 class="text-xl font-semibold">Cetak Invoice</h3>
                    <div class="flex gap-2">
                        <button id="print-invoice" class="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium bg-cyan-600 text-white hover:bg-cyan-700 transition-colors">
                            <i data-lucide="printer" class="h-4 w-4"></i>
                            Print
                        </button>
                        <button id="close-invoice-modal" class="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium border border-white/10 bg-neutral-800 hover:bg-neutral-700 transition-colors">
                            <i data-lucide="x" class="h-4 w-4"></i>
                            Tutup
                        </button>
                    </div>
                </div>
                <div class="p-6 overflow-auto max-h-[calc(90vh-80px)] bg-white">
                    ${invoiceHTML}
                </div>
            </div>
        </div>
    `;

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Initialize Lucide icons
    lucide.createIcons();

    // Get modal elements
    const modal = document.getElementById('invoice-modal');
    const printBtn = document.getElementById('print-invoice');
    const closeBtn = document.getElementById('close-invoice-modal');

    // Print functionality
    printBtn.addEventListener('click', () => {
        const invoiceContent = document.getElementById('invoice-content');
        if (invoiceContent) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Invoice ${order.id.slice(-8)} - Pawon Mamaraka</title>
                    <meta charset="UTF-8">
                    <style>
                        body { 
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            margin: 0;
                            padding: 20px;
                            color: #000;
                            background: white;
                            line-height: 1.4;
                        }
                        @media print {
                            body { margin: 0; }
                            .no-print { display: none !important; }
                            @page { margin: 1cm; }
                        }
                        .text-center { text-align: center; }
                        .font-bold { font-weight: bold; }
                        .border-b { border-bottom: 1px solid #ddd; }
                        .border-t { border-top: 1px solid #ddd; }
                        .pb-4 { padding-bottom: 1rem; }
                        .pt-4 { padding-top: 1rem; }
                        .mb-1 { margin-bottom: 0.25rem; }
                        .mb-2 { margin-bottom: 0.5rem; }
                        .mb-3 { margin-bottom: 0.75rem; }
                        .mb-6 { margin-bottom: 1.5rem; }
                        .mb-8 { margin-bottom: 2rem; }
                        .mt-1 { margin-top: 0.25rem; }
                        .mt-8 { margin-top: 2rem; }
                        .p-3 { padding: 0.75rem; }
                        .p-4 { padding: 1rem; }
                        .p-6 { padding: 1.5rem; }
                        .grid { display: grid; }
                        .grid-cols-2 { grid-template-columns: 1fr 1fr; }
                        .gap-4 { gap: 1rem; }
                        .flex { display: flex; }
                        .justify-between { justify-content: space-between; }
                        .items-center { align-items: center; }
                        .bg-yellow-50 { background-color: #fefce8; }
                        .border-yellow-200 { border-color: #fef08a; }
                        .text-yellow-800 { color: #854d0e; }
                        .text-yellow-700 { color: #a16207; }
                        .text-sm { font-size: 0.875rem; }
                        .text-lg { font-size: 1.125rem; }
                        .text-xl { font-size: 1.25rem; }
                        .text-2xl { font-size: 1.5rem; }
                        .rounded-lg { border-radius: 0.5rem; }
                        .text-gray-500 { color: #6b7280; }
                        .text-gray-600 { color: #4b5563; }
                        .text-gray-800 { color: #1f2937; }
                        .text-gray-900 { color: #111827; }
                        .space-y-2 > * + * { margin-top: 0.5rem; }
                        .space-y-4 > * + * { margin-top: 1rem; }
                        .space-y-6 > * + * { margin-top: 1.5rem; }
                    </style>
                </head>
                <body>
                    ${invoiceContent.outerHTML}
                    <div class="no-print text-center mt-8">
                        <button onclick="window.print()" class="bg-blue-500 text-white px-4 py-2 rounded">Print</button>
                        <button onclick="window.close()" class="bg-gray-500 text-white px-4 py-2 rounded ml-2">Tutup</button>
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            
            // Auto print after content loads
            printWindow.onload = function() {
                setTimeout(() => {
                    printWindow.print();
                }, 500);
            };
        }
    });

    // Close modal
    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// Tambahkan di bagian EVENT LISTENERS atau di akhir file
window.handleAdminSignOut = async function() {
    showBakingLoading('Menutup panel admin...', 'logout');
    try {
        await signOut(auth);
        console.log('Admin signed out');
    } catch (error) {
        console.error('Sign out error:', error);
    } finally {
        setTimeout(hideBakingLoading, 1000);
    }
};

// ========================================
// ERROR HANDLING & CLEANUP
// ========================================

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    // Clean up any resources if needed
});

console.log('✅ admin.js loaded successfully');