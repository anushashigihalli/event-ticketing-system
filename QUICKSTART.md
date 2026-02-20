# Quick Start Guide - 5 Minutes to Running System

## Prerequisites Check
```bash
# Check Go installation
go version
# Should show: go version go1.21 or higher

# Check Git installation
git --version
```

If Go is not installed: https://go.dev/dl/

## Step 1: Setup (1 minute)
```bash
# Install dependencies
go mod download

# Verify installation
go mod verify
```

## Step 2: Run Server (30 seconds)
```bash
# Start the server
go run main.go
```

Expected output:
```
✅ Database connected successfully
✅ Database migrations completed
🚀 Server starting on http://localhost:8080
```

## Step 3: Test API (2 minutes)

### Create an Event
```bash
curl -X POST http://localhost:8080/events -H "Content-Type: application/json" -d "{\"name\":\"Tech Meetup\",\"description\":\"Monthly tech meetup\",\"date\":\"2024-12-31\",\"location\":\"Tech Hub\",\"capacity\":10,\"price\":0,\"organizer_id\":1}"
```

### View All Events
```bash
curl http://localhost:8080/events
```

### Book Tickets
```bash
curl -X POST http://localhost:8080/bookings -H "Content-Type: application/json" -d "{\"event_id\":1,\"user_email\":\"test@example.com\",\"user_name\":\"Test User\",\"quantity\":2}"
```

### Check Availability
```bash
curl "http://localhost:8080/bookings/check?event_id=1"
```

## Step 4: Test Concurrency (1 minute)

Open a NEW terminal (keep server running):
```bash
go run test_concurrency.go
```

Expected result:
```
✅ Successful bookings: 5
❌ Failed bookings: 5
✅ TEST PASSED: No overbooking occurred!
```

## Windows Users

If curl doesn't work, use PowerShell:
```powershell
# Create Event
Invoke-RestMethod -Uri "http://localhost:8080/events" -Method Post -ContentType "application/json" -Body '{"name":"Test Event","date":"2024-12-31","location":"Test Venue","capacity":10,"price":0,"organizer_id":1}'

# Get Events
Invoke-RestMethod -Uri "http://localhost:8080/events"
```

## Troubleshooting

### Port 8080 already in use
```bash
# Windows: Find and kill process
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Module errors
```bash
go mod tidy
go mod download
```

### Database locked
```bash
# Stop server (Ctrl+C)
# Delete database
del events.db  # Windows
rm events.db   # Mac/Linux
# Restart server
```

## Next Steps

1. ✅ Read README.md for full documentation
2. ✅ Read TESTING.md for comprehensive testing guide
3. ✅ Read PRESENTATION.md for presentation preparation
4. ✅ Read VIVA_QUESTIONS.md for Q&A preparation
5. ✅ Read GIT_COMMANDS.md for GitHub submission

## Project Structure
```
event-ticketing-system/
├── main.go                    # Main application
├── test_concurrency.go        # Concurrency test
├── go.mod                     # Dependencies
├── README.md                  # Main documentation
├── design.md                  # Design decisions
├── TESTING.md                 # Testing guide
├── PRESENTATION.md            # Presentation script
├── VIVA_QUESTIONS.md          # Q&A preparation
├── GIT_COMMANDS.md            # Git submission guide
├── QUICKSTART.md              # This file
└── prompts/
    └── ai-prompts.md          # AI transparency log
```

## Success Checklist

✅ Server starts without errors  
✅ Can create events via API  
✅ Can book tickets via API  
✅ Concurrency test passes  
✅ No overbooking occurs  

If all checks pass, you're ready to submit! 🚀

## Support

If you encounter issues:
1. Check TESTING.md for detailed troubleshooting
2. Verify Go version (1.21+)
3. Ensure port 8080 is free
4. Check database file permissions

---

**Time to fully functional system: 5 minutes**  
**Time to understand and present: Read other docs**

Good luck with your presentation! 🎯
