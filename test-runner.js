// ABOUTME: Node.js test runner for Chrome extension using JSDOM for headless testing
// ABOUTME: Runs the same tests as the browser version but in a CI/CD environment

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Setup JSDOM environment with custom URL
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'https://raw.githubusercontent.com/user/repo/main/file.js',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.console = console;

// Note: JSDOM automatically sets window.location based on the URL option above
// We can access it directly as window.location.href

// Load the content script
const contentScript = fs.readFileSync(path.join(__dirname, 'content.js'), 'utf8');
eval(contentScript);

// Test framework
let testResults = [];
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Test failed: ${message}`);
  }
}

function assertEquals(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Test failed: ${message}. Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
  }
}

function runTest(testName, testFunction) {
  try {
    testFunction();
    console.log(`✓ ${testName}`);
    testResults.push({ name: testName, status: 'passed', error: null });
    passedTests++;
  } catch (error) {
    console.error(`✗ ${testName}: ${error.message}`);
    testResults.push({ name: testName, status: 'failed', error: error.message });
    failedTests++;
  }
}

// Run all tests
console.log('Running content.js tests in Node.js environment...\n');

// Tests for parseRawGitHubUrl function
runTest('parseRawGitHubUrl - valid URL', () => {
  const testUrl = 'https://raw.githubusercontent.com/user/repo/main/path/to/file.js';
  const result = parseRawGitHubUrl(testUrl);
  
  assertEquals(result, {
    user: 'user',
    repo: 'repo',
    branch: 'main',
    filePath: 'path/to/file.js',
    githubUrl: 'https://github.com/user/repo/blob/main/path/to/file.js'
  }, 'Should parse valid raw GitHub URL correctly');
});

runTest('parseRawGitHubUrl - nested path', () => {
  const testUrl = 'https://raw.githubusercontent.com/octocat/Hello-World/master/src/components/Button.tsx';
  const result = parseRawGitHubUrl(testUrl);
  
  assertEquals(result, {
    user: 'octocat',
    repo: 'Hello-World',
    branch: 'master',
    filePath: 'src/components/Button.tsx',
    githubUrl: 'https://github.com/octocat/Hello-World/blob/master/src/components/Button.tsx'
  }, 'Should handle nested file paths correctly');
});

runTest('parseRawGitHubUrl - invalid URL', () => {
  const testUrl = 'https://github.com/user/repo/blob/main/file.js';
  const result = parseRawGitHubUrl(testUrl);
  
  assertEquals(result, null, 'Should return null for non-raw GitHub URLs');
});

runTest('parseRawGitHubUrl - malformed URL', () => {
  const testUrl = 'https://raw.githubusercontent.com/user';
  const result = parseRawGitHubUrl(testUrl);
  
  assertEquals(result, null, 'Should return null for malformed URLs');
});

runTest('parseRawGitHubUrl - empty string', () => {
  const result = parseRawGitHubUrl('');
  assertEquals(result, null, 'Should return null for empty string');
});

runTest('parseRawGitHubUrl - branch with special characters', () => {
  const testUrl = 'https://raw.githubusercontent.com/user/repo/feature/add-new-functionality/file.js';
  const result = parseRawGitHubUrl(testUrl);
  
  assertEquals(result, {
    user: 'user',
    repo: 'repo',
    branch: 'feature',
    filePath: 'add-new-functionality/file.js',
    githubUrl: 'https://github.com/user/repo/blob/feature/add-new-functionality/file.js'
  }, 'Should parse URL with branch and nested path correctly');
});

// Tests for getButtonStyles function
runTest('getButtonStyles - returns correct styles object', () => {
  const styles = getButtonStyles();
  
  assert(styles.position === 'fixed', 'Should set position to fixed');
  assert(styles.backgroundColor === '#24292f', 'Should set correct background color');
  assert(styles.color === 'white', 'Should set text color to white');
  assert(styles.zIndex === '9999', 'Should set high z-index');
  assert(styles.top === '10px', 'Should set top position');
  assert(styles.right === '10px', 'Should set right position');
});

// Tests for applyStylesToButton function
runTest('applyStylesToButton - applies styles to button', () => {
  const mockButton = { style: {} };
  const testStyles = {
    color: 'red',
    fontSize: '16px',
    padding: '10px'
  };
  
  applyStylesToButton(mockButton, testStyles);
  
  assertEquals(mockButton.style.color, 'red', 'Should apply color style');
  assertEquals(mockButton.style.fontSize, '16px', 'Should apply fontSize style');
  assertEquals(mockButton.style.padding, '10px', 'Should apply padding style');
});

// Tests for createButton function
runTest('createButton - creates button with default config', () => {
  const button = createButton();
  
  assertEquals(button.id, 'unraw-button', 'Should set default id');
  assertEquals(button.textContent, 'View on GitHub', 'Should set default text');
  assert(button.tagName.toLowerCase() === 'button', 'Should create button element');
});

runTest('createButton - creates button with custom config', () => {
  const config = {
    id: 'custom-button',
    text: 'Custom Text',
    styles: { color: 'blue', fontSize: '18px' }
  };
  
  const button = createButton(config);
  
  assertEquals(button.id, 'custom-button', 'Should use custom id');
  assertEquals(button.textContent, 'Custom Text', 'Should use custom text');
  assertEquals(button.style.color, 'blue', 'Should apply custom styles');
});

// Summary
console.log(`\n--- Test Results ---`);
console.log(`Total tests: ${passedTests + failedTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);

// Write results to JSON file for GitHub Actions
const results = {
  summary: {
    total: passedTests + failedTests,
    passed: passedTests,
    failed: failedTests,
    success: failedTests === 0
  },
  tests: testResults,
  timestamp: new Date().toISOString()
};

fs.writeFileSync('test-results.json', JSON.stringify(results, null, 2));

// Exit with appropriate code
process.exit(failedTests > 0 ? 1 : 0);