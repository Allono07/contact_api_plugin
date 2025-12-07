// Constants for the extension

const ENDPOINTS = {
    us: 'https://api.netcoresmartech.com/apiv2',
    in: 'https://apiin.netcoresmartech.com/apiv2',
    eu: 'https://jsonapi.eu-north-1.eu.netcoresmartech.com/apiv2'
};

const ACTIVITY_ENDPOINTS = {
    us: 'https://api2.netcoresmartech.com/v1/activity/upload',
    in: 'https://apiin2.netcoresmartech.com/v1/activity/upload',
    eu: 'https://apieu2.netcoresmartech.com/v1/activity/upload'
};

const ACTIVITIES = {
    add: { value: 'add', label: 'Add', isSync: false },
    update: { value: 'update', label: 'Update', isSync: false },
    delete: { value: 'delete', label: 'Delete', isSync: false },
    addsync: { value: 'addsync', label: 'Add Sync (Synchronous API)', isSync: true }
};

const ACTIVITY_NAMES = {
    Personal_Profile_Registered: 'Personal Profile Registered',
    Corporate_Profile_Registered: 'Corporate Profile Registered',
    Referral_Activated: 'Referral Activated',
    Cashback_Activated: 'Cashback Activated',
    Inactivity_15d: 'Inactivity 15 Days',
    Inactivity_30d: 'Inactivity 30 Days',
    Promo_Offered: 'Promo Offered',
    Promo_Used: 'Promo Used',
    Trip_Searched_NoBooking: 'Trip Searched (No Booking)',
    Booking_Attempt_Unpaid: 'Booking Attempt Unpaid',
    Booking_Created: 'Booking Created',
    Booking_Cancelled: 'Booking Cancelled',
    Airport_Drop_HomeCity_Completed: 'Airport Drop Home City Completed',
    Airport_Pickup_AwayCity_Completed: 'Airport Pickup Away City Completed',
    Local_Rental_AwayCity_Completed: 'Local Rental Away City Completed',
    Airport_Drop_AwayCity_Completed: 'Airport Drop Away City Completed',
    Airport_Pickup_HomeCity_Completed: 'Airport Pickup Home City Completed',
    Complaint_Received: 'Complaint Received',
    Complaint_Resolved: 'Complaint Resolved',
    NPS_Feedback_Submitted: 'NPS Feedback Submitted',
    NPS_Promoter_Added: 'NPS Promoter Added',
    NPS_Neutral_Added: 'NPS Neutral Added',
    NPS_Detractor_Added: 'NPS Detractor Added',
    Complaint_Reopened: 'Complaint Reopened',
    Reward_Redeemed: 'Reward Redeemed'
};

const DATA_TYPES = {
    string: 'string',
    float: 'float',
    number: 'number',
    date: 'date',
    array: 'array'
};

const API_CONFIG = {
    type: 'contact',
    timeout: 30000
};

const API_TYPES = {
    contact: 'Contact API',
    activity: 'Activity API'
};
