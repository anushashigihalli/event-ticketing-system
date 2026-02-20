# AI Assistance Transparency Log

**Project:** Event Registration & Ticketing System API
**Student:** Anusha Umesh Shigihalli

---

## How I Used AI

During this project, I used AI assistance at a few specific points where I needed clarification or a second opinion. I had already spent time understanding the problem, planning the structure, and attempting things on my own before turning to AI. I treated it the way I'd treat asking a quick question to a peer or looking something up in documentation — helpful in the moment, but not a replacement for doing the actual work.

---

## Prompts Used

**Prompt 1 — Concurrency Clarification**

> "In Go, when multiple goroutines try to update the same database row simultaneously, what's the right way to use sync.Mutex to prevent race conditions? Can you show a short example?"

**Why I asked this:** I understood the concept of mutexes from the sessions, but wanted to make sure I was applying the lock/unlock pattern correctly in the context of a booking system before writing my own implementation.

**What I took from it:** The general pattern. I then wrote my own booking logic around it.

---

**Prompt 2 — SQLite Schema Review**

> "Does this SQLite schema look reasonable for an event ticketing system? I have tables for users, events, and registrations. Anything obviously wrong?"

**Why I asked this:** I had already drafted the schema myself and just wanted a second opinion before building on top of it.

**What I took from it:** Minor feedback on adding a `created_at` timestamp column, which I incorporated.

---

**Prompt 3 — API Workflow Clarity**

> "I'm building an event registration API. Can you help me think through the request flow for the booking endpoint — like what checks should happen in what order before confirming a registration?"

**Why I asked this:** I had a rough idea of the flow but wanted to make sure I wasn't missing any logical steps, like checking capacity before inserting a registration record. I wasn't sure whether to handle this in the handler itself or abstract it into a separate service function.

**What I took from it:** A clearer mental model of the order of operations — validate input → check event exists → check remaining capacity → lock → insert → unlock → return response. I used this as a reference while writing the code myself.

---

**Prompt 4 — README Phrasing**

> "Can you help me phrase the 'Concurrency Strategy' section of my README more clearly? Here's what I wrote: [my draft]"

**Why I asked this:** English documentation is harder for me than the code itself. I had the content ready, I just needed help expressing it more clearly.

**What I took from it:** Improved wording and sentence flow, but the technical content and ideas were entirely my own.

---

## Ethical Considerations

AI was used the way one might use documentation, a textbook, or a quick Google search — to fill in gaps and move forward, not to replace thinking. I made sure I understood whatever AI explained before applying it, and I didn't use anything I couldn't explain myself.

The overall architecture, technology choices, API design, and concurrency approach all came from my own planning and understanding built during the Go sessions.

---

## What I Learned

Building this project gave me a much more concrete understanding of how race conditions can occur in real systems. Implementing mutex locking around the booking logic made that click in a way that theory alone didn't. I also got more comfortable working with Go's `net/http` library — routing, writing handlers, and encoding JSON responses without relying on any external framework.

---

**Prepared by:** Anusha Umesh Shigihalli
**Date:** February 21, 2026
