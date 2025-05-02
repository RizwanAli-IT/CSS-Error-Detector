const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const cssValidator = require('./utils/cssValidator');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.post('/api/validate', (req, res) => {
  try {
    const { cssCode } = req.body;
    
    if (!cssCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'CSS code is required' 
      });
    }
    
    const validationResults = cssValidator.validateCSS(cssCode);
    
    return res.status(200).json({
      success: true,
      errors: validationResults.errors,
      warnings: validationResults.warnings
    });
  } catch (error) {
    console.error('Error validating CSS:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error while validating CSS' 
    });
  }
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
