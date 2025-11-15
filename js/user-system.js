// ========================================
// Pawon Mamaraka - User System
// File: js/user-system.js
// ========================================

import { auth, db, currentUser, isLoggedIn, serverTimestamp } from './core-system.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getDocs, addDoc, updateDoc, deleteDoc, doc,
    collection, query, where, orderBy, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Tab Management for User Dashboard
function initializeUserTabs() {
    const tabs = document.querySelectorAll('[data-user-tab]');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-user-tab');
            
            // Update tab buttons
            tabs.forEach(t => t.classList.remove('user-tab-active', 'text-cyan-500'));
            tabs.forEach(t => t.classList.add('text-neutral-300'));
            tab.classList.add('user-tab-active', 'text-cyan-500');
            
            // Update tab contents
            document.querySelectorAll('.user-tab-content').forEach(content => {
                content.classList.remove('active');
                content.classList.add('hidden');
            });
            
            const targetContent = document.getElementById(`user-section-${targetTab}`);
            if (targetContent) {
                targetContent.classList.remove('hidden');
                targetContent.classList.add('active');
            }
            
            // Load data for the tab
            loadUserTabData(targetTab);
        });
    });
}

function loadUserTabData(tab) {
    switch(tab) {
        case 'orders':
            loadUserOrders();
            break;
        case 'requests':
            loadUserRequests();
            break;
    }
}

// User Requests Management
function loadUserRequests(statusFilter = 'all') {
    if (!currentUser) return;

    let requestsQuery = query(
        collection(db, "requests"),
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "desc")
    );

    onSnapshot(requestsQuery, (querySnapshot) => {
        const requestsContainer = document.getElementById('user-requests-container');
        const emptyElement = document.getElementById('empty-requests');
        
        requestsContainer.innerHTML = '';
        
        if (querySnapshot.empty) {
            requestsContainer.classList.add('hidden');
            emptyElement.classList.remove('hidden');
            return;
        }

        requestsContainer.classList.remove('hidden');
        emptyElement.classList.add('hidden');

        const requests = [];
        
        querySnapshot.forEach(doc => {
            const request = doc.data();
            request.id = doc.id;
            
            // Apply status filter
            if (statusFilter === 'all' || request.status === statusFilter) {
                requests.push(request);
            }
        });

        if (requests.length === 0) {
            requestsContainer.innerHTML = `
                <div class="text-center py-8 text-neutral-400">
                    Tidak ada request dengan status "${statusFilter}"
                </div>
            `;
            return;
        }

        requests.forEach(request => {
            const requestElement = createUserRequestElement(request);
            requestsContainer.appendChild(requestElement);
        });
    });
}

function createUserRequestElement(request) {
    const element = document.createElement('div');
    element.className = 'bg-neutral-900/60 rounded-xl border border-white/10 p-6 hover:border-white/20 transition-colors';
    
    const statusColors = {
        pending: { badge: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300', text: 'Menunggu Persetujuan' },
        approved: { badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300', text: 'Disetujui - Akan dibuka PO' },
        rejected: { badge: 'border-red-500/30 bg-red-500/10 text-red-300', text: 'Ditolak' }
    };
    
    const statusInfo = statusColors[request.status] || statusColors.pending;

    element.innerHTML = `
        <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
                <h3 class="text-lg font-semibold">${request.catalogTitle}</h3>
                <p class="text-sm text-neutral-400 mt-1">${new Date(request.createdAt?.toDate()).toLocaleString('id-ID')}</p>
            </div>
            <span class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${statusInfo.badge}">
                ${statusInfo.text}
            </span>
        </div>
        
        <div class="grid grid-cols-3 gap-4 text-sm mb-4">
            <div>
                <div class="text-neutral-400">Jumlah</div>
                <div class="font-medium">${request.quantity} item</div>
            </div>
            <div>
                <div class="text-neutral-400">Deadline Diinginkan</div>
                <div class="font-medium">${request.desiredDeadline ? new Date(request.desiredDeadline).toLocaleDateString('id-ID') : 'Flexible'}</div>
            </div>
            <div>
                <div class="text-neutral-400">Status</div>
                <div class="font-medium capitalize">${request.status}</div>
            </div>
        </div>
        
        ${request.specialRequest ? `
            <div class="mt-4 p-3 bg-neutral-800/50 rounded-lg border border-white/10">
                <div class="text-sm text-neutral-400 mb-1">Catatan Khusus:</div>
                <div class="text-sm">${request.specialRequest}</div>
            </div>
        ` : ''}
        
        ${request.adminNotes ? `
            <div class="mt-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                <div class="text-sm text-cyan-300 mb-1">Catatan Admin:</div>
                <div class="text-sm">${request.adminNotes}</div>
            </div>
        ` : ''}
        
        <div class="mt-4 flex justify-end">
            <span class="text-xs text-neutral-500">ID Request: ${request.id.slice(-8)}</span>
        </div>
    `;
    
    return element;
}

// Initialize user system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('user.html')) {
        // Check if user is logged in
        onAuthStateChanged(auth, (user) => {
            if (!user) {
                window.location.href = 'index.html';
                return;
            }
            
            initializeUserTabs();
            loadUserOrders(); // Load initial tab data
            
            // Initialize Lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    }
});