// UI Manager - Handles all UI interactions and updates

class UIManager {
    constructor() {
        this.attributeCounter = 0;
    }

    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        document.getElementById('addAttributeBtn').addEventListener('click', () => this.addAttributeRow());
        document.getElementById('generateCurlBtn').addEventListener('click', () => this.handleGenerateCurl());
        document.getElementById('triggerApiBtn').addEventListener('click', () => this.handleTriggerAPI());
        document.getElementById('copyCurlBtn').addEventListener('click', () => this.handleCopyCurl());
        document.getElementById('copyResponseBtn').addEventListener('click', () => this.handleCopyResponse());
        document.getElementById('closeResponseBtn').addEventListener('click', () => this.closeResponseSection());
        document.getElementById('toggleApiKey').addEventListener('click', () => this.toggleApiKeyVisibility());
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

        // Add remove listener
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

            // Save to history
            this.addToHistory({
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
        chrome.storage.local.set({ formData: formData });
    }

    /**
     * Load form state from local storage
     */
    loadFormState() {
        chrome.storage.local.get(['formData'], (result) => {
            if (result.formData) {
                const data = result.formData;

                document.getElementById('region').value = data.region || '';
                document.getElementById('apiKey').value = data.apiKey || '';
                document.getElementById('activity').value = data.activity || '';
                document.getElementById('listId').value = data.listId || '';

                // Load attributes
                if (data.attributes && data.attributes.length > 0) {
                    // Clear default attribute row first
                    document.getElementById('attributesContainer').innerHTML = '';
                    data.attributes.forEach(attr => {
                        this.addAttributeRow(attr.key, attr.value, attr.dataType);
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
                region: callData.region,
                activity: callData.activity,
                listId: callData.listId,
                attributes: callData.attributes,
                response: callData.response,
                status: callData.status
            };
            history.unshift(call); // Add to beginning
            if (history.length > 50) history.pop(); // Keep max 50 items
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
            
            if (history.length === 0) {
                historyContainer.innerHTML = '<p class="no-history">No call history yet</p>';
                return;
            }

            historyContainer.innerHTML = history.map(call => `
                <div class="history-item" data-call-id="${call.id}">
                    <div class="history-header">
                        <span class="history-time">${call.timestamp}</span>
                        <span class="history-activity ${call.activity}">${call.activity}</span>
                        <span class="history-status ${call.status >= 200 && call.status < 300 ? 'success' : 'error'}">
                            ${call.status}
                        </span>
                    </div>
                    <div class="history-details">
                        <small>${call.region} | ${call.attributes.length} attributes</small>
                    </div>
                    <button class="btn-history-restore" data-call-id="${call.id}">Restore</button>
                </div>
            `).join('');

            // Add event listeners for restore buttons
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
                document.getElementById('region').value = call.region;
                document.getElementById('activity').value = call.activity;
                document.getElementById('listId').value = call.listId || '';
                
                // Clear and restore attributes
                document.getElementById('attributesContainer').innerHTML = '';
                call.attributes.forEach(attr => {
                    this.addAttributeRow(attr.key, attr.value, attr.dataType);
                });
                
                this.saveFormState();
                Utils.showStatus(document.getElementById('statusMessage'), 'History restored!', 'success');
            }
        });
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
