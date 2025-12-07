# Debugging Guide for Activity API v2

## How to View Logs

### Background Service Worker Logs (Most Important)
To see the detailed request/response logs from the background service worker:

1. **Open Chrome Extensions Page**
   - Go to `chrome://extensions/`
   - Make sure "Developer mode" is enabled (toggle in top right)

2. **Find Your Extension**
   - Search for "Netcore Contact API" or your extension name
   - Look for "Inspect views" section

3. **Click "Inspect views: service worker"**
   - This opens the DevTools for the background service worker
   - All `console.log()` statements from background.js will appear here

4. **Look for Activity API Logs**
   - When you trigger an activity API call, look for logs marked:
     - `=== ACTIVITY API REQUEST ===`
     - `=== ACTIVITY API RESPONSE ===`
     - `=== ACTIVITY API ERROR ===`

### What the Logs Show

#### Activity API Request Log
```
=== ACTIVITY API REQUEST ===
Endpoint: https://api2.netcoresmartech.com/v1/activity/upload
Bearer Token: [First 20 chars of token]...
Payload: [Complete JSON payload being sent]
Request Headers: {
  'Authorization': 'Bearer [token]',
  'Content-Type': 'application/json'
}
```

**Check this to verify:**
- ✅ Correct endpoint URL
- ✅ Bearer token is present
- ✅ Payload structure matches API requirements
- ✅ All required fields in the payload

#### Activity API Response Log
```
=== ACTIVITY API RESPONSE ===
Status: [HTTP Status Code]
Status Text: [e.g., "OK", "Forbidden", "Unauthorized"]
Response Headers: {
  'content-type': 'application/json',
  'x-amz-apigw-id': '[Request ID]',
  'x-amzn-requestid': '[Request ID]'
}
Response Body: [Full response from API]
```

**Check this to verify:**
- ✅ Status code (200-299 = success, 4xx = client error, 5xx = server error)
- ✅ Response body content

### Popup/Content Script Logs
To see logs from the popup.js or popup.html:

1. **Right-click the extension icon** in the top right of Chrome
2. **Select "Inspect"** 
3. This opens DevTools for the popup window
4. Check the **Console** tab for any errors or logs

## Common Issues & Solutions

### CORS Error (403 Forbidden)
**Error Message:**
```
Access to fetch at 'https://api2.netcoresmartech.com/v1/activity/upload' 
from origin 'chrome-extension://...' has been blocked by CORS policy
```

**Causes:**
- Request is coming from popup script instead of background worker
- API endpoint doesn't accept the request origin
- Missing/invalid authentication header

**Solution:**
- ✅ All Activity API calls should go through background.js
- ✅ Check bearer token is valid and not expired
- ✅ Verify endpoint URL is correct

### 403 Forbidden with MissingAuthenticationTokenException
**Error Response:**
```json
{
  "x-amzn-errortype": "MissingAuthenticationTokenException",
  "x-amzn-requestid": "[request-id]"
}
```

**Causes:**
- Bearer token is missing or invalid
- Bearer token format is incorrect
- Token has expired

**Solution:**
1. Check the request logs - verify Bearer token is present
2. Verify token format: `Authorization: Bearer <token>`
3. Get a fresh authentication token
4. Check token hasn't expired

### Empty or Malformed Payload
**Solution:**
1. Look at the logged payload in `=== ACTIVITY API REQUEST ===`
2. Verify it includes:
   ```json
   [
     {
       "asset_id": "string",
       "activity_name": "string",
       "timestamp": "YYYY-MM-DDTHH:MM:SS",
       "identity": "string",
       "activity_source": "string",
       "activity_params": { /* parameters */ }
     }
   ]
   ```

## Step-by-Step Debugging Process

### 1. Check Background Worker Logs First
- Open Service Worker DevTools (chrome://extensions)
- Trigger the Activity API call from the extension popup
- Look for `=== ACTIVITY API REQUEST ===` log

### 2. Verify Request Details
- ✅ Endpoint URL is correct for the selected region
- ✅ Bearer token is present (not empty)
- ✅ Payload structure is valid JSON array

### 3. Check the Response
- Look for `=== ACTIVITY API RESPONSE ===` log
- Check HTTP status code
- Read response body for error messages

### 4. Examine Error Details
- Look for `=== ACTIVITY API ERROR ===` if request failed
- Check error message and stack trace
- Note the exact error for troubleshooting

### 5. Compare with cURL
- Use the "Generate cURL" button to see the exact request
- Run that cURL in terminal to verify the API endpoint works
- Compare the terminal output with extension logs

## Testing the API Endpoint

### Using cURL from Terminal
```bash
curl -X POST 'https://api2.netcoresmartech.com/v1/activity/upload' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '[{
    "asset_id": "test-asset",
    "activity_name": "test_activity",
    "timestamp": "2025-12-07T10:30:00",
    "identity": "test@example.com",
    "activity_source": "web",
    "activity_params": {"key": "value"}
  }]'
```

### Expected Success Response (200-299)
- Status: 200 OK or 201 Created
- Body: Success message or confirmation

### Expected Error Response (400-499)
- Status: 403 Forbidden (auth issue) or 400 Bad Request (payload issue)
- Body: Error message with details

## Environment Variable Checks

Before testing, verify:
1. **Bearer Token**: Valid and not expired
2. **Endpoint URL**: Correct region (US/India/EU)
3. **Payload Structure**: All required fields present
4. **Activity Name**: Not empty
5. **Identity/Asset ID**: Valid values

## Log Retention

- Service Worker logs persist until the extension is reloaded
- Reload the extension if you don't see recent logs
- Keep logs from a successful request to compare with failed attempts

---

**Need Help?** Check the logs first - they contain all the information needed to diagnose the issue!
