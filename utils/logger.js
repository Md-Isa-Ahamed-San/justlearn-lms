// utils/chalkLogger.js
import chalk from 'chalk';

const isDev = process.env.NODE_ENV === 'development';

// Helper function to get type-specific color
const getTypeColor = (value) => {
  if (value === null) return chalk.gray;
  if (typeof value === 'string') return chalk.green;
  if (typeof value === 'number') return chalk.blue;
  if (typeof value === 'boolean') return chalk.red;
  if (typeof value === 'function') return chalk.yellow;
  return chalk.white;
};

// Helper function to format value with appropriate color
const formatValue = (value) => {
  if (value === null) return chalk.gray('null');
  if (value === undefined) return chalk.gray('undefined');
  if (typeof value === 'string') return chalk.green(`"${value}"`);
  if (typeof value === 'number') return chalk.blue(value);
  if (typeof value === 'boolean') return chalk.red(value);
  if (typeof value === 'function') return chalk.yellow('[Function]');
  return chalk.white(value);
};

// Recursive function to display nested objects/arrays
const displayNested = (data, indent = 0) => {
  const spaces = '  '.repeat(indent);
  
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      if (Array.isArray(item) || (item && typeof item === 'object')) {
        console.log(`${spaces}  ${chalk.red(`[${index}]:`)} `);
        displayNested(item, indent + 1);
      } else {
        console.log(`${spaces}  ${chalk.red(`[${index}]:`)} ${formatValue(item)}`);
      }
    });
  } else if (data && typeof data === 'object') {
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value) || (value && typeof value === 'object')) {
        console.log(`${spaces}  ${chalk.yellow(key)}:`);
        displayNested(value, indent + 1);
      } else {
        console.log(`${spaces}  ${chalk.yellow(key)}: ${formatValue(value)}`);
      }
    });
  }
};

// Helper to format complex values (objects/arrays) or simple values
const formatComplexValue = (value, indent = 0) => {
  // This function is no longer needed with the new approach
  return formatValue(value);
};

export const chalkLog = {
  // Simple object logging
  object: (obj, label = 'Object') => {
    if (!isDev) return;
    
    console.log(`\n${chalk.cyan.bold(`🔍 ${label}`)}`);
    console.log(chalk.gray('─'.repeat(50)));
    console.log(JSON.stringify(obj, null, 2));
    console.log(chalk.gray('─'.repeat(50)));
  },

  // Structured logging with colors and proper formatting
  structured: (obj, label = 'Data') => {
    if (!isDev) return;

    console.log(`\n${chalk.magenta.bold(`📊 ${label}`)}`);
    console.log(chalk.gray('═'.repeat(50)));
    
    if (Array.isArray(obj)) {
      console.log(chalk.cyan(`[Array(${obj.length})]`));
      obj.forEach((item, index) => {
        if (Array.isArray(item) || (item && typeof item === 'object')) {
          console.log(`  ${chalk.red(`[${index}]:`)} `);
          displayNested(item, 1);
        } else {
          console.log(`  ${chalk.red(`[${index}]:`)} ${formatValue(item)}`);
        }
      });
    } else if (obj && typeof obj === 'object') {
      console.log(chalk.yellow('{'));
      Object.entries(obj).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          console.log(chalk.yellow.bold(key) + ': ' + chalk.cyan(`[Array(${value.length})]`));
          displayNested(value, 1);
        } else if (value && typeof value === 'object') {
          console.log(chalk.yellow.bold(key) + ': ' + chalk.gray('{'));
          displayNested(value, 1);
          console.log(chalk.gray('}'));
        } else {
          console.log(chalk.yellow.bold(key) + ': ' + formatValue(value));
        }
      });
      console.log(chalk.yellow('}'));
    } else {
      console.log(formatValue(obj));
    }
    
    console.log(chalk.gray('═'.repeat(50)));
  },

  // API logging
  api: (method, url, data = null, response = null) => {
    if (!isDev) return;
    
    const methodColors = {
      GET: chalk.blue,
      POST: chalk.green,
      PUT: chalk.yellow,
      DELETE: chalk.red,
      PATCH: chalk.magenta
    };
    
    const methodColor = methodColors[method.toUpperCase()] || chalk.white;
    
    console.log(`\n${chalk.bgBlack.white.bold(` 🌐 API ${method.toUpperCase()} `)}`);
    console.log(methodColor.bold(`URL: ${url}`));
    
    if (data) {
      console.log(chalk.cyan.bold('\n📤 Request:'));
      console.log(JSON.stringify(data, null, 2));
    }
    
    if (response) {
      console.log(chalk.green.bold('\n📥 Response:'));
      console.log(JSON.stringify(response, null, 2));
    }
    
    console.log(chalk.gray('─'.repeat(60)));
  },

  // JSON with syntax highlighting
  json: (obj, label = 'JSON') => {
    if (!isDev) return;
    
    console.log(`\n${chalk.yellow.bold(`📄 ${label}`)}`);
    console.log(chalk.gray('─'.repeat(30)));
    
    const jsonString = JSON.stringify(obj, null, 2)
      .replace(/"([^"]+)":/g, chalk.cyan('"$1"') + ':')
      .replace(/: "([^"]*)"/g, ': ' + chalk.green('"$1"'))
      .replace(/: (\d+(?:\.\d+)?)/g, ': ' + chalk.blue('$1'))
      .replace(/: (true|false)/g, ': ' + chalk.red('$1'))
      .replace(/: null/g, ': ' + chalk.gray('null'));
    
    console.log(jsonString);
    console.log(chalk.gray('─'.repeat(30)));
  },

  // Table logging
  table: (data, label = 'Table') => {
    if (!isDev) return;
    
    console.log(`\n${chalk.blue.bold(`📋 ${label}`)}`);
    console.log(chalk.gray('─'.repeat(40)));
    
    if (Array.isArray(data)) {
      console.table(data);
    } else if (data && typeof data === 'object') {
      const tableData = Object.entries(data).map(([key, value]) => ({
        Property: key,
        Value: typeof value === 'object' ? JSON.stringify(value) : String(value),
        Type: typeof value
      }));
      console.table(tableData);
    } else {
      console.log(chalk.yellow('Data is not an object or array'));
      this.object(data, label);
    }
    
    console.log(chalk.gray('─'.repeat(40)));
  },

  // Error logging
  error: (error, context = {}) => {
    console.log(`\n${chalk.bgRed.white.bold(' ❌ ERROR ')}`);
    
    if (error instanceof Error) {
      console.log(chalk.red.bold(`Message: ${error.message}`));
      if (error.stack) {
        console.log(chalk.red('\nStack Trace:'));
        console.log(chalk.dim(error.stack));
      }
    } else {
      console.log(chalk.red.bold('Error Data:'));
      console.log(JSON.stringify(error, null, 2));
    }
    
    if (Object.keys(context).length > 0) {
      console.log(chalk.yellow.bold('\nContext:'));
      console.log(JSON.stringify(context, null, 2));
    }
    
    console.log(chalk.gray('─'.repeat(60)));
  },

  // Success logging
  success: (message, data = null) => {
    if (!isDev && !process.env.FORCE_LOG) return;
    
    console.log(`\n${chalk.bgGreen.black.bold(' ✅ SUCCESS ')}`);
    console.log(chalk.green.bold(message));
    
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
    console.log('');
  },

  // Debug logging
  debug: (data, label = 'Debug') => {
    if (!isDev) return;
    
    const timestamp = new Date().toISOString();
    console.log(`\n${chalk.gray(`[${timestamp}]`)} ${chalk.magenta.bold(`🐛 ${label}`)}`);
    console.log(JSON.stringify(data, null, 2));
    console.log('');
  },

  // Universal logger - auto-detects type and uses appropriate method
  log: function(label, data) {
    if (!isDev) return;

    // Handle error objects
    if (data instanceof Error) {
      this.error(data, { context: label });
      return;
    }

    // Handle success messages
    if (typeof label === 'string' && label.toLowerCase().includes('success')) {
      this.success(typeof data === 'string' ? data : label, typeof data === 'string' ? null : data);
      return;
    }

    // Handle complex data structures
    if (Array.isArray(data) || (data && typeof data === 'object')) {
      this.structured(data, label);
      return;
    }

    // Handle primitives
    this.object(data, label);
  }
};

// Usage examples:
/*
// Basic object logging
chalkLog.object({ name: 'John', age: 30 }, 'User Data');

// Structured logging with nested objects
chalkLog.structured({
  user: 'john.doe',
  active: true,
  profile: {
    name: 'John Doe',
    roles: ['user', 'admin'],
    settings: { theme: 'dark', notifications: true }
  }
}, 'User Profile');

// API logging
chalkLog.api('POST', '/api/users', { name: 'John' }, { id: 1, name: 'John' });

// Auto-detection
chalkLog.log('Homepage Data', courses); // Will use structured logging for arrays/objects
chalkLog.log('Simple Message', 'Hello World'); // Will use object logging for primitives
*/