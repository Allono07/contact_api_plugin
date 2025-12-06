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

        // Return true to indicate we'll respond asynchronously
        return true;
    }
});

/**
 * Trigger API request
 */
async function triggerAPIRequest(endpoint, queryParams, bodyParams) {
    const url = new URL(endpoint);

    // Add query parameters
    Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });

    // Build form data
    const formData = new URLSearchParams(bodyParams);

    try {
        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });

        const responseBody = await response.text();

        return {
            status: response.status,
            statusText: response.statusText,
            body: responseBody
        };
    } catch (error) {
        throw new Error(`API request failed: ${error.message}`);
    }
}
