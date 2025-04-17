// Directly reference the correct path
const path = require('path');

// Log the current directory and available files for debugging
console.log('Current directory:', process.cwd());
console.log('Files in dist directory:');
try {
  const fs = require('fs');
  if (fs.existsSync('./dist')) {
    console.log(fs.readdirSync('./dist'));
    if (fs.existsSync('./dist/core')) {
      console.log('Files in dist/core:', fs.readdirSync('./dist/core'));
    }
  } else {
    console.log('dist directory does not exist');
  }
} catch (error) {
  console.error('Error reading directory:', error);
}

// Try to require the file using an absolute path
try {
  require(path.join(process.cwd(), 'dist', 'core', 'index.js'));
} catch (error) {
  console.error('Failed to require main file:', error);
  
  // Fall back to trying other common patterns
  try {
    require('./dist/index.js');
  } catch (innerError) {
    console.error('Also failed with ./dist/index.js:', innerError);
    
    try {
      require('./dist/src/core/index.js');
    } catch (deeperError) {
      console.error('Also failed with ./dist/src/core/index.js:', deeperError);
    }
  }
}