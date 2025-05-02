/**
 * CSS Validator Utility
 *
 * This module provides functions to validate CSS code and detect common errors.
 * Enhanced to detect typos, spacing issues, and other complex errors.
 */

// Common CSS properties for validation
const validCSSProperties = [
  'color', 'background', 'background-color', 'font-size', 'font-family', 'font-weight',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'border', 'border-top', 'border-right', 'border-bottom', 'border-left',
  'width', 'height', 'max-width', 'max-height', 'min-width', 'min-height',
  'display', 'position', 'top', 'right', 'bottom', 'left',
  'float', 'clear', 'z-index', 'overflow', 'visibility',
  'text-align', 'text-decoration', 'text-transform', 'line-height',
  'flex', 'flex-direction', 'justify-content', 'align-items', 'flex-wrap',
  'grid', 'grid-template-columns', 'grid-template-rows', 'grid-gap',
  'transition', 'animation', 'opacity', 'cursor', 'content',
  'box-sizing', 'border-radius', 'box-shadow', 'text-shadow', 'transform',
  'transform-origin', 'filter', 'backdrop-filter', 'object-fit', 'object-position',
  'list-style', 'list-style-type', 'list-style-position', 'list-style-image',
  'border-collapse', 'border-spacing', 'table-layout', 'caption-side',
  'outline', 'outline-width', 'outline-style', 'outline-color', 'outline-offset',
  'text-overflow', 'white-space', 'word-break', 'word-wrap', 'overflow-wrap',
  'column-count', 'column-gap', 'column-rule', 'column-width', 'columns',
  'gap', 'row-gap', 'column-gap', 'place-items', 'place-content', 'place-self',
  'align-content', 'justify-items', 'justify-self', 'align-self',
  'grid-template-areas', 'grid-area', 'grid-row', 'grid-column',
  'font-style', 'font-variant', 'letter-spacing', 'word-spacing',
  'text-indent', 'vertical-align', 'user-select', 'pointer-events',
  'resize', 'scroll-behavior', 'scroll-snap-type', 'scroll-snap-align',
  'transition-property', 'transition-duration', 'transition-timing-function', 'transition-delay',
  'animation-name', 'animation-duration', 'animation-timing-function', 'animation-delay',
  'animation-iteration-count', 'animation-direction', 'animation-fill-mode', 'animation-play-state'
];

// Common CSS units for validation
const validCSSUnits = [
  'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax', 'ch', 'ex',
  'cm', 'mm', 'in', 'pt', 'pc', 'fr', 's', 'ms', 'deg', 'rad', 'grad', 'turn'
];

// Named colors for validation
const namedColors = [
  'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black',
  'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse',
  'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan',
  'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey', 'darkkhaki', 'darkmagenta', 'darkolivegreen',
  'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray',
  'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey',
  'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite',
  'gold', 'goldenrod', 'gray', 'green', 'greenyellow', 'grey', 'honeydew', 'hotpink', 'indianred',
  'indigo', 'ivory', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue',
  'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey', 'lightpink',
  'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue',
  'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine', 'mediumblue',
  'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise',
  'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace',
  'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise',
  'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'purple', 'rebeccapurple',
  'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna',
  'silver', 'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen', 'steelblue', 'tan',
  'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen',
  'transparent', 'currentcolor'
];

/**
 * Validates CSS code and returns errors and warnings
 * @param {string} cssCode - The CSS code to validate
 * @returns {Object} Object containing arrays of errors and warnings
 */
function validateCSS(cssCode) {
  const errors = [];
  const warnings = [];

  // Split the CSS code into lines for line-by-line analysis
  const lines = cssCode.split('\n');

  // Track braces for matching
  let openBraces = 0;
  let closeBraces = 0;

  // Track if we're inside a rule block
  let insideRuleBlock = false;

  // Track current selector for error reporting
  let currentSelector = '';

  // Process each line
  lines.forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 1;
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (trimmedLine === '' || trimmedLine.startsWith('/*') || trimmedLine.startsWith('*/') || trimmedLine.startsWith('//')) {
      return;
    }

    // Check for missing semicolons in declarations
    if (insideRuleBlock &&
        !trimmedLine.endsWith('{') &&
        !trimmedLine.endsWith('}') &&
        !trimmedLine.endsWith(';') &&
        !trimmedLine.includes('/*') &&
        trimmedLine.includes(':')) {
      errors.push({
        line: lineNumber,
        message: 'Missing semicolon at the end of declaration',
        code: trimmedLine,
        type: 'syntax'
      });
    }

    // Count braces
    if (trimmedLine.includes('{')) {
      openBraces += (trimmedLine.match(/{/g) || []).length;

      // If this line contains a selector
      if (!insideRuleBlock) {
        currentSelector = trimmedLine.split('{')[0].trim();
        insideRuleBlock = true;
      }
    }

    if (trimmedLine.includes('}')) {
      closeBraces += (trimmedLine.match(/}/g) || []).length;

      // If we're closing a rule block
      if (openBraces === closeBraces) {
        insideRuleBlock = false;
      }
    }

    // Check for property-value pairs inside rule blocks
    if (insideRuleBlock && trimmedLine.includes(':')) {
      const colonIndex = trimmedLine.indexOf(':');
      const property = trimmedLine.substring(0, colonIndex).trim();
      let value = trimmedLine.substring(colonIndex + 1).trim();

      // Remove semicolon and comments from value if present
      if (value.endsWith(';')) {
        value = value.slice(0, -1).trim();
      }

      // Check for typos in property names using Levenshtein distance
      if (!validCSSProperties.includes(property) && !property.startsWith('--')) {
        // Find closest property match
        const closestMatch = findClosestMatch(property, validCSSProperties);

        if (closestMatch && closestMatch.distance <= 2) {
          errors.push({
            line: lineNumber,
            message: `Possible typo in property name: '${property}'. Did you mean '${closestMatch.word}'?`,
            code: trimmedLine,
            type: 'typo',
            suggestion: closestMatch.word
          });
        } else {
          warnings.push({
            line: lineNumber,
            message: `Unknown CSS property: '${property}'`,
            code: trimmedLine,
            type: 'unknown-property'
          });
        }
      }

      // Check for empty values
      if (value === '') {
        errors.push({
          line: lineNumber,
          message: `Empty value for property '${property}'`,
          code: trimmedLine,
          type: 'empty-value'
        });
      }

      // Check for spacing issues in values with units (e.g., "20 px" instead of "20px")
      const spacedUnitMatch = value.match(/(\d+)\s+([a-z%]+)/);
      if (spacedUnitMatch && validCSSUnits.includes(spacedUnitMatch[2])) {
        errors.push({
          line: lineNumber,
          message: `Invalid spacing in value: '${value}'. Remove space between number and unit.`,
          code: trimmedLine,
          type: 'spacing',
          suggestion: value.replace(/(\d+)\s+([a-z%]+)/, '$1$2')
        });
      }

      // Check for invalid units
      const unitMatches = value.match(/\d+([a-z%]+)/g);
      if (unitMatches) {
        unitMatches.forEach(match => {
          const unit = match.replace(/\d+/, '');
          if (!validCSSUnits.includes(unit)) {
            // Find closest unit match
            const closestMatch = findClosestMatch(unit, validCSSUnits);

            if (closestMatch && closestMatch.distance <= 1) {
              errors.push({
                line: lineNumber,
                message: `Invalid CSS unit: '${unit}'. Did you mean '${closestMatch.word}'?`,
                code: trimmedLine,
                type: 'invalid-unit',
                suggestion: value.replace(unit, closestMatch.word)
              });
            } else {
              warnings.push({
                line: lineNumber,
                message: `Potentially invalid CSS unit: '${unit}'`,
                code: trimmedLine,
                type: 'unknown-unit'
              });
            }
          }
        });
      }

      // Check for potentially invalid color values
      if (property.includes('color') && !value.startsWith('#') &&
          !value.startsWith('rgb') && !value.startsWith('hsl') &&
          !value.startsWith('var') &&
          !['inherit', 'initial', 'unset', 'revert', 'revert-layer'].includes(value)) {

        // Check if it's a named color
        if (!namedColors.includes(value.toLowerCase())) {
          // Check for hex color without # (e.g., "fff" instead of "#fff")
          if (/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) {
            errors.push({
              line: lineNumber,
              message: `Missing '#' prefix for hex color: '${value}'`,
              code: trimmedLine,
              type: 'color-format',
              suggestion: `#${value}`
            });
          } else {
            // Find closest color name match
            const closestMatch = findClosestMatch(value.toLowerCase(), namedColors);

            if (closestMatch && closestMatch.distance <= 2) {
              errors.push({
                line: lineNumber,
                message: `Invalid color name: '${value}'. Did you mean '${closestMatch.word}'?`,
                code: trimmedLine,
                type: 'color-name',
                suggestion: closestMatch.word
              });
            } else {
              warnings.push({
                line: lineNumber,
                message: `Potentially invalid color value: '${value}'`,
                code: trimmedLine,
                type: 'unknown-color'
              });
            }
          }
        }
      }

      // Check for missing values in shorthand properties
      if (['margin', 'padding', 'border-radius'].includes(property) &&
          value.split(' ').length === 3) {
        warnings.push({
          line: lineNumber,
          message: `Possible incomplete shorthand value for '${property}'. Shorthand properties typically use 1, 2, or 4 values.`,
          code: trimmedLine,
          type: 'shorthand'
        });
      }

      // Check for invalid !important usage
      if (value.includes('!important')) {
        const importantParts = value.split('!');
        if (importantParts.length > 1 && importantParts[1].trim() !== 'important') {
          errors.push({
            line: lineNumber,
            message: `Invalid !important syntax: '${value}'`,
            code: trimmedLine,
            type: 'important-syntax',
            suggestion: `${importantParts[0].trim()} !important`
          });
        }
      }
    }
  });

  // Check for mismatched braces
  if (openBraces !== closeBraces) {
    errors.push({
      line: null,
      message: `Mismatched braces: ${openBraces} opening braces and ${closeBraces} closing braces`,
      code: null,
      type: 'braces'
    });
  }

  return { errors, warnings };
}

/**
 * Calculates Levenshtein distance between two strings
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} - The edit distance between the strings
 */
function levenshteinDistance(a, b) {
  const matrix = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Finds the closest matching word from a list
 * @param {string} word - The word to match
 * @param {string[]} wordList - List of words to match against
 * @returns {Object|null} - The closest match and its distance, or null if no match
 */
function findClosestMatch(word, wordList) {
  let closestMatch = null;
  let minDistance = Infinity;

  for (const candidate of wordList) {
    const distance = levenshteinDistance(word, candidate);

    if (distance < minDistance) {
      minDistance = distance;
      closestMatch = candidate;
    }
  }

  return closestMatch ? { word: closestMatch, distance: minDistance } : null;
}

module.exports = {
  validateCSS
};
