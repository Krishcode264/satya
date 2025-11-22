/**
 * Attack Detection Module
 * Detects SQL Injection, XSS, Command Injection, and Directory Traversal
 */

const ATTACK_PATTERNS = {
  SQL_INJECTION: [
    /('|(\\'))\s*(OR|AND)\s*('|(\\'))\s*\d+\s*=\s*\d+/i,
    /('|(\\'))\s*(OR|AND)\s*('|(\\'))\s*('|(\\'))\s*=/i,
    /--\s*$/,
    /;\s*(DROP|DELETE|TRUNCATE|ALTER|CREATE)\s+(TABLE|DATABASE|INDEX)/i,
    /UNION\s+(ALL\s+)?SELECT/i,
    /SELECT\s+.*\s+FROM/i,
    /INSERT\s+INTO/i,
    /UPDATE\s+.*\s+SET/i,
    /DELETE\s+FROM/i,
    /EXEC\s*\(/i,
    /EXECUTE\s*\(/i,
    /sp_executesql/i,
    /xp_cmdshell/i,
    /';?\s*(DROP|DELETE|TRUNCATE)/i
  ],
  
  XSS_ATTACK: [
    /<script[^>]*>/i,
    /<img[^>]*onerror\s*=/i,
    /<svg[^>]*onload\s*=/i,
    /<iframe[^>]*>/i,
    /<object[^>]*>/i,
    /<embed[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=\s*["']/i,
    /<body[^>]*onload\s*=/i,
    /<input[^>]*onfocus\s*=/i,
    /<marquee[^>]*>/i,
    /<link[^>]*href\s*=\s*["']javascript:/i,
    /<style[^>]*>.*@import/i,
    /expression\s*\(/i
  ],
  
  COMMAND_INJECTION: [
    /;\s*(cat|rm|ls|pwd|whoami|id|uname|ps|kill|chmod|chown|wget|curl|nc|netcat)/i,
    /\|\s*(cat|rm|ls|pwd|whoami|id|uname|ps|kill)/i,
    /&&\s*(cat|rm|ls|pwd|whoami|id|uname|ps|kill)/i,
    /\|\|\s*(cat|rm|ls|pwd|whoami|id|uname|ps|kill)/i,
    /`[^`]*(cat|rm|ls|pwd|whoami|id|uname|ps|kill)[^`]*`/i,
    /\$\([^)]*(cat|rm|ls|pwd|whoami|id|uname|ps|kill)[^)]*\)/i,
    /<\|/,
    /cmd\s*\/c/i,
    /powershell/i,
    /bash\s+-c/i,
    /sh\s+-c/i
  ],
  
  DIR_TRAVERSAL: [
    /\.\.\/\.\.\//,
    /\.\.\\\.\.\\/,
    /\.\.\/\.\.\/\.\.\//,
    /\.\.\\\.\.\\\.\.\\/,
    /\.\.%2F/i,
    /\.\.%5C/i,
    /\.\.%252F/i,
    /\.\.%255C/i,
    /\.\.\//,
    /\.\.\\/
  ]
};

/**
 * Detect attack type and severity
 * @param {string} input - Raw user input
 * @returns {Object} { attackType, severity, matchedPattern }
 */
function detectAttack(input) {
  if (!input || typeof input !== 'string') {
    return { attackType: 'NORMAL', severity: 0, matchedPattern: null };
  }

  const inputUpper = input.toUpperCase();
  
  // Check SQL Injection
  for (const pattern of ATTACK_PATTERNS.SQL_INJECTION) {
    if (pattern.test(input)) {
      return {
        attackType: 'SQL_INJECTION',
        severity: 4,
        matchedPattern: pattern.toString()
      };
    }
  }

  // Check XSS
  for (const pattern of ATTACK_PATTERNS.XSS_ATTACK) {
    if (pattern.test(input)) {
      return {
        attackType: 'XSS_ATTACK',
        severity: 3,
        matchedPattern: pattern.toString()
      };
    }
  }

  // Check Command Injection
  for (const pattern of ATTACK_PATTERNS.COMMAND_INJECTION) {
    if (pattern.test(input)) {
      return {
        attackType: 'COMMAND_INJECTION',
        severity: 5,
        matchedPattern: pattern.toString()
      };
    }
  }

  // Check Directory Traversal
  for (const pattern of ATTACK_PATTERNS.DIR_TRAVERSAL) {
    if (pattern.test(input)) {
      return {
        attackType: 'DIR_TRAVERSAL',
        severity: 3,
        matchedPattern: pattern.toString()
      };
    }
  }

  // Check for suspicious patterns (lower severity)
  const suspiciousPatterns = [
    /<[^>]+>/,
    /['"]/,
    /[;&|`$()]/,
    /%[0-9a-f]{2}/i
  ];

  let suspiciousCount = 0;
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(input)) {
      suspiciousCount++;
    }
  }

  if (suspiciousCount >= 2) {
    return {
      attackType: 'UNKNOWN_SUSPICIOUS',
      severity: 1,
      matchedPattern: 'Multiple suspicious characters detected'
    };
  }

  return { attackType: 'NORMAL', severity: 0, matchedPattern: null };
}

/**
 * Generate deception response based on attack type
 * @param {string} attackType - Type of attack detected
 * @param {number} severity - Severity level (0-5)
 * @returns {Object} { message, delay }
 */
function generateDeceptionResponse(attackType, severity) {
  const responses = {
    SQL_INJECTION: [
      "DatabaseError: Deadlock detected in transaction. Retrying...",
      "SQLState 40001: Transaction aborted due to stale metadata.",
      "ConnectionError: Database connection pool exhausted. Please try again.",
      "QueryTimeout: Execution exceeded maximum allowed time (30s).",
      "SQLException: Invalid column name in WHERE clause."
    ],
    
    XSS_ATTACK: [
      "Script engine: Unexpected token '<' at line 1.",
      "ParserError: Malformed HTML detected. Sanitization failed.",
      "ContentSecurityPolicy: Refused to execute inline script.",
      "DOMException: Invalid character in identifier.",
      "ValidationError: Input contains prohibited script tags."
    ],
    
    COMMAND_INJECTION: [
      "ShellExecError: No TTY allocated for command execution.",
      "PermissionDenied: Insufficient privileges for shell operations.",
      "CommandBlocked: Restricted command detected by security policy.",
      "SystemError: Command interpreter not available in this context.",
      "ExecutionError: Command execution has been disabled for security reasons."
    ],
    
    DIR_TRAVERSAL: [
      "FilesystemWarning: Path sanitization blocked unsafe directory traversal.",
      "AccessDenied: Attempted path traversal detected and prevented.",
      "PathError: Invalid directory path format.",
      "SecurityError: Directory traversal attempt logged and blocked.",
      "ValidationError: Path contains prohibited sequence '..'."
    ],
    
    UNKNOWN_SUSPICIOUS: [
      "ValidationError: Input contains unexpected characters.",
      "ProcessingError: Unable to parse input format.",
      "FormatError: Input does not match expected pattern."
    ],
    
    NORMAL: [
      "Processing your request...",
      "Validating credentials...",
      "Checking database..."
    ]
  };

  const messages = responses[attackType] || responses.NORMAL;
  const message = messages[Math.floor(Math.random() * messages.length)];

  return {
    message,
    delay: severity >= 3
  };
}

module.exports = {
  detectAttack,
  generateDeceptionResponse
};

