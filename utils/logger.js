// utils/chalkLogger.js
import chalk from 'chalk';
import util from 'util';

const isDev = process.env.NODE_ENV === 'development';

export const chalkLog = {
  // ... other methods (object, api, json, table, error, success, debug, log) remain the same ...

  // Structured object with type-based coloring and braces for objects
  structured: (obj, label = 'Structured Object') => {
    if (!isDev) return;

    console.log('\n' + chalk.magenta.bold(`📊 ${label}`));
    console.log(chalk.gray('═'.repeat(50)));

    const displayRecursive = (currentData, indentLevel) => {
      const currentSpaces = '  '.repeat(indentLevel);
      const dataType = typeof currentData;

      if (dataType === 'object') {
        if (currentData === null) {
          console.log(chalk.gray('null')); // Value is null
        } else if (Array.isArray(currentData)) {
          // Value is an Array.
          // The caller (Object.entries loop or Array.forEach loop) already printed "key: " or "[index]: "
          console.log(chalk.cyan(`[Array(${currentData.length})]`));
          currentData.forEach((item, idx) => {
            const itemIndentSpaces = '  '.repeat(indentLevel + 1);
            console.log(`${itemIndentSpaces}${chalk.dim(`[${idx}]`)}: `);
            displayRecursive(item, indentLevel + 1); // Display the array item
          });
        } else { // Value is a plain Object
          // The caller already printed "key: " or "[index]: "
          console.log(chalk.gray('{')); // Opening brace for this object's content
          Object.entries(currentData).forEach(([k, v_val]) => {
            const propIndentSpaces = '  '.repeat(indentLevel + 1);
            console.log(`${propIndentSpaces}${chalk.yellow.bold(k)}: `);
            displayRecursive(v_val, indentLevel + 1); // Display the property's value
          });
          console.log(`${currentSpaces}${chalk.gray('}')}`); // Closing brace, aligned with the level that opened it.
        }
      } else if (dataType === 'string') {
        console.log(chalk.green(`"${currentData}"`));
      } else if (dataType === 'number') {
        console.log(chalk.blue(currentData));
      } else if (dataType === 'boolean') {
        console.log(chalk.red(currentData));
      } else if (dataType === 'function') {
        console.log(chalk.yellow('[Function]'));
      } else { // undefined, symbol, bigint etc.
        console.log(util.inspect(currentData, {colors: true, compact:true}));
      }
    };

    // --- Initial handling for the root object/array/primitive passed to chalkLog.structured ---
    const rootDataType = typeof obj;
    if (rootDataType === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        // Root is an Array
        console.log(chalk.cyan(`[Array(${obj.length})]`)); // Display header for root array
        obj.forEach((item, index) => {
          const rootItemSpaces = '  '.repeat(1); // Indent root array items by 1 level
          console.log(`${rootItemSpaces}${chalk.dim(`[${index}]`)}: `);
          displayRecursive(item, 1); // `indentLevel` is 1 for items of the root array
        });
      } else {
        // Root is an Object. For the very top-level object,
        // we'll print its key-value pairs directly without an enclosing global brace for the `label` itself,
        // but its *values* that are objects will get braces.
        // If you want the entire output wrapped in a single { } pair tied to the label,
        // the initial call to displayRecursive would be for the object itself, inside a manually printed {}.
        // For consistency with how it was, let's list properties directly:
        Object.entries(obj).forEach(([key, value]) => {
          // Root keys have no preceding spaces from a parent object, effectively indentLevel 0 for the key itself.
          console.log(`${chalk.yellow.bold(key)}: `);
          // The `value` associated with this root key is at effective indentLevel 0 from its perspective.
          // `displayRecursive` will handle indenting its children if it's an object/array.
          displayRecursive(value, 0);
        });
      }
    } else {
      // Root is a primitive.
      displayRecursive(obj, 0); // Display the primitive itself
    }

    console.log(chalk.gray('═'.repeat(50)) + '\n'); // Footer
  },

  // Make sure the other methods are here from the previous response
  // Basic object logging with colors
  object: (obj, label = 'Object') => {
    if (!isDev) return;
    console.log('\n' + chalk.cyan.bold(`🔍 ${label}`));
    console.log(chalk.gray('─'.repeat(50)));
    const formatted = JSON.stringify(obj, null, 2);
    console.log(formatted);
    console.log(chalk.gray('─'.repeat(50)) + '\n');
  },
  // API request/response logging
  api: (method, url, data, response = null) => {
    if (!isDev) return;
    const methodColors = { GET: chalk.blue, POST: chalk.green, PUT: chalk.yellow, DELETE: chalk.red, PATCH: chalk.magenta };
    const methodColor = methodColors[method.toUpperCase()] || chalk.white;
    console.log('\n' + chalk.bgBlack.white.bold(` 🌐 API ${method.toUpperCase()} `));
    console.log(methodColor.bold(`URL: ${url}`));
    if (data) {
      console.log(chalk.cyan.bold('\n📤 Request Data:'));
      console.log(JSON.stringify(data, null, 2));
    }
    if (response) {
      console.log(chalk.green.bold('\n📥 Response Data:'));
      console.log(JSON.stringify(response, null, 2));
    }
    console.log(chalk.gray('─'.repeat(60)) + '\n');
  },
  // JSON with syntax highlighting
  json: (obj, label = 'JSON') => {
    if (!isDev) return;
    console.log('\n' + chalk.yellow.bold(`📄 ${label}`));
    console.log(chalk.gray('─'.repeat(30)));
    const jsonString = JSON.stringify(obj, null, 2);
    const highlighted = jsonString
      .replace(/"([^\"]+)":/g, chalk.cyan('"$1"') + ':')
      .replace(/: "([^\"]*)"/g, ': ' + chalk.green('"$1"'))
      .replace(/: (\d+(\.\d+)?)/g, ': ' + chalk.blue('$1'))
      .replace(/: (true|false)/g, ': ' + chalk.red('$1'))
      .replace(/: null/g, ': ' + chalk.gray('null'));
    console.log(highlighted);
    console.log(chalk.gray('─'.repeat(30)) + '\n');
  },
  // Table format with colors
  table: (data, label = 'Table') => {
    if (!isDev) return;
    console.log('\n' + chalk.blue.bold(`📋 ${label}`));
    console.log(chalk.gray('─'.repeat(40)));
    if (Array.isArray(data)) {
      console.table(data);
    } else if (typeof data === 'object' && data !== null) {
      const tableData = Object.entries(data).map(([key, value]) => ({
        Property: chalk.yellow(key),
        Value: typeof value === 'object' ? JSON.stringify(value) : value,
        Type: chalk.dim(typeof value)
      }));
      console.table(tableData);
    } else {
        console.log(chalk.yellow('Data is not an array or object, cannot display as table.'));
        chalkLog.object(data, label);
    }
    console.log(chalk.gray('─'.repeat(40)) + '\n');
  },
  // Error logging with stack trace
  error: (error, context = {}) => {
    console.log('\n' + chalk.bgRed.white.bold(' ❌ ERROR '));
    if (error instanceof Error) {
        console.log(chalk.red.bold(`Message: ${error.message}`));
        if (error.stack) {
          console.log(chalk.red('\nStack Trace:'));
          console.log(chalk.dim(error.stack));
        }
    } else {
        console.log(chalk.red.bold(`Error Data:`));
        console.log(JSON.stringify(error, null, 2));
    }
    if (Object.keys(context).length > 0) {
      console.log(chalk.yellow.bold('\nContext:'));
      console.log(JSON.stringify(context, null, 2));
    }
    console.log(chalk.gray('─'.repeat(60)) + '\n');
  },
  // Success logging
  success: (message, data = null) => {
    if (!isDev && !process.env.FORCE_LOG) return;
    console.log('\n' + chalk.bgGreen.black.bold(' ✅ SUCCESS '));
    console.log(chalk.green.bold(message));
    if (data !== null) {
      console.log(JSON.stringify(data, null, 2));
    }
    console.log('');
  },
  // Debug with timestamp
  debug: (obj, label = 'Debug') => {
    if (!isDev) return;
    const timestamp = new Date().toISOString();
    console.log('\n' + chalk.gray(`[${timestamp}]`) + ' ' + chalk.magenta.bold(`🐛 ${label}`));
    console.log(JSON.stringify(obj, null, 2));
    console.log('');
  },
  // Universal logger from previous step
  log: function(label, data) {
    if (data instanceof Error) {
      this.error(data, { contextFromAutoLog: label });
      return;
    }
    if (!isDev) {
      return;
    }
    if (typeof label === 'string' && label.toLowerCase().includes('success')) {
      if (typeof data === 'string') {
        this.success(data);
      } else {
        this.success(label, data);
      }
      return;
    }
    if (data === null || data === undefined) {
      this.object(data, label);
      return;
    }
    if (Array.isArray(data)) {
      this.structured(data, label); // Using the updated structured logger
      return;
    }
    if (typeof data === 'object') {
      this.structured(data, label); // Using the updated structured logger
      return;
    }
    if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean' || typeof data === 'function') {
      this.object(data, label);
      return;
    }
    this.debug(data, label);
  }
};

// Example of how the updated `structured` log would look:
/*
chalkLog.structured({
  user: "john.doe",
  active: true,
  profile: {
    firstName: "John",
    lastName: "Doe",
    address: {
      street: "123 Main St",
      city: "Anytown",
      zip: "12345",
      coords: {
        lat: 34.0522,
        lon: -118.2437
      }
    },
    roles: ["user", "editor"],
    preferences: null
  },
  lastLogin: new Date()
});
*/