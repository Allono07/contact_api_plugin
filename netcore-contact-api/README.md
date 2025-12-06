# Netcore Contact API Chrome Extension

A modular Chrome extension for creating, generating cURL commands, and triggering Netcore Smarttech Contact API requests directly from your browser.

## Features

- 🌍 **Multi-Region Support**: US, India, and EU endpoints
- 🔑 **Secure API Key Handling**: Password field with toggle visibility
- 📝 **Dynamic Contact Attributes**: Add unlimited contact attributes with type validation
- 🔄 **Multiple Activities**: Add, Update, Delete, and Add Sync (Synchronous) operations
- 📋 **cURL Generation**: Generate ready-to-use cURL commands with one click
- 🚀 **Direct API Triggering**: Execute API calls directly from the extension
- 📋 **Copy to Clipboard**: Easy copying of generated cURL and API responses
- 💾 **Form State Persistence**: Automatically saves your form data to local storage
- 🎨 **Modern UI**: Clean and intuitive interface with proper validation

## Supported Data Types

- **String**: Enclosed in double quotes
- **Float**: Decimal numbers without quotes (e.g., 10.5)
- **Number**: Integer values without quotes (e.g., 123)
- **Date**: Format YYYY-MM-DD within double quotes (e.g., "2023-12-25")

## Project Structure

```
netcore-contact-api/
├── manifest.json                 # Chrome extension manifest
├── src/
│   ├── popup.html               # Main UI
│   ├── background.js            # Service worker for API requests
│   ├── js/
│   │   ├── popup.js             # Main popup logic
│   │   └── modules/
│   │       ├── constants.js      # Configuration constants
│   │       ├── utils.js          # Utility functions
│   │       ├── api-handler.js    # API request handling
│   │       └── ui-manager.js     # UI state management
│   └── styles/
│       └── popup.css            # Styling
├── assets/
│   └── icons/                   # Extension icons (16x16, 48x48, 128x128)
└── README.md

```

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `netcore-contact-api` directory
6. The extension will appear in your Chrome toolbar

## Usage

### Basic Workflow

1. **Select Region**: Choose the appropriate Netcore region
2. **Enter API Key**: Provide your Netcore API key
3. **Select Activity**: Choose the operation type (add, update, delete, or add-sync)
4. **Add Attributes**: Define contact attributes with their values and data types
5. **Generate or Trigger**: 
   - Click "Generate cURL" to create and copy a cURL command
   - Click "Trigger API" to execute the API request directly

### Example: Adding a Contact

```
Region: US
API Key: your_api_key_here
Activity: Add
List ID: 1
Attributes:
  - FIRST_NAME (String): John
  - EMAIL (String): john@example.com
  - MOBILE (Number): 9876543210
  - JOIN_DATE (Date): 2023-12-25
```

## Modular Architecture

The extension is designed with modularity in mind for easy scaling:

### Core Modules

- **constants.js**: Centralized configuration for endpoints, activities, and data types
- **utils.js**: Reusable utility functions for validation, formatting, and UI feedback
- **api-handler.js**: Encapsulates all API interaction logic
- **ui-manager.js**: Handles UI events and state management
- **popup.js**: Main entry point for DOM initialization

### Adding New Features

To add new functionality:

1. **New Activity Type**: Update `ACTIVITIES` in `constants.js`
2. **New Data Type**: Add to `DATA_TYPES` and update `Utils.formatValue()` in `utils.js`
3. **New Endpoint**: Add to `ENDPOINTS` in `constants.js`
4. **UI Components**: Extend `UIManager` class with new methods

## API Reference

### Query Parameters (sent as URL params)
- `type` (static): "contact"
- `activity`: "add", "update", "delete", or "addsync"
- `apikey`: Your Netcore API key

### Body Parameters
- `listid` (optional): Contact list ID
- `data`: JSON string containing contact attributes

### Example Generated cURL

```bash
curl -X POST "https://api.netcoresmartech.com/apiv2?type=contact&activity=add&apikey=xxxxxx" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "listid=1&data=%7B%22FIRST_NAME%22%3A%22John%22%2C%22EMAIL%22%3A%22john%40example.com%22%7D"
```

## Data Type Formatting

The extension automatically formats values based on their selected data type:

| Data Type | Input | Output | Example |
|-----------|-------|--------|---------|
| String | Any text | `"value"` | `"John"` |
| Float | Decimal | number | `10.5` |
| Number | Integer | number | `123` |
| Date | YYYY-MM-DD | `"YYYY-MM-DD"` | `"2023-12-25"` |

## Error Handling

The extension includes comprehensive error handling:

- Validates required fields before submission
- Provides user-friendly error messages
- Validates date formats for date fields
- Handles network errors gracefully
- Displays API response status and body

## Local Storage

The extension automatically saves:
- Selected region
- API key (encrypted in Chrome's secure storage)
- Selected activity
- List ID
- All added attributes

This data persists between extension usage sessions.

## Security Considerations

- API keys are stored in Chrome's local storage (use with caution)
- Recommend using temporary API keys or regenerating them after use
- Ensure you trust the network and device before entering sensitive API keys
- All requests are made directly to Netcore endpoints

## Browser Compatibility

- Chrome/Chromium: 90+
- Edge: 90+
- Brave: 1.20+
- Opera: 76+

## Troubleshooting

### Extension not loading
- Ensure manifest.json is valid JSON
- Check console for error messages (chrome://extensions with Developer mode)

### API requests failing
- Verify API key is correct
- Check selected region is correct
- Ensure attributes don't have empty keys or values
- Check Netcore API status

### Form data not persisting
- Check if Chrome allows local storage for the extension
- Try clearing extension data and reloading

## Support

For issues or feature requests, please contact or file an issue in the repository.

## License

MIT License - see LICENSE file for details

## Version History

### v1.0.0
- Initial release
- Multi-region support
- cURL generation
- Direct API triggering
- Form state persistence
