# CSV Event Sheet Upload Guide

## CSV Format

The CSV file should have exactly 3 columns: `eventName`, `eventPayload`, `dataType`

### Column Descriptions

- **eventName**: Name of the activity/event (e.g., `sign_up`, `user_profile_push`). Leave empty for subsequent parameters of the same event.
- **eventPayload**: Parameter name or array notation (e.g., `seat_type`, `items[].variant_id`). For array items, use `arrayName[].fieldName` format.
- **dataType**: Data type for sample value generation. Supported values:
  - `text` or `string` → generates "Sample Text"
  - `integer` or `int` → generates 42
  - `float` or `decimal` → generates 42.5
  - `date` or `datetime` → generates current timestamp (ISO format)
  - `boolean` → generates true

### CSV Example

```csv
eventName,eventPayload,dataType
sign_up,seat_type,text
,seat number,integer
,movie,text
,screen,text
,date,date
,location,text
,experience,text
,amount,float
user_profile_push,seat_type,text
,seat number,integer
,movie,text
,screen,text
,date,date
,location,text
,experience,text
,amount,float
clicked,revenue,float
product_purchase,items[].variant_id,text
,items[].prname,text
,items[].price,float
,items[].prid,text
,items[].brand,text
appointment_click,user_type,text
```

## How It Works

1. Click "Upload & Parse CSV" button in the Activity API section
2. Select your CSV file (must have eventName, eventPayload, dataType columns)
3. The parser will:
   - Extract all events and their parameters
   - Generate sample values based on data types
   - Create activity rows with pre-filled parameters
   - Handle array parameters (e.g., `items[]`)

4. After upload:
   - All activities are automatically added to the form
   - You can still add, edit, or remove individual activities
   - Generate cURL or trigger API as normal

## Notes

- Sample values are auto-generated for demonstration. Edit them as needed before triggering.
- Array parameters are represented with `[]` notation and will create sample array items with all fields.
- Events with the same name in different rows will be grouped into one activity.
- The CSV parser is case-insensitive for data types.
