document.addEventListener('DOMContentLoaded', () => {
  // Theme handling
  const themeSwitch = document.getElementById('theme-switch');
  const htmlElement = document.documentElement;

  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme') || 'light';
  htmlElement.setAttribute('data-theme', savedTheme);
  themeSwitch.checked = savedTheme === 'dark';

  // Theme toggle functionality
  themeSwitch.addEventListener('change', () => {
    if (themeSwitch.checked) {
      htmlElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      if (cssEditor) {
        cssEditor.setOption('theme', 'dracula');
      }
    } else {
      htmlElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      if (cssEditor) {
        cssEditor.setOption('theme', 'default');
      }
    }
  });

  // Initialize CodeMirror
  const cssEditor = CodeMirror.fromTextArea(document.getElementById('css-code'), {
    mode: 'css',
    theme: savedTheme === 'dark' ? 'dracula' : 'default',
    lineNumbers: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    indentUnit: 2,
    tabSize: 2,
    lineWrapping: true,
    lint: false,
    gutters: ["CodeMirror-linenumbers"]
  });

  // Enhanced sample CSS code with various types of errors
  const sampleCSSCode = `/* CSS with various types of errors for demonstration */
body {
  font-family: Arial, sans-serif;
  background-color: #f0f0f0;
  color: #333
  padding: 20px;
  margin: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 20px
}

h1 {
  color: #2c3e50;
  font-size: 24pt;
  margin-bottom: 15px;
  text-align: center;
}

.button {
  display: inline-block;
  background-color: #3498db;
  colr: white;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.card {
  widdth: 300px;
  height: 200px;
  margin: 20 px;
  background-color: fff;
}

.button:hover {
  background-color: #2980b9
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }

  h1 {
    font-size: 20px;
  }
`;

  // DOM Elements
  const validateBtn = document.getElementById('validate-btn');
  const clearBtn = document.getElementById('clear-btn');
  const sampleBtn = document.getElementById('sample-btn');
  const resultsContainer = document.getElementById('results');
  const errorCount = document.getElementById('error-count');
  const warningCount = document.getElementById('warning-count');
  const realtimeToggle = document.getElementById('realtime-toggle');
  const lineErrorsContainer = document.getElementById('line-errors');

  // State variables
  let validationTimeout = null;
  let currentErrors = [];
  let currentWarnings = [];
  let isRealTimeValidation = true;

  // Event Listeners
  validateBtn.addEventListener('click', validateCSS);
  clearBtn.addEventListener('click', clearEditor);
  sampleBtn.addEventListener('click', loadSample);
  realtimeToggle.addEventListener('change', toggleRealTimeValidation);

  // Set up real-time validation
  cssEditor.on('change', () => {
    if (isRealTimeValidation) {
      // Clear previous timeout to prevent multiple validations
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }

      // Set a timeout to avoid validating on every keystroke
      validationTimeout = setTimeout(() => {
        validateCSS();
      }, 800); // Delay in milliseconds
    }

    // Clear line markers when code changes
    clearLineMarkers();
  });

  // Initialize with real-time validation
  realtimeToggle.checked = true;

  // Functions
  function toggleRealTimeValidation() {
    isRealTimeValidation = realtimeToggle.checked;

    if (isRealTimeValidation) {
      // Validate immediately when turning on real-time validation
      validateCSS();
    } else {
      // Clear line markers when turning off real-time validation
      clearLineMarkers();
    }
  }

  function validateCSS() {
    const cssCode = cssEditor.getValue();

    if (!cssCode.trim()) {
      showPlaceholder('<i class="fas fa-code fa-3x"></i><p>Please enter some CSS code to validate</p>');
      clearLineMarkers();
      return;
    }

    // Show loading state
    if (!isRealTimeValidation) {
      resultsContainer.innerHTML = '<div class="placeholder"><i class="fas fa-spinner fa-spin fa-3x"></i><p>Validating...</p></div>';
    }

    // Send the CSS code to the server for validation
    fetch('/api/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ cssCode })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Store current errors and warnings
        currentErrors = data.errors;
        currentWarnings = data.warnings;

        // Display results
        displayResults(currentErrors, currentWarnings);

        // Add line markers
        addLineMarkers(currentErrors, currentWarnings);
      } else {
        showPlaceholder(`<i class="fas fa-exclamation-circle fa-3x"></i><p>${data.message || 'An error occurred during validation'}</p>`);
        clearLineMarkers();
      }
    })
    .catch(error => {
      console.error('Error:', error);
      showPlaceholder('<i class="fas fa-exclamation-triangle fa-3x"></i><p>Failed to connect to the validation service</p>');
      clearLineMarkers();
    });
  }

  function displayResults(errors, warnings) {
    // Update counts with icons
    errorCount.innerHTML = `<i class="fas fa-times-circle"></i> ${errors.length} Error${errors.length !== 1 ? 's' : ''}`;
    warningCount.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${warnings.length} Warning${warnings.length !== 1 ? 's' : ''}`;

    // Clear previous results
    resultsContainer.innerHTML = '';

    if (errors.length === 0 && warnings.length === 0) {
      resultsContainer.innerHTML = `
        <div class="placeholder">
          <i class="fas fa-check-circle fa-3x" style="color: var(--success-color);"></i>
          <p>No errors or warnings found! Your CSS looks good.</p>
        </div>
      `;
      return;
    }

    // Display errors
    if (errors.length > 0) {
      const errorSection = document.createElement('div');
      errorSection.className = 'error-section';

      errors.forEach(error => {
        const errorItem = document.createElement('div');
        errorItem.className = 'error-item';

        let errorContent = `
          <div class="item-header">
            <span class="item-type">Error</span>
            ${error.line ? `<span class="item-line">Line ${error.line}</span>` : ''}
          </div>
          <div class="item-message">${error.message}</div>
          ${error.code ? `<div class="item-code">${escapeHTML(error.code)}</div>` : ''}
        `;

        // Add suggestion if available
        if (error.suggestion) {
          errorContent += `
            <div class="item-suggestion">
              <strong>Suggestion:</strong> ${typeof error.suggestion === 'string' ? error.suggestion : JSON.stringify(error.suggestion)}
              <button class="apply-suggestion" data-line="${error.line}" data-suggestion="${escapeHTML(typeof error.suggestion === 'string' ? error.suggestion : JSON.stringify(error.suggestion))}">
                <i class="fas fa-magic"></i> Apply Fix
              </button>
            </div>
          `;
        }

        errorItem.innerHTML = errorContent;

        // Add click event to jump to line
        if (error.line) {
          errorItem.addEventListener('click', () => {
            jumpToLine(error.line);
          });
        }

        // Add click event for apply suggestion button
        const applyBtn = errorItem.querySelector('.apply-suggestion');
        if (applyBtn) {
          applyBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering the parent click event
            applySuggestion(error);
          });
        }

        errorSection.appendChild(errorItem);
      });

      resultsContainer.appendChild(errorSection);
    }

    // Display warnings
    if (warnings.length > 0) {
      const warningSection = document.createElement('div');
      warningSection.className = 'warning-section';

      warnings.forEach(warning => {
        const warningItem = document.createElement('div');
        warningItem.className = 'warning-item';

        let warningContent = `
          <div class="item-header">
            <span class="item-type">Warning</span>
            ${warning.line ? `<span class="item-line">Line ${warning.line}</span>` : ''}
          </div>
          <div class="item-message">${warning.message}</div>
          ${warning.code ? `<div class="item-code">${escapeHTML(warning.code)}</div>` : ''}
        `;

        // Add suggestion if available
        if (warning.suggestion) {
          warningContent += `
            <div class="item-suggestion">
              <strong>Suggestion:</strong> ${typeof warning.suggestion === 'string' ? warning.suggestion : JSON.stringify(warning.suggestion)}
              <button class="apply-suggestion" data-line="${warning.line}" data-suggestion="${escapeHTML(typeof warning.suggestion === 'string' ? warning.suggestion : JSON.stringify(warning.suggestion))}">
                <i class="fas fa-magic"></i> Apply Fix
              </button>
            </div>
          `;
        }

        warningItem.innerHTML = warningContent;

        // Add click event to jump to line
        if (warning.line) {
          warningItem.addEventListener('click', () => {
            jumpToLine(warning.line);
          });
        }

        // Add click event for apply suggestion button
        const applyBtn = warningItem.querySelector('.apply-suggestion');
        if (applyBtn) {
          applyBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering the parent click event
            applySuggestion(warning);
          });
        }

        warningSection.appendChild(warningItem);
      });

      resultsContainer.appendChild(warningSection);
    }
  }

  function jumpToLine(line) {
    // Adjust for 0-based line numbers in CodeMirror
    const lineIndex = line - 1;

    // Set cursor to the line
    cssEditor.setCursor(lineIndex);

    // Scroll to the line
    cssEditor.scrollIntoView({line: lineIndex, ch: 0}, 200);

    // Highlight the line temporarily
    cssEditor.addLineClass(lineIndex, 'background', 'highlighted-line');

    // Remove highlight after a delay
    setTimeout(() => {
      cssEditor.removeLineClass(lineIndex, 'background', 'highlighted-line');
    }, 2000);

    // Focus the editor
    cssEditor.focus();
  }

  function applySuggestion(issue) {
    if (!issue.line || !issue.suggestion) return;

    const lineIndex = issue.line - 1;
    const lineContent = cssEditor.getLine(lineIndex);

    let newContent = '';

    // Handle different types of suggestions
    switch (issue.type) {
      case 'typo':
      case 'color-name':
      case 'color-format':
        // Replace the property or value with the suggested one
        newContent = lineContent.replace(issue.code.trim(), issue.code.trim().replace(
          issue.type === 'typo' ? issue.code.split(':')[0].trim() : issue.code.split(':')[1].trim().replace(';', ''),
          issue.suggestion
        ));
        break;

      case 'spacing':
        // Fix spacing issues
        newContent = lineContent.replace(/(\d+)\s+([a-z%]+)/g, '$1$2');
        break;

      case 'syntax':
        // Add missing semicolon
        newContent = lineContent + ';';
        break;

      default:
        // Default replacement if specific handling is not available
        if (typeof issue.suggestion === 'string') {
          newContent = lineContent.replace(issue.code.trim(), issue.suggestion);
        }
    }

    if (newContent && newContent !== lineContent) {
      // Replace the line content
      cssEditor.replaceRange(
        newContent,
        {line: lineIndex, ch: 0},
        {line: lineIndex, ch: lineContent.length}
      );

      // Validate again after applying the suggestion
      setTimeout(validateCSS, 500);
    }
  }

  function addLineMarkers(errors, warnings) {
    clearLineMarkers();

    // Add error markers
    errors.forEach(error => {
      if (error.line) {
        addMarker(error.line, 'error', error.message);
      }
    });

    // Add warning markers
    warnings.forEach(warning => {
      if (warning.line) {
        addMarker(warning.line, 'warning', warning.message);
      }
    });

    function addMarker(line, type, message) {
      const lineIndex = line - 1;
      const lineTop = cssEditor.heightAtLine(lineIndex, 'local');

      // Create marker element
      const marker = document.createElement('div');
      marker.className = `line-error-marker ${type}-marker`;
      marker.innerHTML = type === 'error' ? '!' : '?';
      marker.style.top = `${lineTop}px`;
      marker.title = message;

      // Add click event to jump to line
      marker.addEventListener('click', () => {
        jumpToLine(line);
      });

      // Add to container
      lineErrorsContainer.appendChild(marker);
    }
  }

  function clearLineMarkers() {
    lineErrorsContainer.innerHTML = '';
  }

  function clearEditor() {
    cssEditor.setValue('');
    showPlaceholder('<i class="fas fa-code fa-3x"></i><p>Start typing or paste your CSS code to see validation results</p>');
    clearLineMarkers();
    currentErrors = [];
    currentWarnings = [];
    errorCount.innerHTML = '<i class="fas fa-times-circle"></i> 0 Errors';
    warningCount.innerHTML = '<i class="fas fa-exclamation-triangle"></i> 0 Warnings';
  }

  function loadSample() {
    cssEditor.setValue(sampleCSSCode);

    if (isRealTimeValidation) {
      // Validation will happen automatically due to change event
    } else {
      showPlaceholder('<i class="fas fa-arrow-right fa-3x"></i><p>Click "Validate" to check the sample code</p>');
    }

    // Focus the editor and place cursor at the beginning
    setTimeout(() => {
      cssEditor.focus();
      cssEditor.setCursor(0, 0);
    }, 100);
  }

  function showPlaceholder(htmlContent) {
    resultsContainer.innerHTML = `<div class="placeholder">${htmlContent}</div>`;
    errorCount.innerHTML = '<i class="fas fa-times-circle"></i> 0 Errors';
    warningCount.innerHTML = '<i class="fas fa-exclamation-triangle"></i> 0 Warnings';
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Add CSS class for line highlighting
  cssEditor.addStyleSheet = (function() {
    const style = document.createElement('style');
    document.head.appendChild(style);
    return function(css) {
      style.innerHTML = css;
    };
  })();

  cssEditor.addStyleSheet(`
    .highlighted-line {
      background-color: rgba(255, 235, 59, 0.2);
      transition: background-color 1s;
    }
    .CodeMirror-selected {
      background-color: var(--editor-selection) !important;
    }
    .CodeMirror-cursor {
      border-left-color: var(--editor-cursor) !important;
    }
  `);

  // Initialize with placeholder
  showPlaceholder('<i class="fas fa-code fa-3x"></i><p>Start typing or paste your CSS code to see validation results</p>');
});
