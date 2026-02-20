# Installation Guide

## Prerequisites

### 1. Install Go (Golang)

**Windows:**
1. Download from: https://go.dev/dl/
2. Download `go1.21.x.windows-amd64.msi`
3. Run installer
4. Verify installation:
```cmd
go version
```

**Mac:**
```bash
brew install go
```

**Linux:**
```bash
wget https://go.dev/dl/go1.21.0.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.0.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin
```

### 2. Install Git

**Windows:**
- Download from: https://git-scm.com/download/win
- Run installer with default settings

**Mac:**
```bash
brew install git
```

**Linux:**
```bash
sudo apt-get install git  # Ubuntu/Debian
sudo yum install git      # CentOS/RHEL
```

Verify:
```bash
git --version
```

### 3. Create GitHub Account
- Go to https://github.com
- Sign up if you don't have an account
- Verify your email

## Project Setup

### Option 1: Start Fresh (Recommended)

1. **Create project directory**
```bash
mkdir event-ticketing-system
cd event-ticketing-system
```

2. **Copy all files from this workspace**
   - Copy all .go files
   - Copy all .md files
   - Copy go.mod
   - Copy .gitignore
   - Copy prompts/ folder

3. **Initialize Go module**
```bash
go mod download
```

4. **Verify setup**
```bash
go run main.go
```

### Option 2: Clone from GitHub (After Submission)

```bash
git clone https://github.com/[YOUR-USERNAME]/event-ticketing-system.git
cd event-ticketing-system
go mod download
go run main.go
```

## Dependency Installation

### Install SQLite Driver

The project uses `github.com/mattn/go-sqlite3` which is specified in `go.mod`.

**Automatic installation:**
```bash
go mod download
```

**Manual installation (if needed):**
```bash
go get github.com/mattn/go-sqlite3
```

### Verify Dependencies
```bash
go mod verify
go mod tidy
```

## Running the Application

### Start Server
```bash
go run main.go
```

Expected output:
```
✅ Database connected successfully
✅ Database migrations completed
🚀 Server starting on http://localhost:8080
```

### Run Concurrency Test
Open a new terminal:
```bash
go run test_concurrency.go
```

## Building Executable

### Build for Current Platform
```bash
go build -o event-api main.go
```

**Windows:**
```cmd
go build -o event-api.exe main.go
event-api.exe
```

**Mac/Linux:**
```bash
go build -o event-api main.go
./event-api
```

### Build for Different Platforms

**Windows from Mac/Linux:**
```bash
GOOS=windows GOARCH=amd64 go build -o event-api.exe main.go
```

**Linux from Windows:**
```cmd
set GOOS=linux
set GOARCH=amd64
go build -o event-api main.go
```

**Mac from Windows:**
```cmd
set GOOS=darwin
set GOARCH=amd64
go build -o event-api main.go
```

## Environment Setup

### Set Go Environment Variables (if needed)

**Windows:**
```cmd
setx GOPATH %USERPROFILE%\go
setx PATH "%PATH%;%USERPROFILE%\go\bin"
```

**Mac/Linux:**
Add to `~/.bashrc` or `~/.zshrc`:
```bash
export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin
```

## IDE Setup (Optional)

### Visual Studio Code
1. Install VS Code: https://code.visualstudio.com/
2. Install Go extension: `ms-vscode.go`
3. Open project folder
4. VS Code will prompt to install Go tools - click "Install All"

### GoLand (JetBrains)
1. Download: https://www.jetbrains.com/go/
2. Open project
3. GoLand will auto-detect Go SDK

### Vim/Neovim
Install vim-go:
```vim
Plug 'fatih/vim-go'
```

## Testing Tools

### Install curl (for API testing)

**Windows:**
- Included in Windows 10+ by default
- Or download from: https://curl.se/windows/

**Mac:**
- Pre-installed

**Linux:**
```bash
sudo apt-get install curl  # Ubuntu/Debian
```

### Alternative: Use Postman
1. Download: https://www.postman.com/downloads/
2. Import API collection (create from TESTING.md examples)

## Troubleshooting

### Issue: "go: command not found"

**Solution:**
- Verify Go is installed: Check installation steps above
- Add Go to PATH (see Environment Setup)
- Restart terminal/command prompt

### Issue: "gcc: command not found" (Windows)

SQLite driver requires CGO, which needs GCC on Windows.

**Solution:**
Install TDM-GCC:
1. Download: https://jmeubank.github.io/tdm-gcc/
2. Install with default settings
3. Restart terminal
4. Run: `go mod download`

**Alternative:** Use pre-built binary:
```bash
go build -tags "sqlite_omit_load_extension" main.go
```

### Issue: "cannot find package"

**Solution:**
```bash
go mod tidy
go mod download
go clean -modcache
go mod download
```

### Issue: "port 8080 already in use"

**Solution:**

**Windows:**
```cmd
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti:8080 | xargs kill -9
```

Or change port in main.go:
```go
port := ":8081"  // Change from 8080
```

### Issue: "database is locked"

**Solution:**
- Stop all running instances of the server
- Delete `events.db` file
- Restart server (will recreate database)

### Issue: Module errors after cloning

**Solution:**
```bash
go mod init event-ticketing-system
go mod tidy
go get github.com/mattn/go-sqlite3
```

## Verification Checklist

After installation, verify:

✅ Go version 1.21 or higher
```bash
go version
```

✅ Git installed
```bash
git --version
```

✅ Project dependencies downloaded
```bash
go mod verify
```

✅ Server starts successfully
```bash
go run main.go
```

✅ API responds
```bash
curl http://localhost:8080/events
```

✅ Concurrency test passes
```bash
go run test_concurrency.go
```

## System Requirements

### Minimum
- **OS**: Windows 10, macOS 10.15, Linux (any recent distro)
- **RAM**: 2 GB
- **Disk**: 500 MB free space
- **CPU**: Any modern processor

### Recommended
- **OS**: Windows 11, macOS 12+, Ubuntu 22.04+
- **RAM**: 4 GB
- **Disk**: 1 GB free space
- **CPU**: Multi-core processor

## Network Requirements

- **Port 8080**: Must be available for server
- **Internet**: Required for `go mod download`
- **Firewall**: Allow Go applications (if prompted)

## Database Setup

No manual database setup required! The application:
1. Creates `events.db` automatically on first run
2. Runs migrations to create tables
3. Sets up indexes

To reset database:
```bash
# Stop server
# Delete database file
rm events.db      # Mac/Linux
del events.db     # Windows
# Restart server
```

## Production Deployment

### Docker (Optional)

Create `Dockerfile`:
```dockerfile
FROM golang:1.21-alpine
WORKDIR /app
COPY . .
RUN go build -o event-api main.go
EXPOSE 8080
CMD ["./event-api"]
```

Build and run:
```bash
docker build -t event-api .
docker run -p 8080:8080 event-api
```

### Heroku (Optional)

```bash
heroku create event-ticketing-api
git push heroku main
```

### AWS EC2 (Optional)

1. Launch EC2 instance (Ubuntu)
2. SSH into instance
3. Install Go
4. Clone repository
5. Run application
6. Configure security group for port 8080

## Getting Help

### Official Resources
- Go Documentation: https://go.dev/doc/
- Go Forum: https://forum.golangbridge.org/
- Stack Overflow: https://stackoverflow.com/questions/tagged/go

### Project-Specific
- Check TESTING.md for testing issues
- Check QUICKSTART.md for quick setup
- Check README.md for general documentation

## Next Steps

After successful installation:

1. ✅ Read QUICKSTART.md for 5-minute setup
2. ✅ Read TESTING.md for comprehensive testing
3. ✅ Read PRESENTATION.md for presentation prep
4. ✅ Read VIVA_QUESTIONS.md for Q&A prep
5. ✅ Read GIT_COMMANDS.md for GitHub submission

---

**Installation Time**: 10-15 minutes  
**Difficulty**: Easy  
**Support**: Check troubleshooting section above

You're all set! 🚀
