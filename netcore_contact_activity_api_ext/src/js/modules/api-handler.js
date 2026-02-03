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
    static buildActivityPayload(assetId, identity, anonId, activitySource, activities, systemAttributes = []) {
        // Use local time instead of UTC
        const now = new Date();
        const pad = (n) => n.toString().padStart(2, '0');
        const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

        // Build payload array with all activities
        return activities.map(activity => {
            const item = {
                asset_id: assetId,
                activity_name: activity.activity_name,
                timestamp: timestamp,
                identity: identity,
                activity_source: activitySource,
                activity_params: activity.activity_params
            };

            if (anonId) {
                item.anonid = anonId;
            }

            // Add system attributes
            systemAttributes.forEach(attr => {
                 let val = attr.value;
                 if (attr.dataType === 'number' || attr.dataType === 'float') {
                     val = Number(val);
                 }
                 item[attr.key] = val;
            });

            return item;
        });
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

    // --- V5 Methods ---

    /**
     * Build V5 Payload
     */
    static buildV5Payload(formData) {
        const { operation, contactType, audienceId, identity, systemAttributes, customAttributes } = formData;
        
        const attributesObj = {};
        customAttributes.forEach(attr => {
             if (attr.key && attr.value !== '') {
                 const formatted = Utils.formatValue(attr.value, attr.type);
                 if (formatted !== null) attributesObj[attr.key] = formatted;
             }
        });

        const contactObj = {
            attributes: attributesObj
        };

        if (identity && contactType === 'identified') contactObj.identity = identity;
        
        systemAttributes.forEach(attr => {
            if (attr.key && attr.value !== '') {
                 const formatted = Utils.formatValue(attr.value, attr.type);
                 if (formatted !== null) contactObj[attr.key] = formatted;
            }
        });

        const audienceIdVal = audienceId ? parseInt(audienceId) : 1;
        const audienceDetails = [{
            audience_id: [ audienceIdVal ],
            audience_type: "list"
        }];

        const payload = {
            data: {
                contact_type: contactType,
                contacts: []
            }
        };

        if (contactType === 'identified') {
            if (operation === 'create') {
                payload.data.contacts.push(contactObj);
                payload.data.audience_details = audienceDetails;
            } else if (operation === 'update') {
                contactObj.audience_details = audienceDetails;
                payload.data.contacts.push(contactObj);
            }
        } else {
            // Anonymous
            payload.data.contacts.push(contactObj);
        }

        return payload;
    }

    /**
     * Generate V5 Curl
     */
    static generateV5Curl(endpoint, apiKey, payload) {
        const payloadStr = JSON.stringify(payload, null, 2);
        
        let curl = `curl --request POST \\`;
        curl += `\n     --url ${endpoint} \\`;
        curl += `\n     --header 'Content-Type: application/json' \\`;
        curl += `\n     --header 'accept: application/json' \\`;
        curl += `\n     --header 'api-key: ${apiKey}' \\`;
        curl += `\n     --data '${payloadStr}'`;
        
        return curl; 
    }

    /**
     * Trigger V5 API
     */
    static async triggerV5API(endpoint, apiKey, payload) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                {
                    action: 'triggerV5API',
                    endpoint: endpoint,
                    apiKey: apiKey,
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
