interface StoredElement {
    id: string;
    html: string;
    styles: string;
    timestamp: number;
    name: string;
}

class PopupManager {
    private mainToggle: HTMLInputElement;
    private storedItemsContainer: HTMLElement;

    constructor() {
        this.mainToggle = document.getElementById('mainToggle') as HTMLInputElement;
        this.storedItemsContainer = document.getElementById('storedItems') as HTMLElement;
        this.init();
    }

    private async init() {
        // Initialize toggle state
        const { isEnabled } = await chrome.storage.local.get('isEnabled');
        this.mainToggle.checked = isEnabled || false;

        // Add event listeners
        this.mainToggle.addEventListener('change', () => this.toggleExtension());

        // Load stored elements
        this.loadStoredElements();

        // Listen for new elements being stored
        chrome.storage.onChanged.addListener((changes) => {
            if (changes.storedElements) {
                this.loadStoredElements();
            }
        });
    }

    private async toggleExtension() {
        const isEnabled = this.mainToggle.checked;
        await chrome.storage.local.set({ isEnabled });

        // Notify content script
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_EXTENSION', isEnabled });
        }
    }

    private async loadStoredElements() {
        const { storedElements = [] } = await chrome.storage.local.get('storedElements');
        this.storedItemsContainer.innerHTML = '';

        storedElements.forEach((element: StoredElement) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'item-name';
            nameSpan.textContent = element.name || `Element ${element.id}`;

            const toggleLabel = document.createElement('label');
            toggleLabel.className = 'switch';

            const toggleInput = document.createElement('input');
            toggleInput.type = 'checkbox';
            toggleInput.addEventListener('change', () => this.toggleElementHighlight(element.id, toggleInput.checked));

            const toggleSpan = document.createElement('span');
            toggleSpan.className = 'slider';

            toggleLabel.appendChild(toggleInput);
            toggleLabel.appendChild(toggleSpan);

            itemDiv.appendChild(nameSpan);
            itemDiv.appendChild(toggleLabel);

            this.storedItemsContainer.appendChild(itemDiv);
        });
    }

    private async toggleElementHighlight(elementId: string, isHighlighted: boolean) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id) {
            chrome.tabs.sendMessage(tab.id, {
                type: 'TOGGLE_ELEMENT_HIGHLIGHT',
                elementId,
                isHighlighted
            });
        }
    }
}

// Initialize popup
new PopupManager(); 