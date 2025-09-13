#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// File extensions to check
const EXTENSIONS = ['.js', '.json', '.html', '.md', '.yml', '.yaml'];

// Directories to exclude
const EXCLUDE_DIRS = ['node_modules', '.git', '.claude'];

/**
 * Recursively find all files with specified extensions
 * @param {string} dir - Directory to search
 * @param {string[]} excludeDirs - Directories to exclude
 * @returns {string[]} - Array of file paths
 */
function findFiles(dir, excludeDirs = []) {
  const files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!excludeDirs.includes(item)) {
          files.push(...findFiles(fullPath, excludeDirs));
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (EXTENSIONS.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return files;
}

/**
 * Check if a file ends with a newline
 * @param {string} filePath - Path to the file
 * @returns {boolean} - True if file ends with newline, false otherwise
 */
function endsWithNewline(filePath) {
  try {
    const stats = fs.statSync(filePath);
    
    // Empty files are considered valid
    if (stats.size === 0) {
      return true;
    }
    
    const buffer = Buffer.alloc(1);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 1, stats.size - 1);
    fs.closeSync(fd);
    
    return buffer[0] === 10; // 10 is the ASCII code for newline (\n)
  } catch (error) {
    console.error(`Error checking file ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main function to check all files
 */
function main() {
  console.log('Checking files for proper newline endings...\n');
  
  const files = findFiles('.', EXCLUDE_DIRS);
  const violations = [];
  
  for (const file of files) {
    if (!endsWithNewline(file)) {
      violations.push(file);
    }
  }
  
  if (violations.length === 0) {
    console.log('✅ All files end with a newline!');
    process.exit(0);
  } else {
    console.log('❌ The following files do not end with a newline:');
    violations.forEach(file => console.log(`  - ${file}`));
    console.log(`\nFound ${violations.length} violation(s).`);
    console.log('\nTo fix these files, add a newline at the end of each file.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { findFiles, endsWithNewline };
