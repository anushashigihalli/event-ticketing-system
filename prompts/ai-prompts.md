# AI Assistance Transparency Log

This document records all AI prompts used during the development of this project, as required by the Infosys Capstone Project guidelines.

## Project Information
- **Project**: Event Registration & Ticketing System API
- **Student**: Anusha Umesh Shigihalli

---

## Prompt 1: Initial Project Setup


**Prompt**:
```
I have received an academic email from my professor stating the following:

We have completed foundational Go (Golang) sessions. Infosys has now shared capstone 
project problem statements. Each student must choose one problem statement and complete 
the project individually using Go.

Timeline:
- Project duration: 1 full day
- Submission deadline: Tomorrow before 12:00 PM
- Submission: GitHub repository name must be shared
- Must include:
  - Complete source code
  - README.md explaining design and implementation
  - Markdown design document (if separate)
  - All AI prompts used (for transparency)

Evaluation:
- 15 minutes total
- 7-minute presentation
- Q&A
- Based on performance, selected students may work on DPI project with Infosys 
  and EGov Foundation.

I have chosen:
Capstone Project 5: Event Registration & Ticketing System API

Objective:
Build a REST API for event registration similar to Eventbrite.
Users can browse events and register.
Organizers create events with limited capacity.
Critical challenge: Prevent overbooking when multiple users try to book the 
last seats simultaneously.

I want you to generate a COMPLETE end-to-end implementation plan and code structure using:
- Backend: Golang (net/http standard library)
- Database: SQLite (file-based, free, easy to use)
- Concurrency handling: sync.Mutex
- Testing: Postman/curl
- Project must be realistic but achievable in 1 day.

Please generate:
1. System Architecture explanation
2. Folder structure (professional and clean)
3. Database schema (SQLite tables)
4. Complete working example code
5. Example curl commands to test APIs
6. Concurrency simulation example
7. README.md full content (professional level)
8. Separate design.md explaining concurrency strategy
9. prompts/ai-prompts.md content
10. Git commands to push to GitHub
11. 7-minute presentation script outline
12. Possible viva questions and strong answers
13. Future improvements section

Important constraints:
- Keep implementation realistic for 1-day timeline
- Do NOT overcomplicate
- Avoid external frameworks like Gin unless absolutely necessary
- Use clean Go code and best practices
- Focus heavily on explaining concurrency and mutex usage
- Code must compile

Output everything clearly section-wise.
Make it ready for direct implementation.
```

**AI Response Summary**:
The AI provided a complete project structure including:
- main.go with full REST API implementation
- Database schema and migrations
- Concurrency-safe booking logic using sync.Mutex
- Test files for concurrency simulation
- Complete documentation (README.md, design.md)
- Testing commands and deployment instructions

---

## Prompt 2: [If you used additional prompts, add them here]



**Prompt**:
```
[Your prompt here]
```

**AI Response Summary**:
[Summary of what the AI provided]

---

## Prompt 3: [Additional prompts as needed]

---

## Ethical Considerations

### How AI Was Used
1. **Project Structure**: AI helped design the folder structure and file organization
2. **Code Generation**: AI generated boilerplate code and implementation patterns
3. **Documentation**: AI assisted in writing comprehensive documentation
4. **Best Practices**: AI suggested Go best practices and concurrency patterns

### What I Learned
1. **Concurrency Control**: Understanding mutex locks and race condition prevention
2. **Database Transactions**: ACID properties and transaction management
3. **REST API Design**: RESTful principles and HTTP status codes
4. **Go Programming**: Standard library usage, error handling, JSON encoding

### My Contributions
1. **Problem Selection**: Chose the Event Ticketing System project
2. **Technology Decisions**: Selected Go, SQLite, and sync.Mutex approach
3. **Testing**: Will manually test all endpoints and concurrency scenarios
4. **Customization**: Will adapt code based on testing results
5. **Presentation**: Will create and deliver the presentation independently

### Academic Integrity Statement

I acknowledge that:
- AI was used as a learning and development tool
- I understand all code generated and can explain it
- I will test and validate all functionality
- I take full responsibility for the final submission
- This transparency log fulfills the requirement to disclose AI usage

---

## Reflection

### What Worked Well
- AI provided a solid foundation and structure
- Code follows Go best practices
- Concurrency strategy is well-explained
- Documentation is comprehensive

### What I Modified
[Add any modifications you make to the AI-generated code]

### What I Learned
[Add your learning outcomes after implementing and testing]

---

**Prepared By**: [Your Name]  
**Date**: [Current Date]  
**Signature**: ___________________

---

## Note to Evaluators

This document demonstrates transparency in AI usage as required by the project guidelines. 
All AI-generated content has been reviewed, understood, and will be tested by the student. 
The student takes full responsibility for the correctness and functionality of the 
submitted code.
