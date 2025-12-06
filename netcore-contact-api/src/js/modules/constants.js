// Constants for the extension

const ENDPOINTS = {
    us: 'https://api.netcoresmartech.com/apiv2',
    in: 'https://apiin.netcoresmartech.com/apiv2',
    eu: 'https://jsonapi.eu-north-1.eu.netcoresmartech.com/apiv2'
};

const ACTIVITIES = {
    add: { value: 'add', label: 'Add', isSync: false },
    update: { value: 'update', label: 'Update', isSync: false },
    delete: { value: 'delete', label: 'Delete', isSync: false },
    addsync: { value: 'addsync', label: 'Add Sync (Synchronous API)', isSync: true }
};

const DATA_TYPES = {
    string: 'string',
    float: 'float',
    number: 'number',
    date: 'date'
};

const API_CONFIG = {
    type: 'contact',
    timeout: 30000
};
