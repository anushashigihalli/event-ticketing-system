# Quick Reference Card

## 🚀 Essential Commands

### Start Server
```bash
go run main.go
```

### Test Concurrency
```bash
go run test_concurrency.go
```

### Install Dependencies
```bash
go mod download
```

---

## 📡 API Endpoints

### Create Event
```bash
curl -X POST http://localhost:8080/events \
  -H "Content-Type: application/json" \
  -d '{"name":"Event","date":"2024-12-31","location":"Venue","capacity":10,"price":0,"organizer_id":1}'
```

### Get Events
```bash
curl http://localhost:8080/events
```

### Create Booking
```bash
curl -X POST http://localhost:8080/bookings \
  -H "Content-Type: application/json" \
  -d '{"event_id":1,"user_email":"test@test.com","user_name":"Test","quantity":1}'
```

### Check Availability
```bash
curl http://localhost:8080/bookings/check?event_id=1
```

---

## 🔑 Key Concepts

### Race Condition
Multiple users booking last seats simultaneously → Overbooking

### Solution
```go
bookingMutex.Lock()
defer bookingMutex.Unlock()
// Critical section
```

### Why Mutex?
- Serializes booking requests
- Only ONE booking at a time
- Prevents concurrent modifications
- Guarantees correctness

### Why SQLite?
- Zero configuration
- File-based (events.db)
- ACID compliant
- Perfect for development

---

## 🎤 Presentation Key Points

### 1. Problem (30 sec)
"Prevent overbooking when multiple users book simultaneously"

### 2. Solution (90 sec)
"Three-layer protection: Mutex + Transaction + Validation"

### 3. Demo (90 sec)
"10 users, 5 seats → exactly 5 succeed, 5 fail"

### 4. Why It Works (30 sec)
"Mutex serializes requests, transaction ensures atomicity"

---

## ❓ Top 5 Viva Questions

### Q1: What is a race condition?
**A:** Multiple threads accessing shared data simultaneously, result depends on timing.

### Q2: Why mutex instead of channels?
**A:** Mutex is simpler for protecting critical sections. Channels better for communication.

### Q3: Why SQLite?
**A:** Zero config, file-based, ACID compliant, perfect for 1-day project.

### Q4: Performance impact of mutex?
**A:** Serializes bookings (~100/sec), but correctness > speed for ticketing.

### Q5: What are ACID properties?
**A:** Atomicity, Consistency, Isolation, Durability - ensures data integrity.

---

## 🐛 Troubleshooting

### Port 8080 in use
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Database locked
```bash
# Stop server, delete database, restart
del events.db
go run main.go
```

### Module errors
```bash
go mod tidy
go mod download
```

---

## 📦 Git Commands

### Initial Setup
```bash
git init
git add .
git commit -m "Initial commit: Event Ticketing System"
git remote add origin https://github.com/[USERNAME]/event-ticketing-system.git
git branch -M main
git push -u origin main
```

### Repository URL
```
https://github.com/[YOUR-USERNAME]/event-ticketing-system
```

---

## 📊 Project Stats

- **Language**: Go 1.21+
- **Database**: SQLite3
- **Lines of Code**: 500+
- **API Endpoints**: 7
- **Tables**: 2 (events, bookings)
- **Concurrency**: sync.Mutex
- **Test**: 10 concurrent users

---

## ✅ Pre-Demo Checklist

- [ ] Server running
- [ ] Port 8080 free
- [ ] Database created
- [ ] Concurrency test ready
- [ ] Backup screenshots
- [ ] Confident in explanation

---

## 🎯 Success Criteria

✅ Code compiles  
✅ Server starts  
✅ All endpoints work  
✅ Concurrency test passes  
✅ No overbooking  
✅ Can explain mutex

---

## 📞 Quick Help

**Can't start server?**
→ Check Go installed: `go version`

**API not responding?**
→ Check server running: `curl http://localhost:8080/events`

**Concurrency test fails?**
→ Check server running first

**Git push fails?**
→ Use HTTPS: `git remote set-url origin https://...`

---

## 🔗 Document Links

- Full docs: [README.md](README.md)
- Design: [design.md](design.md)
- Testing: [TESTING.md](TESTING.md)
- Presentation: [PRESENTATION.md](PRESENTATION.md)
- Q&A: [VIVA_QUESTIONS.md](VIVA_QUESTIONS.md)
- Git: [GIT_COMMANDS.md](GIT_COMMANDS.md)

---

## 💡 Remember

**Concurrency is the star of this project!**

Focus on explaining:
1. What race conditions are
2. How mutex prevents them
3. Why this approach works
4. Demo proving it works

---

**Print this page for quick reference during presentation!**
