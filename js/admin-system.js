// ========================================
// Pawon Mamaraka - Admin System
// File: js/admin-system.js
// ========================================

import { auth, db, currentUser, isAdmin, serverTimestamp } from './core-system.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getDocs, addDoc, updateDoc, deleteDoc, doc,
    collection, query, where, orderBy, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Tab Management
function initializeAdminTabs() {
    const tabs = document.querySelectorAll('[data-tab]');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // Update tab buttons
            tabs.forEach(t => t.classList.remove('tab-active', 'text-cyan-500'));
            tabs.forEach(t => t.classList.add('text-neutral-300'));
            tab.classList.add('tab-active', 'text-cyan-500');
            
            // Update tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
                content.classList.add('hidden');
            });
            
            const targetContent = document.getElementById(`section-${targetTab}`);
            if (targetContent) {
                targetContent.classList.remove('hidden');
                targetContent.classList.add('active');
            }
            
            // Load data for the tab
            loadTabData(targetTab);
        });
    });
}

function loadTabData(tab) {
    switch(tab) {
        case 'preorders':
            loadPreorders();
            break;
        case 'catalog':
            loadCatalog();
            break;
        case 'requests':
            loadRequests();
            break;
        case 'orders':
            loadOrders();
            break;
    }
}

// Catalog Management
async function loadCatalog() {
    try {
        const categoryFilter = document.getElementById('catalog-category-filter')?.value || 'all';
        const statusFilter = document.getElementById('catalog-status-filter')?.value || 'all';
        
        let catalogQuery = collection(db, "catalog");
        
        if (statusFilter !== 'all') {
            catalogQuery = query(catalogQuery, where("isActive", "==", statusFilter === 'active'));
        }
        
        catalogQuery = query(catalogQuery, orderBy("createdAt", "desc"));
        
        const querySnapshot = await getDocs(catalogQuery);
        const catalogList = document.getElementById('catalog-list');
        catalogList.innerHTML = '';

        if (querySnapshot.empty) {
            catalogList.innerHTML = `
                <div class="col-span-full text-center py-12 text-neutral-400">
                    <i data-lucide="package" class="h-12 w-12 mx-auto mb-4 text-neutral-600"></i>
                    <div>Belum ada menu di katalog</div>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Apply category filter
            if (categoryFilter !== 'all' && data.category !== categoryFilter) {
                return;
            }
            
            const catalogElement = createCatalogElement(doc.id, data);
            catalogList.appendChild(catalogElement);
        });
        
    } catch (error) {
        console.error('Error loading catalog:', error);
    }
}

function createCatalogElement(id, data) {
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
                    <span class="text-cyan-300 font-semibold">Rp ${data.price.toLocaleString('id-ID')}</span>
                    <span class="capitalize">${data.category}</span>
                    ${data.tags && data.tags.length > 0 ? `
                        <span class="text-xs">${data.tags.slice(0, 2).join(', ')}</span>
                    ` : ''}
                </div>
            </div>
        </div>
        <div class="flex gap-2 mt-4">
            <button onclick="editCatalog('${id}')" class="edit-catalog-btn rounded-md px-3 py-2 text-sm font-medium border border-white/10 bg-neutral-800 hover:bg-neutral-700 transition-colors">
                Edit
            </button>
            <button onclick="createPreorderFromCatalog('${id}')" class="rounded-md px-3 py-2 text-sm font-medium border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-colors">
                Buat PO
            </button>
            <button onclick="toggleCatalog('${id}', ${!data.isActive})" class="rounded-md px-3 py-2 text-sm font-medium border ${
                data.isActive ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
            } hover:opacity-80 transition-colors">
                ${data.isActive ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
            <button onclick="deleteCatalog('${id}')" class="rounded-md px-3 py-2 text-sm font-medium border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors">
                Hapus
            </button>
        </div>
    `;
    return element;
}

// Requests Management
async function loadRequests() {
    try {
        const statusFilter = document.getElementById('requests-status-filter')?.value || 'all';
        
        let requestsQuery = collection(db, "requests");
        
        if (statusFilter !== 'all') {
            requestsQuery = query(requestsQuery, where("status", "==", statusFilter));
        }
        
        requestsQuery = query(requestsQuery, orderBy("createdAt", "desc"));
        
        onSnapshot(requestsQuery, (querySnapshot) => {
            const requestsContainer = document.getElementById('requests-container');
            requestsContainer.innerHTML = '';
            
            if (querySnapshot.empty) {
                requestsContainer.innerHTML = `
                    <div class="p-8 text-center text-neutral-400">
                        <i data-lucide="inbox" class="h-12 w-12 mx-auto mb-4 text-neutral-600"></i>
                        <div>Tidak ada requests</div>
                    </div>
                `;
                lucide.createIcons();
                return;
            }

            querySnapshot.forEach(async (doc) => {
                const request = doc.data();
                const requestElement = await createRequestElement(doc.id, request);
                requestsContainer.appendChild(requestElement);
            });
        });
        
    } catch (error) {
        console.error('Error loading requests:', error);
    }
}

async function createRequestElement(id, request) {
    const element = document.createElement('div');
    element.className = 'grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-sm items-center hover:bg-neutral-800/20 transition-colors';
    
    const statusColors = {
        pending: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
        approved: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
        rejected: 'border-red-500/30 bg-red-500/10 text-red-300'
    };

    element.innerHTML = `
        <div class="col-span-3">
            <div class="font-medium">${request.catalogTitle}</div>
            <div class="text-xs text-neutral-400">${new Date(request.createdAt?.toDate()).toLocaleDateString('id-ID')}</div>
        </div>
        <div class="col-span-2">
            <div>${request.userName}</div>
            <div class="text-xs text-neutral-400">${request.userEmail}</div>
        </div>
        <div class="col-span-1 text-center">${request.quantity}</div>
        <div class="col-span-2">
            ${request.desiredDeadline ? new Date(request.desiredDeadline).toLocaleDateString('id-ID') : 'Flexible'}
        </div>
        <div class="col-span-2">
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs ${statusColors[request.status]}">
                ${request.status === 'pending' ? 'Pending' : request.status === 'approved' ? 'Disetujui' : 'Ditolak'}
            </span>
        </div>
        <div class="col-span-2 flex gap-2">
            ${request.status === 'pending' ? `
                <button onclick="approveRequest('${id}')" class="flex-1 rounded px-2 py-1 text-xs border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-colors">
                    Setujui
                </button>
                <button onclick="rejectRequest('${id}')" class="flex-1 rounded px-2 py-1 text-xs border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors">
                    Tolak
                </button>
            ` : ''}
            <button onclick="viewRequestDetail('${id}')" class="flex-1 rounded px-2 py-1 text-xs border border-white/10 bg-neutral-800 hover:bg-neutral-700 transition-colors">
                Detail
            </button>
        </div>
    `;
    return element;
}

// Export functions to global scope
window.editCatalog = editCatalog;
window.createPreorderFromCatalog = createPreorderFromCatalog;
window.toggleCatalog = toggleCatalog;
window.deleteCatalog = deleteCatalog;
window.approveRequest = approveRequest;
window.rejectRequest = rejectRequest;
window.viewRequestDetail = viewRequestDetail;

// Initialize admin system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('admin.html')) {
        // Check if user is admin
        onAuthStateChanged(auth, (user) => {
            if (!user || !isAdmin(user)) {
                alert('Anda tidak memiliki akses ke halaman admin');
                window.location.href = 'index.html';
                return;
            }
            
            initializeAdminTabs();
            loadPreorders(); // Load initial tab data
            
            // Initialize Lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    }
});