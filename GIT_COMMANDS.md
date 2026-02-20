# Git Commands for Project Submission

## Initial Setup

### Step 1: Initialize Git Repository
```bash
# Navigate to your project directory
cd event-ticketing-system

# Initialize git repository
git init

# Check git status
git status
```

### Step 2: Create .gitignore
```bash
# Create .gitignore file
echo events.db > .gitignore
echo *.exe >> .gitignore
echo *.log >> .gitignore
```

This prevents committing:
- Database file (events.db) - will be regenerated
- Compiled binaries (.exe)
- Log files

### Step 3: Add All Files
```bash
# Add all files to staging
git add .

# Verify what will be committed
git status
```

### Step 4: Create Initial Commit
```bash
# Commit with descriptive message
git commit -m "Initial commit: Event Registration & Ticketing System API

- Implemented REST API with Go standard library
- Added SQLite database with migrations
- Implemented concurrency-safe booking with sync.Mutex
- Added comprehensive testing and documentation
- Included concurrency simulation test
- Created presentation and viva materials"
```

## GitHub Setup

### Step 5: Create GitHub Repository

**Option A: Via GitHub Website**
1. Go to https://github.com
2. Click "New repository" (+ icon, top right)
3. Repository name: `event-ticketing-system`
4. Description: `Event Registration & Ticketing System API - Infosys Capstone Project`
5. Keep it Public (for submission)
6. DO NOT initialize with README (we already have one)
7. Click "Create repository"

**Option B: Via GitHub CLI (if installed)**
```bash
gh repo create event-ticketing-system --public --source=. --remote=origin
```

### Step 6: Connect Local to GitHub
```bash
# Add GitHub repository as remote
git remote add origin https://github.com/[YOUR-USERNAME]/event-ticketing-system.git

# Verify remote is added
git remote -v
```

Replace `[YOUR-USERNAME]` with your actual GitHub username.

### Step 7: Push to GitHub
```bash
# Push to main branch
git push -u origin main
```

If you get an error about "master" vs "main":
```bash
# Rename branch to main
git branch -M main

# Push again
git push -u origin main
```

### Step 8: Verify Upload
1. Go to https://github.com/[YOUR-USERNAME]/event-ticketing-system
2. Verify all files are present
3. Check README.md displays correctly

## Making Updates

### If You Make Changes Later
```bash
# Check what changed
git status

# Add specific files
git add main.go
git add README.md

# Or add all changes
git add .

# Commit with message
git commit -m "Fix: Updated booking validation logic"

# Push to GitHub
git push
```

## Common Git Commands

### Check Status
```bash
git status
```

### View Commit History
```bash
git log
git log --oneline
```

### View Changes
```bash
# See unstaged changes
git diff

# See staged changes
git diff --staged
```

### Undo Changes
```bash
# Discard changes in working directory
git checkout -- filename

# Unstage file
git reset HEAD filename

# Undo last commit (keep changes)
git reset --soft HEAD~1
```

### Create Branch (for experiments)
```bash
# Create and switch to new branch
git checkout -b feature-name

# Switch back to main
git checkout main

# Merge branch
git merge feature-name
```

## Submission Checklist

Before submitting, verify:

✅ All files committed and pushed
```bash
git status  # Should show "nothing to commit, working tree clean"
```

✅ GitHub repository is public
- Go to repository settings
- Ensure it's not private

✅ README.md displays correctly
- Check on GitHub web interface

✅ Repository URL is correct
- Format: `https://github.com/[YOUR-USERNAME]/event-ticketing-system`

✅ All required files present:
- [ ] main.go
- [ ] test_concurrency.go
- [ ] go.mod
- [ ] README.md
- [ ] design.md
- [ ] TESTING.md
- [ ] PRESENTATION.md
- [ ] VIVA_QUESTIONS.md
- [ ] prompts/ai-prompts.md

## Submission Format

**Email to Professor:**
```
Subject: Capstone Project Submission - [Your Name] - Event Ticketing System

Dear Professor,

I am submitting my Infosys Capstone Project: Event Registration & Ticketing System API.

GitHub Repository: https://github.com/[YOUR-USERNAME]/event-ticketing-system

Project Details:
- Language: Go (Golang)
- Database: SQLite
- Key Feature: Concurrency-safe booking with sync.Mutex
- All documentation and AI prompts included as required

The repository includes:
- Complete source code
- Comprehensive README.md
- Design document explaining concurrency strategy
- Testing guide and concurrency simulation
- Presentation script and viva preparation materials
- AI transparency log (prompts/ai-prompts.md)

I am ready for the presentation and Q&A session.

Thank you.

Best regards,
[Your Name]
[Roll Number]
[Email]
```

## Troubleshooting

### Issue: "Permission denied (publickey)"
**Solution:**
```bash
# Use HTTPS instead of SSH
git remote set-url origin https://github.com/[YOUR-USERNAME]/event-ticketing-system.git
```

### Issue: "Repository not found"
**Solution:**
- Verify repository exists on GitHub
- Check username spelling
- Ensure repository is public

### Issue: "Failed to push some refs"
**Solution:**
```bash
# Pull first, then push
git pull origin main --rebase
git push origin main
```

### Issue: "Large files"
**Solution:**
```bash
# Remove large files from tracking
git rm --cached events.db
echo events.db >> .gitignore
git commit -m "Remove database file"
git push
```

## Quick Reference

```bash
# Complete workflow in one go
git init
git add .
git commit -m "Initial commit: Event Ticketing System"
git remote add origin https://github.com/[YOUR-USERNAME]/event-ticketing-system.git
git branch -M main
git push -u origin main
```

## After Submission

### Keep Repository Updated
If you make improvements after submission:
```bash
git add .
git commit -m "Enhancement: Added feature X"
git push
```

### Add Topics/Tags on GitHub
1. Go to repository on GitHub
2. Click "Add topics"
3. Add: `golang`, `rest-api`, `sqlite`, `concurrency`, `capstone-project`

### Add Repository Description
1. Go to repository settings
2. Add description: "Event Registration & Ticketing System API with concurrency-safe booking - Infosys Capstone Project"

---

**Important Notes:**

1. **DO NOT** commit sensitive information (passwords, API keys)
2. **DO** commit all source code and documentation
3. **DO NOT** commit generated files (events.db, binaries)
4. **DO** write clear commit messages
5. **DO** verify everything is pushed before submission deadline

---

**Repository URL Format:**
```
https://github.com/[YOUR-USERNAME]/event-ticketing-system
```

Share this exact URL with your professor.

Good luck! 🚀
