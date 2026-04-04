// In-memory database (replace with MongoDB/SQLite for production)
const { v4: uuidv4 } = require('uuid');

const db = {
  users: [
    {
      id: 'user-demo-1',
      email: 'demo@skillforge.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'user',
      name: 'Alex Chen',
      bio: 'Passionate learner exploring the world of technology.',
      avatar: null,
      existingSkills: ['HTML', 'CSS'],
      createdAt: new Date().toISOString(),
      points: 150,
      level: 2,
      achievements: ['First Steps', 'Task Master']
    }
  ],
  admins: [
    {
      id: 'admin-1',
      email: 'admin@skillforge.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'admin',
      name: 'Admin User'
    }
  ],
  skillPaths: {},
  notifications: {},
  quizResults: {},
  resources: {}
};

const SKILL_TEMPLATES = {
  'JavaScript': {
    beginner: [
      { day: 1, title: 'JS Fundamentals', description: 'Variables, data types, and operators', points: 10, resources: ['MDN JS Basics', 'JS.info Introduction'] },
      { day: 2, title: 'Control Flow', description: 'if/else, loops, and switch statements', points: 10, resources: ['MDN Control Flow'] },
      { day: 3, title: 'Functions', description: 'Function declarations, expressions, and arrow functions', points: 15, resources: ['MDN Functions Guide'] },
      { day: 4, title: 'Arrays & Objects', description: 'Working with complex data structures', points: 15, resources: ['Array Methods Guide'] },
      { day: 5, title: 'DOM Manipulation', description: 'Selecting and modifying HTML elements', points: 20, resources: ['DOM Tutorial'] },
      { day: 6, title: 'Events', description: 'Event listeners and handling user interactions', points: 15, resources: ['Events MDN'] },
      { day: 7, title: 'Mini Project', description: 'Build a simple interactive webpage', points: 30, resources: ['Project Ideas'] }
    ],
    intermediate: [
      { day: 1, title: 'Async JavaScript', description: 'Promises, async/await, callbacks', points: 20, resources: ['Async JS Guide'] },
      { day: 2, title: 'ES6+ Features', description: 'Destructuring, spread, modules', points: 15, resources: ['ES6 Features'] },
      { day: 3, title: 'Fetch API & AJAX', description: 'Making HTTP requests', points: 20, resources: ['Fetch API MDN'] },
      { day: 4, title: 'Error Handling', description: 'try/catch, error types', points: 15, resources: ['Error Handling'] },
      { day: 5, title: 'OOP in JS', description: 'Classes, inheritance, prototypes', points: 20, resources: ['OOP Guide'] },
      { day: 6, title: 'LocalStorage & APIs', description: 'Browser storage and third-party APIs', points: 20, resources: ['Storage API'] },
      { day: 7, title: 'Build a Full App', description: 'Create a weather or todo app', points: 40, resources: ['App Tutorial'] }
    ],
    advanced: [
      { day: 1, title: 'Design Patterns', description: 'Singleton, Observer, Factory patterns', points: 25, resources: ['JS Design Patterns'] },
      { day: 2, title: 'Performance Optimization', description: 'Debouncing, memoization, lazy loading', points: 25, resources: ['Web Performance'] },
      { day: 3, title: 'Testing with Jest', description: 'Unit tests and test-driven development', points: 30, resources: ['Jest Docs'] },
      { day: 4, title: 'TypeScript Intro', description: 'Types, interfaces, generics', points: 30, resources: ['TypeScript Handbook'] },
      { day: 5, title: 'Node.js Basics', description: 'Server-side JS fundamentals', points: 25, resources: ['Node.js Guide'] },
      { day: 6, title: 'Build Tools', description: 'Webpack, Vite, npm scripts', points: 20, resources: ['Build Tools Guide'] },
      { day: 7, title: 'Capstone Project', description: 'Full-stack mini application', points: 50, resources: ['Full Stack Guide'] }
    ]
  },
  'Python': {
    beginner: [
      { day: 1, title: 'Python Basics', description: 'Syntax, variables, and data types', points: 10, resources: ['Python.org Tutorial'] },
      { day: 2, title: 'Control Structures', description: 'Loops and conditionals', points: 10, resources: ['Control Flow Guide'] },
      { day: 3, title: 'Functions & Modules', description: 'Defining and importing modules', points: 15, resources: ['Python Functions'] },
      { day: 4, title: 'Lists & Dictionaries', description: 'Core Python data structures', points: 15, resources: ['Data Structures'] },
      { day: 5, title: 'File I/O', description: 'Reading and writing files', points: 15, resources: ['File Handling'] },
      { day: 6, title: 'Error Handling', description: 'Exceptions and debugging', points: 15, resources: ['Exception Handling'] },
      { day: 7, title: 'Mini Project', description: 'Build a simple CLI tool', points: 30, resources: ['Python Projects'] }
    ],
    intermediate: [
      { day: 1, title: 'OOP in Python', description: 'Classes, inheritance, polymorphism', points: 20, resources: ['Python OOP'] },
      { day: 2, title: 'Decorators & Generators', description: 'Advanced Python features', points: 25, resources: ['Decorators Guide'] },
      { day: 3, title: 'Web Scraping', description: 'BeautifulSoup and requests', points: 20, resources: ['Scraping Guide'] },
      { day: 4, title: 'Data with Pandas', description: 'Data analysis fundamentals', points: 25, resources: ['Pandas Docs'] },
      { day: 5, title: 'APIs with Flask', description: 'Build simple REST APIs', points: 30, resources: ['Flask Tutorial'] },
      { day: 6, title: 'Testing', description: 'unittest and pytest', points: 20, resources: ['Python Testing'] },
      { day: 7, title: 'Build a REST API', description: 'Full CRUD application', points: 40, resources: ['API Project Guide'] }
    ],
    advanced: [
      { day: 1, title: 'Async Python', description: 'asyncio and concurrent programming', points: 30, resources: ['Asyncio Docs'] },
      { day: 2, title: 'Machine Learning Intro', description: 'scikit-learn basics', points: 35, resources: ['sklearn Guide'] },
      { day: 3, title: 'Data Visualization', description: 'matplotlib and seaborn', points: 25, resources: ['Visualization Guide'] },
      { day: 4, title: 'Django Framework', description: 'Full-featured web framework', points: 35, resources: ['Django Tutorial'] },
      { day: 5, title: 'Databases', description: 'SQLAlchemy and PostgreSQL', points: 30, resources: ['DB Guide'] },
      { day: 6, title: 'Docker & Deployment', description: 'Containerizing Python apps', points: 30, resources: ['Docker Guide'] },
      { day: 7, title: 'ML Project', description: 'Build a prediction model', points: 50, resources: ['ML Project'] }
    ]
  },
  'Cybersecurity': {
    beginner: [
      { day: 1, title: 'Security Fundamentals', description: 'CIA triad, threat landscape basics', points: 10, resources: ['CompTIA Security+'] },
      { day: 2, title: 'Networking Concepts', description: 'TCP/IP, DNS, HTTP basics', points: 10, resources: ['Networking Guide'] },
      { day: 3, title: 'IP Addressing', description: 'IPv4/IPv6, subnetting basics', points: 15, resources: ['IP Addressing Course'] },
      { day: 4, title: 'Common Threats', description: 'Malware, phishing, social engineering', points: 15, resources: ['Threat Guide'] },
      { day: 5, title: 'Password Security', description: 'Hashing, salting, best practices', points: 15, resources: ['Password Security'] },
      { day: 6, title: 'Basic Cryptography', description: 'Symmetric vs asymmetric encryption', points: 20, resources: ['Crypto Basics'] },
      { day: 7, title: 'Security Audit', description: 'Audit a simple web application', points: 30, resources: ['Audit Guide'] }
    ],
    intermediate: [
      { day: 1, title: 'Network Scanning', description: 'Nmap, port scanning techniques', points: 20, resources: ['Nmap Guide'] },
      { day: 2, title: 'Web Vulnerabilities', description: 'OWASP Top 10', points: 25, resources: ['OWASP Guide'] },
      { day: 3, title: 'Penetration Testing', description: 'Methodology and tools overview', points: 30, resources: ['PenTest Guide'] },
      { day: 4, title: 'Incident Response', description: 'Detection and containment steps', points: 25, resources: ['IR Guide'] },
      { day: 5, title: 'Log Analysis', description: 'SIEM and log monitoring', points: 25, resources: ['SIEM Tutorial'] },
      { day: 6, title: 'Firewall & IDS', description: 'Configuration and rules', points: 25, resources: ['Firewall Guide'] },
      { day: 7, title: 'CTF Challenge', description: 'Capture The Flag beginner challenge', points: 40, resources: ['CTF Guide'] }
    ],
    advanced: [
      { day: 1, title: 'Exploit Development', description: 'Buffer overflows, shellcode basics', points: 40, resources: ['Exploit Dev Guide'] },
      { day: 2, title: 'Malware Analysis', description: 'Static and dynamic analysis', points: 40, resources: ['Malware Guide'] },
      { day: 3, title: 'Red Team Ops', description: 'Advanced attack simulation', points: 35, resources: ['Red Team Guide'] },
      { day: 4, title: 'Cloud Security', description: 'AWS/Azure security architecture', points: 35, resources: ['Cloud Security'] },
      { day: 5, title: 'Zero Trust Architecture', description: 'Modern security models', points: 30, resources: ['ZTA Guide'] },
      { day: 6, title: 'Forensics', description: 'Digital forensics and evidence collection', points: 35, resources: ['Forensics Guide'] },
      { day: 7, title: 'Security Assessment', description: 'Full penetration test report', points: 50, resources: ['Assessment Guide'] }
    ]
  },
  'React': {
    beginner: [
      { day: 1, title: 'React Fundamentals', description: 'JSX, components, and props', points: 10, resources: ['React Docs'] },
      { day: 2, title: 'State & Events', description: 'useState hook and event handling', points: 15, resources: ['Hooks Guide'] },
      { day: 3, title: 'Component Lifecycle', description: 'useEffect and side effects', points: 15, resources: ['useEffect Guide'] },
      { day: 4, title: 'Lists & Forms', description: 'Rendering lists and form handling', points: 15, resources: ['Forms Guide'] },
      { day: 5, title: 'React Router', description: 'Navigation and routing basics', points: 20, resources: ['Router Docs'] },
      { day: 6, title: 'Styling in React', description: 'CSS Modules, Tailwind, styled-components', points: 15, resources: ['Styling Guide'] },
      { day: 7, title: 'Build a Todo App', description: 'Complete CRUD application', points: 30, resources: ['Todo Tutorial'] }
    ],
    intermediate: [
      { day: 1, title: 'Context API', description: 'Global state management', points: 20, resources: ['Context Docs'] },
      { day: 2, title: 'Custom Hooks', description: 'Creating reusable logic', points: 25, resources: ['Custom Hooks'] },
      { day: 3, title: 'Performance', description: 'useMemo, useCallback, React.memo', points: 25, resources: ['Perf Guide'] },
      { day: 4, title: 'Data Fetching', description: 'REST APIs and React Query', points: 25, resources: ['Data Fetching'] },
      { day: 5, title: 'Testing with RTL', description: 'React Testing Library', points: 30, resources: ['RTL Docs'] },
      { day: 6, title: 'Redux Toolkit', description: 'Advanced state management', points: 30, resources: ['Redux Docs'] },
      { day: 7, title: 'Build a Dashboard', description: 'Data-rich application', points: 40, resources: ['Dashboard Guide'] }
    ],
    advanced: [
      { day: 1, title: 'Next.js', description: 'SSR and SSG with Next.js', points: 35, resources: ['Next.js Docs'] },
      { day: 2, title: 'GraphQL & Apollo', description: 'Advanced data fetching', points: 35, resources: ['Apollo Docs'] },
      { day: 3, title: 'Microfrontends', description: 'Module federation architecture', points: 40, resources: ['MFE Guide'] },
      { day: 4, title: 'Animation', description: 'Framer Motion and complex animations', points: 30, resources: ['Framer Docs'] },
      { day: 5, title: 'Accessibility', description: 'ARIA, keyboard nav, screen readers', points: 30, resources: ['A11y Guide'] },
      { day: 6, title: 'CI/CD for React', description: 'GitHub Actions, Vercel deployment', points: 30, resources: ['DevOps Guide'] },
      { day: 7, title: 'SaaS App', description: 'Full production-ready application', points: 50, resources: ['SaaS Tutorial'] }
    ]
  }
};

const QUIZZES = {
  'JavaScript': [
    { id: 'q1', question: 'What is the output of typeof null in JavaScript?', options: ['null', 'object', 'undefined', 'string'], correct: 1, explanation: 'typeof null returns "object" — a well-known quirk of JavaScript.' },
    { id: 'q2', question: 'Which method adds an element to the end of an array?', options: ['push()', 'pop()', 'shift()', 'unshift()'], correct: 0, explanation: 'push() adds one or more elements to the end of an array.' },
    { id: 'q3', question: 'What does === check in JavaScript?', options: ['Value only', 'Type only', 'Both value and type', 'Neither'], correct: 2, explanation: '=== is the strict equality operator — checks both value AND type.' },
    { id: 'q4', question: 'What is a closure?', options: ['A loop structure', 'A function with access to outer scope', 'A class method', 'A module system'], correct: 1, explanation: 'A closure is a function that retains access to its outer scope variables.' },
    { id: 'q5', question: 'Which keyword declares a block-scoped variable?', options: ['var', 'let', 'function', 'global'], correct: 1, explanation: 'let declares block-scoped variables, unlike var which is function-scoped.' }
  ],
  'Python': [
    { id: 'q1', question: 'What is the correct way to start a comment in Python?', options: ['//', '#', '/*', '--'], correct: 1, explanation: 'Python uses # for single-line comments.' },
    { id: 'q2', question: 'Which data structure uses key-value pairs?', options: ['List', 'Tuple', 'Dictionary', 'Set'], correct: 2, explanation: 'Dictionaries (dicts) store data as key-value pairs.' },
    { id: 'q3', question: 'What does len() return?', options: ['Last element', 'Number of elements', 'First element', 'Data type'], correct: 1, explanation: 'len() returns the number of items in a sequence or collection.' },
    { id: 'q4', question: 'How do you define a function in Python?', options: ['function myFunc():', 'def myFunc():', 'func myFunc():', 'define myFunc():'], correct: 1, explanation: 'Python uses the def keyword to define functions.' },
    { id: 'q5', question: 'What does list comprehension do?', options: ['Sorts a list', 'Creates list from expression', 'Removes duplicates', 'Flattens nested lists'], correct: 1, explanation: 'List comprehensions provide a concise way to create lists based on a condition or expression.' }
  ],
  'Cybersecurity': [
    { id: 'q1', question: 'What does CIA stand for in security?', options: ['Central Intelligence Agency', 'Confidentiality, Integrity, Availability', 'Control, Identify, Authenticate', 'Cyber Intelligence Architecture'], correct: 1, explanation: 'The CIA triad — Confidentiality, Integrity, Availability — is the foundation of information security.' },
    { id: 'q2', question: 'What type of attack tricks users into revealing credentials?', options: ['DDoS', 'Phishing', 'SQL Injection', 'Brute Force'], correct: 1, explanation: 'Phishing attacks impersonate trusted entities to steal sensitive information.' },
    { id: 'q3', question: 'What is a firewall?', options: ['Virus scanner', 'Network traffic filter', 'Password manager', 'Encryption tool'], correct: 1, explanation: 'A firewall monitors and filters network traffic based on security rules.' },
    { id: 'q4', question: 'What does HTTPS use to secure communications?', options: ['FTP', 'SSH', 'TLS/SSL', 'HTTP/2'], correct: 2, explanation: 'HTTPS uses TLS (Transport Layer Security) to encrypt communications.' },
    { id: 'q5', question: 'What is a zero-day vulnerability?', options: ['A vulnerability with no fix available', 'A new type of virus', 'A failed login attempt', 'A backup system failure'], correct: 0, explanation: 'A zero-day is a vulnerability exploited before the vendor has released a patch.' }
  ],
  'React': [
    { id: 'q1', question: 'What is JSX?', options: ['A JavaScript library', 'Syntax extension for HTML in JS', 'A CSS preprocessor', 'A testing framework'], correct: 1, explanation: 'JSX is a syntax extension that lets you write HTML-like code inside JavaScript.' },
    { id: 'q2', question: 'What hook is used for side effects?', options: ['useState', 'useEffect', 'useContext', 'useRef'], correct: 1, explanation: 'useEffect handles side effects like data fetching and subscriptions.' },
    { id: 'q3', question: 'What does useState return?', options: ['A function', 'An array with state and setter', 'An object', 'A Promise'], correct: 1, explanation: 'useState returns an array: [currentState, setterFunction].' },
    { id: 'q4', question: 'What is the virtual DOM?', options: ['Real HTML DOM', 'In-memory representation of DOM', 'CSS rendering engine', 'JavaScript engine'], correct: 1, explanation: "React's virtual DOM is a lightweight copy used to optimize re-renders." },
    { id: 'q5', question: 'How do you pass data to child components?', options: ['Via state', 'Via props', 'Via context only', 'Via refs'], correct: 1, explanation: 'Props (properties) are used to pass data from parent to child components.' }
  ]
};

module.exports = { db, SKILL_TEMPLATES, QUIZZES, uuidv4 };
