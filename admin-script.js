// ========================================
// ADMIN PANEL LOGIC & SECURITY
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // 🔒 SECURITY CHECK: Kick out anyone who isn't the admin
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Check if no user is logged in, OR if the logged-in user is not an admin
    if (!currentUser || currentUser.role !== 'admin') {
        alert('⛔ Access Denied! Please log in with an Admin account.');
        window.location.href = 'login.html';
        return; // Stops the rest of the page from working
    }

    console.log('Admin Script Loaded!');
    
    // Initialize Navigation
    initAdminNavigation();
    // Load the Booking Data
    loadAdminBookings();
    // Load the Customer Data
    loadAdminCustomers(); // <-- ADD THIS LINE
    // Load the Venues Data
    loadAdminVenues();
    // Load the Packages Data
    loadAdminPackages(); // <-- ADD THIS LINE
});
// ✅ ADMIN LOGOUT FUNCTION
function adminLogout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}
// ✅ SIDEBAR NAVIGATION LOGIC
function initAdminNavigation() {
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const sections = document.querySelectorAll('.content-section');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 1. Remove 'active' from all nav items, add to the clicked one
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            // 2. Hide all content sections
            sections.forEach(sec => sec.classList.remove('active'));
            
            // 3. Find the target section ID and show it
            const targetId = this.getAttribute('data-section');
            const targetSection = document.getElementById(targetId);
            if(targetSection) {
                targetSection.classList.add('active');
            }
            // 4. Update the page title at the top
            const titleElement = document.getElementById('pageTitle');
            if(titleElement) {
                titleElement.innerText = this.querySelector('span').innerText;
            }
        });
    });
}
// ✅ LOAD BOOKINGS & POPULATE TABLES
function loadAdminBookings() {
    // Get bookings from local storage
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    
    // Get table elements
    const mainTable = document.getElementById('bookingsTable');
    const recentTable = document.getElementById('recentBookingsTable');
    // Clear tables
    if (mainTable) mainTable.innerHTML = '';
    if (recentTable) recentTable.innerHTML = '';
    // If no bookings exist
    if (bookings.length === 0) {
        if (mainTable) mainTable.innerHTML = '<tr><td colspan="12" style="text-align:center; padding: 2rem;">No bookings found yet.</td></tr>';
        if (recentTable) recentTable.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem;">No recent bookings.</td></tr>';
        updateDashboardStats(bookings);
        return;
    }
    // Populate MAIN "All Bookings" Table
    bookings.forEach(booking => {
        const shortId = '#' + booking.id.toString().slice(-5);
        const packageType = booking.package ? booking.package.split(' ')[0].toLowerCase() : 'silver';
        const total = booking.total ? `₹${booking.total.toLocaleString('en-IN')}` : 'TBD';   
        if (mainTable) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${shortId}</strong></td>
                <td><div style="font-weight: 600; color: #2d3748;">${booking.customer}</div></td>
                <td><div style="font-size: 0.85rem; color: #718096;">${booking.phone}</div></td>
                <td><span class="event-type">${booking.eventType || 'Event'}</span></td>
                <td><div style="font-weight: 500;">${booking.eventDate || 'TBD'}</div></td>
                <td><div style="font-size: 0.9rem;">${booking.location || 'TBD'}</div></td>
                <td><span class="package-badge ${packageType}">${booking.package || 'Custom'}</span></td>
                <td>${booking.guests || '0'}</td>
                <td><div style="font-size: 0.85rem; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${booking.requirements || 'None'}">${booking.requirements || '-'}</div></td>
                <td><strong>${total}</strong></td>
                <td><span class="status-badge ${booking.status}">${booking.status}</span></td>
                <td>
                    <button onclick="updateBookingStatus(${booking.id}, 'approved')" class="btn btn-sm btn-success" style="padding: 0.4rem; min-width:35px; margin-right: 0.2rem;" title="Approve"><i class="fas fa-check"></i></button>
                    <button onclick="updateBookingStatus(${booking.id}, 'rejected')" class="btn btn-sm btn-danger" style="padding: 0.4rem; min-width:35px;" title="Reject"><i class="fas fa-times"></i></button>
                    <button onclick="deleteBooking(${booking.id})">❌</button>
                </td>
            `;
            mainTable.appendChild(row);
        }
    });

    // Populate RECENT Bookings Table (Last 5 Bookings, 5 Columns)
    if (recentTable) {
        const recentBookings = [...bookings].reverse().slice(0, 5);
        
        recentBookings.forEach(booking => {
            const total = booking.total ? `₹${booking.total.toLocaleString('en-IN')}` : 'TBD';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div style="font-weight: 600; color: #2d3748;">${booking.customer}</div>
                    <div style="font-size: 0.8rem; color: #718096;">${booking.phone}</div>
                </td>
                <td><span class="event-type">${booking.eventType || 'Event'}</span></td>
                <td><div style="font-weight: 500;">${booking.eventDate || 'TBD'}</div></td>
                <td><strong>${total}</strong></td>
                <td><span class="status-badge ${booking.status}">${booking.status}</span></td>
            `;
            recentTable.appendChild(row);
        });
    }

    // Update Dashboard Numbers
    updateDashboardStats(bookings);
}

// ✅ APPROVE/REJECT LOGIC
function updateBookingStatus(bookingId, newStatus) {
    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    
    if (bookingIndex !== -1) {
        bookings[bookingIndex].status = newStatus;
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        // Instantly reload tables
        loadAdminBookings();
    }
}

// ✅ UPDATE DASHBOARD STATS
function updateDashboardStats(bookings) {
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const completedBookings = bookings.filter(b => b.status === 'approved').length;
    const revenue = bookings.reduce((sum, b) => b.status === 'approved' ? sum + (b.total || 0) : sum, 0);

    const elTotal = document.getElementById('totalBookings');
    const elPending = document.getElementById('pendingBookings');
    const elCompleted = document.getElementById('completedBookings');
    const elRevenue = document.getElementById('totalRevenue');
    const elBadge = document.getElementById('pendingCount');

    // Safely update text if element exists
    if(elTotal) elTotal.innerText = totalBookings;
    if(elPending) elPending.innerText = pendingBookings;
    if(elCompleted) elCompleted.innerText = completedBookings;
    if(elRevenue) elRevenue.innerText = `₹${revenue.toLocaleString('en-IN')}`;
    if(elBadge) elBadge.innerText = pendingBookings;
}
// ✅ LOAD CUSTOMERS LOGIC
function loadAdminCustomers() {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const customersTable = document.getElementById('customersTable');
    
    // Stop if we aren't on a page with the customers table
    if (!customersTable) return; 

    customersTable.innerHTML = ''; // Clear table

    // 1. Extract unique customers and count their bookings
    const customerMap = {};
    bookings.forEach(booking => {
        // Use phone number as the unique identifier
        if (!customerMap[booking.phone]) {
            customerMap[booking.phone] = { 
                name: booking.customer, 
                phone: booking.phone, 
                bookingCount: 0 
            };
        }
        customerMap[booking.phone].bookingCount += 1;
    });

    // Convert our map back into an array
    const uniqueCustomers = Object.values(customerMap);

    // 2. Display 'No Data' message if empty
    if (uniqueCustomers.length === 0) {
        customersTable.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 2rem;">No registered customers yet.</td></tr>';
        return;
    }

    // 3. Populate the table
    uniqueCustomers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${customer.name}</strong></td>
            <td>${customer.phone}</td>
            <td><span class="badge" style="background-color: #4a5568; color: white;">${customer.bookingCount} Booking(s)</span></td>
        `;
        customersTable.appendChild(row);
    });
}

function deleteBooking(id){
    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];

    bookings = bookings.filter(b => b.id !== id);

    localStorage.setItem('bookings', JSON.stringify(bookings));

    alert("Deleted Successfully!");
    location.reload();
}
// ✅ LOAD PACKAGES LOGIC
function loadAdminPackages() {
    const packagesGrid = document.getElementById('packagesGrid');
    
    // Stop if we aren't on a page with the packages grid
    if (!packagesGrid) return; 

    // Package data based on your booking form options
    const packagesData = {
        "Birthday Packages": [
            { name: "Silver Package", price: "₹25,000", features: ["Basic floral decoration", "2 hours setup time", "Standard lighting", "Up to 100 guests"], tier: "silver", color: "#718096", bg: "#e2e8f0" },
            { name: "Gold Package", price: "₹45,000", features: ["Premium floral arrangement", "4 hours setup time", "LED lighting", "Up to 250 guests"], tier: "gold", color: "#b7791f", bg: "#fefcbf" },
            { name: "Platinum Package", price: "₹75,000", features: ["Luxury floral arrangements", "Full day setup", "Laser lighting", "Unlimited guests"], tier: "platinum", color: "#4c51bf", bg: "#ebf4ff" }
        ],
        "Wedding Packages": [
            { name: "Silver Package", price: "₹2,50,000", features: ["Beautiful floral entrance", "Standard stage decoration", "Traditional Mandap", "200 guests"], tier: "silver", color: "#718096", bg: "#e2e8f0" },
            { name: "Gold Package", price: "₹3,50,000", features: ["Premium imported flowers", "Grand stage with LED screens", "Intelligent lighting", "500 guests"], tier: "gold", color: "#b7791f", bg: "#fefcbf" },
            { name: "Diamond Package", price: "₹5,00,000", features: ["Exotic luxury floral ceiling", "3D theme stage", "Laser & fireworks", "Unlimited premium seating"], tier: "platinum", color: "#4c51bf", bg: "#ebf4ff" }
        ],
        "Corporate Packages": [
            { name: "Standard Package", price: "₹80,000", features: ["Professional flex backdrop", "Basic AV & PA sound", "Stage & podium", "Up to 100 pax"], tier: "silver", color: "#718096", bg: "#e2e8f0" },
            { name: "Premium Package", price: "₹1,50,000", features: ["LED video wall backdrop", "Premium line-array sound", "Custom lighting", "Up to 300 pax"], tier: "gold", color: "#b7791f", bg: "#fefcbf" },
            { name: "Elite Package", price: "₹3,00,000", features: ["Multiple curved LED screens", "Concert-grade AV", "3D projection mapping", "500+ pax"], tier: "platinum", color: "#4c51bf", bg: "#ebf4ff" }
        ]
    };

    packagesGrid.innerHTML = ''; // Clear grid

    // Loop through each event category
    for (const [category, packages] of Object.entries(packagesData)) {
        
        // Create a full-width header for the category
        const categoryHeader = document.createElement('div');
        categoryHeader.style.gridColumn = "1 / -1"; // Makes it span all columns
        categoryHeader.style.marginTop = "1rem";
        categoryHeader.innerHTML = `
            <h3 style="border-bottom: 2px solid #edf2f7; padding-bottom: 0.8rem; color: #2d3748; display: flex; align-items: center;">
                <i class="fas fa-box-open" style="color: #667eea; margin-right: 10px;"></i>${category}
            </h3>
        `;
        packagesGrid.appendChild(categoryHeader);

        // Loop through the 3 packages within that category
        packages.forEach(pkg => {
            const featureList = pkg.features.map(f => 
                `<li style="margin-bottom: 0.6rem; font-size: 0.9rem; color: #4a5568;">
                    <i class="fas fa-check" style="color: #48bb78; margin-right: 8px;"></i>${f}
                </li>`
            ).join('');

            const card = document.createElement('div');
            card.className = 'card';
            card.style.padding = '1.5rem';
            card.style.borderTop = `4px solid ${pkg.color}`; // Colored top border based on tier
            
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <h4 style="margin: 0; color: #2d3748; font-size: 1.1rem;">${pkg.name}</h4>
                    <span style="background: ${pkg.bg}; color: ${pkg.color}; padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">${pkg.tier}</span>
                </div>
                <div style="font-size: 1.6rem; font-weight: 700; color: #2d3748; margin-bottom: 1.5rem;">${pkg.price}</div>
                <ul style="list-style: none; padding: 0; margin: 0; margin-bottom: 1.5rem;">
                    ${featureList}
                </ul>
                <button class="btn btn-secondary" style="width: 100%; padding: 0.6rem; font-size: 0.9rem;">
                    <i class="fas fa-edit"></i> Edit Package
                </button>
            `;
            
            packagesGrid.appendChild(card);
        });
    }
}