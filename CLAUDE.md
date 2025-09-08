# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome extension called "unraw" that provides a button to convert raw GitHub URLs to standard GitHub URLs. When viewing files on `raw.githubusercontent.com`, the extension adds a "View on GitHub" button that navigates to the corresponding file on `github.com/user/repo/blob/branch/path`.

## Architecture

- **manifest.json**: Chrome extension manifest (v3) defining permissions, content scripts, and popup
- **content.js**: Content script that runs on `raw.githubusercontent.com` pages, creates and positions the "View on GitHub" button
- **popup.html**: Extension popup shown when clicking the extension icon in the toolbar
- **Icons**: Standard Chrome extension icons (16x16, 48x48, 128x128)

## Key Implementation Details

The extension uses a regex pattern to parse raw GitHub URLs:
```
/https:\/\/raw.githubusercontent.com\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.*)/
```

This extracts: user, repository, branch, and file path, then constructs the standard GitHub URL format:
```
https://github.com/{user}/{repo}/blob/{branch}/{filePath}
```

## Development Notes

- No build process or dependencies - pure HTML/CSS/JavaScript
- Extension only requires `activeTab` and `scripting` permissions
- Content script automatically injects on matching URLs
- Button styling matches GitHub's dark theme

## Testing

The code has been refactored to be testable with separated concerns:

### Testable Functions
- `parseRawGitHubUrl(rawUrl)`: Pure function that parses raw GitHub URLs and returns structured data
- `getButtonStyles()`: Returns default button styling configuration
- `createButton(config)`: Creates a button element with configurable properties
- `applyStylesToButton(button, styles)`: Applies CSS styles to a button element

### Running Tests
- Open `test-runner.html` in a browser to run the test suite
- Tests use a simple assertion framework without external dependencies
- `content.test.js` contains comprehensive unit tests for all pure functions

### Test Coverage
- URL parsing with various valid and invalid inputs
- Button creation with default and custom configurations
- Style application and configuration

## CI/CD

### GitHub Actions Workflow
The project includes automated testing via GitHub Actions (`.github/workflows/test.yml`):

- Runs on push to `main`/`develop` branches and pull requests to `main`
- Uses Node.js 20 with JSDOM for headless browser testing
- Installs dependencies with `npm install --no-package-lock`
- Generates test results JSON artifact with 7-day retention

### Commands
- `npm test`: Run tests in headless environment (for CI/CD)
- `npm install`: Install dependencies (jsdom for testing)

### Local Testing
- Browser: Open `test-runner.html` in browser for interactive testing
- Command line: Run `npm test` for headless testing (requires `npm install` first)
