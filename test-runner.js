// ABOUTME: Node.js test runner for Chrome extension using JSDOM for headless testing
// ABOUTME: Runs the same tests as the browser version but in a CI/CD environment

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Configuration constants
const TEST_CONFIG = {
  mockUrl: 'https://raw.githubusercontent.com/user/repo/main/file.js',
  contentScriptPath: 'content.js',
  resultsFileName: 'test-results.json'
};

class TestRunner {
  constructor() {
    this.results = [];
    this.stats = { passed: 0, failed: 0 };
  }

  setupEnvironment() {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: TEST_CONFIG.mockUrl,
      pretendToBeVisual: true,
      resources: 'usable'
    });

    global.window = dom.window;
    global.document = dom.window.document;
    global.console = console;
  }

  loadContentScript() {
    const contentScript = fs.readFileSync(path.join(__dirname, TEST_CONFIG.contentScriptPath), 'utf8');
    
    // Execute in global context to make functions available
    const vm = require('vm');
    const context = {
      window: global.window,
      document: global.document,
      console: global.console
    };
    
    vm.createContext(context);
    vm.runInContext(contentScript, context);
    
    // Copy only the functions we need to global scope
    global.parseRawGitHubUrl = context.parseRawGitHubUrl;
    global.getButtonStyles = context.getButtonStyles;
    global.applyStylesToButton = context.applyStylesToButton;
    global.createButton = context.createButton;
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(`Test failed: ${message}`);
    }
  }

  assertEquals(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      const expectedStr = JSON.stringify(expected);
      const actualStr = JSON.stringify(actual);
      throw new Error(`Test failed: ${message}. Expected: ${expectedStr}, Actual: ${actualStr}`);
    }
  }

  runTest(testName, testFunction) {
    try {
      testFunction();
      console.log(`✓ ${testName}`);
      this.results.push({ name: testName, status: 'passed', error: null });
      this.stats.passed++;
    } catch (error) {
      console.error(`✗ ${testName}: ${error.message}`);
      this.results.push({ name: testName, status: 'failed', error: error.message });
      this.stats.failed++;
    }
  }

  runAllTests() {
    console.log('Running content.js tests in Node.js environment...\n');
    
    this.runParseRawGitHubUrlTests();
    this.runButtonStylesTests();
    this.runButtonCreationTests();
  }

  runParseRawGitHubUrlTests() {
    const testCases = [
      {
        name: 'parseRawGitHubUrl - valid URL',
        url: 'https://raw.githubusercontent.com/user/repo/main/path/to/file.js',
        expected: {
          user: 'user',
          repo: 'repo',
          branch: 'main',
          filePath: 'path/to/file.js',
          githubUrl: 'https://github.com/user/repo/blob/main/path/to/file.js'
        },
        description: 'Should parse valid raw GitHub URL correctly'
      },
      {
        name: 'parseRawGitHubUrl - nested path',
        url: 'https://raw.githubusercontent.com/octocat/Hello-World/master/src/components/Button.tsx',
        expected: {
          user: 'octocat',
          repo: 'Hello-World',
          branch: 'master',
          filePath: 'src/components/Button.tsx',
          githubUrl: 'https://github.com/octocat/Hello-World/blob/master/src/components/Button.tsx'
        },
        description: 'Should handle nested file paths correctly'
      },
      {
        name: 'parseRawGitHubUrl - invalid URL',
        url: 'https://github.com/user/repo/blob/main/file.js',
        expected: null,
        description: 'Should return null for non-raw GitHub URLs'
      },
      {
        name: 'parseRawGitHubUrl - malformed URL',
        url: 'https://raw.githubusercontent.com/user',
        expected: null,
        description: 'Should return null for malformed URLs'
      },
      {
        name: 'parseRawGitHubUrl - empty string',
        url: '',
        expected: null,
        description: 'Should return null for empty string'
      },
      {
        name: 'parseRawGitHubUrl - branch with special characters',
        url: 'https://raw.githubusercontent.com/user/repo/feature/add-new-functionality/file.js',
        expected: {
          user: 'user',
          repo: 'repo',
          branch: 'feature',
          filePath: 'add-new-functionality/file.js',
          githubUrl: 'https://github.com/user/repo/blob/feature/add-new-functionality/file.js'
        },
        description: 'Should parse URL with branch and nested path correctly'
      }
    ];

    testCases.forEach(({ name, url, expected, description }) => {
      this.runTest(name, () => {
        const result = parseRawGitHubUrl(url);
        this.assertEquals(result, expected, description);
      });
    });
  }

  runButtonStylesTests() {
    this.runTest('getButtonStyles - returns correct styles object', () => {

      const styles = getButtonStyles();
      
      const expectedProperties = {
        position: 'fixed',
        backgroundColor: '#24292f', 
        color: 'white',
        zIndex: '9999',
        top: '10px',
        right: '10px'
      };

      Object.entries(expectedProperties).forEach(([property, expectedValue]) => {
        this.assert(styles[property] === expectedValue, 
          `Should set ${property} to ${expectedValue}`);
      });
    });

    this.runTest('applyStylesToButton - applies styles to button', () => {
      const mockButton = { style: {} };
      const testStyles = { color: 'red', fontSize: '16px', padding: '10px' };
      
      applyStylesToButton(mockButton, testStyles);
      
      Object.entries(testStyles).forEach(([property, expectedValue]) => {
        this.assertEquals(mockButton.style[property], expectedValue, 
          `Should apply ${property} style`);
      });
    });
  }

  runButtonCreationTests() {
    this.runTest('createButton - creates button with default config', () => {
      const button = createButton();
      
      this.assertEquals(button.id, 'unraw-button', 'Should set default id');
      this.assertEquals(button.textContent, 'View on GitHub', 'Should set default text');
      this.assert(button.tagName.toLowerCase() === 'button', 'Should create button element');
    });

    this.runTest('createButton - creates button with custom config', () => {
      const config = {
        id: 'custom-button',
        text: 'Custom Text',
        styles: { color: 'blue', fontSize: '18px' }
      };
      
      const button = createButton(config);
      
      this.assertEquals(button.id, 'custom-button', 'Should use custom id');
      this.assertEquals(button.textContent, 'Custom Text', 'Should use custom text');
      this.assertEquals(button.style.color, 'blue', 'Should apply custom styles');
    });
  }

  printSummary() {
    const { passed, failed } = this.stats;
    const total = passed + failed;
    
    console.log(`\n--- Test Results ---`);
    console.log(`Total tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
  }

  saveResults() {
    const { passed, failed } = this.stats;
    const results = {
      summary: {
        total: passed + failed,
        passed,
        failed,
        success: failed === 0
      },
      tests: this.results,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(TEST_CONFIG.resultsFileName, JSON.stringify(results, null, 2));
  }

  run() {
    this.setupEnvironment();
    this.loadContentScript();
    this.runAllTests();
    this.printSummary();
    this.saveResults();
    
    process.exit(this.stats.failed > 0 ? 1 : 0);
  }
}

// Run the tests
const testRunner = new TestRunner();
testRunner.run();
