// ============================================================
//  RE-KOST — script.js
//  Single source of truth — no duplicate functions
// ============================================================


// ── PAGE NAVIGATION ──────────────────────────────────────────

var selectedProduct = null;
var lastPage = 'home-page'; // Track previous page for back button

function showPage(pageId) {
    // Hide every page (jangan hide detail-page, itu modal)
    ['splash-screen', 'auth-page', 'home-page', 'sell-page',
     'profile-page', 'all-page', 'category-page'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

        if (pageId === 'home-page') renderProducts();
        if (pageId === 'all-page') renderAllProducts();

    // Track last page for detail-page back navigation
    if (pageId !== 'detail-page' && ['home-page', 'all-page', 'category-page', 'sell-page', 'profile-page'].includes(pageId)) {
        lastPage = pageId;
    }

    // Show the requested page
    var target = document.getElementById(pageId);
    if (target) target.classList.remove('hidden');

    // Bottom nav: show on main pages, hide on splash/auth/detail
    var nav = document.querySelector('.bottom-nav');
    var pagesWithNav = ['home-page', 'sell-page', 'profile-page', 'all-page', 'category-page'];

    if (pagesWithNav.includes(pageId)) {
        nav.style.display = 'flex';
        // Update active state
        document.querySelectorAll('.bottom-nav .nav-item').forEach(function(el) {
            el.classList.remove('active');
        });
        var activeBtn = document.querySelector('.bottom-nav .nav-item[data-page="' + pageId + '"]');
        if (activeBtn) activeBtn.classList.add('active');
    } else {
        if (nav) nav.style.display = 'none';
    }
}


// ── REGISTER ─────────────────────────────────────────────────
function registerUser() {
    var name     = document.getElementById('name').value.trim();
    var phone    = document.getElementById('phone').value.trim();
    var campus   = document.getElementById('campus').value.trim();
    var location = document.getElementById('location').value.trim();
    var password = document.getElementById('password').value.trim();

    if (!name || !phone || !campus || !location || !password) {
        alert('Harap isi semua data!');
        return;
    }

    localStorage.setItem('user', JSON.stringify({ name, phone, campus, location, password }));
    alert('Akun berhasil dibuat!');
    showPage('home-page');
    loadUserData();
}


// ── LOAD USER DATA ────────────────────────────────────────────
function loadUserData() {
    var user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    var greeting = document.getElementById('greeting');
    if (greeting) greeting.innerText = 'Hai, ' + user.name + ' 👋';

    var nameEl = document.getElementById('profile-name-display');
    var campusEl = document.getElementById('profile-campus-display');
    var locationEl = document.getElementById('profile-location-display');
    if (nameEl)     nameEl.innerText     = user.name;
    if (campusEl)   campusEl.innerText   = user.campus;
    if (locationEl) locationEl.innerText = user.location;

    // Pre-fill edit form fields
    var inputName = document.getElementById('profile-name');
    var inputCampus = document.getElementById('profile-campus');
    var inputLocation = document.getElementById('profile-location');
    if (inputName)     inputName.value     = user.name;
    if (inputCampus)   inputCampus.value   = user.campus;
    if (inputLocation) inputLocation.value = user.location;

    // ✅ LOAD FOTO PROFIL
    var savedImage = localStorage.getItem('profileImage');
    if (savedImage) {
        var img = document.getElementById('profile-image');
        if (img) img.src = savedImage;
}
}


// ── AUTO LOGIN ────────────────────────────────────────────────
function checkLogin() {
    if (localStorage.getItem('user')) {
        showPage('home-page');
        loadUserData();
    }
}


// ── LOGOUT ────────────────────────────────────────────────────
function logout() {
    localStorage.removeItem('user');
    alert('Kamu sudah logout');
    showPage('splash-screen');
}


// ── CATEGORY FILTER ───────────────────────────────────────────
function showCategory(cat) {
    document.getElementById('category-title').textContent = cat;

    var grid = document.getElementById('category-grid');
    grid.innerHTML = '';

    var products = JSON.parse(localStorage.getItem('products')) || [];

    products.forEach(function(p) {
        if (p.category === cat) {
            var card = document.createElement('div');
            card.className = 'product-card dynamic';
            card.innerHTML = `
                <div class="product-img">
                    <img src="${p.image}" style="width:100%;height:100%;object-fit:cover;">
                </div>
                <div class="product-info">
                    <p class="product-name">${p.name}</p>
                    <p class="price">Rp ${p.price}</p>
                    <p class="location">📍 ${p.location}</p>
                </div>
            `;
            card.addEventListener('click', function() {
            showDetail(p);
        });
            grid.appendChild(card);
        }
    });

    if (grid.children.length === 0) {
        grid.innerHTML = '<p style="padding:20px;">Tidak ada barang</p>';
    }

    showPage('category-page');
    console.log(products);
}


// ── PROFILE: TOGGLE EDIT FORM ─────────────────────────────────
function toggleEditForm() {
    var form = document.getElementById('profile-inline-form');

    form.classList.toggle('hidden');

    // tutup panel lain
    document.getElementById('selling-list').classList.add('hidden');
    document.getElementById('favorite-list').classList.add('hidden');
}


// ── PROFILE: TOGGLE ITEM PANELS ──────────────────────────────
function toggleItemPanel(type) {
    var selling  = document.getElementById('selling-list');
    var favorite = document.getElementById('favorite-list'); // ✅ Ganti ke favorite-list
    
    // Close edit form
    document.getElementById('profile-inline-form').classList.add('hidden');

    if (type === 'selling') {
        selling.classList.toggle('hidden');
        favorite.classList.add('hidden');
        if (!selling.classList.contains('hidden')) {
            loadSellingProducts();
        }
    } else if (type === 'favorite') {
        favorite.classList.toggle('hidden');
        selling.classList.add('hidden');
        if (!favorite.classList.contains('hidden')) {
            loadFavorites(); // ✅ Load saat dibuka
        }
    }
}


// ── INIT ──────────────────────────────────────────────────────

function renderProducts() {
    var products = JSON.parse(localStorage.getItem('products')) || [];
    var grid = document.querySelector('#home-page .product-grid');

    // ❌ JANGAN HAPUS SEMUA
    // grid.innerHTML = '';

    var existing = document.querySelectorAll('#home-page .product-card.dynamic');
    existing.forEach(el => el.remove());

    products.forEach(function(p) {

        var card = document.createElement('div');
        card.className = 'product-card dynamic';
        card.dataset.cat = p.category;

        card.innerHTML = `
            <div class="product-img">
                <img src="${p.image}" style="width:100%;height:100%;object-fit:cover;">
            </div>
            <div class="product-info">
                <p class="product-name">${p.name}</p>
                <p class="price">Rp ${p.price}</p>
                <p class="location">📍 ${p.location}</p>
            </div>
        `;

        // ✅ TAMBAHKAN DI ATAS (bukan appendChild)

        card.addEventListener('click', function() {
        showDetail(p);
    });

        grid.prepend(card);
    });
}

// ═══════════════════════════════════════════════════════════════
// ✅ FIXED: LOAD FAVORITES YANG BISA DIKLIK
// ═══════════════════════════════════════════════════════════════
function loadFavorites() {
    var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    var container = document.getElementById('favorite-list'); // Container utama
    
    if (!container) {
        console.error('❌ favorite-list tidak ditemukan!');
        return;
    }
    
    // ✅ CLEAR DULU
    container.innerHTML = '';

    if (favorites.length === 0) {
        container.innerHTML = '<div style="padding:20px;color:#999;text-align:center;font-style:italic;">Belum ada barang favorit</div>';
        return;
    }

    // ✅ HAPUS DUPLIKAT
    var uniqueFavorites = [];
    var seenIds = new Set();
    favorites.forEach(function(item) {
        if (item.id && !seenIds.has(item.id)) {
            seenIds.add(item.id);
            uniqueFavorites.push(item);
        }
    });

    // ✅ BUAT LIST ITEM
    uniqueFavorites.forEach(function(item) {
        var itemDiv = document.createElement('div');
        itemDiv.className = 'favorite-item';
        itemDiv.style.cssText = `
            padding: 15px;
            margin: 5px 0;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            transition: all 0.2s;
            border-left: 4px solid #27AE60;
        `;
        
        itemDiv.innerHTML = `
            <div style="flex:1;">
                <div style="font-weight:600;font-size:15px;margin-bottom:4px;">${item.name}</div>
                <div style="font-size:12px;color:#aaa;">Rp ${item.price} • ${item.location}</div>
            </div>
            <button class="remove-fav-btn" data-id="${item.id}" style="
                background: #ff4d6d;
                color: white;
                border: none;
                border-radius: 20px;
                padding: 6px 12px;
                font-size: 12px;
                cursor: pointer;
                min-width: 35px;
                height: 35px;
            ">×</button>
        `;
        
        // ✅ EVENT LISTENER UNTUK LIHAT DETAIL
        itemDiv.addEventListener('click', function(e) {
            var target = e.target;
            // Jangan trigger kalau klik tombol hapus
            if (target.classList.contains('remove-fav-btn') || target.closest('.remove-fav-btn')) {
                return;
            }
            showDetail(item);
        });
        
        // ✅ EVENT LISTENER HAPUS
        var removeBtn = itemDiv.querySelector('.remove-fav-btn');
        removeBtn.addEventListener('click', function() {
            removeFavorite(item.id);
        });
        
        container.appendChild(itemDiv);
    });
}

// ✅ FUNGSI HAPUS FAVORIT
function removeFavorite(productId) {
    var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(function(f) {
        return f.id != productId;
    });
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Refresh list
    loadFavorites();
    alert('✅ Dihapus dari favorit!');
}

function removeFavorite(productId) {
    var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(function(f) {
        return f.id !== productId;
    });
    localStorage.setItem('favorites', JSON.stringify(favorites));
    loadFavorites(); // Refresh list
    alert('✅ Dihapus dari favorit');
}

function loadSellingProducts() {
    var products = JSON.parse(localStorage.getItem('products')) || [];
    var grid = document.getElementById('selling-grid');
    
    grid.innerHTML = '';
    
    if (products.length === 0) {
        grid.innerHTML = '<p style="padding:20px;grid-column:1/-1;text-align:center;color:#999;">Belum ada barang yang dijual</p>';
        return;
    }
    
    products.forEach(function(product) {
        var card = document.createElement('div');
        card.className = 'product-card';
        card.style.cursor = 'pointer';
        card.innerHTML = `
            <div class="product-img">
                <img src="${product.image}" style="width:100%;height:100%;object-fit:cover;">
            </div>
            <div class="product-info">
                <p class="product-name">${product.name}</p>
                <p class="price">Rp ${product.price}</p>
            </div>
        `;
        card.addEventListener('click', function() {
            showDetail(product);
        });
        grid.appendChild(card);
    });
}

// ── SELL FORM SUBMIT ──

function renderAllProducts() {
    var products = JSON.parse(localStorage.getItem('products')) || [];
    var grid = document.querySelector('#all-page .product-grid');

    // hapus produk lama (yang dynamic saja)
    var existing = grid.querySelectorAll('.dynamic');
    existing.forEach(el => el.remove());

    products.forEach(function(p) {
        var card = document.createElement('div');
        card.className = 'product-card dynamic';

        card.innerHTML = `
            <div class="product-img">
                <img src="${p.image}" style="width:100%;height:100%;object-fit:cover;">
            </div>
            <div class="product-info">
                <p class="product-name">${p.name}</p>
                <p class="price">Rp ${p.price}</p>
                <p class="location">📍 ${p.location}</p>
            </div>
        `;

        card.addEventListener('click', function() {
            showDetail(p);
        });

        grid.prepend(card);
    });
}

function showDetail(product) {
    selectedProduct = product;

    document.getElementById('detail-image').src = product.image;
    document.getElementById('detail-name').innerText = product.name;
    document.getElementById('detail-price').innerText = 'Rp ' + product.price;
    document.getElementById('detail-location').innerText = '📍 ' + product.location;
    document.getElementById('detail-description').innerText = product.description || 'Tidak ada deskripsi';
    
    // Tampilkan info penjual
    var user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('detail-seller').innerText = 'Penjual: ' + product.sellerName;
    }

    // Tutup menu jika ada
    var menu = document.getElementById('detail-menu');
    if (menu) menu.classList.add('hidden');

    // Tampilkan modal (jangan ganti halaman)
    document.getElementById('detail-modal-backdrop').classList.remove('hidden');
    document.getElementById('detail-page').classList.remove('hidden');
}

function closeDetail() {
    document.getElementById('detail-modal-backdrop').classList.add('hidden');
    document.getElementById('detail-page').classList.add('hidden');
    // Tutup menu saat menutup detail
    var menu = document.getElementById('detail-menu');
    if (menu) menu.classList.add('hidden');
}

function toggleDetailMenu() {
    var menu = document.getElementById('detail-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

function deleteProduct() {
    if (!selectedProduct) return;
    
    if (confirm('Yakin ingin menghapus barang ini?')) {
        var products = JSON.parse(localStorage.getItem('products')) || [];
        
        // Cari dan hapus produk yang sesuai
        products = products.filter(function(p) {
        return p.id !== selectedProduct.id;
    });
        
        localStorage.setItem('products', JSON.stringify(products));
        alert('Barang berhasil dihapus!');
        
        renderProducts();
        renderAllProducts();
        loadSellingProducts();
        closeDetail();
    }
}

function shareProduct() {
    if (!selectedProduct) return;
    
    var text = 'Halo, lihat barang bekas yang bagus ini!\n\n' +
        selectedProduct.name + '\n' +
        'Harga: Rp ' + selectedProduct.price + '\n' +
        'Lokasi: ' + selectedProduct.location + '\n' +
        'Deskripsi: ' + (selectedProduct.description || '-');
    
    // Jika ada fitur share ke WhatsApp atau media sosial
    var whatsappUrl = 'https://wa.me/?text=' + encodeURIComponent(text);
    window.open(whatsappUrl);
}

function searchProducts(keyword) {
    keyword = keyword.toLowerCase();
    
    // ✅ FIXED: Cari SEMUA product-grid di page aktif
    var grids = document.querySelectorAll('.product-grid');
    
    grids.forEach(function(grid) {
        var cards = grid.querySelectorAll('.product-card');
        cards.forEach(function(card) {
            var name = card.querySelector('.product-name');
            if (name) {
                var text = name.innerText.toLowerCase();
                if (text.includes(keyword) || keyword === '') {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            }
        });
    });
}


function addToFavorite() {
    if (!selectedProduct) return;

    var favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    // ✅ FIXED: Cek duplikat berdasarkan ID SAJA
    var exists = favorites.some(function(f) {
        return f.id === selectedProduct.id;
    });

    if (!exists) {
        favorites.push(selectedProduct);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert('✅ Ditambahkan ke favorit!');
    } else {
        alert('❌ Sudah ada di favorit');
    }
}

function chatSeller() {
    if (!selectedProduct) return;
    
    var user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('Silakan login terlebih dahulu');
        return;
    }
    
    var message = 'Halo, saya tertarik dengan ' + selectedProduct.name + '. Apakah masih tersedia?';
    var sellerPhone = selectedProduct.sellerPhone;  

    // Buka WhatsApp
    window.open('https://wa.me/' + sellerPhone.replace(/[^0-9]/g, '') + '?text=' + encodeURIComponent(message));
}

function buyProduct() {
    if (!selectedProduct) return;
    
    var user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('Silakan login terlebih dahulu');
        return;
    }
    
    alert('Terima kasih! Anda akan dialihkan ke WhatsApp untuk menyelesaikan pembelian.');
    chatSeller();
}


// ═══════════════════════════════════════════════════════════════
// ✅ SAVE PROFILE - TAMBAHAN BARU
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// ✅ FIXED UPLOAD - DOMContentLoaded BARU
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ App fully loaded!');
    
    // AUTO INIT
    renderProducts();
    checkLogin();
    
    // ====================================================
    // ✅ FIXED PHOTO UPLOAD
    // ====================================================
    var photoBox = document.getElementById('photo-box');
    var photoInput = document.getElementById('item-photo');
    
    if (photoBox && photoInput) {
        // Photo box click → trigger file input
        photoBox.addEventListener('click', function(e) {
            e.stopPropagation(); // ✅ Prevent bubble ke form
            console.log('📷 Photo box clicked');
            photoInput.click();
        });
        
        // File selected → preview
        photoInput.addEventListener('change', function() {
            console.log('✅ Photo selected');
            var file = this.files[0];
            if (file) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    photoBox.innerHTML = 
                        `<img src="${e.target.result}" style="width:100%;height:180px;object-fit:cover;border-radius:8px;">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // ====================================================
    // ✅ FIXED FORM SUBMIT - Z-INDEX SOLVED
    // ====================================================
    var sellForm = document.getElementById('sell-form');
    if (sellForm) {
        sellForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation(); // ✅ Prevent double trigger
            console.log('🚀 UPLOAD BUTTON CLICKED!');
            uploadProduct();
        });
    }
});

// ═══════════════════════════════════════════════════════════════
// ✅ UPLOAD FIX 100% - NO Z-INDEX CONFLICT
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 App ready!');
    
    // Auto load
    renderProducts();
    checkLogin();
    
    // ====================================================
    // ✅ PHOTO UPLOAD FIX
    // ====================================================
    const photoBox = document.getElementById('photo-box');
    const photoInput = document.getElementById('item-photo');
    const sellForm = document.getElementById('sell-form');
    
    if (photoBox && photoInput) {
        // Klik photo box → buka file picker
        photoBox.addEventListener('click', function() {
            console.log('📷 Photo clicked');
            photoInput.click();
        });
        
        // Preview foto
        photoInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    photoBox.innerHTML = 
                        `<img src="${e.target.result}" style="width:100%;height:180px;object-fit:cover;border-radius:8px;">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // ====================================================
    // ✅ FORM SUBMIT FIX - DIRECT onclick
    // ====================================================
    const uploadBtn = document.querySelector('#sell-form button[type="submit"]');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('✅ UPLOAD CLICKED!');
            uploadProduct();
        });
    }
});

// ========================================================
// FUNGSI UPLOAD TERPISAH
// ========================================================
function uploadProduct() {
    console.log('🚀 Starting upload...');
    
    var name = document.getElementById('item-name').value;
    var category = document.getElementById('item-category').value;
    var price = document.getElementById('item-price').value;
    var location = document.getElementById('item-location').value;
    var photoInput = document.getElementById('item-photo');
    
    if (!name || !category || !price || !location || !photoInput.files[0]) {
        alert('❌ Lengkapi semua field & foto!');
        return;
    }
    
    var reader = new FileReader();
    reader.onload = function(e) {
        var products = JSON.parse(localStorage.getItem('products')) || [];
        var user = JSON.parse(localStorage.getItem('user'));
        
        var newProduct = {
            id: Date.now(),
            name: name,
            category: category,
            price: price,
            location: location,
            image: e.target.result,
            sellerName: user ? user.name : 'Seller'
        };
        
        products.unshift(newProduct);
        localStorage.setItem('products', JSON.stringify(products));
        
        console.log('✅ Product saved:', newProduct);
        alert('🎉 Barang berhasil diupload!');
        
        // RESET FORM
        document.getElementById('sell-form').reset();
        document.getElementById('photo-box').innerHTML = `
            <div class="photo-placeholder" style="cursor:pointer;">
                📷<br><span class="photo-text">+ Klik untuk tambah foto</span>
            </div>
        `;
        
        renderProducts();
        showPage('home-page');
    };
    reader.readAsDataURL(photoInput.files[0]);
}

// ✅ UPDATE CHAT BUTTON - BUKA HALAMAN CHAT
document.getElementById('chat-button')?.addEventListener('click', function() {
    showPage('chat-page');
});
// ✅ FUNGSI CHAT - TAMBAH DI AKHIR
function searchChats(keyword) {
    keyword = keyword.toLowerCase();
    document.querySelectorAll('.chat-item').forEach(item => {
        var name = item.querySelector('.chat-name')?.innerText.toLowerCase() || '';
        item.style.display = name.includes(keyword) ? '' : 'none';
    });
}

// ✅ GANTI openChat() 
function openChat(chatTitle) {
    window.currentChat = {
        title: chatTitle,
        product: chatTitle.split(' - ')[1] || 'Barang',
        partner: chatTitle.split(' - ')[0] || 'Seller'
    };
    
    document.getElementById('chat-detail-title').innerText = window.currentChat.partner;
    loadChatMessages();
    
    showPage('chat-detail-page');  // ← LANGSUNG KE CHAT DETAIL
}

// ✅ CHAT SYSTEM - TAMBAH SEMUA DI AKHIR

// Simpan chat history per user
function getChatHistory(partner) {
    var chats = JSON.parse(localStorage.getItem('chats') || '{}');
    return chats[partner] || [];
}

function saveChatHistory(partner, messages) {
    var chats = JSON.parse(localStorage.getItem('chats') || '{}');
    chats[partner] = messages;
    localStorage.setItem('chats', JSON.stringify(chats));
}

function loadChatMessages() {
    var partner = window.currentChat?.partner;
    if (!partner) return;
    
    var messages = getChatHistory(partner);
    var container = document.getElementById('chat-messages');
    container.innerHTML = '';
    
    // Tambah pesan pembuka otomatis
    if (messages.length === 0) {
        var welcomeMsg = {
            text: `Halo! Saya tertarik dengan ${window.currentChat.product}. Masih tersedia? 😊`,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            sent: true
        };
        messages.push(welcomeMsg);
        saveChatHistory(partner, messages);
    }
    
    messages.forEach(msg => {
        var div = document.createElement('div');
        div.className = `message ${msg.sent ? 'sent' : 'received'}`;
        div.innerHTML = `
            ${msg.text}
            <div class="message-time">${msg.time}</div>
        `;
        container.appendChild(div);
    });
    
    // Scroll ke bawah
    container.scrollTop = container.scrollHeight;
}

function sendMessage() {
    var input = document.getElementById('message-input');
    var text = input.value.trim();
    
    if (!text || !window.currentChat) return;
    
    var partner = window.currentChat.partner;
    var messages = getChatHistory(partner);
    
    // Tambah pesan user
    var userMsg = {
        text: text,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        sent: true
    };
    messages.push(userMsg);
    
    // Simulasi balasan (delay 2 detik)
    setTimeout(() => {
        var replyMsg = {
            text: `Terima kasih! ${window.currentChat.product} masih ada. Bisa COD di ${window.currentChat.location}? 💬`,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            sent: false
        };
        messages.push(replyMsg);
        saveChatHistory(partner, messages);
        loadChatMessages();
    }, 2000);
    
    input.value = '';
    saveChatHistory(partner, messages);
    loadChatMessages();
}

function handleKeypress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Update chat list dengan data real
function updateChatList() {
    var chats = JSON.parse(localStorage.getItem('chats') || '{}');
    var chatItems = document.querySelectorAll('.chat-item');
    
    chatItems.forEach((item, index) => {
        var partner = ['Budi', 'Sari'][index];
        var messages = chats[partner] || [];
        if (messages.length > 0) {
            var lastMsg = messages[messages.length - 1];
            item.querySelector('.chat-preview').innerText = lastMsg.text.substring(0, 30) + '...';
            item.querySelector('.chat-time').innerText = lastMsg.time;
        }
    });
}