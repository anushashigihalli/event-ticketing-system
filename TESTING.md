# Testing Guide

## Quick Start Testing

### Step 1: Start the Server
```bash
go mod download
go run main.go
```

You should see:
```
 Database connected successfully
 Database migrations completed
 Server starting on http://localhost:8080
```

### Step 2: Test API Endpoints

#### 1. Create an Event
```bash
curl -X POST http://localhost:8080/events -H "Content-Type: application/json" -d "{\"name\":\"Tech Conference 2024\",\"description\":\"Annual technology conference\",\"date\":\"2024-12-15\",\"location\":\"Convention Center\",\"capacity\":100,\"price\":50.00,\"organizer_id\":1}"
```

Expected Response:
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": 1,
    "name": "Tech Conference 2024",
    "capacity": 100,
    "available": 100,
    ...
  }
}
```

#### 2. Get All Events
```bash
curl http://localhost:8080/events
```

#### 3. Get Event by ID
```bash
curl http://localhost:8080/events/1
```

#### 4. Create a Booking
```bash
curl -X POST http://localhost:8080/bookings -H "Content-Type: application/json" -d "{\"event_id\":1,\"user_email\":\"alice@example.com\",\"user_name\":\"Alice Smith\",\"quantity\":2}"
```

Expected Response:
```json
{
  "success": true,
  "message": "Booking confirmed successfully",
  "data": {
    "id": 1,
    "event_id": 1,
    "user_email": "alice@example.com",
    "quantity": 2,
    "status": "confirmed"
  }
}
```

#### 5. Check Availability
```bash
curl "http://localhost:8080/bookings/check?event_id=1"
```

Expected Response:
```json
{
  "success": true,
  "message": "Availability checked",
  "data": {
    "event_id": "1",
    "available": 98
  }
}
```

#### 6. Get All Bookings
```bash
curl http://localhost:8080/bookings
```

#### 7. Get Bookings by Email
```bash
curl "http://localhost:8080/bookings?email=alice@example.com"
```

### Step 3: Test Concurrency (Critical!)

Open a new terminal and run:
```bash
go run test_concurrency.go
```

Expected Output:
```
 Starting Concurrency Test for Overbooking Prevention
============================================================
 Created test event with ID: 2 (Capacity: 5 seats)

 Simulating 10 concurrent booking requests...

 User 1: Booking confirmed
 User 3: Booking confirmed
 User 2: Booking confirmed
 User 5: Booking confirmed
 User 4: Booking confirmed
 User 6: Booking failed - Not enough seats available. Only 0 seats left
 User 7: Booking failed - Not enough seats available. Only 0 seats left
 User 8: Booking failed - Not enough seats available. Only 0 seats left
 User 9: Booking failed - Not enough seats available. Only 0 seats left
 User 10: Booking failed - Not enough seats available. Only 0 seats left

============================================================
 CONCURRENCY TEST RESULTS
============================================================
 Successful bookings: 5
 Failed bookings: 5
  Total time: 45ms
============================================================
 TEST PASSED: No overbooking occurred!
   Mutex successfully prevented race conditions.
```

## Test Scenarios

### Scenario 1: Normal Booking Flow
1. Create event with 10 seats
2. Book 3 seats - should succeed
3. Check availability - should show 7 seats
4. Book 5 more seats - should succeed
5. Check availability - should show 2 seats

### Scenario 2: Overbooking Prevention
1. Create event with 5 seats
2. Try to book 6 seats - should fail with "Not enough seats"
3. Book 5 seats - should succeed
4. Try to book 1 more seat - should fail with "Only 0 seats left"

### Scenario 3: Multiple Users
1. Create event with 20 seats
2. User A books 5 seats
3. User B books 8 seats
4. User C books 7 seats
5. Total: 20 seats booked
6. User D tries to book 1 seat - should fail

### Scenario 4: Concurrent Stress Test
Run `test_concurrency.go` multiple times to verify consistency

## Windows-Specific Commands

If curl doesn't work, use PowerShell:

```powershell
# Create Event
Invoke-RestMethod -Uri "http://localhost:8080/events" -Method Post -ContentType "application/json" -Body '{"name":"Test Event","description":"Testing","date":"2024-12-31","location":"Test Venue","capacity":50,"price":25.00,"organizer_id":1}'

# Get Events
Invoke-RestMethod -Uri "http://localhost:8080/events" -Method Get

# Create Booking
Invoke-RestMethod -Uri "http://localhost:8080/bookings" -Method Post -ContentType "application/json" -Body '{"event_id":1,"user_email":"test@example.com","user_name":"Test User","quantity":2}'
```

## Troubleshooting

### Issue: Port already in use
```bash
# Windows: Find and kill process on port 8080
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Issue: Database locked
- Stop the server
- Delete `events.db` file
- Restart the server (will recreate database)

### Issue: Module not found
```bash
go mod download
go mod tidy
```

## Performance Benchmarks

Expected performance on average hardware:
- Event creation: < 10ms
- Booking creation: < 50ms (with mutex lock)
- Query operations: < 5ms
- Concurrent bookings (10 users): < 100ms total

## Success Criteria

- All API endpoints return correct responses  
- Database persists data correctly  
- Concurrency test shows exactly 5 successes and 5 failures  
- No overbooking occurs under any scenario  
- Error messages are clear and helpful  
- Server handles invalid requests gracefully
