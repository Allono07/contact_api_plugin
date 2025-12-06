# Changelog

All notable changes to the Netcore Contact API Chrome Extension will be documented in this file.

## [1.1.0] - 2025-12-06

### Added
- **Call History Tab**: View all previous API calls with timestamps, status codes, and activity types
- **Restore from History**: Click any previous call to restore its configuration instantly
- **Clear History**: Remove all call history with one click (with confirmation)
- **Persistent Attributes**: Contact attributes now persist when closing and reopening the extension
- **Tab-based Navigation**: Switch between Form and History tabs easily
- **Improved Color Scheme**: 
  - Primary: #230f2e (header background)
  - Accent: #FC5E02 (buttons and highlights)
  - Background: White (#ffffff)
  - Text: Black (#000000) and #FC5E02

### Fixed
- Attributes no longer disappear when extension is minimized/closed
- Form data properly restored on extension reopen
- UI sizing improved for better visibility at 700px width

### Changed
- Complete redesign of color palette for better visual appeal
- Reorganized popup layout with tab-based interface
- Updated button and status message styling
- History limited to 50 most recent calls to manage storage

---

## [1.0.0] - 2023-12-25

### Added
- Initial release of Netcore Contact API Extension
- Multi-region support (US, India, EU)
- Dynamic API endpoint selection
- API key input with secure password field toggle
- Three activity types: Add, Update, Delete
- Add Sync (Synchronous) activity option
- Dynamic contact attributes with:
  - Unlimited attribute rows
  - Support for String, Float, Number, and Date data types
  - Easy add/remove functionality
- Optional List ID field
- cURL command generation with one-click copy
- Direct API triggering from extension
- API response display with status codes
- Form state persistence using Chrome local storage
- Comprehensive error handling and validation
- User-friendly status messages
- Modular code architecture for easy scaling

### Architecture
- Constants module for centralized configuration
- Utils module for shared functionality
- API Handler module for request management
- UI Manager module for interface control
- Background service worker for API requests

### Features
- ✅ Multi-region API endpoints
- ✅ Dynamic attribute management
- ✅ Data type validation and formatting
- ✅ cURL generation
- ✅ Direct API calls
- ✅ Response handling
- ✅ Local storage persistence
- ✅ Error handling
- ✅ User feedback via status messages

---

## Future Roadmap

### [1.1.0] - Planned
- [ ] Request history / previously sent requests
- [ ] Preset templates for common operations
- [ ] Batch operations support
- [ ] Request scheduling
- [ ] Response filtering and search

### [1.2.0] - Planned
- [ ] Multiple API key profiles
- [ ] Request import/export
- [ ] Advanced response formatting
- [ ] Request analytics dashboard
- [ ] API rate limit monitoring

### [2.0.0] - Planned
- [ ] Support for additional Netcore API endpoints
- [ ] OAuth2 authentication option
- [ ] Team collaboration features
- [ ] Custom webhooks integration
- [ ] Request versioning and rollback

---

## Version Details

### v1.0.0 Features

#### Core Functionality
- Complete API request builder
- Real-time cURL generation
- Direct API execution
- Response handling and display

#### User Experience
- Intuitive form layout
- One-click operations
- Copy to clipboard functionality
- Automatic form state saving
- Clear error messages

#### Developer Experience
- Modular code structure
- Well-documented modules
- Easy to extend
- Clean separation of concerns
- Comprehensive inline comments

#### Documentation
- User guides
- Developer documentation
- API reference
- Real-world examples
- Troubleshooting guide

---

## Known Limitations (v1.0.0)

- Single API request at a time (no concurrent requests)
- No request history
- No authentication methods other than API key
- No batch operations
- No request scheduling
- Limited to Netcore Contact API only

---

## Fixed Issues

### No issues in v1.0.0 (initial release)

---

## Known Issues

### Currently Being Tracked
- [ ] Large responses may be truncated in display
- [ ] Data type validation could be more strict for dates

---

## Contributors

- Initial development team

---

## Support & Feedback

For issues, feature requests, or feedback:
1. Check existing documentation
2. Review examples and troubleshooting guide
3. Enable developer console for error details
4. Report with clear description and steps to reproduce

---

## Security Notes

### v1.0.0
- API keys stored in browser local storage (not encrypted)
- Consider using temporary API keys
- Recommend regenerating keys after sharing
- All communications via HTTPS
- No data sent except to official Netcore endpoints

### Security Best Practices
- Don't share your API key
- Rotate API keys regularly
- Use different keys for different environments
- Monitor API usage for unauthorized access
- Keep extension updated

---

## Migration Guide

### First Time Installation
1. Download extension
2. Load unpacked in Developer mode
3. Open popup and configure settings
4. No migration needed for new installations

### Upgrading
- Simply reload extension in Chrome
- Form data will be preserved
- No manual action required

---

## Special Thanks

- Netcore Smarttech API documentation
- Chrome Extension development community
- All early testers and feedback providers

---

## License

Netcore Contact API Extension is licensed under the MIT License.
See LICENSE file for details.

---

## Useful Links

- [Netcore Smarttech](https://www.netcoresmartech.com/)
- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- [GitHub Repository](https://github.com/yourusername/netcore-contact-api)

---

## Version History Timeline

```
2023-12-25 | v1.0.0 | Initial Release
```

---

Last Updated: 2023-12-25
