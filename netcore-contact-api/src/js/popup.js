// Main Popup Script

let uiManager;

document.addEventListener('DOMContentLoaded', () => {
    uiManager = new UIManager();
    uiManager.initializeEventListeners();
    uiManager.loadFormState();
    uiManager.loadHistory();

    // Save form state when inputs change
    document.getElementById('region').addEventListener('change', () => uiManager.saveFormState());
    document.getElementById('apiKey').addEventListener('change', () => uiManager.saveFormState());
    document.getElementById('activity').addEventListener('change', () => uiManager.saveFormState());
    document.getElementById('listId').addEventListener('change', () => uiManager.saveFormState());
    
    // Activity API form state listeners - Updated for new fields (with null checks)
    const activityApiKey = document.getElementById('activityApiKey');
    const activityRegion = document.getElementById('activityRegion');
    const assetId = document.getElementById('assetId');
    const identity = document.getElementById('identity');
    const activitySource = document.getElementById('activitySource');
    
    if (activityApiKey) activityApiKey.addEventListener('change', () => uiManager.saveFormState());
    if (activityRegion) activityRegion.addEventListener('change', () => uiManager.saveFormState());
    if (assetId) assetId.addEventListener('change', () => uiManager.saveFormState());
    if (identity) identity.addEventListener('change', () => uiManager.saveFormState());
    if (activitySource) activitySource.addEventListener('change', () => uiManager.saveFormState());
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            
            // Remove active from all tabs and buttons
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            
            // Add active to clicked button and corresponding tab
            e.target.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
            
            if (tabName === 'history') {
                uiManager.loadHistory();
            }
        });
    });

    // API type switching
    document.querySelectorAll('.api-type-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const apiType = e.target.getAttribute('data-api');
            
            // Update active button
            document.querySelectorAll('.api-type-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Show/hide API sections
            const contactSection = document.getElementById('contact-section');
            const activitySection = document.getElementById('activity-section');
            
            if (apiType === 'contact') {
                contactSection.style.display = 'block';
                activitySection.style.display = 'none';
            } else {
                contactSection.style.display = 'none';
                activitySection.style.display = 'block';
            }
            
            // Save API type preference
            chrome.storage.local.set({ currentApiType: apiType });
        });
    });
    
    // Load saved API type preference
    chrome.storage.local.get('currentApiType', (result) => {
        const apiType = result.currentApiType || 'contact';
        const activeButton = document.querySelector(`[data-api="${apiType}"]`);
        if (activeButton) {
            activeButton.click();
        }
    });

    // Clear history button
    document.getElementById('clearHistoryBtn').addEventListener('click', () => {
        uiManager.clearHistory();
    });
    
    // Add initial attribute row if none exist
    if (document.querySelectorAll('.attribute-row').length === 0) {
        uiManager.addAttributeRow();
    }
});
