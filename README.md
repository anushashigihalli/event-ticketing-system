# Event Registration & Ticketing System API

A production-ready REST API for event registration and ticketing built with Go, featuring robust concurrency control to prevent overbooking scenarios.

##  Project Overview

This system allows:
- **Users**: Browse events and register for tickets
- **Organizers**: Create events with limited capacity
- **System**: Prevent overbooking when multiple users book simultaneously

## Architecture

### Technology Stack
- **Language**: Go 1.21+
- **Database**: SQLite3 (file-based, zero-configuration)
- **Concurrency**: sync.Mutex for thread-safe operations
- **HTTP**: Standard library net/http

### Key Design Decisions

1. **SQLite Database**: Chosen for simplicity, portability, and zero setup requirements
2. **Mutex Locking**: Ensures atomic booking operations preventing race conditions
3. **Database Transactions**: ACID compliance for data integrity
4. **Standard Library**: Minimal dependencies for reliability and performance

##  Project Structure

```
event-ticketing-system/
├── main.go                 # Main application with all handlers
├── test_concurrency.go     # Concurrency test simulation
├── go.mod                  # Go module dependencies
├── events.db              # SQLite database (auto-generated)
├── README.md              # This file
├── design.md              # Detailed design document
└── prompts/
    └── ai-prompts.md      # AI assistance transparency log
```

##  Database Schema

### Events Table
```sql
CREATE TABLE events (
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
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    status TEXT DEFAULT 'confirmed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
);
```

## Getting Started

### Prerequisites
- Go 1.21 or higher
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/[your-username]/event-ticketing-system.git
cd event-ticketing-system
```

2. **Install dependencies**
```bash
go mod download
```

3. **Run the application**
```bash
go run main.go
```

Server starts at `http://localhost:8080`

##  API Endpoints

### 1. Create Event
```bash
POST /events
Content-Type: application/json

{
  "name": "Tech Conference 2024",
  "description": "Annual technology conference",
  "date": "2024-12-15",
  "location": "Convention Center",
  "capacity": 100,
  "price": 50.00,
  "organizer_id": 1
}
```

### 2. Get All Events
```bash
GET /events
```

### 3. Get Event by ID
```bash
GET /events/{id}
```

### 4. Create Booking
```bash
POST /bookings
Content-Type: application/json

{
  "event_id": 1,
  "user_email": "user@example.com",
  "user_name": "John Doe",
  "quantity": 2
}
```

### 5. Get Bookings
```bash
GET /bookings
GET /bookings?email=user@example.com
```

### 6. Check Availability
```bash
GET /bookings/check?event_id=1
```

## Testing

### Manual Testing with curl

**Create an event:**
```bash
curl -X POST http://localhost:8080/events \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Music Festival\",\"description\":\"Summer music event\",\"date\":\"2024-08-20\",\"location\":\"City Park\",\"capacity\":50,\"price\":75.00,\"organizer_id\":1}"
```

**Book tickets:**
```bash
curl -X POST http://localhost:8080/bookings \
  -H "Content-Type: application/json" \
  -d "{\"event_id\":1,\"user_email\":\"alice@example.com\",\"user_name\":\"Alice Smith\",\"quantity\":2}"
```

**Check availability:**
```bash
curl http://localhost:8080/bookings/check?event_id=1
```

### Concurrency Test

Run the automated concurrency test:
```bash
# Terminal 1: Start the server
go run main.go

# Terminal 2: Run concurrency test
go run test_concurrency.go
```

This simulates 10 concurrent users trying to book the last 5 seats, verifying no overbooking occurs.

##  Concurrency Control

### The Problem
When multiple users simultaneously book the last available seats, without proper synchronization:
1. User A checks: 2 seats available ✓
2. User B checks: 2 seats available ✓
3. User A books 2 seats
4. User B books 2 seats
5. Result: 4 seats booked but only 2 were available (OVERBOOKING!)

### The Solution
```go
// Global mutex for booking operations
var bookingMutex sync.Mutex

func createBooking(w http.ResponseWriter, r *http.Request) {
    // Lock ensures only ONE booking at a time
    bookingMutex.Lock()
    defer bookingMutex.Unlock()
    
    // Begin database transaction
    tx, _ := db.Begin()
    defer tx.Rollback()
    
    // Check availability
    // Update seats
    // Create booking
    
    // Commit transaction
    tx.Commit()
}
```

**Key mechanisms:**
1. **Mutex Lock**: Serializes booking requests
2. **Database Transaction**: Ensures atomicity
3. **Row-level checks**: Validates availability before update

##  Performance Considerations

- **Mutex scope**: Minimal lock duration for better throughput
- **Database indexes**: Fast lookups on event_id and user_email
- **Connection pooling**: SQLite handles concurrent reads efficiently
- **Transaction isolation**: Prevents dirty reads

##  Learning Outcomes

1. **Concurrency patterns** in Go using sync.Mutex
2. **Race condition prevention** in real-world scenarios
3. **Database transactions** for data integrity
4. **RESTful API design** with standard library
5. **Error handling** and validation best practices

##  Future Enhancements

1. **Authentication & Authorization**: JWT-based user authentication
2. **Payment Integration**: Stripe/Razorpay for actual payments
3. **Email Notifications**: Booking confirmations via SMTP
4. **Waitlist Feature**: Queue users when events are full
5. **Event Categories**: Filter events by type/category
6. **Rate Limiting**: Prevent API abuse
7. **Caching**: Redis for frequently accessed data
8. **Microservices**: Split into event-service and booking-service
9. **WebSocket**: Real-time seat availability updates
10. **Admin Dashboard**: Web UI for organizers

##  Author

**Anusha Umesh Shigihalli**
- GitHub: [@anushashigihalli](https://github.com/anushashigihalli)
- Email: anushashigihalli6@gmail.com

## License

This project is created for academic purposes as part of Infosys Capstone Project.

##  Acknowledgments

- Infosys Springboard for project guidelines
- Go community for excellent documentation
- SQLite for reliable embedded database

---


