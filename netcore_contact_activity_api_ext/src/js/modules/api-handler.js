// API Handler - Manages all API interactions

class APIHandler {
    /**
     * Build query parameters
     */
    static buildQueryParams(apiKey, activity, listId) {
        const params = {
            type: API_CONFIG.type,
            activity: activity,
            apikey: apiKey
        };

        if (listId) {
            params.listid = parseInt(listId, 10);
        }

        return params;
    }

    /**
     * Build request body
     */
    static buildRequestBody(attributes) {
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

        return bodyParams;
    }

    /**
     * Generate cURL command
     */
    static generateCurl(endpoint, queryParams, bodyParams) {
        let curl = `curl -X POST "${endpoint}?${this.buildQueryString(queryParams)}"`;

        // Add headers
        curl += ` \\\n  --header 'Content-Type: application/x-www-form-urlencoded'`;

        // Add data
        // Use --data-urlencode for cleaner usage while ensuring correct encoding
        if (bodyParams.data) {
            curl += ` \\\n  --data-urlencode 'data=${bodyParams.data}'`;
        } else {
            const dataParams = new URLSearchParams(bodyParams);
            curl += ` \\\n  -d "${dataParams.toString()}"`;
        }

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

    /**
     * Build Activity API payload with multiple activities
     * @param {string} assetId - Static asset ID for all activities
     * @param {string} identity - Static identity for all activities
     * @param {string} activitySource - Static activity source (app/web)
     * @param {Array} activities - Array of activity objects with activity_name and activity_params
     */
    static buildActivityPayload(assetId, identity, activitySource, activities) {
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19);

        // Build payload array with all activities
        return activities.map(activity => ({
            asset_id: assetId,
            activity_name: activity.activity_name,
            timestamp: timestamp,
            identity: identity,
            activity_source: activitySource,
            activity_params: activity.activity_params
        }));
    }

    /**
     * Generate cURL for Activity API with region
     */
    static generateActivityCurl(bearerToken, region, payload) {
        const endpoint = ACTIVITY_ENDPOINTS[region] || ACTIVITY_ENDPOINTS.us;
        const payloadStr = JSON.stringify(payload);
        
        let curl = `curl --location '${endpoint}' \\`;
        curl += `\n  --header 'Authorization: Bearer ${bearerToken}' \\`;
        curl += `\n  --header 'Content-Type: application/json' \\`;
        curl += `\n  --data '${payloadStr}'`;

        return curl;
    }

    /**
     * Trigger Activity API request via background script with region
     */
    static async triggerActivityAPI(bearerToken, region, payload) {
        const endpoint = ACTIVITY_ENDPOINTS[region] || ACTIVITY_ENDPOINTS.us;
        
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                {
                    action: 'triggerActivityAPI',
                    endpoint: endpoint,
                    bearerToken: bearerToken,
                    payload: payload
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
}
