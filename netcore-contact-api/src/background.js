// Background Service Worker - Handles API requests

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'triggerAPI') {
        triggerAPIRequest(request.endpoint, request.queryParams, request.bodyParams)
            .then(response => {
                sendResponse({ success: true, data: response });
            })
            .catch(error => {
                sendResponse({ success: false, error: error.message });
            });
        return true;
    } else if (request.action === 'triggerActivityAPI') {
        triggerActivityAPIRequest(request.endpoint, request.bearerToken, request.payload)
            .then(response => {
                sendResponse({ success: true, data: response });
            })
            .catch(error => {
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }
});

/**
 * Trigger Contact API request
 */
async function triggerAPIRequest(endpoint, queryParams, bodyParams) {
    const url = new URL(endpoint);

    // Add query parameters
    Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });

    // Build form data
    const formData = new URLSearchParams(bodyParams);

    console.log('=== CONTACT API REQUEST ===');
    console.log('Endpoint:', url.toString());
    console.log('Query Params:', queryParams);
    console.log('Body Params:', bodyParams);
    console.log('Request Headers:', {
        'Content-Type': 'application/x-www-form-urlencoded'
    });

    try {
        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });

        const responseBody = await response.text();
        
        console.log('=== CONTACT API RESPONSE ===');
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('Response Body:', responseBody);

        return {
            status: response.status,
            statusText: response.statusText,
            body: responseBody
        };
    } catch (error) {
        console.error('=== CONTACT API ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        throw new Error(`API request failed: ${error.message}`);
    }
}

/**
 * Trigger Activity API request
 */
async function triggerActivityAPIRequest(endpoint, bearerToken, payload) {
    console.log('=== ACTIVITY API REQUEST ===');
    console.log('Endpoint:', endpoint);
    console.log('Bearer Token:', bearerToken ? `${bearerToken.substring(0, 20)}...` : 'MISSING');
    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.log('Request Headers:', {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json'
    });
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const responseBody = await response.text();
        
        console.log('=== ACTIVITY API RESPONSE ===');
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('Response Headers:', {
            'content-type': response.headers.get('content-type'),
            'x-amz-apigw-id': response.headers.get('x-amz-apigw-id'),
            'x-amzn-requestid': response.headers.get('x-amzn-requestid')
        });
        console.log('Response Body:', responseBody);

        return {
            status: response.status,
            statusText: response.statusText,
            body: responseBody
        };
    } catch (error) {
        console.error('=== ACTIVITY API ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        throw new Error(`Activity API request failed: ${error.message}`);
    }
}
