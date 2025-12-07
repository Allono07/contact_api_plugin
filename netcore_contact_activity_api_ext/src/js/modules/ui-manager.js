// UI Manager - Handles all UI interactions and updates

class UIManager {
    constructor() {
        this.attributeCounter = 0;
    }

    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        // Contact API listeners
        document.getElementById('addAttributeBtn').addEventListener('click', () => this.addAttributeRow());
        document.getElementById('generateCurlBtn').addEventListener('click', () => this.handleGenerateCurl());
        document.getElementById('triggerApiBtn').addEventListener('click', () => this.handleTriggerAPI());
        document.getElementById('toggleApiKey').addEventListener('click', () => this.toggleApiKeyVisibility());

        // Activity API listeners
        const addActivityBtn = document.getElementById('addActivityBtn');
        const generateActivityCurlBtn = document.getElementById('generateActivityCurlBtn');
        const triggerActivityApiBtn = document.getElementById('triggerActivityApiBtn');
        const toggleActivityApiKey = document.getElementById('toggleActivityApiKey');
        const uploadCsvBtn = document.getElementById('uploadCsvBtn');
        const clearActivityFormBtn = document.getElementById('clearActivityFormBtn');

        if (addActivityBtn) addActivityBtn.addEventListener('click', () => this.addActivityRow());
        if (generateActivityCurlBtn) generateActivityCurlBtn.addEventListener('click', () => this.handleGenerateActivityCurl());
        if (triggerActivityApiBtn) triggerActivityApiBtn.addEventListener('click', () => this.handleTriggerActivityAPI());
        if (toggleActivityApiKey) toggleActivityApiKey.addEventListener('click', () => this.toggleActivityApiKeyVisibility());
        if (uploadCsvBtn) uploadCsvBtn.addEventListener('click', () => this.handleCSVUpload());
        if (clearActivityFormBtn) clearActivityFormBtn.addEventListener('click', () => this.handleClearActivityForm());

        // Response listeners
        document.getElementById('copyCurlBtn').addEventListener('click', () => this.handleCopyCurl());
        document.getElementById('copyResponseBtn').addEventListener('click', () => this.handleCopyResponse());
        document.getElementById('closeResponseBtn').addEventListener('click', () => this.closeResponseSection());
    }

    /**
     * Add Activity Row
     */
    addActivityRow(activityName = '', params = {}) {
        const container = document.getElementById('activitiesContainer');
        if (!container) return;
        
        const activityId = `activity-${Date.now()}-${Math.random()}`;
        const activityRow = document.createElement('div');
        activityRow.className = 'activity-row';
        activityRow.id = activityId;
        activityRow.innerHTML = `
            <div class="activity-header">
                <input type="text" class="activity-name" placeholder="Activity Name (e.g., Booking_Created)" value="${activityName}">
                <button class="btn-remove-activity" data-activity-id="${activityId}">Remove Activity</button>
            </div>
            <div class="activity-params-container" data-activity-id="${activityId}"></div>
            <button class="btn-add-activity-param" data-activity-id="${activityId}">+ Add Parameter</button>
        `;

        container.appendChild(activityRow);

        activityRow.querySelector('.btn-remove-activity').addEventListener('click', (e) => {
            document.getElementById(e.target.dataset.activityId).remove();
        });

        activityRow.querySelector('.btn-add-activity-param').addEventListener('click', (e) => {
            this.addActivityParamRow(e.target.dataset.activityId);
        });

        if (Object.keys(params).length > 0) {
            Object.entries(params).forEach(([key, param]) => {
                const arrayItems = param.arrayItems || [];
                this.addActivityParamRow(activityId, key, param.value, param.dataType, arrayItems);
            });
        }

        return activityId;
    }

    /**
     * Add Activity Parameter Row
     */
    addActivityParamRow(activityId, key = '', value = '', dataType = DATA_TYPES.string, arrayItems = []) {
        const container = document.querySelector(`.activity-params-container[data-activity-id="${activityId}"]`);
        if (!container) return;
        
        const paramId = `param-${Date.now()}-${Math.random()}`;
        const paramRow = document.createElement('div');
        paramRow.className = 'activity-param-row';
        paramRow.id = paramId;
        paramRow.innerHTML = `
            <div class="param-inputs">
                <input type="text" class="param-key" placeholder="Parameter Name" value="${key}">
                <input type="text" class="param-value" placeholder="Value (or use Array Builder for arrays)" value="${value}" ${dataType === DATA_TYPES.array ? 'disabled' : ''} style="background-color: ${dataType === DATA_TYPES.array ? '#e0e0e0' : 'white'};">
                <select class="param-type">
                    <option value="${DATA_TYPES.string}" ${dataType === DATA_TYPES.string ? 'selected' : ''}>String</option>
                    <option value="${DATA_TYPES.float}" ${dataType === DATA_TYPES.float ? 'selected' : ''}>Float</option>
                    <option value="${DATA_TYPES.number}" ${dataType === DATA_TYPES.number ? 'selected' : ''}>Number</option>
                    <option value="${DATA_TYPES.date}" ${dataType === DATA_TYPES.date ? 'selected' : ''}>Date</option>
                    <option value="${DATA_TYPES.array}" ${dataType === DATA_TYPES.array ? 'selected' : ''}>Array (JSON)</option>
                </select>
                <button class="btn-array-builder" data-param-id="${paramId}" style="display: ${dataType === DATA_TYPES.array ? 'inline-block' : 'none'};">Array Builder</button>
                <button class="btn-remove-param" data-param-id="${paramId}">Remove</button>
            </div>
            <div class="array-items-container" id="array-items-${paramId}" style="display: ${dataType === DATA_TYPES.array ? 'block' : 'none'}; margin-left: 20px; margin-top: 10px;"></div>
        `;

        container.appendChild(paramRow);

        const typeSelect = paramRow.querySelector('.param-type');
        const valueInput = paramRow.querySelector('.param-value');
        const arrayBuilderBtn = paramRow.querySelector('.btn-array-builder');
        const arrayItemsContainer = document.getElementById(`array-items-${paramId}`);

        typeSelect.addEventListener('change', (e) => {
            const isArray = e.target.value === DATA_TYPES.array;
            valueInput.disabled = isArray;
            valueInput.style.backgroundColor = isArray ? '#e0e0e0' : 'white';
            arrayBuilderBtn.style.display = isArray ? 'inline-block' : 'none';
            arrayItemsContainer.style.display = isArray ? 'block' : 'none';
        });

        arrayBuilderBtn.addEventListener('click', () => {
            this.toggleArrayBuilder(paramId, arrayItemsContainer);
        });

        paramRow.querySelector('.btn-remove-param').addEventListener('click', (e) => {
            document.getElementById(e.target.dataset.paramId).remove();
        });

        if (arrayItems && arrayItems.length > 0) {
            arrayItems.forEach((item, idx) => {
                this.addArrayItemRow(paramId, arrayItemsContainer, idx, item);
            });
        }
    }

    /**
     * Toggle Array Builder visibility
     */
    toggleArrayBuilder(paramId, container) {
        const builderSection = container.querySelector('.array-builder-section');
        
        if (builderSection) {
            builderSection.style.display = builderSection.style.display === 'none' ? 'block' : 'none';
        } else {
            const builder = document.createElement('div');
            builder.className = 'array-builder-section';
            builder.innerHTML = `
                <div style="margin: 10px 0;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Array Items</label>
                    <div class="array-items-list" id="items-list-${paramId}"></div>
                    <button class="btn btn-secondary" data-param-id="${paramId}" style="margin-top: 10px;">+ Add Array Item</button>
                </div>
            `;
            container.appendChild(builder);
            
            builder.querySelector('button').addEventListener('click', (e) => {
                e.preventDefault();
                this.addArrayItemRow(paramId, document.getElementById(`items-list-${paramId}`));
            });
        }
    }

    /**
     * Add Array Item
     */
    addArrayItemRow(paramId, container, itemIndex = null, itemData = {}) {
        const itemId = `array-item-${paramId}-${Date.now()}-${Math.random()}`;
        const itemNum = container.querySelectorAll('.array-item-row').length + 1;

        const itemRow = document.createElement('div');
        itemRow.className = 'array-item-row';
        itemRow.id = itemId;
        itemRow.style.border = '1px solid #ddd';
        itemRow.style.padding = '10px';
        itemRow.style.margin = '10px 0';
        itemRow.style.borderRadius = '4px';
        itemRow.style.backgroundColor = '#f9f9f9';
        itemRow.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <strong>Item #${itemNum}</strong>
                <button class="btn-remove-item" data-item-id="${itemId}" style="padding: 2px 8px; font-size: 12px;">Remove Item</button>
            </div>
            <div class="array-item-fields" data-param-id="${paramId}"></div>
            <button class="btn-add-field" data-item-id="${itemId}" style="margin-top: 8px; padding: 4px 8px; font-size: 12px;">+ Add Field</button>
        `;

        container.appendChild(itemRow);

        const fieldsContainer = itemRow.querySelector('.array-item-fields');
        itemRow.querySelector('.btn-remove-item').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById(e.target.dataset.itemId).remove();
        });

        itemRow.querySelector('.btn-add-field').addEventListener('click', (e) => {
            e.preventDefault();
            this.addArrayFieldRow(itemId, fieldsContainer);
        });

        if (Object.keys(itemData).length > 0) {
            Object.entries(itemData).forEach(([fieldKey, fieldData]) => {
                const fieldValue = typeof fieldData === 'object' ? fieldData.value : fieldData;
                const fieldType = typeof fieldData === 'object' ? fieldData.type : DATA_TYPES.string;
                this.addArrayFieldRow(itemId, fieldsContainer, fieldKey, fieldValue, fieldType);
            });
        }
    }

    /**
     * Add Field to Array Item
     */
    addArrayFieldRow(itemId, container, fieldKey = '', fieldValue = '', fieldType = DATA_TYPES.string) {
        const fieldId = `field-${itemId}-${Date.now()}`;
        const fieldRow = document.createElement('div');
        fieldRow.className = 'array-field-row';
        fieldRow.id = fieldId;
        fieldRow.style.display = 'flex';
        fieldRow.style.gap = '8px';
        fieldRow.style.marginBottom = '8px';
        fieldRow.style.alignItems = 'center';
        fieldRow.innerHTML = `
            <input type="text" class="field-key" placeholder="Field Name" value="${fieldKey}" style="flex: 1.2; padding: 8px; border: 1px solid #ddd; border-radius: 3px; min-width: 120px;">
            <input type="text" class="field-value" placeholder="Value" value="${fieldValue}" style="flex: 1.5; padding: 8px; border: 1px solid #ddd; border-radius: 3px; min-width: 150px;">
            <select class="field-type" style="flex: 0.8; padding: 8px; border: 1px solid #ddd; border-radius: 3px; min-width: 80px;">
                <option value="${DATA_TYPES.string}" ${fieldType === DATA_TYPES.string ? 'selected' : ''}>String</option>
                <option value="${DATA_TYPES.float}" ${fieldType === DATA_TYPES.float ? 'selected' : ''}>Float</option>
                <option value="${DATA_TYPES.number}" ${fieldType === DATA_TYPES.number ? 'selected' : ''}>Number</option>
                <option value="${DATA_TYPES.date}" ${fieldType === DATA_TYPES.date ? 'selected' : ''}>Date</option>
            </select>
            <button class="btn-remove-field" data-field-id="${fieldId}" style="padding: 6px 10px; font-size: 12px; background-color: #ff6b6b; color: white; border: none; border-radius: 3px; cursor: pointer; flex-shrink: 0;">×</button>
        `;

        container.appendChild(fieldRow);
        fieldRow.querySelector('.btn-remove-field').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById(e.target.dataset.fieldId).remove();
        });
    }

    /**
     * Get all activities with their parameters
     */
    getActivities() {
        const activities = [];
        document.querySelectorAll('.activity-row').forEach(actRow => {
            const activityName = actRow.querySelector('.activity-name').value.trim();
            if (!activityName) return;

            const params = {};
            actRow.querySelectorAll('.activity-param-row').forEach(paramRow => {
                const key = paramRow.querySelector('.param-key').value.trim();
                const value = paramRow.querySelector('.param-value').value.trim();
                const dataType = paramRow.querySelector('.param-type').value;

                if (key) {
                    if (dataType === DATA_TYPES.array) {
                        const arrayItems = [];
                        const itemsContainer = paramRow.querySelector('.array-items-container');
                        
                        if (itemsContainer) {
                            itemsContainer.querySelectorAll('.array-item-row').forEach(itemRow => {
                                const itemObj = {};
                                itemRow.querySelectorAll('.array-field-row').forEach(fieldRow => {
                                    const fieldKey = fieldRow.querySelector('.field-key').value.trim();
                                    const fieldValue = fieldRow.querySelector('.field-value').value.trim();
                                    const fieldType = fieldRow.querySelector('.field-type')?.value || DATA_TYPES.string;
                                    if (fieldKey && fieldValue) {
                                        try {
                                            itemObj[fieldKey] = this.formatActivityValue(fieldValue, fieldType, false);
                                        } catch (e) {
                                            itemObj[fieldKey] = fieldValue;
                                        }
                                    }
                                });
                                if (Object.keys(itemObj).length > 0) {
                                    arrayItems.push(itemObj);
                                }
                            });
                        }
                        
                        if (arrayItems.length === 0 && value) {
                            try {
                                const parsed = JSON.parse(value);
                                if (Array.isArray(parsed)) {
                                    params[key] = parsed;
                                }
                            } catch (e) {
                                throw new Error(`Activity "${activityName}", array "${key}": Invalid JSON array format`);
                            }
                        } else if (arrayItems.length > 0) {
                            params[key] = arrayItems;
                        }
                    } else if (value) {
                        try {
                            const formattedValue = this.formatActivityValue(value, dataType, false);
                            params[key] = formattedValue;
                        } catch (error) {
                            throw new Error(`Activity "${activityName}", parameter "${key}": ${error.message}`);
                        }
                    }
                }
            });

            activities.push({
                activity_name: activityName,
                activity_params: params
            });
        });
        return activities;
    }

    /**
     * Format activity parameter value based on type
     */
    formatActivityValue(value, dataType, isArrayName = false) {
        if (!value) return null;

        switch (dataType) {
            case DATA_TYPES.string:
                return value;
            case DATA_TYPES.float:
                return parseFloat(value);
            case DATA_TYPES.number:
                return parseInt(value, 10);
            case DATA_TYPES.date:
                if (!/^(\d{4}-\d{2}-\d{2}|\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/.test(value)) {
                    throw new Error(`Invalid date format. Use YYYY-MM-DD or YYYY-MM-DD HH:MM:SS`);
                }
                return value;
            case DATA_TYPES.array:
                try {
                    const parsed = JSON.parse(value);
                    if (!Array.isArray(parsed)) {
                        throw new Error('Must be a valid JSON array');
                    }
                    return parsed;
                } catch (e) {
                    throw new Error(`Invalid JSON array: ${e.message}`);
                }
            default:
                return value;
        }
    }

    /**
     * Toggle Activity API Key visibility
     */
    toggleActivityApiKeyVisibility() {
        const apiKeyInput = document.getElementById('activityApiKey');
        const toggleBtn = document.getElementById('toggleActivityApiKey');

        if (!apiKeyInput || !toggleBtn) return;

        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            toggleBtn.textContent = 'Hide';
        } else {
            apiKeyInput.type = 'password';
            toggleBtn.textContent = 'Show';
        }
    }

    /**
     * Handle CSV File Upload
     */
    handleCSVUpload() {
        const fileInput = document.getElementById('csvFileInput');
        const statusMessage = document.getElementById('statusMessage');

        if (!fileInput.files || fileInput.files.length === 0) {
            Utils.showStatus(statusMessage, 'Please select a CSV file', 'error', 4000);
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const csvContent = e.target.result;
                const parsedActivities = CSVParser.parseCSV(csvContent);

                if (parsedActivities.length === 0) {
                    Utils.showStatus(statusMessage, 'No valid activities found in CSV', 'error', 4000);
                    return;
                }

                // Show preview in a tabular format
                this.showCSVPreview(parsedActivities, fileInput, statusMessage);
            } catch (error) {
                Utils.showStatus(statusMessage, `CSV Parse Error: ${error.message}`, 'error', 5000);
            }
        };

        reader.onerror = () => {
            Utils.showStatus(statusMessage, 'Error reading file', 'error', 4000);
        };

        reader.readAsText(file);
    }

    /**
     * Show CSV Preview in Table Format
     */
    showCSVPreview(parsedActivities, fileInput, statusMessage) {
        let previewContainer = document.getElementById('csvPreviewContainer');
        
        if (!previewContainer) {
            previewContainer = document.createElement('div');
            previewContainer.id = 'csvPreviewContainer';
            const uploadSection = document.querySelector('.csv-upload-section');
            uploadSection.appendChild(previewContainer);
        }

        // Build table rows from parsed activities
        let tableRows = '';
        
        // Build table rows with activity grouping
        parsedActivities.forEach((activity, actIndex) => {
            const params = activity.params;
            const paramKeys = Object.keys(params);
            
            paramKeys.forEach((paramKey, paramIndex) => {
                const param = params[paramKey];
                const isArrayType = Array.isArray(param.arrayItems);
                const typeLabel = isArrayType ? 'Array' : this.getDataTypeLabel(param.dataType);
                const sampleValue = isArrayType ? 
                    `[${param.arrayItems.length} item${param.arrayItems.length !== 1 ? 's' : ''}]` : 
                    String(param.value);

                const typeClass = typeLabel.toLowerCase().replace(/\\s+/g, '');
                tableRows += `
                    <tr>
                        ${paramIndex === 0 ? `<td rowspan=\"${paramKeys.length}\" style=\"font-weight: 600; background-color: #f0f0f0; vertical-align: top;\">${activity.name}</td>` : ''}
                        <td><strong>${paramKey}</strong></td>
                        <td><span class="csv-param-type ${typeClass}">${typeLabel}</span></td>
                        <td title="${sampleValue}">${this.truncateText(sampleValue, 30)}</td>
                    </tr>
                `;
            });
        });

        previewContainer.innerHTML = `
            <div class="csv-preview-container">
                <div class="csv-preview-header">📊 CSV Preview - ${parsedActivities.length} Activities</div>
                <table class="csv-preview-table">
                    <thead>
                        <tr>
                            <th style="width: 25%;">Activity</th>
                            <th style="width: 25%;">Parameter</th>
                            <th style="width: 20%;">Type</th>
                            <th style="width: 30%;">Sample Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
                <div class="csv-preview-actions">
                    <button class="btn-apply-csv" id="applyCSVBtn">✓ Apply & Load Activities</button>
                    <button class="btn-cancel-csv" id="cancelCSVBtn">✕ Cancel</button>
                </div>
            </div>
        `;

        // Store parsed activities for later use
        this._csvData = { activities: parsedActivities, fileInput, statusMessage };

        document.getElementById('applyCSVBtn').addEventListener('click', () => {
            this.applyCSVData(parsedActivities, fileInput, statusMessage);
        });

        document.getElementById('cancelCSVBtn').addEventListener('click', () => {
            previewContainer.innerHTML = '';
            fileInput.value = '';
        });
    }

    /**
     * Apply CSV Data to Form
     */
    applyCSVData(parsedActivities, fileInput, statusMessage) {
        try {
            // Clear existing activities
            document.getElementById('activitiesContainer').innerHTML = '';

            // Add parsed activities to form
            parsedActivities.forEach(activity => {
                this.addActivityRow(activity.name, activity.params);
            });

            // Save form state
            this.saveFormState();

            // Clear preview
            const previewContainer = document.getElementById('csvPreviewContainer');
            previewContainer.innerHTML = '';

            Utils.showStatus(statusMessage, `✓ Successfully loaded ${parsedActivities.length} activities from CSV`, 'success', 4000);
            
            // Clear file input
            fileInput.value = '';
        } catch (error) {
            Utils.showStatus(statusMessage, `Error loading activities: ${error.message}`, 'error', 5000);
        }
    }

    /**
     * Get readable label for data type
     */
    getDataTypeLabel(dataType) {
        const labels = {
            [DATA_TYPES.string]: 'String',
            [DATA_TYPES.number]: 'Number',
            [DATA_TYPES.float]: 'Float',
            [DATA_TYPES.date]: 'Date',
            [DATA_TYPES.array]: 'Array'
        };
        return labels[dataType] || 'String';
    }

    /**
     * Truncate text for display
     */
    truncateText(text, length) {
        const str = String(text);
        return str.length > length ? str.substring(0, length) + '...' : str;
    }

    /**
     * Handle Generate Activity cURL
     */
    handleGenerateActivityCurl() {
        const statusMessage = document.getElementById('statusMessage');

        try {
            const bearerToken = document.getElementById('activityApiKey').value.trim();
            const region = document.getElementById('activityRegion').value;
            const assetId = document.getElementById('assetId').value.trim();
            const identity = document.getElementById('identity').value.trim();
            const activitySource = document.getElementById('activitySource').value;

            const errors = [];
            if (!bearerToken) errors.push('Bearer token is required');
            if (!region) errors.push('Region is required');
            if (!assetId) errors.push('Asset ID is required');
            if (!identity) errors.push('Identity is required');
            if (!activitySource) errors.push('Activity source is required');

            if (errors.length > 0) {
                Utils.showStatus(statusMessage, errors.join(', '), 'error', 4000);
                return;
            }

            const activities = this.getActivities();
            if (activities.length === 0) {
                Utils.showStatus(statusMessage, 'At least one activity with a name is required', 'error', 4000);
                return;
            }

            const payload = APIHandler.buildActivityPayload(assetId, identity, activitySource, activities);
            const curl = APIHandler.generateActivityCurl(bearerToken, region, payload);

            this.displayCurl(curl);
            Utils.showStatus(statusMessage, 'Activity API cURL generated successfully!', 'success');
        } catch (error) {
            Utils.showStatus(statusMessage, `Error: ${error.message}`, 'error', 4000);
        }
    }

    /**
     * Handle Trigger Activity API
     */
    async handleTriggerActivityAPI() {
        const statusMessage = document.getElementById('statusMessage');

        try {
            const bearerToken = document.getElementById('activityApiKey').value.trim();
            const region = document.getElementById('activityRegion').value;
            const assetId = document.getElementById('assetId').value.trim();
            const identity = document.getElementById('identity').value.trim();
            const activitySource = document.getElementById('activitySource').value;

            const errors = [];
            if (!bearerToken) errors.push('Bearer token is required');
            if (!region) errors.push('Region is required');
            if (!assetId) errors.push('Asset ID is required');
            if (!identity) errors.push('Identity is required');
            if (!activitySource) errors.push('Activity source is required');

            if (errors.length > 0) {
                Utils.showStatus(statusMessage, errors.join(', '), 'error', 4000);
                return;
            }

            const activities = this.getActivities();
            if (activities.length === 0) {
                Utils.showStatus(statusMessage, 'At least one activity with a name is required', 'error', 4000);
                return;
            }

            const payload = APIHandler.buildActivityPayload(assetId, identity, activitySource, activities);

            Utils.showStatus(statusMessage, 'Triggering Activity API...', 'info');

            const response = await APIHandler.triggerActivityAPI(bearerToken, region, payload);
            const formattedResponse = APIHandler.formatResponse(response);

            // Store the exact request data for history restoration
            const historyPayload = JSON.parse(JSON.stringify(payload)); // Deep copy to preserve exact state
            
            // Get the complete form data to store (same structure as activityFormData)
            const completeActivityData = this.getActivityFormData();

            // Add to history with apiType='activity' and full activity details
            this.addToHistory({
                apiType: 'activity',
                region: region,
                activity: `Events Count (${activities.length})`,
                listId: assetId,
                identity: identity,
                activitySource: activitySource,
                activities: completeActivityData.activities,
                historyPayload: historyPayload,
                attributes: activities.map(a => a.activity_name),
                response: formattedResponse.body,
                status: formattedResponse.status
            });
            this.displayResponse(formattedResponse);
            Utils.showStatus(statusMessage, 'Activity API triggered successfully!', 'success');
        } catch (error) {
            Utils.showStatus(statusMessage, `Error: ${error.message}`, 'error', 4000);
        }
    }

    /**
     * Handle Clear Activity Form
     */
    handleClearActivityForm() {
        const statusMessage = document.getElementById('statusMessage');
        
        // Show confirmation dialog
        const confirmed = confirm('Are you sure you want to clear all activities? This action cannot be undone.');
        if (!confirmed) {
            return;
        }

        try {
            // Clear all activities
            document.getElementById('activitiesContainer').innerHTML = '';
            
            // Clear CSV preview if any
            const csvPreviewContainer = document.getElementById('csvPreviewContainer');
            if (csvPreviewContainer) {
                csvPreviewContainer.innerHTML = '';
            }
            
            // Clear file input
            const csvFileInput = document.getElementById('csvFileInput');
            if (csvFileInput) {
                csvFileInput.value = '';
            }
            
            // Save form state (empty)
            this.saveFormState();
            
            Utils.showStatus(statusMessage, '✓ Form cleared successfully', 'success', 3000);
        } catch (error) {
            Utils.showStatus(statusMessage, `Error clearing form: ${error.message}`, 'error', 4000);
        }
    }

    /**
     * Add a new attribute row
     */
    addAttributeRow(key = '', value = '', dataType = DATA_TYPES.string) {
        const container = document.getElementById('attributesContainer');
        const rowId = `attr-${this.attributeCounter++}`;

        const attributeRow = document.createElement('div');
        attributeRow.className = 'attribute-row';
        attributeRow.id = rowId;
        attributeRow.innerHTML = `
            <div class="attribute-inputs">
                <input type="text" class="attr-key" placeholder="Key (e.g., FIRST_NAME)" value="${key}">
                <input type="text" class="attr-value" placeholder="Value" value="${value}">
                <select class="attr-type">
                    <option value="${DATA_TYPES.string}" ${dataType === DATA_TYPES.string ? 'selected' : ''}>String</option>
                    <option value="${DATA_TYPES.float}" ${dataType === DATA_TYPES.float ? 'selected' : ''}>Float</option>
                    <option value="${DATA_TYPES.number}" ${dataType === DATA_TYPES.number ? 'selected' : ''}>Number</option>
                    <option value="${DATA_TYPES.date}" ${dataType === DATA_TYPES.date ? 'selected' : ''}>Date (YYYY-MM-DD)</option>
                </select>
                <button class="btn-remove" data-row-id="${rowId}">Remove</button>
            </div>
        `;

        container.appendChild(attributeRow);

        attributeRow.querySelector('.btn-remove').addEventListener('click', (e) => {
            document.getElementById(e.target.dataset.rowId).remove();
        });
    }

    /**
     * Get all form data
     */
    getFormData() {
        const region = document.getElementById('region').value;
        const apiKey = document.getElementById('apiKey').value;
        const activity = document.getElementById('activity').value;
        const listId = document.getElementById('listId').value;

        const attributes = [];
        document.querySelectorAll('.attribute-row').forEach(row => {
            const key = row.querySelector('.attr-key').value.trim();
            const value = row.querySelector('.attr-value').value.trim();
            const dataType = row.querySelector('.attr-type').value;

            if (key && value) {
                attributes.push({ key, value, dataType });
            }
        });

        return {
            region,
            apiKey,
            activity,
            listId: listId || null,
            attributes
        };
    }

    /**
     * Handle Generate cURL
     */
    handleGenerateCurl() {
        const statusMessage = document.getElementById('statusMessage');

        try {
            const formData = this.getFormData();
            const errors = Utils.validateFormData(formData);

            if (errors.length > 0) {
                Utils.showStatus(statusMessage, errors.join(', '), 'error', 4000);
                return;
            }

            const endpoint = ENDPOINTS[formData.region];
            const queryParams = APIHandler.buildQueryParams(formData.apiKey, formData.activity);
            const bodyParams = APIHandler.buildRequestBody(formData.listId, formData.attributes);

            const curl = APIHandler.generateCurl(endpoint, queryParams, bodyParams);

            this.displayCurl(curl);
            Utils.showStatus(statusMessage, 'cURL generated successfully!', 'success');
        } catch (error) {
            Utils.showStatus(statusMessage, `Error: ${error.message}`, 'error', 4000);
        }
    }

    /**
     * Display cURL output
     */
    displayCurl(curl) {
        const curlSection = document.getElementById('curlSection');
        const curlOutput = document.getElementById('curlOutput');

        curlOutput.value = curl;
        curlSection.classList.remove('hidden');
    }

    /**
     * Handle Trigger API
     */
    async handleTriggerAPI() {
        const statusMessage = document.getElementById('statusMessage');

        try {
            const formData = this.getFormData();
            const errors = Utils.validateFormData(formData);

            if (errors.length > 0) {
                Utils.showStatus(statusMessage, errors.join(', '), 'error', 4000);
                return;
            }

            const endpoint = ENDPOINTS[formData.region];
            const queryParams = APIHandler.buildQueryParams(formData.apiKey, formData.activity);
            const bodyParams = APIHandler.buildRequestBody(formData.listId, formData.attributes);

            Utils.showStatus(statusMessage, 'Triggering API...', 'info');

            const response = await APIHandler.triggerAPI(endpoint, queryParams, bodyParams);
            const formattedResponse = APIHandler.formatResponse(response);

            // Save to history with apiType='contact'
            this.addToHistory({
                apiType: 'contact',
                region: formData.region,
                activity: formData.activity,
                listId: formData.listId,
                attributes: formData.attributes,
                response: formattedResponse.body,
                status: formattedResponse.status
            });

            this.displayResponse(formattedResponse);
            Utils.showStatus(statusMessage, 'API triggered successfully!', 'success');
        } catch (error) {
            Utils.showStatus(statusMessage, `Error: ${error.message}`, 'error', 4000);
        }
    }

    /**
     * Display API response
     */
    displayResponse(response) {
        const responseSection = document.getElementById('responseSection');
        const responseContent = document.getElementById('responseContent');

        const statusClass = response.status >= 200 && response.status < 300 ? 'success' : 'error';

        responseContent.innerHTML = `
            <div class="response-status ${statusClass}">
                <strong>Status:</strong> ${response.status} ${response.statusText}
            </div>
            <div class="response-body">
                <pre>${Utils.formatJSON(response.body)}</pre>
            </div>
        `;

        responseSection.classList.remove('hidden');
    }

    /**
     * Handle Copy cURL
     */
    handleCopyCurl() {
        const curlOutput = document.getElementById('curlOutput');
        Utils.copyToClipboard(curlOutput.value);
        Utils.showStatus(document.getElementById('statusMessage'), 'cURL copied to clipboard!', 'success');
    }

    /**
     * Handle Copy Response
     */
    handleCopyResponse() {
        const responseContent = document.getElementById('responseContent');
        const text = responseContent.innerText;
        Utils.copyToClipboard(text);
        Utils.showStatus(document.getElementById('statusMessage'), 'Response copied to clipboard!', 'success');
    }

    /**
     * Close response section
     */
    closeResponseSection() {
        document.getElementById('responseSection').classList.add('hidden');
    }

    /**
     * Toggle API key visibility
     */
    toggleApiKeyVisibility() {
        const apiKeyInput = document.getElementById('apiKey');
        const toggleBtn = document.getElementById('toggleApiKey');

        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            toggleBtn.textContent = 'Hide';
        } else {
            apiKeyInput.type = 'password';
            toggleBtn.textContent = 'Show';
        }
    }

    /**
     * Save form state to local storage
     */
    saveFormState() {
        const formData = this.getFormData();
        const activityFormData = this.getActivityFormData();
        chrome.storage.local.set({ formData: formData, activityFormData: activityFormData });
    }

    /**
     * Get Activity API form data
     */
    getActivityFormData() {
        const activities = [];
        
        const activitiesContainer = document.getElementById('activitiesContainer');
        if (!activitiesContainer) return null;
        
        activitiesContainer.querySelectorAll('.activity-row').forEach(actRow => {
            const activityName = actRow.querySelector('.activity-name').value.trim();
            if (!activityName) return;

            const params = {};
            actRow.querySelectorAll('.activity-param-row').forEach(paramRow => {
                const key = paramRow.querySelector('.param-key').value.trim();
                const value = paramRow.querySelector('.param-value').value.trim();
                const dataType = paramRow.querySelector('.param-type').value;

                if (key) {
                    const paramData = { value, dataType };
                    
                    if (dataType === DATA_TYPES.array) {
                        const arrayItems = [];
                        const itemsContainer = paramRow.querySelector('.array-items-container');
                        
                        if (itemsContainer) {
                            itemsContainer.querySelectorAll('.array-item-row').forEach(itemRow => {
                                const itemObj = {};
                                itemRow.querySelectorAll('.array-field-row').forEach(fieldRow => {
                                    const fieldKey = fieldRow.querySelector('.field-key').value.trim();
                                    const fieldValue = fieldRow.querySelector('.field-value').value.trim();
                                    const fieldType = fieldRow.querySelector('.field-type')?.value || DATA_TYPES.string;
                                    if (fieldKey && fieldValue) {
                                        itemObj[fieldKey] = { value: fieldValue, type: fieldType };
                                    }
                                });
                                if (Object.keys(itemObj).length > 0) {
                                    arrayItems.push(itemObj);
                                }
                            });
                        }
                        paramData.arrayItems = arrayItems;
                    }
                    
                    params[key] = paramData;
                }
            });

            activities.push({
                name: activityName,
                params: params
            });
        });

        return {
            bearerToken: document.getElementById('activityApiKey')?.value || '',
            region: document.getElementById('activityRegion')?.value || '',
            assetId: document.getElementById('assetId')?.value || '',
            identity: document.getElementById('identity')?.value || '',
            activitySource: document.getElementById('activitySource')?.value || '',
            activities: activities
        };
    }

    /**
     * Load form state from local storage
     */
    loadFormState() {
        chrome.storage.local.get(['formData', 'activityFormData'], (result) => {
            if (result.formData) {
                const data = result.formData;

                document.getElementById('region').value = data.region || '';
                document.getElementById('apiKey').value = data.apiKey || '';
                document.getElementById('activity').value = data.activity || '';
                document.getElementById('listId').value = data.listId || '';

                if (data.attributes && data.attributes.length > 0) {
                    document.getElementById('attributesContainer').innerHTML = '';
                    data.attributes.forEach(attr => {
                        this.addAttributeRow(attr.key, attr.value, attr.dataType);
                    });
                }
            }

            if (result.activityFormData) {
                const actData = result.activityFormData;

                const activityApiKey = document.getElementById('activityApiKey');
                const activityRegion = document.getElementById('activityRegion');
                const assetId = document.getElementById('assetId');
                const identity = document.getElementById('identity');
                const activitySource = document.getElementById('activitySource');
                const activitiesContainer = document.getElementById('activitiesContainer');

                if (activityApiKey) activityApiKey.value = actData.bearerToken || '';
                if (activityRegion) activityRegion.value = actData.region || '';
                if (assetId) assetId.value = actData.assetId || '';
                if (identity) identity.value = actData.identity || '';
                if (activitySource) activitySource.value = actData.activitySource || '';

                if (activitiesContainer && actData.activities && actData.activities.length > 0) {
                    activitiesContainer.innerHTML = '';
                    actData.activities.forEach(activity => {
                        this.addActivityRow(activity.name, activity.params);
                    });
                }
            }
        });
    }

    /**
     * Add call to history
     */
    addToHistory(callData) {
        chrome.storage.local.get(['callHistory'], (result) => {
            const history = result.callHistory || [];
            const call = {
                id: Date.now(),
                timestamp: new Date().toLocaleString(),
                apiType: callData.apiType || 'contact',
                region: callData.region,
                activity: callData.activity,
                listId: callData.listId,
                attributes: callData.attributes,
                response: callData.response,
                status: callData.status
            };
            
            // For Activity API calls, store additional fields needed for history restoration
            if (callData.apiType === 'activity') {
                call.identity = callData.identity;
                call.activitySource = callData.activitySource;
                call.activities = callData.activities;
                call.historyPayload = callData.historyPayload;
            }
            
            history.unshift(call);
            if (history.length > 50) history.pop();
            chrome.storage.local.set({ callHistory: history });
        });
    }

    /**
     * Load and display call history
     */
    loadHistory() {
        chrome.storage.local.get(['callHistory'], (result) => {
            const history = result.callHistory || [];
            const historyContainer = document.getElementById('historyContainer');
            
            if (!historyContainer) return;
            
            if (history.length === 0) {
                historyContainer.innerHTML = '<p class="no-history">No call history yet</p>';
                return;
            }

            historyContainer.innerHTML = history.map(call => {
                const apiType = call.apiType || 'contact';
                const apiLabel = apiType === 'activity' ? 'ACTIVITY API' : 'CONTACT API';
                const attributesText = Array.isArray(call.attributes) ? call.attributes.length : 0;
                const buttonText = apiType === 'activity' ? 'View cURL' : 'Restore';
                
                return `
                    <div class="history-item" data-call-id="${call.id}" data-api-type="${apiType}" style="margin-bottom: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; background-color: #fafafa;">
                        <div class="history-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span class="history-time" style="font-size: 12px; color: #666;">${call.timestamp}</span>
                            <span class="history-api-type" style="font-weight: bold; margin-left: 10px; padding: 2px 8px; background-color: ${apiType === 'activity' ? '#e3f2fd' : '#f1f8e9'}; border-radius: 3px;">${apiLabel}</span>
                            <span class="history-activity" style="margin-left: 10px; font-weight: 500; flex: 1;">${call.activity}</span>
                            <span class="history-status" style="margin-left: 10px; padding: 2px 8px; border-radius: 3px; background-color: ${call.status >= 200 && call.status < 300 ? '#c8e6c9' : '#ffcdd2'}; color: ${call.status >= 200 && call.status < 300 ? '#2e7d32' : '#c62828'}; font-weight: bold;">
                                ${call.status}
                            </span>
                        </div>
                        <div class="history-details" style="margin-bottom: 8px;">
                            <small style="color: #999;">${call.region} | ${attributesText} ${apiType === 'activity' ? 'activities' : 'attributes'}</small>
                        </div>
                        <button class="btn-history-restore" data-call-id="${call.id}" style="padding: 6px 12px; background-color: #1976d2; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;">${buttonText}</button>
                    </div>
                `;
            }).join('');

            document.querySelectorAll('.btn-history-restore').forEach(btn => {
                btn.addEventListener('click', (e) => this.restoreFromHistory(e.target.dataset.callId));
            });
        });
    }

    /**
     * Restore a previous call from history
     */
    restoreFromHistory(callId) {
        chrome.storage.local.get(['callHistory'], (result) => {
            const history = result.callHistory || [];
            const call = history.find(c => c.id == callId);
            
            if (call) {
                const apiType = call.apiType || 'contact';
                
                if (apiType === 'contact') {
                    document.getElementById('region').value = call.region;
                    document.getElementById('activity').value = call.activity;
                    document.getElementById('listId').value = call.listId || '';
                    
                    document.getElementById('attributesContainer').innerHTML = '';
                    if (Array.isArray(call.attributes)) {
                        call.attributes.forEach(attr => {
                            if (attr.key && attr.value !== undefined) {
                                this.addAttributeRow(attr.key, attr.value, attr.dataType || DATA_TYPES.string);
                            }
                        });
                    }
                    this.saveFormState();
                    Utils.showStatus(document.getElementById('statusMessage'), 'History restored!', 'success');
                } else if (apiType === 'activity') {
                    // Generate cURL for Activity API from history
                    this.generateActivityCurlFromHistory(call);
                }
            }
        });
    }

    /**
     * Generate Activity API cURL from history data
     */
    generateActivityCurlFromHistory(call) {
        try {
            const statusMessage = document.getElementById('statusMessage');
            
            console.log('History call data:', call);
            console.log('historyPayload from history:', call.historyPayload);
            
            // If we have the exact payload from history, use it directly (most reliable)
            if (call.historyPayload && Array.isArray(call.historyPayload) && call.historyPayload.length > 0) {
                const bearerToken = document.getElementById('activityApiKey').value.trim();
                if (!bearerToken) {
                    Utils.showStatus(statusMessage, 'Please enter your Activity API Bearer Token to generate cURL', 'warning', 4000);
                    return;
                }

                // Generate cURL directly from stored payload
                const curl = APIHandler.generateActivityCurl(bearerToken, call.region, call.historyPayload);
                this.displayCurl(curl);
                
                // Show informative message
                const numActivities = call.historyPayload.length;
                const message = `Activity API cURL generated from history (${numActivities} activities restored with full parameters)`;
                Utils.showStatus(statusMessage, message, 'info', 5000);
                return;
            }
            
            // Fallback: reconstruct from activities or activity names
            const activities = call.activities && call.activities.length > 0 ? call.activities : (
                Array.isArray(call.attributes) ? call.attributes.map(actName => ({
                    activity_name: actName,
                    activity_params: {}
                })) : []
            );
            
            if (activities.length === 0) {
                Utils.showStatus(statusMessage, 'No activity data available in history', 'error', 4000);
                return;
            }

            // Use stored identity and source, or fallback to defaults
            const identity = call.identity || 'restored_identity';
            const activitySource = call.activitySource || 'history_restore';

            // Build payload using API Handler
            const payload = APIHandler.buildActivityPayload(call.listId, identity, activitySource, activities);
            
            // Get bearer token from form (user needs to provide it)
            const bearerToken = document.getElementById('activityApiKey').value.trim();
            if (!bearerToken) {
                Utils.showStatus(statusMessage, 'Please enter your Activity API Bearer Token to generate cURL', 'warning', 4000);
                return;
            }

            // Generate cURL
            const curl = APIHandler.generateActivityCurl(bearerToken, call.region, payload);
            this.displayCurl(curl);
            
            // Show informative message
            const message = `Activity API cURL generated from history (${activities.length} activities). Identity: ${identity}, Source: ${activitySource}`;
            Utils.showStatus(statusMessage, message, 'info', 5000);
        } catch (error) {
            Utils.showStatus(document.getElementById('statusMessage'), `Error: ${error.message}`, 'error', 4000);
        }
    }

    /**
     * Clear all history
     */
    clearHistory() {
        if (confirm('Are you sure you want to clear all call history?')) {
            chrome.storage.local.set({ callHistory: [] });
            this.loadHistory();
            Utils.showStatus(document.getElementById('statusMessage'), 'History cleared!', 'success');
        }
    }
}
