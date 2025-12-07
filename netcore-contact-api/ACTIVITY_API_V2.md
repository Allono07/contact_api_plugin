# Activity API V2 - Complete Redesign

## Overview

The Activity API has been completely redesigned to support:
- ✅ **Dynamic Region Selection** - 3 regions (US, India, EU) with region-specific endpoints
- ✅ **Multiple Activities** - Users can add multiple activities in a single API call
- ✅ **Dynamic Activity Names** - Users type activity names (not selected from dropdown)
- ✅ **Per-Activity Parameters** - Each activity can have its own set of parameters
- ✅ **Complex Nested Arrays** - Support for named arrays containing JSON objects

## Regional Endpoints

Three endpoints are now dynamically selected based on region:

| Region | Endpoint |
|--------|----------|
| **US** | `https://api2.netcoresmartech.com/v1/activity/upload` |
| **India** | `https://apiin2.netcoresmartech.com/v1/activity/upload` |
| **EU** | `https://apieu2.netcoresmartech.com/v1/activity/upload` |

## Key Features

### 1. Region Selector
- New dropdown in Activity API form
- Dynamically selects the correct endpoint
- Saved to form state for persistence

### 2. Multiple Activities Support
Users can now add multiple activities in a single API call:
- Click "+ Add Activity" to create a new activity
- Each activity has:
  - **Activity Name** field (text input - user types the name)
  - **Parameters section** with add/remove buttons
  - **Remove Activity** button

### 3. Dynamic Activity Names
- No longer a dropdown selection
- Users type any activity name they need
- Examples: `Booking_Created`, `Personal_Profile_Registered`, `Custom_Event`, etc.
- Each activity can have a unique name

### 4. Per-Activity Parameters
Each activity can have its own set of parameters:
- Click "+ Add Parameter" within an activity
- Define parameter properties:
  - **Parameter Name** (key)
  - **Parameter Value** (value)
  - **Data Type** (String, Float, Number, Date, Array)

### 5. Complex Nested Array Support
For array-type parameters, users can:
- Mark parameter as "Array Name" checkbox
- Enter JSON array in the value field
- Example structure:
```json
"items": [
  {
    "mrp": 250.0,
    "l2_category": "Moisturizers",
    "l3_category": "Serums & Essence",
    "l1_category": "Skin",
    "price": 250.0,
    "quantity": 1,
    "product_name": "L'Oreal Paris Revitalift Crystal Micro-Essence"
  },
  {
    "l1_category": "Makeup",
    "quantity": 1,
    "mrp": 620.20,
    "product_name": "Maybelline New York Instant Age Rewind Eraser",
    "price": 496.1
  }
]
```

## User Workflow

### 1. Switch to Activity API
Click "Activity API" button in Form tab

### 2. Fill Common Fields (same for all activities)
- **Bearer Token** - API authentication token (password field with show/hide)
- **Region** - Select US, India, or EU
- **Asset ID** - Static ID for all activities
- **Identity** - Phone or email (static for all activities)
- **Activity Source** - Select "app" or "web" (static for all activities)

### 3. Add Activities
1. Click "+ Add Activity"
2. Enter **Activity Name** (e.g., "Booking_Created")
3. Click "+ Add Parameter" within the activity
4. Fill in parameter details:
   - **Parameter Name** (key)
   - **Parameter Value** (value or JSON)
   - **Data Type** (select from dropdown)
   - Check "Array Name" if it's an array parameter
5. Repeat for each parameter
6. Add more activities by clicking "+ Add Activity" again

### 4. Generate cURL
- Click "Generate cURL" button
- cURL command appears with:
  - All activities in the payload
  - Bearer token in Authorization header
  - Region-specific endpoint
  - Proper JSON formatting

### 5. Execute API
- Click "Trigger API"
- Request sent to selected region endpoint
- Response appears with status code
- All activities tracked in history

## Payload Structure Example

For multiple activities with complex parameters:

```json
[
  {
    "asset_id": "12345",
    "activity_name": "Booking_Created",
    "timestamp": "2025-12-07T20:30:00",
    "identity": "user@example.com",
    "activity_source": "web",
    "activity_params": {
      "booking_id": "BK123456",
      "amount": 5000.50,
      "quantity": 2,
      "items": [
        {
          "product_name": "Product A",
          "price": 2500.25,
          "mrp": 3000.0
        },
        {
          "product_name": "Product B",
          "price": 2500.25,
          "mrp": 2500.0
        }
      ]
    }
  },
  {
    "asset_id": "12345",
    "activity_name": "Payment_Completed",
    "timestamp": "2025-12-07T20:30:00",
    "identity": "user@example.com",
    "activity_source": "web",
    "activity_params": {
      "payment_id": "PAY789",
      "status": "success",
      "gateway": "credit_card"
    }
  }
]
```

## Data Types Supported

| Type | Example | Format |
|------|---------|--------|
| **String** | "hello world" | Any text |
| **Number** | 42 | Integer numbers |
| **Float** | 10.5 | Decimal numbers |
| **Date** | "2025-12-07T20:30:00" | YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS |
| **Array** | `[{...}, {...}]` | Valid JSON array (can be marked as array name) |

## Form State Persistence

All Activity API form data is automatically saved:
- Bearer token
- Selected region
- Asset ID, Identity, Activity Source
- All activities with their names
- All parameters with data types and array name markers

Data persists across:
- Popup close/open
- Browser restart (until extension is uninstalled)

## Auto-Generated Fields

**Timestamp** is automatically generated for each request:
- Uses current device time
- Format: ISO 8601 (YYYY-MM-DDTHH:MM:SS)
- Same timestamp applied to all activities in batch

## Key Differences from V1

| Aspect | V1 | V2 |
|--------|----|----|
| **Endpoints** | 1 static endpoint | 3 dynamic endpoints (region selector) |
| **Activity Names** | Dropdown (fixed list) | Text input (user typed) |
| **Activity Count** | 1 per request | Multiple per request |
| **Parameters** | Single set for activity | Per-activity parameters |
| **Flexible Activities** | No | Yes - can add different activity types in one call |

## Files Modified

1. **src/js/modules/constants.js**
   - Updated `ACTIVITY_ENDPOINTS` with 3 regional URLs

2. **src/popup.html**
   - Added region selector dropdown
   - Replaced single activity form with activities container
   - Activity rows with dynamic name input
   - Parameter management per activity
   - Array name checkbox support

3. **src/js/modules/ui-manager.js**
   - New `addActivityRow()` - Creates activity sections
   - Updated `addActivityParamRow()` - Per-activity parameters
   - New `getActivities()` - Collects all activities
   - Updated `handleGenerateActivityCurl()` - Supports region and multiple activities
   - Updated `handleTriggerActivityAPI()` - Supports region and multiple activities
   - Updated form state methods for new structure

4. **src/js/modules/api-handler.js**
   - Updated `buildActivityPayload()` - Accepts array of activities
   - Updated `generateActivityCurl()` - Region parameter
   - Updated `triggerActivityAPI()` - Region parameter and endpoint selection

5. **src/js/popup.js**
   - Updated form listeners for new Activity API fields

## Testing Checklist

- [ ] Region selector dropdown works correctly
- [ ] Selecting region changes endpoint in cURL
- [ ] Can add multiple activities
- [ ] Each activity can have a unique name
- [ ] Activity names accept custom text input
- [ ] Can add parameters to each activity
- [ ] Array type parameters show "Array Name" checkbox
- [ ] JSON array values parse correctly
- [ ] All data types work (string, number, float, date, array)
- [ ] cURL shows correct region endpoint
- [ ] API request sends to correct endpoint
- [ ] Timestamp auto-generates for all activities
- [ ] Form state persists across popup close/open
- [ ] History tracks multiple activities correctly
- [ ] Removing activity removes all its parameters

## Example Usage Scenarios

### Scenario 1: E-commerce Order with Items
**Region:** India
**Activities:** 2
1. **Booking_Created**
   - booking_id: "ORDER123" (string)
   - amount: "5000.50" (float)
   - items: JSON array of products (array)

2. **Payment_Completed**
   - payment_id: "PAY456" (string)
   - amount: "5000.50" (float)
   - status: "success" (string)

### Scenario 2: Complex User Profile Update
**Region:** US
**Activities:** 3
1. **Profile_Updated**
   - fields_changed: JSON array (array)
   
2. **Document_Verified**
   - document_type: "id_proof" (string)
   
3. **Email_Verified**
   - email: "user@example.com" (string)

## Notes

- Timestamp is automatically generated using device timezone
- Each activity in the batch gets the same timestamp
- Array Name checkbox helps identify which parameters are array fields
- Form state is saved automatically on field changes
- History displays activity count for multiple activity requests
- All validations happen before API call
