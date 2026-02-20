# Design Document: Event Registration & Ticketing System

## 1. System Overview

This document explains the architectural decisions, concurrency strategy, and implementation details of the Event Registration & Ticketing System API.

## 2. Problem Statement

Build a REST API similar to Eventbrite where:
- Users can browse and register for events
- Organizers can create events with limited capacity
- **Critical Challenge**: Prevent overbooking when multiple users simultaneously book the last available seats

## 3. Technology Choices

### 3.1 Why Go (Golang)?

**Advantages:**
- Built-in concurrency primitives (goroutines, channels, mutexes)
- Excellent performance for I/O-bound operations
- Strong standard library (net/http, database/sql)
- Static typing prevents runtime errors
- Fast compilation and execution

### 3.2 Why SQLite?

**Advantages:**
- Zero configuration required
- File-based (no separate server process)
- ACID compliant transactions
- Perfect for development and small-to-medium deployments
- Easy to backup (single file)
- Cross-platform compatibility

**Trade-offs:**
- Limited concurrent write performance (acceptable for this use case)
- Not suitable for high-traffic production (would use PostgreSQL/MySQL)
- Single file can be a bottleneck at scale

**Why SQLite is Perfect for This Project:**
1. 1-day implementation timeline
2. Easy setup and deployment
3. Demonstrates database concepts without infrastructure complexity
4. Sufficient for demonstration and testing

### 3.3 Why Standard Library (net/http)?

**Advantages:**
- No external dependencies (except database driver)
- Production-ready HTTP server
- Full control over routing and middleware
- Lightweight and fast

**Alternative Considered:**
- Gin framework: More features but adds complexity
- Decision: Standard library sufficient for project scope

## 4. Concurrency Strategy

### 4.1 The Race Condition Problem

**Scenario**: Event has 2 seats left, 3 users try to book simultaneously


**Without Concurrency Control:**
```
Time    User A              User B              User C
----    ------              ------              ------
T1      Read: 2 available
T2                          Read: 2 available
T3                                              Read: 2 available
T4      Book 1 seat
T5                          Book 1 seat
T6                                              Book 1 seat
Result: 3 bookings for 2 seats = OVERBOOKING!
```

**With Mutex Lock:**
```
Time    User A              User B              User C
----    ------              ------              ------
T1      Lock acquired
T2      Read: 2 available
T3      Book 1 seat
T4      Unlock
T5                          Lock acquired
T6                          Read: 1 available
T7                          Book 1 seat
T8                          Unlock
T9                                              Lock acquired
T10                                             Read: 0 available
T11                                             Booking REJECTED
T12                                             Unlock
Result: 2 bookings for 2 seats = NO OVERBOOKING ✓
```

### 4.2 Implementation Strategy

**Three-Layer Protection:**

1. **Application-Level Mutex (sync.Mutex)**
   - Serializes booking requests
   - Only one booking processed at a time
   - Prevents race conditions in Go code

2. **Database Transaction**
   - ACID properties ensure atomicity
   - Rollback on any failure
   - Consistent state guaranteed

3. **Row-Level Validation**
   - Check availability within transaction
   - Update only if sufficient seats
   - Atomic read-modify-write operation

### 4.3 Code Implementation

```go
var bookingMutex sync.Mutex

func createBooking(w http.ResponseWriter, r *http.Request) {
    // Step 1: Acquire mutex lock
    bookingMutex.Lock()
    defer bookingMutex.Unlock()  // Ensures unlock even on panic
    
    // Step 2: Begin database transaction
    tx, err := db.Begin()
    defer tx.Rollback()  // Rollback if not committed
    
    // Step 3: Check availability (within transaction)
    var available int
    tx.QueryRow("SELECT available FROM events WHERE id = ?", eventID).Scan(&available)
    
    // Step 4: Validate sufficient seats
    if available < requestedQuantity {
        return error  // Transaction rolled back
    }
    
    // Step 5: Update seats atomically
    tx.Exec("UPDATE events SET available = available - ? WHERE id = ?", quantity, eventID)
    
    // Step 6: Create booking record
    tx.Exec("INSERT INTO bookings (...) VALUES (...)")
    
    // Step 7: Commit transaction
    tx.Commit()  // All or nothing
}
```

### 4.4 Why This Approach Works

**Mutex Scope:**
- Locks entire booking operation
- Prevents concurrent modifications
- Minimal lock duration (only during booking)

**Transaction Isolation:**
- SQLite default isolation: SERIALIZABLE
- Prevents dirty reads and phantom reads
- Ensures consistency

**Atomic Operations:**
- `available = available - quantity` is atomic within transaction
- No intermediate states visible to other transactions

## 5. Database Design

### 5.1 Schema Rationale

**Events Table:**
- `capacity`: Total seats (immutable)
- `available`: Current available seats (mutable)
- Separation allows tracking bookings vs capacity

**Bookings Table:**
- Foreign key to events ensures referential integrity
- `status` field allows future cancellation feature
- Indexed on `event_id` and `user_email` for fast queries

### 5.2 Indexes

```sql
CREATE INDEX idx_event_id ON bookings(event_id);
CREATE INDEX idx_user_email ON bookings(user_email);
```

**Benefits:**
- Fast lookup of bookings by event
- Fast lookup of user's bookings
- Improved query performance

## 6. API Design

### 6.1 RESTful Principles

- **Resource-based URLs**: `/events`, `/bookings`
- **HTTP methods**: GET (read), POST (create)
- **Status codes**: 200 (OK), 201 (Created), 404 (Not Found), 409 (Conflict)
- **JSON format**: Standard request/response format

### 6.2 Response Structure

```json
{
  "success": true,
  "message": "Booking confirmed successfully",
  "data": { ... }
}
```

**Consistency:**
- All responses follow same structure
- Easy to parse on client side
- Clear success/failure indication

## 7. Error Handling

### 7.1 Validation Errors (400 Bad Request)
- Missing required fields
- Invalid data types
- Negative quantities

### 7.2 Not Found Errors (404)
- Event doesn't exist
- Booking doesn't exist

### 7.3 Conflict Errors (409)
- Insufficient seats available
- Overbooking prevented

### 7.4 Server Errors (500)
- Database connection failures
- Transaction failures

## 8. Testing Strategy

### 8.1 Manual Testing
- curl commands for each endpoint
- Verify CRUD operations
- Test error scenarios

### 8.2 Concurrency Testing
- Simulate 10 concurrent users
- Event with 5 seats capacity
- Verify exactly 5 bookings succeed
- Verify 5 bookings fail gracefully

### 8.3 Test Scenarios
1. Create event successfully
2. Book tickets with available seats
3. Attempt booking with insufficient seats
4. Concurrent booking stress test
5. Query bookings by email
6. Check availability endpoint

## 9. Performance Considerations

### 9.1 Bottlenecks
- Mutex serializes bookings (intentional for correctness)
- SQLite write lock (acceptable for project scope)

### 9.2 Optimizations
- Minimal mutex scope
- Database connection pooling
- Indexed queries
- Efficient JSON encoding

### 9.3 Scalability Limits
- Current design: ~100 concurrent bookings/second
- For higher scale: Use PostgreSQL + optimistic locking
- For very high scale: Distributed locks (Redis) + message queue

## 10. Security Considerations

### 10.1 Current Implementation
- Input validation
- SQL injection prevention (parameterized queries)
- Error message sanitization

### 10.2 Production Enhancements Needed
- Authentication (JWT tokens)
- Authorization (role-based access)
- Rate limiting
- HTTPS/TLS
- CORS configuration
- API key management

## 11. Future Improvements

### 11.1 Short-term (1 week)
1. User authentication system
2. Email notifications
3. Booking cancellation
4. Event search and filtering

### 11.2 Medium-term (1 month)
1. Payment integration (Stripe/Razorpay)
2. QR code ticket generation
3. Event categories and tags
4. Admin dashboard

### 11.3 Long-term (3 months)
1. Microservices architecture
2. Real-time seat availability (WebSocket)
3. Waitlist management
4. Analytics and reporting
5. Mobile app integration

## 12. Deployment Strategy

### 12.1 Development
```bash
go run main.go
```

### 12.2 Production Build
```bash
go build -o event-api main.go
./event-api
```

### 12.3 Docker Deployment
```dockerfile
FROM golang:1.21-alpine
WORKDIR /app
COPY . .
RUN go build -o event-api main.go
CMD ["./event-api"]
```

### 12.4 Cloud Deployment Options
- **Heroku**: Simple deployment with buildpack
- **AWS EC2**: Full control, manual setup
- **Google Cloud Run**: Serverless containers
- **DigitalOcean App Platform**: Managed deployment

## 13. Monitoring and Logging

### 13.1 Current Logging
- Server startup confirmation
- Database connection status
- Migration completion

### 13.2 Production Logging Needs
- Request/response logging
- Error tracking (Sentry)
- Performance metrics (Prometheus)
- Database query logging

## 14. Conclusion

This design prioritizes:
1. **Correctness**: No overbooking through proper concurrency control
2. **Simplicity**: Minimal dependencies, clear code structure
3. **Practicality**: Achievable in 1-day timeline
4. **Extensibility**: Easy to add features later

The mutex-based approach trades some performance for guaranteed correctness, which is the right choice for a ticketing system where data integrity is paramount.

---

**Design Approved By**: [Your Name]  
**Date**: [Current Date]  
**Version**: 1.0
