# 7-Minute Presentation Script

## Slide 1: Title (30 seconds)
**"Event Registration & Ticketing System API"**

"Good morning/afternoon. I'm [Your Name], and today I'll present my capstone project: an Event Registration and Ticketing System API built with Go."

**Key Points:**
- Similar to Eventbrite
- Solves real-world overbooking problem
- Built in Go with SQLite

---

## Slide 2: Problem Statement (45 seconds)

"The core challenge: preventing overbooking when multiple users simultaneously try to book the last available seats."

**Scenario:**
- Event has 2 seats left
- 3 users click 'Book' at the same time
- Without proper handling: all 3 bookings succeed = OVERBOOKING
- With proper handling: only 2 succeed, 1 fails gracefully

"This is a critical problem in real ticketing systems like BookMyShow, Eventbrite, and airline reservations."

---

## Slide 3: System Architecture (1 minute)

**Technology Stack:**
- **Backend**: Go (Golang) with net/http standard library
- **Database**: SQLite3 (file-based, ACID compliant)
- **Concurrency**: sync.Mutex for thread-safe operations
- **API**: RESTful design with JSON

**Why These Choices?**
- Go: Built-in concurrency support, excellent performance
- SQLite: Zero configuration, perfect for development
- Mutex: Simple, reliable concurrency control
- Standard library: No unnecessary dependencies

---

## Slide 4: Database Design (45 seconds)

**Two Main Tables:**

1. **Events Table**
   - Stores event details (name, date, location)
   - Capacity: total seats
   - Available: current available seats

2. **Bookings Table**
   - Links users to events
   - Tracks quantity and status
   - Foreign key ensures referential integrity

**Key Design Decision:**
Separate `capacity` and `available` fields allows tracking bookings vs total capacity.

---

## Slide 5: Concurrency Solution (1.5 minutes) **[MOST IMPORTANT]**

"This is the heart of the project. Let me explain how we prevent race conditions."

**Three-Layer Protection:**

1. **Mutex Lock (Application Level)**
```go
bookingMutex.Lock()
defer bookingMutex.Unlock()
```
- Only ONE booking processed at a time
- Prevents concurrent modifications

2. **Database Transaction**
```go
tx, _ := db.Begin()
defer tx.Rollback()
// ... operations ...
tx.Commit()
```
- ACID properties ensure atomicity
- All-or-nothing guarantee

3. **Availability Check**
```go
if available < requestedQuantity {
    return error
}
```
- Validates within transaction
- Atomic read-modify-write

**Demo Flow:**
- User A locks mutex → checks 2 seats → books 1 → unlocks
- User B locks mutex → checks 1 seat → books 1 → unlocks
- User C locks mutex → checks 0 seats → REJECTED → unlocks

"Result: No overbooking, guaranteed correctness."

---

## Slide 6: API Endpoints (45 seconds)

**RESTful API Design:**

1. `POST /events` - Create event
2. `GET /events` - List all events
3. `GET /events/{id}` - Get specific event
4. `POST /bookings` - Create booking (with concurrency control)
5. `GET /bookings` - List bookings (filter by email)
6. `GET /bookings/check?event_id=1` - Check availability

**Response Format:**
```json
{
  "success": true,
  "message": "Booking confirmed",
  "data": { ... }
}
```

---

## Slide 7: Live Demo (1.5 minutes)

**"Let me show you the concurrency test in action."**

1. **Start Server**
   ```bash
   go run main.go
   ```

2. **Run Concurrency Test**
   ```bash
   go run test_concurrency.go
   ```

**Expected Output:**
- Creates event with 5 seats
- Simulates 10 concurrent users
- Shows exactly 5 successes, 5 failures
- Proves no overbooking

**Point to highlight:**
"Notice the mutex ensures only 5 bookings succeed, even though 10 users tried simultaneously. This is the core value of our solution."

---

## Slide 8: Testing & Validation (30 seconds)

**Testing Strategy:**
- Manual testing with curl commands
- Automated concurrency simulation
- Edge case testing (0 seats, negative quantity, invalid event)

**Results:**
✅ All endpoints working correctly  
✅ No overbooking in stress tests  
✅ Proper error handling  
✅ Database integrity maintained

---

## Slide 9: Future Enhancements (30 seconds)

**Short-term:**
- User authentication (JWT)
- Email notifications
- Payment integration

**Long-term:**
- Microservices architecture
- Real-time updates (WebSocket)
- Waitlist management
- Analytics dashboard

---

## Slide 10: Conclusion (30 seconds)

**Key Achievements:**
1. ✅ Solved critical overbooking problem
2. ✅ Production-ready concurrency control
3. ✅ Clean, maintainable code
4. ✅ Comprehensive documentation

**Learning Outcomes:**
- Deep understanding of Go concurrency
- Race condition prevention
- Database transaction management
- RESTful API design

"Thank you. I'm ready for questions."

---

## Timing Breakdown
- Introduction: 30s
- Problem: 45s
- Architecture: 1m
- Database: 45s
- Concurrency: 1m 30s ⭐ (Most important)
- API: 45s
- Demo: 1m 30s
- Testing: 30s
- Future: 30s
- Conclusion: 30s
**Total: 7 minutes**

---

## Presentation Tips

### Do's:
✅ Speak confidently about the concurrency solution  
✅ Emphasize the mutex lock mechanism  
✅ Show the live demo smoothly  
✅ Explain WHY you made each design choice  
✅ Make eye contact with evaluators  
✅ Use technical terms correctly

### Don'ts:
❌ Don't rush through the concurrency section  
❌ Don't apologize for simplicity  
❌ Don't read from slides  
❌ Don't skip the demo  
❌ Don't ignore time limits

### If Demo Fails:
- Have screenshots ready as backup
- Explain what SHOULD happen
- Show the code logic instead

### Body Language:
- Stand confidently
- Use hand gestures to emphasize points
- Smile when appropriate
- Show enthusiasm for your solution

---

## Key Phrases to Use

**Confidence Builders:**
- "The critical challenge here is..."
- "I chose this approach because..."
- "This ensures that..."
- "As you can see in the demo..."
- "The mutex guarantees..."

**Technical Credibility:**
- "Race condition prevention"
- "ACID compliance"
- "Atomic operations"
- "Thread-safe implementation"
- "Serializable isolation level"

---

## Emergency Backup Plan

If technical issues occur:
1. Have code open in editor
2. Walk through the logic verbally
3. Show test results screenshots
4. Explain expected behavior
5. Demonstrate understanding through explanation

Remember: Understanding > Working Demo
