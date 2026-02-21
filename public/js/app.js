/**
 * Stellar Events - Main Application Logic
 */

// ==========================================================================
// Variables & State
// ==========================================================================
const API_URL = ''; // Relative URL since it's served from the same host
let eventsData = [];
let currentBookingEventId = null;

// DOM Elements
const elements = {
    // Containers
    eventsGrid: document.getElementById('events-grid'),
    eventsLoading: document.getElementById('events-loading'),
    eventsEmpty: document.getElementById('events-empty'),
    toastContainer: document.getElementById('toast-container'),
    
    // Modals
    createModal: document.getElementById('create-event-modal'),
    bookingModal: document.getElementById('booking-modal'),
    
    // Forms
    createForm: document.getElementById('create-event-form'),
    bookingForm: document.getElementById('booking-form'),
    
    // Buttons (Global)
    btnCreateModal: document.getElementById('btn-create-event-modal'),
    btnEmptyCreate: document.getElementById('btn-empty-create'),
    closeButtons: document.querySelectorAll('.modal-close, .modal-cancel'),
    
    // Booking Form specific elements
    qtyMinus: document.getElementById('qty-minus'),
    qtyPlus: document.getElementById('qty-plus'),
    qtyInput: document.getElementById('book-quantity'),
    seatsText: document.getElementById('seats-available-text'),
    summaryPrice: document.getElementById('summary-price'),
    summaryQty: document.getElementById('summary-qty'),
    summaryTotal: document.getElementById('summary-total'),
    bookingPreview: document.getElementById('booking-event-preview'),
    btnSubmitBooking: document.getElementById('btn-submit-booking')
};

// ==========================================================================
// Initialization
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
});

function initApp() {
    fetchEvents();
}

// ==========================================================================
// Event Listeners Setup
// ==========================================================================
function setupEventListeners() {
    // Modal controls
    elements.btnCreateModal.addEventListener('click', () => openModal(elements.createModal));
    elements.btnEmptyCreate.addEventListener('click', () => openModal(elements.createModal));
    
    elements.closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(elements.createModal);
            closeModal(elements.bookingModal);
        });
    });

    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            closeModal(e.target);
        }
    });

    // Form Submissions
    elements.createForm.addEventListener('submit', handleCreateEvent);
    elements.bookingForm.addEventListener('submit', handleBookingSubmit);

    // Filter Events
    document.getElementById('search-events').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        filterEvents(term);
    });

    // Quantity selector in booking form
    elements.qtyMinus.addEventListener('click', () => updateQuantity(-1));
    elements.qtyPlus.addEventListener('click', () => updateQuantity(1));
}

// ==========================================================================
// API Operations
// ==========================================================================

/**
 * Fetch all events from API
 */
async function fetchEvents() {
    showState('loading');
    
    try {
        const response = await fetch(`${API_URL}/events`);
        const result = await response.json();
        
        if (result.success) {
            eventsData = result.data || [];
            
            if (eventsData.length === 0) {
                showState('empty');
            } else {
                renderEvents(eventsData);
                showState('content');
            }
        } else {
            showToast('Error', result.message || 'Failed to fetch events', 'error');
            showState('empty');
        }
    } catch (error) {
        console.error('Fetch error:', error);
        showToast('Connection Error', 'Could not connect to the server', 'error');
        showState('empty');
    }
}

/**
 * Handle new event creation
 */
async function handleCreateEvent(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('btn-submit-event');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating...';
    submitBtn.disabled = true;
    
    // Convert local datetime to ISO string keeping local time structure for simple display
    const dateInput = document.getElementById('event-date').value;
    const formattedDate = new Date(dateInput).toISOString().slice(0, 16).replace('T', ' ');

    const payload = {
        name: document.getElementById('event-name').value,
        description: document.getElementById('event-desc').value,
        date: formattedDate,
        location: document.getElementById('event-location').value,
        capacity: parseInt(document.getElementById('event-capacity').value, 10),
        price: parseFloat(document.getElementById('event-price').value),
        organizer_id: parseInt(document.getElementById('organizer-id').value, 10)
    };

    try {
        const response = await fetch(`${API_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Success', 'Event created successfully!', 'success');
            closeModal(elements.createModal);
            elements.createForm.reset();
            fetchEvents(); // Reload lists
        } else {
            showToast('Error', result.message || 'Failed to create event', 'error');
        }
    } catch (error) {
        console.error('Create event error:', error);
        showToast('Connection Error', 'Failed to communicate with the server', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

/**
 * Initiate booking process
 */
async function initiateBooking(eventId) {
    const event = eventsData.find(e => e.id === eventId);
    if (!event) return;
    
    if (event.available <= 0) {
        showToast('Sold Out', 'Sorry, this event is completely sold out.', 'warning');
        return;
    }

    currentBookingEventId = event.id;
    
    // Reset form
    elements.bookingForm.reset();
    elements.qtyInput.value = 1;
    elements.qtyInput.max = event.available;
    
    // Populate preview
    const dateObj = new Date(event.date);
    const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    elements.bookingPreview.innerHTML = `
        <h4 style="margin-bottom: 0.5rem; font-family: var(--font-heading);">${event.name}</h4>
        <div class="meta-item"><i class="fa-solid fa-calendar"></i> ${dateStr} • ${timeStr}</div>
        <div class="meta-item mt-2"><i class="fa-solid fa-location-dot"></i> ${event.location}</div>
    `;
    
    // Setup summary pricing
    elements.summaryPrice.textContent = formatCurrency(event.price);
    updateBookingSummary(event.price, 1);
    
    // Check real-time availability just in case
    checkRealTimeAvailability(event.id, event.price);
    
    openModal(elements.bookingModal);
}

/**
 * Check real-time availability
 */
async function checkRealTimeAvailability(eventId, price) {
    elements.seatsText.textContent = 'Checking real-time availability...';
    elements.seatsText.className = 'helper-text';
    elements.btnSubmitBooking.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/bookings/check?event_id=${eventId}`);
        const result = await response.json();
        
        if (result.success) {
            const available = result.data.available;
            
            if (available > 0) {
                elements.qtyInput.max = available;
                
                if (available <= 5) {
                    elements.seatsText.textContent = `Hurry! Only ${available} seats remaining.`;
                    elements.seatsText.className = 'helper-text warning';
                } else {
                    elements.seatsText.textContent = `${available} seats currently available.`;
                    elements.seatsText.className = 'helper-text';
                }
                
                // Adjust quantity if exceeds max
                let currentVal = parseInt(elements.qtyInput.value, 10);
                if (currentVal > available) {
                    elements.qtyInput.value = available;
                    updateBookingSummary(price, available);
                }
                
                elements.btnSubmitBooking.disabled = false;
            } else {
                elements.seatsText.textContent = 'Sorry, this event just sold out.';
                elements.seatsText.className = 'helper-text error';
                elements.btnSubmitBooking.disabled = true;
            }
        }
    } catch (error) {
        elements.seatsText.textContent = 'Could not verify real-time availability.';
        elements.btnSubmitBooking.disabled = false; // Allow optimistic attempt
    }
}

/**
 * Handle booking submission
 */
async function handleBookingSubmit(e) {
    e.preventDefault();
    
    const event = eventsData.find(e => e.id === currentBookingEventId);
    if (!event) return;
    
    const qty = parseInt(elements.qtyInput.value, 10);
    const btnSubmit = elements.btnSubmitBooking;
    const originalText = btnSubmit.innerHTML;
    
    if (qty > event.available) {
        showToast('Error', 'Not enough tickets available.', 'error');
        return;
    }

    btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
    btnSubmit.disabled = true;

    const payload = {
        event_id: currentBookingEventId,
        user_name: document.getElementById('book-name').value,
        user_email: document.getElementById('book-email').value,
        quantity: qty
    };

    try {
        const response = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showToast('Booking Confirmed!', `Successfully booked ${qty} tickets.`, 'success');
            closeModal(elements.bookingModal);
            fetchEvents(); // Refresh data to show updated capacity
        } else {
            showToast('Booking Failed', result.message || 'The tickets might have been sold out.', 'error');
            // If conflict, check availability again
            if (response.status === 409) {
                checkRealTimeAvailability(currentBookingEventId, event.price);
            }
        }
    } catch (error) {
        showToast('Connection Error', 'Failed to process booking', 'error');
    } finally {
        if (!elements.bookingModal.classList.contains('hidden')) {
            btnSubmit.innerHTML = originalText;
            btnSubmit.disabled = false;
        }
    }
}

// ==========================================================================
// UI Rendering & Utilities
// ==========================================================================

function renderEvents(events) {
    elements.eventsGrid.innerHTML = '';
    
    events.forEach(event => {
        const dateObj = new Date(event.date.replace(/-/g, '/').replace(/T/g, ' '));
        const monthStr = dateObj.toLocaleDateString('en-US', { month: 'short' });
        const dayStr = dateObj.getDate();
        const fullDateStr = isNaN(dateObj) ? event.date : dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        const priceStr = event.price === 0 ? 'Free' : formatCurrency(event.price);
        const priceClass = event.price === 0 ? 'free' : '';
        
        // Status calculations
        let statusBadge = '';
        let btnDisabled = '';
        let btnText = 'Book Tickets';
        
        if (event.available === 0) {
            statusBadge = '<span class="badge badge-soldout">Sold Out</span>';
            btnDisabled = 'disabled style="opacity: 0.5; cursor: not-allowed;"';
            btnText = 'Sold Out';
        } else if (event.available <= 5) {
            statusBadge = '<span class="badge badge-warning">Selling Fast</span>';
        } else {
            statusBadge = '<span class="badge badge-available">Available</span>';
        }

        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
            <div class="event-card-image">
                <div class="event-date-badge">
                    <span class="date-month">${monthStr || 'TBA'}</span>
                    <span class="date-day">${dayStr || '--'}</span>
                </div>
            </div>
            <div class="event-content">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <h3 class="event-title">${escapeHTML(event.name)}</h3>
                    ${statusBadge}
                </div>
                
                <p class="event-desc">${escapeHTML(event.description || 'No description provided.')}</p>
                
                <div class="event-meta">
                    <div class="meta-item">
                        <i class="fa-solid fa-clock"></i>
                        <span>${fullDateStr}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fa-solid fa-location-dot"></i>
                        <span>${escapeHTML(event.location)}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fa-solid fa-users"></i>
                        <span>${event.available} / ${event.capacity} seats remaining</span>
                    </div>
                </div>
                
                <div class="event-footer">
                    <div class="event-price ${priceClass}">${priceStr}</div>
                    <button class="btn btn-primary btn-glow" onclick="initiateBooking(${event.id})" ${btnDisabled}>
                        ${btnText} <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
        
        elements.eventsGrid.appendChild(card);
    });
}

function filterEvents(term) {
    if (!term) {
        renderEvents(eventsData);
        if (eventsData.length > 0) showState('content');
        return;
    }
    
    const filtered = eventsData.filter(e => 
        e.name.toLowerCase().includes(term) || 
        e.location.toLowerCase().includes(term) ||
        (e.description && e.description.toLowerCase().includes(term))
    );
    
    if (filtered.length === 0) {
        showState('empty');
        elements.btnEmptyCreate.parentElement.querySelector('h3').textContent = 'No matches found';
        elements.btnEmptyCreate.parentElement.querySelector('p').textContent = 'Try adjusting your search query.';
        elements.btnEmptyCreate.style.display = 'none'; // hide create button on search miss
    } else {
        renderEvents(filtered);
        showState('content');
    }
}

// ==========================================================================
// Helpers
// ==========================================================================

function showState(state) {
    elements.eventsLoading.classList.add('hidden');
    elements.eventsEmpty.classList.add('hidden');
    elements.eventsGrid.classList.add('hidden');
    
    if (state === 'loading') elements.eventsLoading.classList.remove('hidden');
    if (state === 'empty') elements.eventsEmpty.classList.remove('hidden');
    if (state === 'content') elements.eventsGrid.classList.remove('hidden');
}

function openModal(modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal(modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function updateQuantity(change) {
    const input = elements.qtyInput;
    let val = parseInt(input.value, 10);
    const max = parseInt(input.max, 10) || 1;
    
    if (isNaN(val)) val = 1;
    val += change;
    
    if (val < 1) val = 1;
    if (val > max) {
        val = max;
        showToast('Info', `Only ${max} tickets available`, 'warning');
    }
    
    input.value = val;
    
    // Update summary
    const event = eventsData.find(e => e.id === currentBookingEventId);
    if (event) {
        updateBookingSummary(event.price, val);
    }
}

function updateBookingSummary(price, qty) {
    elements.summaryQty.textContent = `x ${qty}`;
    const total = price * qty;
    elements.summaryTotal.textContent = formatCurrency(total);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Toast Notification System
 */
function showToast(title, message, type = 'success') {
    const toastId = 'toast-' + Date.now();
    
    const iconMap = {
        'success': 'fa-circle-check',
        'error': 'fa-circle-exclamation',
        'warning': 'fa-triangle-exclamation'
    };
    
    const iconClass = iconMap[type] || 'fa-info-circle';
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.id = toastId;
    
    toast.innerHTML = `
        <i class="fa-solid ${iconClass}" style="margin-top: 3px;"></i>
        <div class="toast-content" style="flex-grow: 1;">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="removeToast('${toastId}')">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    // Auto remove after 5s
    setTimeout(() => {
        removeToast(toastId);
    }, 5000);
}

// Global scope for onclick handlers
window.initiateBooking = initiateBooking;
window.removeToast = function(id) {
    const toast = document.getElementById(id);
    if (toast) {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300); // Wait for exit animation
    }
};
