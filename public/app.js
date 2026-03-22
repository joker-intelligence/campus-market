// Helper to get user from local storage
const getCurrentUser = () => JSON.parse(localStorage.getItem('user'));

// --- REGISTER ---
function register() {
    const username = document.getElementById('username').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;

    if(!username || !phone || !password) return alert("Please fill all fields");

    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, phone, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Registration Successful! Please login.");
            window.location = "login.html";
        } else {
            alert(data.message || "Registration failed");
        }
    });
}

// --- LOGIN ---
function login() {
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location = "index.html";
        } else {
            alert("Invalid phone or password");
        }
    });
}

// --- LOAD ITEMS (Now with Image Support) ---
function loadItems() {
    fetch('/posts') // Changed from /items to /posts to match your server
    .then(res => res.json())
    .then(items => {
        const container = document.getElementById('items');
        if(!container) return; 
        container.innerHTML = ""; 

        if (items.length === 0) {
            container.innerHTML = "<p>No items for sale yet. Be the first!</p>";
            return;
        }

        items.forEach(item => {
            container.innerHTML += `
                <div class="card">
                    ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" style="width:100%; border-radius:10px; margin-bottom:10px;">` : ''}
                    <div class="price">₦${item.price}</div>
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <p><small>Seller: ${item.seller}</small></p>
                    <a href="https://wa.me/${item.phone || ''}?text=Hi, I'm interested in your ${item.name}" 
                       target="_blank" 
                       class="whatsapp-link">
                       Chat with Seller
                    </a>
                </div>
            `;
        });
    });
}

// --- POST ITEM (The Async Image Version) ---
async function postItem() {
    const name = document.getElementById('itemName').value;
    const price = document.getElementById('itemPrice').value;
    const desc = document.getElementById('itemDesc').value;
    const imageInput = document.getElementById('itemImage'); 
    const imageFile = imageInput.files[0];

    const user = getCurrentUser();
    if (!user) return window.location = "login.html";

    if (!name || !price || !imageFile) {
        alert("Please fill in the Name, Price, and select a Photo!");
        return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('description', desc);
    formData.append('image', imageFile); 
    formData.append('seller', user.username);
    formData.append('phone', user.phone); // Adding phone so WhatsApp works!

    try {
        const response = await fetch('/posts', {
            method: 'POST',
            body: formData 
        });

        if (response.ok) {
            alert("Success! Item is now live.");
            window.location.href = "index.html";
        } else {
            alert("Upload failed. Check your connection.");
        }
    } catch (err) {
        console.error("Connection error:", err);
    }
}

// --- LOGOUT ---
function logout() {
    localStorage.removeItem('user');
    window.location = "login.html";
}

