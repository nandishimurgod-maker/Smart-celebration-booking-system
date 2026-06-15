let currentStep = 1;

let bookingData = {
    eventType: "",
    eventDate: "",
    startTime: "",
    duration: "",
    guests: "",
    requirements: "",
    package: "",
    packagePrice: 0,
    location: "",
    venue: ""
};

// VALIDATION
function validateStep(step) {
    if (step === 1) {
        const eventType = document.getElementById('eventType').value;
        const eventDate = document.getElementById('eventDate').value;
        const startTime = document.getElementById('startTime').value;
        const guests = document.getElementById('guests').value;

        if (!eventType || !eventDate || !startTime || !guests) {
            alert("Please fill out all required fields marked with *");
            return false;
        }

        bookingData.eventType = eventType;
        bookingData.eventDate = eventDate;
        bookingData.startTime = startTime;
        bookingData.duration = document.getElementById('duration').value;
        bookingData.guests = guests;
        bookingData.requirements = document.getElementById('requirements').value;

        // Auto-switch packages based on event
        let category = 'birthday'; 
        if (eventType === 'wedding') category = 'wedding';
        if (eventType === 'corporate') category = 'corporate';

        // Hide all grids, show correct one
        document.querySelectorAll('.packages-category').forEach(grid => grid.style.display = 'none');
        document.getElementById(`grid-${category}`).style.display = 'grid';

        // Reset package selection when changing tabs
        document.querySelectorAll('.package-card').forEach(c => c.classList.remove('active'));
        bookingData.package = "";
        bookingData.packagePrice = 0;

        return true;
    }

    if (step === 2) {
        if (!bookingData.package) {
            alert("Please select a package to continue!");
            return false;
        }

        const location = document.getElementById('location').value;
        const venue = document.getElementById('venue').value;

        if (!location || !venue) {
            alert("Please select both a city and a venue!");
            return false;
        }

        bookingData.location = location;
        bookingData.venue = venue;

        return true;
    }

    return true;
}

// STEP NAVIGATION
function nextStep(step) {
    if (!validateStep(step)) return;

    // Switch active class
    document.getElementById(`step${step}`).classList.remove('active');
    document.getElementById(`step${step + 1}`).classList.add('active');

    currentStep = step + 1;
    updateProgress();

    // Call update summary if reaching step 3
    if (currentStep === 3) {
        updateSummary();
    }
}

function prevStep(step) {
    document.getElementById(`step${step}`).classList.remove('active');
    document.getElementById(`step${step - 1}`).classList.add('active');

    currentStep = step - 1;
    updateProgress();
}

// PROGRESS BAR UI
function updateProgress() {
    document.querySelectorAll('.progress-step').forEach((step, i) => {
        step.classList.toggle('active', i < currentStep);
    });
}

// SETUP EVENT LISTENERS
document.addEventListener("DOMContentLoaded", function () {

    // Package selection logic
    document.querySelectorAll('.package-card').forEach(card => {
        card.addEventListener('click', function() {
            // Remove active from sibling cards in the same grid
            const parentGrid = this.closest('.packages-grid');
            parentGrid.querySelectorAll('.package-card').forEach(c => c.classList.remove('active'));
            
            // Add active to clicked card
            this.classList.add('active');
            
            // Save data
            bookingData.package = this.dataset.package;
            bookingData.packagePrice = parseInt(this.dataset.price); 
        });
    });

    // Venues logic
    const venuesData = {
        hubli: ["Clarks Inn Hotel Ballroom", "The Signature Club", "Hubli Lawns & Resorts"],
        dharwad: ["Kamat Hotel Banquet Hall", "Sai International", "Dharwad Lawn House"],
        belagavi: ["The President Hotel Banquet", "Belagavi Turf Club", "Vasant Vihar Lawns"],
        mysore: ["Radisson Blu Plaza", "Mysore Palace Lawns", "Silent Shores Resort"],
        bangalore: ["Taj West End", "UB City Terrace", "The Leela Palace"]
    };

    const locationSelect = document.getElementById('location');
    const venueSelect = document.getElementById('venue');

    if (locationSelect && venueSelect) {
        locationSelect.addEventListener('change', function () {
            venueSelect.innerHTML = '<option value="">Select Venue</option>';

            if (venuesData[this.value]) {
                venuesData[this.value].forEach(v => {
                    const option = document.createElement('option');
                    option.value = v;
                    option.textContent = v;
                    venueSelect.appendChild(option);
                });
                venueSelect.disabled = false;
            } else {
                venueSelect.disabled = true;
            }
        });
    }
});

// SUMMARY POPULATOR
function updateSummary() {
    try {
        document.getElementById('summaryEvent').innerText = (bookingData.eventType || "Event").toUpperCase();
        document.getElementById('summaryDateTime').innerText = (bookingData.eventDate || "TBD") + " | " + (bookingData.startTime || "TBD");
        document.getElementById('summaryGuests').innerText = (bookingData.guests || "0") + " Guests";
        document.getElementById('summaryPackage').innerText = bookingData.package || "Custom";
        document.getElementById('summaryVenue').innerText = (bookingData.location || "Location").toUpperCase() + " - " + (bookingData.venue || "Venue");
        
        // <-- ADDED THIS BLOCK TO SHOW REQUIREMENTS -->
        const summaryReq = document.getElementById('summaryRequirements');
        if (summaryReq) {
            summaryReq.innerText = bookingData.requirements ? bookingData.requirements : "None";
        }
        
        const priceString = bookingData.packagePrice ? bookingData.packagePrice.toLocaleString('en-IN') : "0";
        document.getElementById('summaryTotal').innerText = "₹" + priceString;
    } catch (error) {
        console.log("Error generating summary: ", error);
    }
}

// FINAL SUBMISSION
// FINAL SUBMISSION
function confirmBooking() {
    const storedUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    const customerName = storedUser ? `${storedUser.firstName} ${storedUser.lastName}` : "Guest Customer";
    const customerPhone = storedUser ? storedUser.phone : "+91 9876543210";

    const newBooking = {
        id: Date.now(),
        customer: customerName,
        phone: customerPhone,
        eventType: bookingData.eventType,
        eventDate: bookingData.eventDate,
        location: bookingData.location,
        venue: bookingData.venue,
        package: bookingData.package,
        guests: bookingData.guests,
        requirements: bookingData.requirements, // <-- ADDED THIS LINE
        total: bookingData.packagePrice,
        status: "pending"
    };

    let savedBookings = JSON.parse(localStorage.getItem('bookings')) || [];
    savedBookings.push(newBooking);
    localStorage.setItem('bookings', JSON.stringify(savedBookings));

    alert("🎉 Booking Confirmed! Your event has been sent to the Admin Panel.");
    window.location.href = 'index.html'; 
}