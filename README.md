# 🦎 CHAMELEON - Adaptive Deception Honeypot

A sophisticated honeypot system designed to trap attackers, detect malicious inputs (SQLi, XSS, Command Injection, Directory Traversal), and respond with intelligent fake errors while logging everything in a real-time forensic dashboard secured with blockchain-style hash chaining for immutability.

## 🏗️ Architecture

The project consists of three main components:

1. **Frontend Trap** - A fake website that looks vulnerable and encourages attackers to input malicious payloads
2. **Backend Deception Engine** - Detects attacks and generates believable fake error responses
3. **Forensic Dashboard** - Real-time monitoring dashboard with hash chain verification

## 📁 Project Structure

```
chameleon-honeypot/
├── server/                 # Backend Deception Engine
│   ├── index.js           # Express server with WebSocket
│   ├── attackDetector.js  # Attack detection module
│   └── logManager.js      # Log manager with hash chaining
├── frontend-trap/         # Fake website (React)
│   └── src/
│       ├── App.js         # Main trap interface
│       └── ...
└── dashboard/              # Forensic Dashboard (React)
    └── src/
        ├── App.js         # Dashboard interface
        └── ...
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

   Or install manually:
   ```bash
   npm install
   cd server && npm install
   cd ../frontend-trap && npm install
   cd ../dashboard && npm install
   ```

### Running the Application

**Option 1: Run all services concurrently (recommended)**
```bash
npm run dev
```

**Option 2: Run services separately**

Terminal 1 - Backend:
```bash
npm run dev:backend
```

Terminal 2 - Frontend Trap:
```bash
npm run dev:frontend
```

Terminal 3 - Dashboard:
```bash
npm run dev:dashboard
```

### Access Points

- **Frontend Trap**: http://localhost:3000
- **Forensic Dashboard**: http://localhost:3002
- **Backend API**: http://localhost:3001

## 🎯 Features

### Frontend Trap
- ✅ Fake login and search forms
- ✅ Sends raw input to backend (no sanitization)
- ✅ Displays fake error messages from backend
- ✅ Never executes attacker scripts (safe rendering)
- ✅ Simulates delays for high-severity attacks

### Backend Deception Engine
- ✅ **Attack Detection**: SQL Injection, XSS, Command Injection, Directory Traversal
- ✅ **Deception Responses**: Context-aware fake errors
- ✅ **Hash Chaining**: Blockchain-style immutability
- ✅ **Real-time Updates**: WebSocket support for dashboard
- ✅ **Attack Logging**: Comprehensive logging with metadata

### Forensic Dashboard
- ✅ **Live Attack Feed**: Real-time table of all attacks
- ✅ **Statistics**: Attack counts, types, and metrics
- ✅ **Hash Chain Viewer**: Visual representation of immutable chain
- ✅ **Detailed Log View**: Click any attack for full details
- ✅ **WebSocket Integration**: Live updates without polling

## 🔍 Attack Detection

The system detects the following attack types:

### SQL Injection
- Pattern: `' OR '1'='1`, `--`, `UNION SELECT`, `DROP TABLE`, etc.
- Severity: 4/5
- Deception: Fake database errors

### XSS (Cross-Site Scripting)
- Pattern: `<script>`, `<img onerror=`, `<svg onload=`, etc.
- Severity: 3/5
- Deception: Fake JavaScript parsing errors

### Command Injection
- Pattern: `; cat`, `| ls`, `&& rm`, etc.
- Severity: 5/5
- Deception: Fake shell execution errors

### Directory Traversal
- Pattern: `../`, `..\\`, encoded variants
- Severity: 3/5
- Deception: Fake filesystem errors

## 🔐 Hash Chain (Blockchain-style Immutability)

Each attack log entry is cryptographically linked to the previous entry:

```
Hash = SHA256(entry_data + previous_hash)
```

This ensures:
- **Immutability**: Any modification breaks the chain
- **Integrity**: Chain can be verified at any time
- **Auditability**: Complete attack history is preserved

## 📊 Dashboard Features

### Live Attack Feed
- Real-time table showing all detected attacks
- Color-coded attack types
- Severity indicators
- Click to view full details

### Statistics Panel
- Total attacks count
- Breakdown by attack type
- High-risk attack count
- Average delay time

### Hash Chain Viewer
- Genesis hash (first entry)
- Latest hash (current state)
- Recent chain entries (last 5)
- Chain integrity explanation

### Log Details Modal
- Full payload display
- Attack classification
- Deception strategy used
- Hash chain information
- Complete metadata

## 🧪 Testing the System

Try these malicious inputs in the frontend trap:

**SQL Injection:**
```
admin' OR '1'='1
'; DROP TABLE users;--
UNION SELECT * FROM users
```

**XSS:**
```
<script>alert('XSS')</script>
<img src=x onerror=alert(1)>
<svg/onload=alert(1)>
```

**Command Injection:**
```
; cat /etc/passwd
| ls -la
&& rm -rf /
```

**Directory Traversal:**
```
../../../etc/passwd
..\\..\\..\\windows\\system32
```

Watch the dashboard update in real-time!

## 🛡️ Security Notes

- **This is a honeypot**: Designed to attract and trap attackers
- **Do not deploy in production** without proper security hardening
- **Frontend never executes** attacker input as code
- **All input is logged** for forensic analysis
- **Hash chain provides** tamper detection

## 📝 API Endpoints

### POST `/api/analyze`
Analyze user input and return deception response.

**Request:**
```json
{
  "userInput": "<script>alert(1)</script>",
  "page": "login",
  "field": "username"
}
```

**Response:**
```json
{
  "message": "Script engine: Unexpected token '<' at line 1.",
  "delay": true,
  "attackDetected": true
}
```

### GET `/api/logs`
Get all attack logs (last 100).

### GET `/api/stats`
Get attack statistics.

### GET `/api/hash-chain`
Get hash chain information.

### WebSocket `/ws`
Real-time updates for dashboard.

## 🎨 Technologies Used

- **Frontend**: React 18
- **Backend**: Node.js, Express
- **WebSocket**: ws, express-ws
- **Cryptography**: Node.js crypto (SHA256)
- **Styling**: CSS3 with modern design

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

This is a security research project. Contributions welcome!

## ⚠️ Disclaimer

This tool is for educational and authorized security testing purposes only. Unauthorized use against systems you don't own or have permission to test is illegal.

---

**Built with 🦎 by the CHAMELEON Team**

