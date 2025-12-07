// CSV Parser - Handles event sheet CSV parsing

class CSVParser {
    /**
     * Parse CSV content
     */
    static parseCSV(csvContent) {
        const lines = csvContent.trim().split('\n');
        if (lines.length < 2) {
            throw new Error('CSV must have at least header and one data row');
        }

        const headers = this.parseCSVLine(lines[0]);
        if (!headers.includes('eventName') || !headers.includes('eventPayload') || !headers.includes('dataType')) {
            throw new Error('CSV must have columns: eventName, eventPayload, dataType');
        }

        const eventNameIdx = headers.indexOf('eventName');
        const eventPayloadIdx = headers.indexOf('eventPayload');
        const dataTypeIdx = headers.indexOf('dataType');

        const activities = {};

        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = this.parseCSVLine(line);
            const eventName = values[eventNameIdx] ? values[eventNameIdx].trim() : '';
            const eventPayload = values[eventPayloadIdx] ? values[eventPayloadIdx].trim() : '';
            const dataType = values[dataTypeIdx] ? values[dataTypeIdx].trim() : '';

            if (!eventPayload) continue; // Skip empty payload rows

            // If eventName exists, create new activity
            if (eventName) {
                if (!activities[eventName]) {
                    activities[eventName] = {
                        activity_name: eventName,
                        activity_params: {}
                    };
                }
            }

            // Get the last activity (current event group)
            const lastActivityName = Object.keys(activities)[Object.keys(activities).length - 1];
            if (!lastActivityName) continue;

            // Parse payload field (handle array notation like items[])
            const { paramKey, isArray } = this.parsePayloadField(eventPayload);
            const sampleValue = this.generateSampleValue(dataType);

            if (isArray) {
                // For arrays, store as nested object within array
                if (!activities[lastActivityName].activity_params[paramKey]) {
                    activities[lastActivityName].activity_params[paramKey] = [];
                }
                
                // For array items, we'll handle them separately
                if (!activities[lastActivityName]._arrayFields) {
                    activities[lastActivityName]._arrayFields = {};
                }
                if (!activities[lastActivityName]._arrayFields[paramKey]) {
                    activities[lastActivityName]._arrayFields[paramKey] = [];
                }
                
                const fieldName = eventPayload.replace(paramKey + '[]', '').replace(/^\./, '');
                activities[lastActivityName]._arrayFields[paramKey].push({
                    fieldName: fieldName,
                    dataType: dataType,
                    sampleValue: sampleValue
                });
            } else {
                // Regular parameter
                activities[lastActivityName].activity_params[paramKey] = {
                    value: sampleValue,
                    dataType: this.mapDataType(dataType)
                };
            }
        }

        // Process array fields and convert to proper format
        const processedActivities = [];
        for (const actName in activities) {
            const activity = activities[actName];
            const params = {};

            // Process regular params
            for (const paramKey in activity.activity_params) {
                if (typeof activity.activity_params[paramKey] === 'object' && !Array.isArray(activity.activity_params[paramKey])) {
                    // Regular param with dataType
                    params[paramKey] = activity.activity_params[paramKey];
                }
            }

            // Process array fields
            if (activity._arrayFields) {
                for (const arrayKey in activity._arrayFields) {
                    const arrayFields = activity._arrayFields[arrayKey];
                    const arrayItems = [{}];
                    
                    arrayFields.forEach(field => {
                        arrayItems[0][field.fieldName] = {
                            value: field.sampleValue,
                            type: this.mapDataType(field.dataType)
                        };
                    });

                    params[arrayKey] = {
                        value: '',
                        dataType: DATA_TYPES.array,
                        arrayItems: arrayItems
                    };
                }
            }

            processedActivities.push({
                name: actName,
                params: params
            });
        }

        return processedActivities;
    }

    /**
     * Parse a CSV line handling quoted values
     */
    static parseCSVLine(line) {
        const result = [];
        let current = '';
        let insideQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);

        return result.map(val => val.trim());
    }

    /**
     * Parse payload field to handle array notation
     * e.g., "items[].variant_id" -> { paramKey: "items", fieldName: "variant_id", isArray: true }
     */
    static parsePayloadField(payload) {
        if (payload.includes('[]')) {
            const parts = payload.split('[]');
            const paramKey = parts[0].trim();
            return {
                paramKey: paramKey,
                isArray: true
            };
        }
        return {
            paramKey: payload,
            isArray: false
        };
    }

    /**
     * Generate sample value based on data type
     */
    static generateSampleValue(dataType) {
        dataType = dataType.toLowerCase().trim();

        switch (dataType) {
            case 'text':
            case 'string':
                return 'Sample Text';
            case 'integer':
            case 'int':
                return 42;
            case 'float':
            case 'decimal':
                return 42.5;
            case 'date':
            case 'datetime':
                return new Date().toISOString().slice(0, 19);
            case 'boolean':
                return true;
            default:
                return 'Sample Value';
        }
    }

    /**
     * Map CSV data type to DATA_TYPES constant
     */
    static mapDataType(csvDataType) {
        csvDataType = csvDataType.toLowerCase().trim();

        switch (csvDataType) {
            case 'float':
            case 'decimal':
                return DATA_TYPES.float;
            case 'integer':
            case 'int':
                return DATA_TYPES.number;
            case 'date':
            case 'datetime':
                return DATA_TYPES.date;
            case 'text':
            case 'string':
            default:
                return DATA_TYPES.string;
        }
    }

    /**
     * Build Activity API payload from parsed activities
     */
    static buildPayloadFromParsed(activities, assetId, identity, activitySource) {
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19);

        return activities.map(activity => {
            const params = {};

            for (const key in activity.params) {
                const param = activity.params[key];

                if (param.dataType === DATA_TYPES.array && param.arrayItems) {
                    // Convert array items to proper format
                    const arrayData = [];
                    param.arrayItems.forEach(item => {
                        const arrayItem = {};
                        for (const fieldKey in item) {
                            const field = item[fieldKey];
                            arrayItem[fieldKey] = this.formatValue(field.value, field.type);
                        }
                        arrayData.push(arrayItem);
                    });
                    params[key] = arrayData;
                } else {
                    // Regular parameter
                    params[key] = this.formatValue(param.value, param.dataType);
                }
            }

            return {
                asset_id: assetId,
                activity_name: activity.name,
                timestamp: timestamp,
                identity: identity,
                activity_source: activitySource,
                activity_params: params
            };
        });
    }

    /**
     * Format value based on data type
     */
    static formatValue(value, dataType) {
        if (!value) return value;

        switch (dataType) {
            case DATA_TYPES.float:
                return parseFloat(value);
            case DATA_TYPES.number:
                return parseInt(value, 10);
            default:
                return value;
        }
    }
}
