# Activity API v2 - Complete Implementation Guide

## Overview

The Activity API has been fully updated to support:
- ✅ **3 Regional Endpoints** (US, India, EU) - dynamically selected
- ✅ **Multiple Activities** per request - each with custom names
- ✅ **Dynamic Activity Names** - user-typed instead of dropdown
- ✅ **Complex Nested Array Parameters** - with array item builder UI
- ✅ **Named Array Support** - define array name and structure
- ✅ **Form Persistence** - all data saved/restored across sessions

---

## Key Changes & Features

### 1. **Regional Endpoints** 
**File**: `src/js/modules/constants.js`

```javascript
const ACTIVITY_ENDPOINTS = {
    us: 'https://api2.netcoresmartech.com/v1/activity/upload',
    in: 'https://apiin2.netcoresmartech.com/v1/activity/upload',
    eu: 'https://apieu2.netcoresmartech.com/v1/activity/upload'
};
```

- User selects region (US, India, EU) in dropdown
- Endpoint dynamically changes based on selection
- Passed to API handler which sends to background service worker

---

### 2. **Multiple Activities with Dynamic Names**
**Files**: `src/popup.html`, `src/js/modules/ui-manager.js`

#### HTML Structure:
```html
<div class="form-group">
    <label>Activities</label>
    <div id="activitiesContainer" class="activities-container">
        <!-- Activity rows added dynamically -->
    </div>
    <button id="addActivityBtn" class="btn btn-secondary">+ Add Activity</button>
</div>
```

#### Features:
- **+ Add Activity** button creates new activity row
- Each activity has:
  - **Activity Name** text input (e.g., "Booking_Created", "Purchase_Complete")
  - **Dynamic Parameters** specific to that activity
  - **Remove Activity** button

#### UI Manager Methods:
```javascript
addActivityRow(activityName = '', params = {})
  // Creates activity row with header and parameter container
  
getActivities()
  // Returns array of activity objects:
  // [{
  //   activity_name: "Booking_Created",
  //   activity_params: { ...params }
  // }]
```

---

### 3. **Advanced Array Parameter Builder**
**File**: `src/js/modules/ui-manager.js`

#### Workflow:

**Step 1: Select Array Type**
```
Parameter Row:
[Key: "items"] [Value: "..."] [Type: Array (JSON)] [Array Builder] [Remove]
```

**Step 2: Click "Array Builder" Button**
Opens nested structure UI:
```
Array Items Section:
  ├─ Item #1 (with fields)
  │  ├─ [Field Name] [Field Value] [Remove Field]
  │  ├─ [Field Name] [Field Value] [Remove Field]
  │  └─ + Add Field
  │
  ├─ Item #2 (with fields)
  │  ├─ [Field Name] [Field Value] [Remove Field]
  │  └─ + Add Field
  │
  └─ + Add Array Item
```

#### Example - Building Items Array:

**Input UI:**
```
Activity: "Purchase_Complete"

Parameter: "items" (Array type)
  Array Builder opens:
  
  Item #1:
  - product_name: "Laptop"
  - price: 50000
  - quantity: 1
  
  Item #2:
  - product_name: "Mouse"
  - price: 500
  - quantity: 2
```

**Generated Payload:**
```json
{
  "items": [
    {
      "product_name": "Laptop",
      "price": 50000,
      "quantity": 1
    },
    {
      "product_name": "Mouse",
      "price": 500,
      "quantity": 2
    }
  ]
}
```

#### UI Manager Array Methods:
```javascript
toggleArrayBuilder(paramId, container)
  // Show/hide array builder section
  
addArrayItemRow(paramId, container, itemIndex, itemData)
  // Add nested object row to array
  // Creates fields container for object properties
  
addArrayFieldRow(itemId, container, fieldKey, fieldValue)
  // Add key-value field to array item
```

---

### 4. **Fixed vs Dynamic Fields**

#### Fixed Fields (Same for all activities):
```javascript
- bearerToken     // API authentication
- region          // Endpoint selection (US/India/EU)
- assetId         // Asset identifier
- identity        // Phone/email
- activitySource  // "app" or "web"
```

#### Dynamic Fields (Per activity):
```javascript
- activity_name   // User-typed activity name
- activity_params // Custom parameters for that activity
  ├─ Simple types (string, number, float, date)
  └─ Complex types (arrays with nested objects)
```

---

### 5. **API Payload Structure**

**Request to Activity API:**
```json
[
  {
    "asset_id": "12345",
    "activity_name": "Booking_Created",
    "timestamp": "2025-12-07T15:30:45",
    "identity": "user@email.com",
    "activity_source": "app",
    "activity_params": {
      "booking_id": "BK123",
      "amount": 5000.50,
      "items": [
        {
          "product_name": "Flight Ticket",
          "price": 5000,
          "seats": 2
        }
      ]
    }
  },
  {
    "asset_id": "12345",
    "activity_name": "Purchase_Complete",
    "timestamp": "2025-12-07T15:30:46",
    "identity": "user@email.com",
    "activity_source": "app",
    "activity_params": {
      "order_id": "ORD456",
      "total_amount": 12500,
      "items": [...]
    }
  }
]
```

---

### 6. **Error Fixes Applied**

**Issue 1: Null Reference Errors**
- **Solution**: Added null checks in popup.js before adding event listeners
- All Activity API field references now check if element exists

**Issue 2: Form State Persistence**
- **Solution**: Enhanced loadFormState() with safe DOM element access
- Gracefully handles missing elements when contact/activity tabs switch

**Issue 3: Array Parameter Handling**
- **Solution**: Implemented Array Builder UI instead of simple JSON input
- Users can visually build nested objects without writing JSON
- Fallback: Direct JSON paste still supported

---

### 7. **Data Type Support**

For **normal parameters**:
- **String**: Text values
- **Number**: Integers (e.g., 100)
- **Float**: Decimals (e.g., 99.99)
- **Date**: YYYY-MM-DD or YYYY-MM-DD HH:MM:SS format

For **array parameters**:
- Each item is a JSON object
- Fields can be strings, numbers, floats, or dates
- Arrays can't be nested (single level only)
- Multiple items supported in one array

---

### 8. **Form State Persistence**

**Saved Data Structure:**
```javascript
chrome.storage.local.set({
  formData: { /* Contact API form */ },
  activityFormData: {
    bearerToken: "token...",
    region: "us",
    assetId: "12345",
    identity: "email@domain.com",
    activitySource: "app",
    activities: [
      {
        name: "Booking_Created",
        params: {
          booking_id: { value: "BK123", dataType: "string", isArrayName: false },
          items: { 
            value: "...", 
            dataType: "array", 
            isArrayName: true,
            arrayItems: [ /* restored array data */ ]
          }
        }
      }
    ]
  }
});
```

---

### 9. **User Workflow**

#### Step 1: Select Region
```
[Dropdown] → US | India | EU
```

#### Step 2: Fill Static Fields
```
Bearer Token: [input]
Asset ID: [input]
Identity: [input]
Activity Source: [select app/web]
```

#### Step 3: Add Activities
```
[+ Add Activity]
  ├─ Activity #1
  │  ├─ Activity Name: [input]
  │  ├─ + Add Parameter
  │  │  ├─ [param key] [param value] [type select] [Remove]
  │  │  ├─ [param key] [Array (JSON)] [Array Builder] [Remove]
  │  │  │  └─ Array Builder UI (visual item editor)
  │  │  └─ + Add Parameter
  │  └─ [Remove Activity]
  │
  └─ Activity #2
     ├─ Activity Name: [input]
     ├─ + Add Parameter
     └─ [Remove Activity]
```

#### Step 4: Generate & Execute
```
[Generate cURL] → Shows curl command
[Trigger API] → Executes API
```

---

### 10. **Files Modified Summary**

| File | Changes |
|------|---------|
| `constants.js` | Updated ACTIVITY_ENDPOINTS with 3 regions |
| `popup.html` | Removed dropdown, added region selector, dynamic activities container |
| `popup.js` | Added null checks for Activity fields, removed hardcoded field listeners |
| `api-handler.js` | Updated buildActivityPayload & generateActivityCurl for region & multiple activities |
| `ui-manager.js` | **Major**: Added array builder UI, nested object handling, form persistence |
| `background.js` | Already configured for dynamic endpoints ✓ |
| `popup.css` | (No changes needed - styling already in place) |

---

### 11. **Testing Checklist**

- [ ] Region dropdown shows US, India, EU options
- [ ] Changing region updates the API endpoint in generated cURL
- [ ] "Add Activity" button creates new activity row
- [ ] Activity names accept any text input (not dropdown)
- [ ] Parameters can be added/removed per activity
- [ ] Array type selection shows "Array Builder" button
- [ ] Array Builder button opens nested object UI
- [ ] Can add multiple items to array
- [ ] Can add multiple fields to each item
- [ ] Array data is properly formatted in cURL and payload
- [ ] Form state persists across popup close/reopen
- [ ] Multiple activities are sent in single API request
- [ ] cURL shows proper Bearer token header
- [ ] cURL shows correct regional endpoint URL

---

### 12. **Example: Complete Activity with Arrays**

```
Activity Name: "Purchase_Completed"

Parameters:
1. order_id: "ORD12345" (String)
2. total_amount: "10000.50" (Float)
3. items: [Array] → Array Builder
   Item #1:
   - product_name: "Laptop"
   - price: "50000"
   - discount: "5000"
   
   Item #2:
   - product_name: "Mouse"
   - price: "500"
   - quantity: "2"

4. customer_tier: "premium" (String)

Generated activity_params:
{
  "order_id": "ORD12345",
  "total_amount": 10000.50,
  "items": [
    {
      "product_name": "Laptop",
      "price": "50000",
      "discount": "5000"
    },
    {
      "product_name": "Mouse",
      "price": "500",
      "quantity": "2"
    }
  ],
  "customer_tier": "premium"
}
```

---

### 13. **Known Limitations & Design Decisions**

1. **Single-level Arrays Only** - No nested arrays (as per requirement)
2. **No Array Name Checkbox** - Currently marks all arrays as named (can be enhanced)
3. **JSON Fallback** - Users can paste JSON directly in value field instead of using Array Builder
4. **Auto-Timestamp** - Always ISO format in device timezone
5. **No Field Validation** - Type validation happens on API response

---

## Version

- **Extension Version**: 1.2.0
- **Activity API Support**: ✅ v2 - Full Featured
- **Features**: Multi-region, Multiple activities, Complex arrays, Form persistence

---

## Support

For issues or questions about the Activity API v2 implementation, refer to:
- Generated cURL commands (visible in UI)
- API response messages (shown in response section)
- Browser console (for detailed error messages)
