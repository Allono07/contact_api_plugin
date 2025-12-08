// Utility functions

class Utils {
    /**
     * Format data based on type
     */
    static formatValue(value, dataType) {
        if (value === '' || value === null || value === undefined) {
            return null;
        }

        switch (dataType) {
            case DATA_TYPES.string:
                return `"${value}"`;
            case DATA_TYPES.float:
                return parseFloat(value).toString();
            case DATA_TYPES.number:
                return parseInt(value, 10).toString();
            case DATA_TYPES.date:
                // Validate date format YYYY-MM-DD
                if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                    throw new Error(`Invalid date format for "${value}". Use YYYY-MM-DD`);
                }
                return `"${value}"`;
            default:
                return `"${value}"`;
        }
    }

    /**
     * Validate all required fields
     */
    static validateFormData(formData) {
        const errors = [];

        if (!formData.region) {
            errors.push('Region is required');
        }
        if (!formData.apiKey) {
            errors.push('API Key is required');
        }
        if (!formData.activity) {
            errors.push('Activity is required');
        }
        
        // Check for Primary Key
        if (!formData.primaryKey || !formData.primaryKey.key || !formData.primaryKey.value) {
            errors.push('Primary Key and Value are required');
        }

        return errors;
    }

    /**
     * Show temporary status message
     */
    static showStatus(element, message, type = 'info', duration = 3000) {
        element.textContent = message;
        element.className = `status-message ${type}`;
        element.classList.remove('hidden');

        setTimeout(() => {
            element.classList.add('hidden');
        }, duration);
    }

    /**
     * Copy text to clipboard
     */
    static copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            return true;
        }).catch(err => {
            console.error('Failed to copy:', err);
            return false;
        });
    }

    /**
     * Format JSON for display
     */
    static formatJSON(obj) {
        return JSON.stringify(obj, null, 2);
    }

    /**
     * Parse query string to object
     */
    static queryToObject(queryString) {
        const params = new URLSearchParams(queryString);
        const obj = {};
        params.forEach((value, key) => {
            obj[key] = value;
        });
        return obj;
    }
}
