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
    })
    .catch(err => console.error("Error:", err));
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

// --- LOAD ITEMS (The Magnificent Version) ---
function loadItems() {
    fetch('/items')
    .then(res => res.json())
    .then(items => {
        const container = document.getElementById('items');
        container.innerHTML = ""; // Clear loading message

        if (items.length === 0) {
            container.innerHTML = "<p>No items for sale yet. Be the first!</p>";
            return;
        }

        items.forEach(item => {
            container.innerHTML += `
                <div class="card">
                    <div class="price">₦${item.price}</div>
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <a href="https://wa.me/${item.phone}?text=Hi, I'm interested in your ${item.name}" 
                       target="_blank" 
                       class="whatsapp-link">
                       Chat with Seller
                    </a>
                </div>
            `;
        });
    });
}

// --- LOGOUT ---
function logout() {
    localStorage.removeItem('user');
    window.location = "login.html";
}

// --- POST ITEM ---
function postItem() {
    const name = document.getElementById('itemName').value;
    const price = document.getElementById('itemPrice').value;
    const description = document.getElementById('itemDesc').value;
    
    // Get logged-in user details
    const user = JSON.parse(localStorage.getItem('user'));

    if (!name || !price || !description) {
        return alert("Please fill in all fields!");
    }

    const newItem = {
        name,
        price,
        description,
        phone: user.phone, // Automatically link the post to the seller
        seller: user.username,
        date: new Date().toLocaleDateString()
    };

    fetch('/add-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Success! Your item is now live.");
            window.location = "index.html";
        }
    })
    .catch(err => alert("Error posting item. Check your connection."));
}

