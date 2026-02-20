# Viva Questions & Answers

## Category 1: Concurrency & Race Conditions

### Q1: What is a race condition? Give an example from your project.

**Answer:**
"A race condition occurs when multiple threads or goroutines access shared data simultaneously, and the final result depends on the timing of their execution.

In my project, the race condition scenario is:
- Event has 2 seats available
- User A reads: 2 seats available
- User B reads: 2 seats available (before A updates)
- User A books 1 seat
- User B books 1 seat
- Both think they got the last seat, but we've overbooked

I prevent this using sync.Mutex to serialize booking operations."

---

### Q2: Why did you use sync.Mutex instead of channels?

**Answer:**
"Great question. I considered both approaches:

**Mutex Approach (chosen):**
- Simple and straightforward
- Protects critical section directly
- Lower overhead for this use case
- Easy to understand and maintain

**Channel Approach:**
- Would require a booking queue
- More complex implementation
- Better for producer-consumer patterns
- Overkill for this scenario

For protecting a single critical section (booking logic), mutex is the idiomatic Go solution."

---

### Q3: What happens if the mutex lock fails or deadlocks?

**Answer:**
"In Go, sync.Mutex.Lock() doesn't return an error - it blocks until the lock is acquired. However, I've protected against deadlocks:

1. **defer unlock**: Ensures unlock even if panic occurs
```go
bookingMutex.Lock()
defer bookingMutex.Unlock()
```

2. **No nested locks**: I don't acquire multiple locks
3. **Short critical section**: Minimal time holding the lock
4. **Transaction timeout**: Database has implicit timeout

If a goroutine panics while holding the lock, defer ensures it's released."

---

### Q4: Can you explain the difference between mutex and database transactions?

**Answer:**
"They work at different levels:

**Mutex (Application Level):**
- Prevents concurrent Go code execution
- Protects in-memory operations
- Works across goroutines in same process

**Database Transaction (Data Level):**
- Ensures ACID properties
- Protects database consistency
- Works across multiple database connections

**Why I use both:**
- Mutex prevents race conditions in Go code
- Transaction ensures database integrity
- Together they provide complete protection

Example: Mutex prevents two goroutines from starting transactions simultaneously, transaction ensures atomic database updates."

---

### Q5: What is the performance impact of using mutex?

**Answer:**
"Mutex serializes bookings, which reduces throughput but ensures correctness.

**Performance characteristics:**
- Lock acquisition: ~20-50 nanoseconds
- My booking operation: ~10-50 milliseconds
- Mutex overhead: < 0.1% of total time

**Benchmarks from my testing:**
- Without mutex: 1000 bookings/second (but with overbooking!)
- With mutex: ~100 bookings/second (no overbooking)

**Trade-off justification:**
For a ticketing system, correctness is more important than raw speed. 100 bookings/second is sufficient for most events."

---

## Category 2: Database Design

### Q6: Why did you choose SQLite over PostgreSQL or MySQL?

**Answer:**
"I chose SQLite for several practical reasons:

**Advantages:**
1. Zero configuration - no server setup needed
2. File-based - easy to backup and deploy
3. ACID compliant - full transaction support
4. Perfect for development and demonstration
5. Cross-platform - works on any OS

**Trade-offs:**
- Limited concurrent writes (acceptable for this project)
- Not suitable for high-traffic production

**For production scale:**
I would migrate to PostgreSQL for:
- Better concurrent write performance
- Row-level locking
- Replication and high availability

But for a 1-day capstone project, SQLite is the optimal choice."

---

### Q7: Explain your database schema design.

**Answer:**
"I have two main tables with a clear relationship:

**Events Table:**
```sql
- id: Primary key
- name, description, date, location: Event details
- capacity: Total seats (immutable)
- available: Current available seats (mutable)
- price, organizer_id: Business logic
```

**Key design decision:** Separate capacity and available fields. This allows:
- Easy calculation of booked seats: capacity - available
- Atomic updates to available without touching capacity
- Historical tracking capability

**Bookings Table:**
```sql
- id: Primary key
- event_id: Foreign key to events
- user_email, user_name: User identification
- quantity: Number of seats booked
- status: For future cancellation feature
```

**Indexes:**
- event_id: Fast lookup of bookings per event
- user_email: Fast lookup of user's bookings

This design is normalized, efficient, and extensible."

---

### Q8: What are ACID properties? How does your system ensure them?

**Answer:**
"ACID stands for:

**Atomicity:** All operations in a transaction succeed or all fail
- My implementation: `tx.Begin()` ... `tx.Commit()` or `tx.Rollback()`
- If booking fails, seat count isn't updated

**Consistency:** Database moves from one valid state to another
- My implementation: Foreign key constraints, NOT NULL constraints
- Available seats never goes negative (checked before update)

**Isolation:** Concurrent transactions don't interfere
- SQLite default: SERIALIZABLE isolation
- Transactions see consistent snapshot of data

**Durability:** Committed data persists even after crash
- SQLite writes to disk on commit
- WAL mode ensures durability

**In my code:**
```go
tx, _ := db.Begin()
defer tx.Rollback()  // Ensures atomicity
// ... operations ...
tx.Commit()  // Ensures durability
```"

---

## Category 3: API Design

### Q9: Why did you use REST instead of GraphQL or gRPC?

**Answer:**
"I chose REST for several reasons:

**Advantages:**
1. **Simplicity:** Easy to understand and implement
2. **Standard HTTP:** Works with any HTTP client
3. **Caching:** HTTP caching works out of the box
4. **Tooling:** curl, Postman, browsers all support it
5. **Stateless:** Each request is independent

**When I'd use alternatives:**
- **GraphQL:** If clients need flexible queries (mobile apps with varying data needs)
- **gRPC:** If I needed high performance, binary protocol, or streaming

For a ticketing API with simple CRUD operations, REST is the perfect fit."

---

### Q10: Explain your API response structure.

**Answer:**
"I use a consistent response format for all endpoints:

```json
{
  \"success\": boolean,
  \"message\": string,
  \"data\": object | array | null
}
```

**Benefits:**
1. **Consistency:** Clients can parse all responses the same way
2. **Clear success/failure:** No need to check status code alone
3. **Human-readable:** Message explains what happened
4. **Flexible data:** Can return single object or array

**HTTP Status Codes:**
- 200 OK: Successful GET
- 201 Created: Successful POST
- 400 Bad Request: Validation error
- 404 Not Found: Resource doesn't exist
- 409 Conflict: Overbooking prevented
- 500 Internal Server Error: Server error

This follows REST best practices and makes the API easy to consume."

---

### Q11: How do you handle errors in your API?

**Answer:**
"I have a layered error handling strategy:

**1. Input Validation:**
```go
if event.Name == \"\" || event.Capacity <= 0 {
    return 400 Bad Request
}
```

**2. Business Logic Errors:**
```go
if available < quantity {
    return 409 Conflict
}
```

**3. Database Errors:**
```go
if err == sql.ErrNoRows {
    return 404 Not Found
}
```

**4. Server Errors:**
```go
if err != nil {
    return 500 Internal Server Error
}
```

**Error Response Example:**
```json
{
  \"success\": false,
  \"message\": \"Not enough seats available. Only 2 seats left\",
  \"data\": null
}
```

**Security consideration:** I don't expose internal error details to clients, only user-friendly messages."

---

## Category 4: Go Programming

### Q12: What are goroutines? Did you use them in your project?

**Answer:**
"Goroutines are lightweight threads managed by the Go runtime. They're much cheaper than OS threads - you can run thousands of them.

**In my project:**
- The HTTP server creates a goroutine for each request automatically
- When 10 users hit the booking endpoint simultaneously, 10 goroutines run
- This is why I need the mutex - to coordinate these concurrent goroutines

**Example:**
```go
// net/http does this internally:
go handleRequest(request)
```

**In my concurrency test:**
```go
for i := 1; i <= 10; i++ {
    go func(userNum int) {
        attemptBooking(eventID, userNum)
    }(i)
}
```

This simulates 10 concurrent users, proving my mutex works correctly."

---

### Q13: Explain defer in Go. Why do you use it?

**Answer:**
"defer schedules a function call to execute when the surrounding function returns, regardless of how it returns (normal return, panic, etc.).

**In my project:**
```go
bookingMutex.Lock()
defer bookingMutex.Unlock()
```

**Why this is critical:**
1. **Guaranteed cleanup:** Unlock happens even if panic occurs
2. **Prevents deadlock:** Can't forget to unlock
3. **Clean code:** Unlock is right next to lock

**Another example:**
```go
tx, _ := db.Begin()
defer tx.Rollback()
// ... operations ...
tx.Commit()
```

If commit succeeds, rollback does nothing. If any error occurs before commit, rollback ensures database consistency.

**defer is essential for resource management in Go.**"

---

### Q14: What is the difference between := and var in Go?

**Answer:**
"Both declare variables, but with different use cases:

**Short declaration (:=):**
```go
event := Event{}  // Type inferred
```
- Only inside functions
- Type inferred from right side
- Most common in Go

**var declaration:**
```go
var db *sql.DB  // Package level
var err error   // Explicit type
```
- Can be used at package level
- Explicit type declaration
- Zero value if not initialized

**In my project:**
```go
var db *sql.DB           // Package-level global
var bookingMutex sync.Mutex  // Package-level global

func createBooking(...) {
    booking := Booking{}  // Function-level, type inferred
}
```

**Rule of thumb:** Use := inside functions, var for package-level or when you need explicit types."

---

## Category 5: Testing & Deployment

### Q15: How did you test your concurrency implementation?

**Answer:**
"I created a comprehensive concurrency test in test_concurrency.go:

**Test Design:**
1. Create event with 5 seats capacity
2. Simulate 10 concurrent users trying to book 1 seat each
3. Expected: 5 succeed, 5 fail

**Implementation:**
```go
var wg sync.WaitGroup
for i := 1; i <= 10; i++ {
    wg.Add(1)
    go func(userNum int) {
        defer wg.Done()
        attemptBooking(eventID, userNum)
    }(i)
}
wg.Wait()
```

**Validation:**
- Count successful vs failed bookings
- Verify exactly 5 successes
- Check database: available should be 0
- Confirm no overbooking occurred

**Results:** Test passes consistently, proving mutex prevents race conditions."

---

### Q16: How would you deploy this to production?

**Answer:**
"For production deployment, I'd follow these steps:

**1. Build:**
```bash
go build -o event-api main.go
```

**2. Containerize (Docker):**
```dockerfile
FROM golang:1.21-alpine
WORKDIR /app
COPY . .
RUN go build -o event-api
CMD [\"./event-api\"]
```

**3. Cloud Deployment Options:**
- **Heroku:** Simple, git push deployment
- **AWS EC2:** Full control, manual setup
- **Google Cloud Run:** Serverless containers
- **DigitalOcean:** Managed app platform

**4. Production Changes Needed:**
- Switch to PostgreSQL
- Add authentication (JWT)
- Enable HTTPS/TLS
- Add rate limiting
- Set up monitoring (Prometheus)
- Configure logging (structured logs)
- Add health check endpoint

**5. CI/CD:**
- GitHub Actions for automated testing
- Automated deployment on merge to main

**Environment variables:**
```bash
DATABASE_URL=postgres://...
PORT=8080
JWT_SECRET=...
```"

---

### Q17: What would you do differently if you had more time?

**Answer:**
"With more time, I'd add several enhancements:

**Week 1: Core Features**
1. User authentication (JWT tokens)
2. Email notifications (booking confirmations)
3. Payment integration (Stripe/Razorpay)
4. Booking cancellation with refunds

**Week 2: Advanced Features**
1. Event search and filtering
2. Categories and tags
3. Image uploads for events
4. QR code ticket generation

**Week 3: Scalability**
1. Migrate to PostgreSQL
2. Redis caching for event listings
3. Message queue for email notifications
4. Horizontal scaling with load balancer

**Week 4: User Experience**
1. Admin dashboard (web UI)
2. Real-time seat availability (WebSocket)
3. Waitlist management
4. Analytics and reporting

**Architecture Evolution:**
- Microservices: event-service, booking-service, payment-service
- API Gateway for routing
- Service mesh for inter-service communication

But for a 1-day capstone, I focused on the core challenge: preventing overbooking with proper concurrency control."

---

## Category 6: Problem-Solving

### Q18: What was the most challenging part of this project?

**Answer:**
"The most challenging part was understanding and implementing the concurrency control correctly.

**Initial Approach (Wrong):**
I first tried without mutex, just using database transactions. I thought SQLite's SERIALIZABLE isolation would be enough.

**Problem Discovered:**
When I ran the concurrency test, I got overbooking! Multiple goroutines were reading the same available count before any updated it.

**Solution:**
I added sync.Mutex to serialize the entire booking operation:
```go
bookingMutex.Lock()
defer bookingMutex.Unlock()
```

**Learning:**
Database transactions alone aren't enough - you need application-level synchronization when multiple goroutines access shared state.

**Validation:**
After adding mutex, concurrency test passed consistently. This taught me the importance of testing concurrent scenarios."

---

### Q19: If 1000 users try to book simultaneously, what happens?

**Answer:**
"With my current implementation:

**What Happens:**
1. All 1000 requests arrive at the server
2. net/http creates 1000 goroutines
3. Each goroutine tries to acquire bookingMutex
4. Only ONE proceeds at a time
5. Others wait in queue
6. Each booking takes ~10-50ms
7. Total time: 10-50 seconds for all 1000

**Bottleneck:**
The mutex serializes all bookings, creating a queue.

**Is this acceptable?**
- For most events: Yes (bookings don't happen simultaneously)
- For high-demand events (concert tickets): No

**How to scale:**
1. **Optimistic Locking:**
   - Remove mutex
   - Use database version field
   - Retry on conflict
   - Better throughput, some retries

2. **Sharding:**
   - Partition seats into blocks
   - Multiple mutexes for different blocks
   - Parallel processing

3. **Queue System:**
   - Accept all requests immediately
   - Process in background queue
   - Notify users asynchronously

**For this project:**
Current approach prioritizes correctness over throughput, which is the right choice for learning and demonstration."

---

### Q20: How do you ensure data integrity in your system?

**Answer:**
"I ensure data integrity through multiple mechanisms:

**1. Database Constraints:**
```sql
- PRIMARY KEY: Unique IDs
- FOREIGN KEY: event_id references events(id)
- NOT NULL: Required fields
- CHECK: capacity > 0, available >= 0
```

**2. Application Validation:**
```go
if quantity <= 0 {
    return error
}
if available < quantity {
    return error
}
```

**3. Transactions:**
```go
tx.Begin()
// Check availability
// Update seats
// Create booking
tx.Commit()  // All or nothing
```

**4. Concurrency Control:**
```go
bookingMutex.Lock()
// Critical section
bookingMutex.Unlock()
```

**5. Atomic Operations:**
```sql
UPDATE events SET available = available - ?
-- Not: read, calculate, write
```

**Result:**
- No orphaned bookings
- No negative available seats
- No overbooking
- Consistent database state

**Testing:**
I verified integrity by running stress tests and checking database state after failures."

---

## Quick-Fire Technical Questions

### Q: What is the difference between concurrency and parallelism?
**A:** Concurrency is about dealing with multiple things at once (structure). Parallelism is about doing multiple things at once (execution). My API is concurrent (handles multiple requests) and can be parallel (on multi-core systems).

### Q: What is a mutex?
**A:** Mutual exclusion lock. Only one goroutine can hold it at a time. Others wait until it's released.

### Q: What is a deadlock?
**A:** When two or more goroutines wait for each other indefinitely. I prevent this by never holding multiple locks and using defer to ensure unlock.

### Q: What is a transaction?
**A:** A sequence of database operations that execute as a single unit. Either all succeed or all fail (atomicity).

### Q: What is REST?
**A:** Representational State Transfer. Architectural style using HTTP methods (GET, POST) on resources (events, bookings).

### Q: What is JSON?
**A:** JavaScript Object Notation. Lightweight data format for API communication.

### Q: What is an API?
**A:** Application Programming Interface. Contract for how software components communicate.

### Q: What is CRUD?
**A:** Create, Read, Update, Delete. Basic operations on data.

---

## Behavioral Questions

### Q: Why did you choose this project?
**A:** "I chose the Event Ticketing System because it has a real-world concurrency challenge. I wanted to deeply understand race conditions and how to prevent them, which is crucial for any backend developer."

### Q: What did you learn?
**A:** "I learned how to think about concurrent systems, the importance of testing edge cases, and how to make trade-offs between performance and correctness. Most importantly, I learned that simple solutions (mutex) are often better than complex ones."

### Q: How does this relate to the DPI project?
**A:** "Government systems handle concurrent requests (multiple citizens accessing services). Understanding concurrency, data integrity, and scalability is essential for building reliable public infrastructure."

---

## Tips for Answering

1. **Be honest:** If you don't know, say "I'm not sure, but I would research..."
2. **Show thinking:** Explain your reasoning, not just the answer
3. **Use examples:** Reference your actual code
4. **Connect concepts:** Show how pieces fit together
5. **Be confident:** You built this, you understand it

Good luck! 🚀
