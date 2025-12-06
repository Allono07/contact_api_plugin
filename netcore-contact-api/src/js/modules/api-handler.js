// API Handler - Manages all API interactions

class APIHandler {
    /**
     * Build query parameters
     */
    static buildQueryParams(apiKey, activity) {
        return {
            type: API_CONFIG.type,
            activity: activity,
            apikey: apiKey
        };
    }

    /**
     * Build request body
     */
    static buildRequestBody(listId, attributes) {
        const dataObject = {};

        // Add attributes to data object
        attributes.forEach(attr => {
            if (attr.key && attr.value !== '') {
                const formattedValue = Utils.formatValue(attr.value, attr.dataType);
                if (formattedValue !== null) {
                    // Store as object temporarily for proper JSON formatting
                    dataObject[attr.key] = attr.value;
                }
            }
        });

        const bodyParams = {
            data: JSON.stringify(dataObject)
        };

        if (listId) {
            bodyParams.listid = parseInt(listId, 10);
        }

        return bodyParams;
    }

    /**
     * Generate cURL command
     */
    static generateCurl(endpoint, queryParams, bodyParams) {
        let curl = `curl -X POST "${endpoint}?${this.buildQueryString(queryParams)}"`;

        // Add headers
        curl += ` \\\n  -H "Content-Type: application/x-www-form-urlencoded"`;

        // Add data
        const dataParams = new URLSearchParams(bodyParams);
        curl += ` \\\n  -d "${dataParams.toString()}"`;

        return curl;
    }

    /**
     * Build query string
     */
    static buildQueryString(params) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            queryParams.append(key, value);
        });
        return queryParams.toString();
    }

    /**
     * Trigger API request via background script
     */
    static async triggerAPI(endpoint, queryParams, bodyParams) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                {
                    action: 'triggerAPI',
                    endpoint: endpoint,
                    queryParams: queryParams,
                    bodyParams: bodyParams
                },
                (response) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else if (response && response.success) {
                        resolve(response.data);
                    } else {
                        reject(new Error(response?.error || 'Unknown error occurred'));
                    }
                }
            );
        });
    }

    /**
     * Format API response for display
     */
    static formatResponse(response) {
        try {
            return {
                status: response.status,
                statusText: response.statusText,
                body: typeof response.body === 'string' ? 
                    JSON.parse(response.body) : response.body
            };
        } catch (e) {
            return {
                status: response.status,
                statusText: response.statusText,
                body: response.body
            };
        }
    }

    /**
     * Get call history
     */
    static getCallHistory() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['callHistory'], (result) => {
                resolve(result.callHistory || []);
            });
        });
    }
}
