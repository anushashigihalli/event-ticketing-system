package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

// Global database connection
var db *sql.DB

// Mutex for thread-safe booking operations
var bookingMutex sync.Mutex

// Event represents an event in the system
type Event struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Date        string    `json:"date"`
	Location    string    `json:"location"`
	Capacity    int       `json:"capacity"`
	Available   int       `json:"available"`
	Price       float64   `json:"price"`
	OrganizerID int       `json:"organizer_id"`
	CreatedAt   time.Time `json:"created_at"`
}

// Booking represents a ticket booking
type Booking struct {
	ID        int       `json:"id"`
	EventID   int       `json:"event_id"`
	UserEmail string    `json:"user_email"`
	UserName  string    `json:"user_name"`
	Quantity  int       `json:"quantity"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

// Response structure for API responses
type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

func main() {
	// Initialize database
	initDB()
	defer db.Close()

	// Run migrations
	runMigrations()

	// Setup routes
	http.HandleFunc("/events", handleEvents)
	http.HandleFunc("/events/", handleEventByID)
	http.HandleFunc("/bookings", handleBookings)
	http.HandleFunc("/bookings/check", handleCheckAvailability)

	// Serve static files from the public directory
	fs := http.FileServer(http.Dir("./public"))
	http.Handle("/", fs)

	// Start server
	port := ":8080"
	fmt.Printf("🚀 Server starting on http://localhost%s\n", port)
	log.Fatal(http.ListenAndServe(port, nil))
}

// Initialize database connection
func initDB() {
	var err error
	db, err = sql.Open("sqlite3", "./events.db")
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Test connection
	if err = db.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	fmt.Println("✅ Database connected successfully")
}

// Run database migrations
func runMigrations() {
	// Create events table
	eventsTable := `
	CREATE TABLE IF NOT EXISTS events (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		description TEXT,
		date TEXT NOT NULL,
		location TEXT NOT NULL,
		capacity INTEGER NOT NULL,
		available INTEGER NOT NULL,
		price REAL NOT NULL,
		organizer_id INTEGER NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

	// Create bookings table
	bookingsTable := `
	CREATE TABLE IF NOT EXISTS bookings (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		event_id INTEGER NOT NULL,
		user_email TEXT NOT NULL,
		user_name TEXT NOT NULL,
		quantity INTEGER NOT NULL,
		status TEXT DEFAULT 'confirmed',
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (event_id) REFERENCES events(id)
	);`

	// Create index for faster queries
	indexQuery := `
	CREATE INDEX IF NOT EXISTS idx_event_id ON bookings(event_id);
	CREATE INDEX IF NOT EXISTS idx_user_email ON bookings(user_email);`

	_, err := db.Exec(eventsTable)
	if err != nil {
		log.Fatal("Failed to create events table:", err)
	}

	_, err = db.Exec(bookingsTable)
	if err != nil {
		log.Fatal("Failed to create bookings table:", err)
	}

	_, err = db.Exec(indexQuery)
	if err != nil {
		log.Fatal("Failed to create indexes:", err)
	}

	fmt.Println("✅ Database migrations completed")
}

// Handle events endpoint (GET all, POST create)
func handleEvents(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case "GET":
		getEvents(w, r)
	case "POST":
		createEvent(w, r)
	default:
		sendResponse(w, http.StatusMethodNotAllowed, false, "Method not allowed", nil)
	}
}

// Get all events
func getEvents(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, name, description, date, location, capacity, available, price, organizer_id, created_at FROM events ORDER BY date")
	if err != nil {
		sendResponse(w, http.StatusInternalServerError, false, "Failed to fetch events", nil)
		return
	}
	defer rows.Close()

	events := []Event{}
	for rows.Next() {
		var event Event
		err := rows.Scan(&event.ID, &event.Name, &event.Description, &event.Date, &event.Location, &event.Capacity, &event.Available, &event.Price, &event.OrganizerID, &event.CreatedAt)
		if err != nil {
			continue
		}
		events = append(events, event)
	}

	sendResponse(w, http.StatusOK, true, "Events fetched successfully", events)
}

// Create new event
func createEvent(w http.ResponseWriter, r *http.Request) {
	var event Event
	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		sendResponse(w, http.StatusBadRequest, false, "Invalid request body", nil)
		return
	}

	// Validation
	if event.Name == "" || event.Date == "" || event.Location == "" || event.Capacity <= 0 {
		sendResponse(w, http.StatusBadRequest, false, "Missing required fields", nil)
		return
	}

	// Set available seats equal to capacity initially
	event.Available = event.Capacity

	result, err := db.Exec(
		"INSERT INTO events (name, description, date, location, capacity, available, price, organizer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
		event.Name, event.Description, event.Date, event.Location, event.Capacity, event.Available, event.Price, event.OrganizerID,
	)
	if err != nil {
		sendResponse(w, http.StatusInternalServerError, false, "Failed to create event", nil)
		return
	}

	id, _ := result.LastInsertId()
	event.ID = int(id)

	sendResponse(w, http.StatusCreated, true, "Event created successfully", event)
}

// Handle individual event by ID
func handleEventByID(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Extract ID from URL
	id := r.URL.Path[len("/events/"):]
	if id == "" {
		sendResponse(w, http.StatusBadRequest, false, "Event ID required", nil)
		return
	}

	var event Event
	err := db.QueryRow(
		"SELECT id, name, description, date, location, capacity, available, price, organizer_id, created_at FROM events WHERE id = ?",
		id,
	).Scan(&event.ID, &event.Name, &event.Description, &event.Date, &event.Location, &event.Capacity, &event.Available, &event.Price, &event.OrganizerID, &event.CreatedAt)

	if err == sql.ErrNoRows {
		sendResponse(w, http.StatusNotFound, false, "Event not found", nil)
		return
	} else if err != nil {
		sendResponse(w, http.StatusInternalServerError, false, "Failed to fetch event", nil)
		return
	}

	sendResponse(w, http.StatusOK, true, "Event fetched successfully", event)
}

// Handle bookings endpoint
func handleBookings(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case "POST":
		createBooking(w, r)
	case "GET":
		getBookings(w, r)
	default:
		sendResponse(w, http.StatusMethodNotAllowed, false, "Method not allowed", nil)
	}
}

// Create booking with concurrency control
func createBooking(w http.ResponseWriter, r *http.Request) {
	var booking Booking
	if err := json.NewDecoder(r.Body).Decode(&booking); err != nil {
		sendResponse(w, http.StatusBadRequest, false, "Invalid request body", nil)
		return
	}

	// Validation
	if booking.EventID <= 0 || booking.UserEmail == "" || booking.UserName == "" || booking.Quantity <= 0 {
		sendResponse(w, http.StatusBadRequest, false, "Missing required fields", nil)
		return
	}

	// CRITICAL: Lock mutex to prevent race conditions
	bookingMutex.Lock()
	defer bookingMutex.Unlock()

	// Begin transaction
	tx, err := db.Begin()
	if err != nil {
		sendResponse(w, http.StatusInternalServerError, false, "Failed to start transaction", nil)
		return
	}
	defer tx.Rollback()

	// Check available seats with row lock
	var available int
	err = tx.QueryRow("SELECT available FROM events WHERE id = ?", booking.EventID).Scan(&available)
	if err == sql.ErrNoRows {
		sendResponse(w, http.StatusNotFound, false, "Event not found", nil)
		return
	} else if err != nil {
		sendResponse(w, http.StatusInternalServerError, false, "Failed to check availability", nil)
		return
	}

	// Check if enough seats available
	if available < booking.Quantity {
		sendResponse(w, http.StatusConflict, false, fmt.Sprintf("Not enough seats available. Only %d seats left", available), nil)
		return
	}

	// Update available seats
	_, err = tx.Exec("UPDATE events SET available = available - ? WHERE id = ?", booking.Quantity, booking.EventID)
	if err != nil {
		sendResponse(w, http.StatusInternalServerError, false, "Failed to update availability", nil)
		return
	}

	// Create booking record
	result, err := tx.Exec(
		"INSERT INTO bookings (event_id, user_email, user_name, quantity, status) VALUES (?, ?, ?, ?, ?)",
		booking.EventID, booking.UserEmail, booking.UserName, booking.Quantity, "confirmed",
	)
	if err != nil {
		sendResponse(w, http.StatusInternalServerError, false, "Failed to create booking", nil)
		return
	}

	// Commit transaction
	if err = tx.Commit(); err != nil {
		sendResponse(w, http.StatusInternalServerError, false, "Failed to commit booking", nil)
		return
	}

	id, _ := result.LastInsertId()
	booking.ID = int(id)
	booking.Status = "confirmed"

	sendResponse(w, http.StatusCreated, true, "Booking confirmed successfully", booking)
}

// Get bookings (optionally filter by email)
func getBookings(w http.ResponseWriter, r *http.Request) {
	email := r.URL.Query().Get("email")

	var rows *sql.Rows
	var err error

	if email != "" {
		rows, err = db.Query("SELECT id, event_id, user_email, user_name, quantity, status, created_at FROM bookings WHERE user_email = ?", email)
	} else {
		rows, err = db.Query("SELECT id, event_id, user_email, user_name, quantity, status, created_at FROM bookings")
	}

	if err != nil {
		sendResponse(w, http.StatusInternalServerError, false, "Failed to fetch bookings", nil)
		return
	}
	defer rows.Close()

	bookings := []Booking{}
	for rows.Next() {
		var booking Booking
		err := rows.Scan(&booking.ID, &booking.EventID, &booking.UserEmail, &booking.UserName, &booking.Quantity, &booking.Status, &booking.CreatedAt)
		if err != nil {
			continue
		}
		bookings = append(bookings, booking)
	}

	sendResponse(w, http.StatusOK, true, "Bookings fetched successfully", bookings)
}

// Check availability endpoint
func handleCheckAvailability(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	eventID := r.URL.Query().Get("event_id")
	if eventID == "" {
		sendResponse(w, http.StatusBadRequest, false, "event_id parameter required", nil)
		return
	}

	var available int
	err := db.QueryRow("SELECT available FROM events WHERE id = ?", eventID).Scan(&available)
	if err == sql.ErrNoRows {
		sendResponse(w, http.StatusNotFound, false, "Event not found", nil)
		return
	} else if err != nil {
		sendResponse(w, http.StatusInternalServerError, false, "Failed to check availability", nil)
		return
	}

	data := map[string]interface{}{
		"event_id":  eventID,
		"available": available,
	}

	sendResponse(w, http.StatusOK, true, "Availability checked", data)
}

// Helper function to send JSON responses
func sendResponse(w http.ResponseWriter, statusCode int, success bool, message string, data interface{}) {
	w.WriteHeader(statusCode)
	response := Response{
		Success: success,
		Message: message,
		Data:    data,
	}
	json.NewEncoder(w).Encode(response)
}
