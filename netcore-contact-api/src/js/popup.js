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

    // Clear history button
    document.getElementById('clearHistoryBtn').addEventListener('click', () => {
        uiManager.clearHistory();
    });
    
    // Add initial attribute row if none exist
    if (document.querySelectorAll('.attribute-row').length === 0) {
        uiManager.addAttributeRow();
    }
});
