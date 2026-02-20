package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
)

// Concurrency test to simulate race condition
func main() {
	fmt.Println("🧪 Starting Concurrency Test for Overbooking Prevention")
	fmt.Println("=" + string(make([]byte, 60)))

	// First, create a test event with limited capacity
	eventID := createTestEvent()
	if eventID == 0 {
		fmt.Println("❌ Failed to create test event")
		return
	}

	fmt.Printf("✅ Created test event with ID: %d (Capacity: 5 seats)\n\n", eventID)

	// Wait for server to be ready
	time.Sleep(1 * time.Second)

	// Simulate 10 concurrent users trying to book 1 seat each
	// Only 5 should succeed (capacity = 5)
	numUsers := 10
	var wg sync.WaitGroup
	results := make(chan bool, numUsers)

	fmt.Printf("🚀 Simulating %d concurrent booking requests...\n\n", numUsers)

	startTime := time.Now()

	for i := 1; i <= numUsers; i++ {
		wg.Add(1)
		go func(userNum int) {
			defer wg.Done()
			success := attemptBooking(eventID, userNum)
			results <- success
		}(i)
	}

	wg.Wait()
	close(results)

	duration := time.Since(startTime)

	// Count successes and failures
	successCount := 0
	failureCount := 0

	for result := range results {
		if result {
			successCount++
		} else {
			failureCount++
		}
	}

	// Print results
	fmt.Println("\n" + string(make([]byte, 60)))
	fmt.Println("📊 CONCURRENCY TEST RESULTS")
	fmt.Println("=" + string(make([]byte, 60)))
	fmt.Printf("✅ Successful bookings: %d\n", successCount)
	fmt.Printf("❌ Failed bookings: %d\n", failureCount)
	fmt.Printf("⏱️  Total time: %v\n", duration)
	fmt.Println("=" + string(make([]byte, 60)))

	if successCount == 5 && failureCount == 5 {
		fmt.Println("✅ TEST PASSED: No overbooking occurred!")
		fmt.Println("   Mutex successfully prevented race conditions.")
	} else {
		fmt.Println("❌ TEST FAILED: Overbooking detected!")
		fmt.Printf("   Expected 5 successes, got %d\n", successCount)
	}
}

func createTestEvent() int {
	event := map[string]interface{}{
		"name":         "Concurrency Test Event",
		"description":  "Testing race condition prevention",
		"date":         "2024-12-31",
		"location":     "Test Venue",
		"capacity":     5,
		"price":        100.0,
		"organizer_id": 1,
	}

	jsonData, _ := json.Marshal(event)
	resp, err := http.Post("http://localhost:8080/events", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return 0
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	if data, ok := result["data"].(map[string]interface{}); ok {
		if id, ok := data["id"].(float64); ok {
			return int(id)
		}
	}

	return 0
}

func attemptBooking(eventID, userNum int) bool {
	booking := map[string]interface{}{
		"event_id":   eventID,
		"user_email": fmt.Sprintf("user%d@test.com", userNum),
		"user_name":  fmt.Sprintf("Test User %d", userNum),
		"quantity":   1,
	}

	jsonData, _ := json.Marshal(booking)
	resp, err := http.Post("http://localhost:8080/bookings", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Printf("❌ User %d: Request failed - %v\n", userNum, err)
		return false
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	success := result["success"].(bool)
	message := result["message"].(string)

	if success {
		fmt.Printf("✅ User %d: Booking confirmed\n", userNum)
	} else {
		fmt.Printf("❌ User %d: Booking failed - %s\n", userNum, message)
	}

	return success
}
