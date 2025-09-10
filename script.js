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
    addInteractiveAnimations();
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
    
    timeSlots.forEach((slot, index) => {
        const slotElement = document.createElement('div');
        slotElement.className = `time-slot ${!slot.available ? 'booked' : ''}`;
        slotElement.innerHTML = `
            <div class="time">${slot.time}</div>
            <div class="price">ÜCRETSİZ</div>
        `;
        
        // Add staggered animation
        slotElement.style.animationDelay = `${index * 0.1}s`;
        slotElement.classList.add('slot-animate');
        
        if (slot.available) {
            slotElement.addEventListener('click', () => selectTimeSlot(slot, slotElement));
        }
        
        slotsContainer.appendChild(slotElement);
    });
    
    // Add CSS for slot animation
    if (!document.getElementById('slot-animation-styles')) {
        const style = document.createElement('style');
        style.id = 'slot-animation-styles';
        style.textContent = `
            .slot-animate {
                opacity: 0;
                transform: translateY(30px);
                animation: slotFadeIn 0.6s ease-out forwards;
            }
            
            @keyframes slotFadeIn {
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Handle time slot selection
function selectTimeSlot(slot, element) {
    // Remove previous selection
    document.querySelectorAll('.time-slot.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Add selection to clicked slot with animation
    element.classList.add('selected');
    
    // Add celebration effect
    createCelebrationEffect(element);
    
    selectedTime = slot.time;
    selectedPrice = slot.price;
    
    updateSelectedInfo();
    updateBookButton();
}

// Create celebration effect
function createCelebrationEffect(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 10; i++) {
        createParticle(centerX, centerY);
    }
}

function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: fixed;
        width: 6px;
        height: 6px;
        background: #f39c12;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        left: ${x}px;
        top: ${y}px;
    `;
    
    document.body.appendChild(particle);
    
    const angle = Math.random() * 2 * Math.PI;
    const velocity = 100 + Math.random() * 100;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;
    
    let opacity = 1;
    let posX = 0;
    let posY = 0;
    
    const animate = () => {
        posX += vx * 0.016;
        posY += vy * 0.016 + 50 * 0.016; // gravity
        opacity -= 0.02;
        
        particle.style.transform = `translate(${posX}px, ${posY}px)`;
        particle.style.opacity = opacity;
        
        if (opacity > 0) {
            requestAnimationFrame(animate);
        } else {
            document.body.removeChild(particle);
        }
    };
    
    animate();
}

// Update selected information display
function updateSelectedInfo() {
    const selectedDateEl = document.getElementById('selectedDate');
    const selectedTimeEl = document.getElementById('selectedTime');
    const totalPriceEl = document.getElementById('totalPrice');
    
    selectedDateEl.textContent = `📅 Tarih: ${selectedDate ? formatDate(selectedDate) : 'Seçilmedi'}`;
    selectedTimeEl.textContent = `⏰ Saat: ${selectedTime ? selectedTime : 'Seçilmedi'}`;
    totalPriceEl.textContent = `💰 Toplam: ÜCRETSİZ`;
    
    // Add pulse animation to total price
    if (selectedTime) {
        totalPriceEl.style.animation = 'pulse 1s ease-in-out';
        setTimeout(() => {
            totalPriceEl.style.animation = '';
        }, 1000);
    }
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
    
    if (canBook) {
        bookButton.style.animation = 'glow 2s ease-in-out infinite alternate';
    } else {
        bookButton.style.animation = '';
    }
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
    
    // Form input handlers with real-time validation
    ['name', 'phone'].forEach(fieldId => {
        const field = document.getElementById(fieldId);
        field.addEventListener('input', function() {
            updateBookButton();
            validateField(this);
        });
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
    
    // Phone number formatting
    document.getElementById('phone').addEventListener('input', formatPhoneNumber);
}

// Validate field
function validateField(field) {
    const isValid = field.value.trim().length >= (field.id === 'name' ? 2 : 10);
    
    if (isValid) {
        field.style.borderColor = '#27ae60';
        field.style.boxShadow = '0 0 10px rgba(39, 174, 96, 0.3)';
    } else {
        field.style.borderColor = '#e74c3c';
        field.style.boxShadow = '0 0 10px rgba(231, 76, 60, 0.3)';
    }
}

// Format phone number
function formatPhoneNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 0) {
        if (value.length <= 4) {
            value = value;
        } else if (value.length <= 7) {
            value = value.slice(0, 4) + ' ' + value.slice(4);
        } else if (value.length <= 9) {
            value = value.slice(0, 4) + ' ' + value.slice(4, 7) + ' ' + value.slice(7);
        } else {
            value = value.slice(0, 4) + ' ' + value.slice(4, 7) + ' ' + value.slice(7, 9) + ' ' + value.slice(9, 11);
        }
    }
    
    e.target.value = value;
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
    if (availableSlots.length < 4) {
        for (let i = 0; i < 4 && i < timeSlots.length; i++) {
            timeSlots[i].available = true;
        }
    }
    
    generateTimeSlots();
    
    // Clear previous selection if the slot is no longer available
    if (selectedTime) {
        const selectedSlot = timeSlots.find(slot => slot.time === selectedTime);
        if (!selectedSlot || !selectedSlot.available) {
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
        showNotification('Lütfen tarih ve saat seçiniz!', 'error');
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
    }, 2500);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        background: ${type === 'error' ? '#e74c3c' : '#3498db'};
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
    
    // Add CSS for notification animations
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Show loading state
function showLoadingState() {
    const bookButton = document.querySelector('.book-btn');
    bookButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Rezervasyon yapılıyor...';
    bookButton.disabled = true;
    bookButton.style.background = 'linear-gradient(45deg, #f39c12, #e67e22)';
}

// Hide loading state
function hideLoadingState() {
    const bookButton = document.querySelector('.book-btn');
    bookButton.innerHTML = '<i class="fas fa-check"></i> Rezervasyonu Tamamla';
    bookButton.style.background = 'linear-gradient(45deg, #27ae60, #2ecc71)';
    updateBookButton();
}

// Show success modal
function showSuccessModal(reservationData) {
    const modal = document.getElementById('successModal');
    const detailsDiv = document.getElementById('reservationDetails');
    
    detailsDiv.innerHTML = `
        <strong>🎉 Rezervasyon Detayları:</strong><br><br>
        <strong>👤 Ad Soyad:</strong> ${reservationData.name}<br>
        <strong>📱 Telefon:</strong> ${reservationData.phone}<br>
        <strong>📅 Tarih:</strong> ${formatDate(reservationData.date)}<br>
        <strong>⏰ Saat:</strong> ${reservationData.time}<br>
        <strong>💰 Ücret:</strong> ÜCRETSİZ (Hatay Büyükşehir Belediyesi)<br>
        ${reservationData.notes ? `<strong>📝 Not:</strong> ${reservationData.notes}<br>` : ''}
        <br>
        <small style="color: #7f8c8d;">🎫 Rezervasyon kodu: #${generateReservationCode()}</small>
    `;
    
    modal.style.display = 'block';
    
    // Update availability (mark selected slot as booked)
    const selectedSlot = timeSlots.find(slot => slot.time === selectedTime);
    if (selectedSlot) {
        selectedSlot.available = false;
    }
    generateTimeSlots();
    
    // Add confetti effect
    createConfetti();
}

// Create confetti effect
function createConfetti() {
    const colors = ['#f39c12', '#e74c3c', '#3498db', '#27ae60', '#9b59b6'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                top: -10px;
                left: ${Math.random() * window.innerWidth}px;
                z-index: 10000;
                pointer-events: none;
                border-radius: 50%;
            `;
            
            document.body.appendChild(confetti);
            
            let posY = -10;
            let posX = parseFloat(confetti.style.left);
            let rotation = 0;
            const fallSpeed = 2 + Math.random() * 3;
            const rotationSpeed = (Math.random() - 0.5) * 10;
            const drift = (Math.random() - 0.5) * 2;
            
            const fall = () => {
                posY += fallSpeed;
                posX += drift;
                rotation += rotationSpeed;
                
                confetti.style.top = posY + 'px';
                confetti.style.left = posX + 'px';
                confetti.style.transform = `rotate(${rotation}deg)`;
                
                if (posY < window.innerHeight) {
                    requestAnimationFrame(fall);
                } else {
                    document.body.removeChild(confetti);
                }
            };
            
            fall();
        }, i * 50);
    }
}

// Generate reservation code
function generateReservationCode() {
    const prefix = 'HTY';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    return `${prefix}${timestamp}${random}`;
}

// Close modal
function closeModal() {
    const modal = document.getElementById('successModal');
    modal.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
        modal.style.display = 'none';
        modal.style.animation = '';
    }, 300);
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
    
    // Reset field styles
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(field => {
        field.style.borderColor = '#e9ecef';
        field.style.boxShadow = '';
    });
}

// Scroll to booking section
function scrollToBooking() {
    document.getElementById('booking').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('successModal');
    if (e.target === modal) {
        closeModal();
    }
});

// Add interactive animations
function addInteractiveAnimations() {
    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.hero-bg');
        if (parallax) {
            const speed = scrolled * 0.3;
            parallax.style.transform = `translateY(${speed}px) scale(1.1)`;
        }
        
        // Header background opacity
        const header = document.querySelector('header');
        const opacity = Math.min(scrolled / 100, 0.95);
        header.style.background = `linear-gradient(135deg, rgba(30, 60, 114, ${opacity}), rgba(42, 82, 152, ${opacity}))`;
    });
    
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);
    
    // Observe elements
    document.querySelectorAll('.booking-form, .time-slots, .contact-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });
    
    // Add floating animation to hero features
    document.querySelectorAll('.feature-item').forEach((item, index) => {
        item.style.animationDelay = `${index * 0.2}s`;
        item.classList.add('float');
    });
    
    // Add CSS for floating animation
    if (!document.getElementById('float-animation')) {
        const style = document.createElement('style');
        style.id = 'float-animation';
        style.textContent = `
            .float {
                animation: float 3s ease-in-out infinite;
            }
            
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Add some easter eggs
document.addEventListener('keydown', function(e) {
    // Konami code easter egg
    const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    if (!window.konamiSequence) window.konamiSequence = [];
    
    window.konamiSequence.push(e.keyCode);
    if (window.konamiSequence.length > konamiCode.length) {
        window.konamiSequence.shift();
    }
    
    if (window.konamiSequence.join(',') === konamiCode.join(',')) {
        showNotification('🎉 Hatay Büyükşehir Belediyesi Easter Egg! Tebrikler!', 'success');
        createConfetti();
        window.konamiSequence = [];
    }
});

// Performance optimization
document.addEventListener('DOMContentLoaded', function() {
    // Lazy load background images
    const heroSection = document.querySelector('.hero-bg');
    if (heroSection) {
        const img = new Image();
        img.onload = function() {
            heroSection.style.backgroundImage = `linear-gradient(135deg, rgba(30, 60, 114, 0.9), rgba(42, 82, 152, 0.8)), url('${this.src}')`;
        };
        img.src = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';
    }
});
