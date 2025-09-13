// Simple test framework
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
  } catch (error) {
    console.error(`✗ ${testName}: ${error.message}`);
  }
}

// Mock DOM environment for testing
function createMockElement() {
  return {
    style: {},
    id: '',
    textContent: '',
    tagName: 'BUTTON'
  };
}

function mockCreateElement(tagName) {
  if (tagName === 'button') {
    return createMockElement();
  }
  return createMockElement();
}

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
  const mockButton = createMockElement();
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
  const originalCreateElement = document.createElement;
  document.createElement = mockCreateElement;
  
  const button = createButton();
  
  assertEquals(button.id, 'unraw-button', 'Should set default id');
  assertEquals(button.textContent, 'View on GitHub', 'Should set default text');
  assert(button.tagName.toLowerCase() === 'button', 'Should create button element');
  
  document.createElement = originalCreateElement;
});

runTest('createButton - creates button with custom config', () => {
  const originalCreateElement = document.createElement;
  document.createElement = mockCreateElement;
  
  const config = {
    id: 'custom-button',
    text: 'Custom Text',
    styles: { color: 'blue', fontSize: '18px' }
  };
  
  const button = createButton(config);
  
  assertEquals(button.id, 'custom-button', 'Should use custom id');
  assertEquals(button.textContent, 'Custom Text', 'Should use custom text');
  assertEquals(button.style.color, 'blue', 'Should apply custom styles');
  
  document.createElement = originalCreateElement;
});

console.log('Running content.js tests in browser environment...');
