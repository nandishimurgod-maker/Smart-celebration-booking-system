// Eventura Home Page - Complete Working Script
console.log('Eventura Script Loaded!');

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Loaded - Initializing Eventura...');
    
    initSlider();
    initBookingForm();
    initNavbarEffects();
    initSmoothScrolling();
    initScrollAnimations();
    initPackageTabs(); // <--- Add this line!

    function handleLogin(event) {
    event.preventDefault(); // Stop form from refreshing the page
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // 👑 1. Check if it is the Admin trying to log in
    if (email === 'admin@eventura.com' && password === 'admin123') {
        // Save admin session
        localStorage.setItem('currentUser', JSON.stringify({
            firstName: 'Eventura',
            lastName: 'Admin',
            email: 'admin@eventura.com',
            role: 'admin' // <-- This is the secret key the admin panel looks for!
        }));
        
        alert('Welcome back, Admin!');
        window.location.href = 'admin.html'; // Send to Admin Panel
        return;
    }

    // 👤 2. Regular Customer Login Logic goes here...
    // (Your existing code to check standard users)
}


    initPackageTabs();
    document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Loaded - Initializing Eventura...');
    
    
});


});

// ========================================
// SLIDER FUNCTIONALITY
// ========================================
let currentSlideIndex = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.nav-dot');

function initSlider() {
    if (slides.length === 0) return;
    
    showSlide(currentSlideIndex);
    
    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => currentSlide(index));
    });

    // Arrow navigation
    const prevBtn = document.querySelector('.slider-arrow.prev');
    const nextBtn = document.querySelector('.slider-arrow.next');
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    // Auto slide
    setInterval(nextSlide, 5000);
}

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
    
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

function nextSlide() {
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    showSlide(currentSlideIndex);
}

function prevSlide() {
    currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
    showSlide(currentSlideIndex);
}

function currentSlide(index) {
    currentSlideIndex = index;
    showSlide(currentSlideIndex);
}

// ========================================
// SCROLL ANIMATIONS (Intersection Observer)
// ========================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target); // Stops observing once animated
            }
        });
    }, observerOptions);

    // Observe service cards, packages, and locations
    document.querySelectorAll('.service-card, .package-card, .location-card').forEach(el => {
        observer.observe(el);
    });
}

// ========================================
// BOOKING FUNCTIONALITY
// ========================================
let currentStep = 1;
let bookingData = {};

// VENUES DATA
const venues = {
    dharwad: ["Kamat Hotel Banquet Hall", "Sai International Function Hall", "Dharwad Lawn House"],
    hubli: ["Clarks Inn Hotel Ballroom", "The Signature Club", "Hubli Lawns & Resorts"],
    belagavi: ["The President Hotel Banquet", "Belagavi Turf Club", "Vasant Vihar Lawns"],
    mysore: ["Radisson Blu Plaza Ballroom", "Mysore Palace Lawns", "Silent Shores Resort"],
    bangalore: ["Taj West End Grand Ballroom", "UB City Terrace", "The Leela Palace Lawns"]
};

const packages = {
    silver: 25000,
    gold: 45000,
    platinum: 75000
};

function initBookingForm() {
    // FIX: Check if we are actually on the booking page before redirecting
    const eventForm = document.getElementById('eventDetailsForm');
    const isBookingPage = document.querySelector('.booking-container');
    
    if (!eventForm && !isBookingPage) return; // Stop if not on booking page

    // Check if user is logged in (Only runs if on booking page now)
    if (!localStorage.getItem('currentUser')) {
        window.location.href = 'login.html';
        return;
    }

    // Package selection
    document.querySelectorAll('.package-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.package-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            bookingData.package = this.dataset.package;
        });
    });

    // Location change handler
    document.getElementById('location')?.addEventListener('change', loadVenues);

    // Event details form
    if (eventForm) {
        eventForm.addEventListener('submit', handleEventDetailsSubmit);
    }

    // Show first step
    showStep(1);
}

function showStep(step) {
    document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
    document.getElementById(`step${step}`)?.classList.add('active');
    currentStep = step;
    updateProgress();
}

function nextStep(step) {
    if (step === 1) {
        // Validate event details before moving to step 2
        const formData = {
            eventType: document.getElementById('eventType')?.value,
            eventDate: document.getElementById('eventDate')?.value,
            startTime: document.getElementById('startTime')?.value,
            duration: document.getElementById('duration')?.value,
            guests: document.getElementById('guests')?.value,
            requirements: document.getElementById('requirements')?.value
        };

        if (!formData.eventType || !formData.eventDate || !formData.guests) {
            alert('Please fill all required fields!');
            return;
        }

        bookingData = { ...bookingData, ...formData };
    }

    showStep(step + 1);
}

function prevStep(step) {
    showStep(step - 1);
}

function updateProgress() {
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        step.classList.toggle('active', index + 1 <= currentStep);
    });
}

function loadVenues() {
    const location = document.getElementById('location')?.value;
    const venueSelect = document.getElementById('venue');
    
    if (!venueSelect) return;
    
    venueSelect.innerHTML = '<option value="">Select Venue</option>';
    
    if (location && venues[location]) {
        venues[location].forEach(venue => {
            const option = document.createElement('option');
            option.value = venue;
            option.textContent = venue;
            venueSelect.appendChild(option);
        });
    }
}

function handleEventDetailsSubmit(e) {
    e.preventDefault();
    nextStep(1);
}

function confirmBooking() {
    bookingData.location = document.getElementById('location')?.value;
    bookingData.venue = document.getElementById('venue')?.value;
    
    if (!bookingData.package || !bookingData.location || !bookingData.venue) {
        alert('Please complete all fields!');
        return;
    }
    
    // Calculate total
    const basePrice = packages[bookingData.package];
    const guestMultiplier = Math.ceil(bookingData.guests / 50);
    bookingData.total = basePrice * guestMultiplier;
    
    // Save booking
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const booking = {
        id: Date.now(),
        customer: `${user.firstName} ${user.lastName}`,
        phone: user.phone,
        email: user.email,
        ...bookingData,
        status: 'pending'
    };
    
    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    alert('Booking created successfully! Admin will review and approve.');
    window.location.href = 'index.html';
}

// ========================================
// UI EFFECTS
// ========================================
function initNavbarEffects() {
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
}

function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Mobile menu toggle logic
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
}

// ========================================
// PACKAGE TABS FUNCTIONALITY
// ========================================
function initPackageTabs() {
    const tabs = document.querySelectorAll('.package-tab');
    const views = document.querySelectorAll('.package-view');

    if(tabs.length === 0) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 1. Remove active state from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // 2. Add active state to clicked tab
            tab.classList.add('active');

            // 3. Hide all package views
            views.forEach(v => {
                v.classList.remove('active-view');
                setTimeout(() => { v.style.display = 'none'; }, 50); // Small delay prevents jumping
            });

            // 4. Show the matching package view
            const target = document.getElementById(`view-${tab.dataset.category}`);
            if(target) {
                setTimeout(() => {
                    target.style.display = 'block';
                    target.classList.add('active-view');
                }, 50);
            }
        });
    });
}