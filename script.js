// Global variables
let selectedDate = null;
let selectedTime = null;
let selectedPrice = 0;

// Time slots data - Hatay Büyükşehir Belediyesi ÜCRETSIZ
const timeSlots = [
    { time: '08:00', price: 0, available: true },
    { time: '09:00', price: 0, available: true },
    { time: '10:00', price: 0, available: true },
    { time: '11:00', price: 0, available: false },
    { time: '12:00', price: 0, available: true },
    { time: '13:00', price: 0, available: true },
    { time: '14:00', price: 0, available: false },
    { time: '15:00', price: 0, available: true },
    { time: '16:00', price: 0, available: true },
    { time: '17:00', price: 0, available: true },
    { time: '18:00', price: 0, available: false },
    { time: '19:00', price: 0, available: true },
    { time: '20:00', price: 0, available: true },
    { time: '21:00', price: 0, available: true },
    { time: '22:00', price: 0, available: true },
    { time: '23:00', price: 0, available: true }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeDatePicker();
    generateTimeSlots();
    setupEventListeners();
});

// Set minimum date to today
function initializeDatePicker() {
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    
    // Set default to today
    dateInput.value = today;
    selectedDate = today;
    updateSelectedInfo();
}

// Generate time slots HTML
function generateTimeSlots() {
    const slotsContainer = document.getElementById('timeSlots');
    slotsContainer.innerHTML = '';
    
    timeSlots.forEach(slot => {
        const slotElement = document.createElement('div');
        slotElement.className = `time-slot ${!slot.available ? 'booked' : ''}`;
        slotElement.innerHTML = `
            <div class="time">${slot.time}</div>
            <div class="price">ÜCRETSİZ</div>
        `;
        
        if (slot.available) {
            slotElement.addEventListener('click', () => selectTimeSlot(slot, slotElement));
        }
        
        slotsContainer.appendChild(slotElement);
    });
}

// Handle time slot selection
function selectTimeSlot(slot, element) {
    // Remove previous selection
    document.querySelectorAll('.time-slot.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Add selection to clicked slot
    element.classList.add('selected');
    
    selectedTime = slot.time;
    selectedPrice = slot.price;
    
    updateSelectedInfo();
    updateBookButton();
}

// Update selected information display
function updateSelectedInfo() {
    const selectedDateEl = document.getElementById('selectedDate');
    const selectedTimeEl = document.getElementById('selectedTime');
    const totalPriceEl = document.getElementById('totalPrice');
    
    selectedDateEl.textContent = `Tarih: ${selectedDate ? formatDate(selectedDate) : 'Seçilmedi'}`;
    selectedTimeEl.textContent = `Saat: ${selectedTime ? selectedTime : 'Seçilmedi'}`;
    totalPriceEl.textContent = `Toplam: ÜCRETSİZ`;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    return date.toLocaleDateString('tr-TR', options);
}

// Update book button state
function updateBookButton() {
    const bookButton = document.querySelector('.book-btn');
    const canBook = selectedDate && selectedTime && isFormValid();
    
    bookButton.disabled = !canBook;
}

// Check if form is valid
function isFormValid() {
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    return name.length >= 2 && phone.length >= 10;
}

// Setup event listeners
function setupEventListeners() {
    // Date change handler
    document.getElementById('date').addEventListener('change', function(e) {
        selectedDate = e.target.value;
        updateSelectedInfo();
        updateBookButton();
        
        // Simulate different availability for different dates
        simulateAvailabilityForDate(selectedDate);
    });
    
    // Form input handlers
    ['name', 'phone'].forEach(fieldId => {
        document.getElementById(fieldId).addEventListener('input', updateBookButton);
    });
    
    // Form submission
    document.getElementById('reservationForm').addEventListener('submit', handleFormSubmission);
    
    // Smooth scrolling for navigation
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Simulate different availability for different dates
function simulateAvailabilityForDate(date) {
    const dayOfWeek = new Date(date).getDay();
    
    // Weekend has different availability
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        timeSlots.forEach(slot => {
            // More slots booked on weekends
            slot.available = Math.random() > 0.3;
        });
    } else {
        timeSlots.forEach(slot => {
            // Fewer slots booked on weekdays
            slot.available = Math.random() > 0.2;
        });
    }
    
    // Always keep some slots available
    const availableSlots = timeSlots.filter(slot => slot.available);
    if (availableSlots.length < 3) {
        for (let i = 0; i < 3 && i < timeSlots.length; i++) {
            timeSlots[i].available = true;
        }
    }
    
    generateTimeSlots();
    
    // Clear previous selection if the slot is no longer available
    if (selectedTime) {
        const selectedSlot = timeSlots.find(slot => slot.time === selectedTime);
        if (!selectedSlot.available) {
            selectedTime = null;
            selectedPrice = 0;
            updateSelectedInfo();
            updateBookButton();
        }
    }
}

// Handle form submission
function handleFormSubmission(e) {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
        alert('Lütfen tarih ve saat seçiniz!');
        return;
    }
    
    const formData = {
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        date: selectedDate,
        time: selectedTime,
        price: selectedPrice,
        notes: document.getElementById('notes').value.trim()
    };
    
    // Simulate booking process
    showLoadingState();
    
    setTimeout(() => {
        hideLoadingState();
        showSuccessModal(formData);
        resetForm();
    }, 2000);
}

// Show loading state
function showLoadingState() {
    const bookButton = document.querySelector('.book-btn');
    bookButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Rezervasyon yapılıyor...';
    bookButton.disabled = true;
}

// Hide loading state
function hideLoadingState() {
    const bookButton = document.querySelector('.book-btn');
    bookButton.innerHTML = '<i class="fas fa-check"></i> Rezervasyonu Tamamla';
    updateBookButton();
}

// Show success modal
function showSuccessModal(reservationData) {
    const modal = document.getElementById('successModal');
    const detailsDiv = document.getElementById('reservationDetails');
    
    detailsDiv.innerHTML = `
        <strong>Rezervasyon Detayları:</strong><br><br>
        <strong>Ad Soyad:</strong> ${reservationData.name}<br>
        <strong>Telefon:</strong> ${reservationData.phone}<br>
        <strong>Tarih:</strong> ${formatDate(reservationData.date)}<br>
        <strong>Saat:</strong> ${reservationData.time}<br>
        <strong>Ücret:</strong> ÜCRETSİZ (Hatay Büyükşehir Belediyesi)<br>
        ${reservationData.notes ? `<strong>Not:</strong> ${reservationData.notes}<br>` : ''}
        <br>
        <small style="color: #7f8c8d;">Rezervasyon kodu: #${generateReservationCode()}</small>
    `;
    
    modal.style.display = 'block';
    
    // Update availability (mark selected slot as booked)
    const selectedSlot = timeSlots.find(slot => slot.time === selectedTime);
    if (selectedSlot) {
        selectedSlot.available = false;
    }
    generateTimeSlots();
}

// Generate reservation code
function generateReservationCode() {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Close modal
function closeModal() {
    document.getElementById('successModal').style.display = 'none';
}

// Reset form
function resetForm() {
    document.getElementById('reservationForm').reset();
    selectedTime = null;
    selectedPrice = 0;
    
    // Reset date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    selectedDate = today;
    
    updateSelectedInfo();
    updateBookButton();
    
    // Remove selected class from time slots
    document.querySelectorAll('.time-slot.selected').forEach(el => {
        el.classList.remove('selected');
    });
}

// Scroll to booking section
function scrollToBooking() {
    document.getElementById('booking').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Phone number formatting
document.getElementById('phone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 0) {
        if (value.length <= 3) {
            value = value;
        } else if (value.length <= 6) {
            value = value.slice(0, 4) + ' ' + value.slice(4);
        } else if (value.length <= 8) {
            value = value.slice(0, 4) + ' ' + value.slice(4, 7) + ' ' + value.slice(7);
        } else {
            value = value.slice(0, 4) + ' ' + value.slice(4, 7) + ' ' + value.slice(7, 9) + ' ' + value.slice(9, 11);
        }
    }
    
    e.target.value = value;
});

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('successModal');
    if (e.target === modal) {
        closeModal();
    }
});

// Add some interactive animations
function addInteractiveAnimations() {
    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.hero-bg');
        if (parallax) {
            const speed = scrolled * 0.5;
            parallax.style.transform = `translateY(${speed}px)`;
        }
    });
    
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements
    document.querySelectorAll('.booking-form, .time-slots, .contact-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Initialize animations after DOM is loaded
document.addEventListener('DOMContentLoaded', addInteractiveAnimations);
