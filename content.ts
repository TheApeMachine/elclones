/// <reference types="chrome"/>

interface StoredElement {
    id: string;
    html: string;
    styles: string;
    timestamp: number;
    name: string;
}

class ElementCloner {
    private isEnabled: boolean = false;
    private highlightedElements: Set<string> = new Set();
    private overlay: HTMLElement | null = null;
    private db: IDBDatabase | null = null;

    constructor() {
        this.initializeDB();
        this.initializeOverlay();
        this.setupMessageListeners();
        this.setupMouseListeners();
    }

    private async initializeDB() {
        const request = indexedDB.open('ElClonesDB', 1);

        request.onerror = () => console.error('Failed to open database');

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('elements')) {
                db.createObjectStore('elements', { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => {
            this.db = (event.target as IDBOpenDBRequest).result;
        };
    }

    private initializeOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = `
            position: fixed;
            pointer-events: none;
            background: rgba(75, 161, 255, 0.3);
            border: 2px solid #4BA1FF;
            z-index: 10000;
            display: none;
        `;
        document.body.appendChild(this.overlay);
    }

    private setupMessageListeners() {
        // Establish persistent connection
        const port = chrome.runtime.connect({ name: 'el-clones' });

        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            switch (message.type) {
                case 'TOGGLE_EXTENSION':
                    this.isEnabled = message.isEnabled;
                    break;
                case 'TOGGLE_ELEMENT_HIGHLIGHT':
                    if (message.isHighlighted) {
                        this.highlightedElements.add(message.elementId);
                    } else {
                        this.highlightedElements.delete(message.elementId);
                    }
                    break;
            }
        });
    }

    private setupMouseListeners() {
        document.addEventListener('mousemove', (e) => {
            if (!this.isEnabled && this.highlightedElements.size === 0) return;

            const target = e.target as HTMLElement;
            if (this.overlay) {
                const rect = target.getBoundingClientRect();
                this.overlay.style.display = 'block';
                this.overlay.style.top = rect.top + window.scrollY + 'px';
                this.overlay.style.left = rect.left + window.scrollX + 'px';
                this.overlay.style.width = rect.width + 'px';
                this.overlay.style.height = rect.height + 'px';
            }
        });

        document.addEventListener('mouseout', () => {
            if (this.overlay) {
                this.overlay.style.display = 'none';
            }
        });

        document.addEventListener('click', async (e) => {
            if (!this.isEnabled && this.highlightedElements.size === 0) return;
            e.preventDefault();

            const target = e.target as HTMLElement;
            if (this.isEnabled) {
                // Store mode
                await this.storeElement(target);
            } else {
                // Clone mode
                await this.cloneStoredElement(target);
            }
        });
    }

    private async storeElement(element: HTMLElement) {
        if (!this.db) return;

        const styles = this.getComputedStyles(element);
        const storedElement: StoredElement = {
            id: crypto.randomUUID(),
            html: element.outerHTML,
            styles,
            timestamp: Date.now(),
            name: this.generateElementName(element)
        };

        const transaction = this.db.transaction(['elements'], 'readwrite');
        const store = transaction.objectStore('elements');
        store.add(storedElement);

        // Update storage for popup
        const { storedElements = [] } = await chrome.storage.local.get('storedElements');
        storedElements.push(storedElement);
        await chrome.storage.local.set({ storedElements });
    }

    private async cloneStoredElement(targetContainer: HTMLElement) {
        if (!this.db) return;

        const transaction = this.db.transaction(['elements'], 'readonly');
        const store = transaction.objectStore('elements');
        const request = store.getAll();

        request.onsuccess = () => {
            const elements = request.result;
            // Find element from highlighted elements
            const elementToClone = elements.find(el =>
                this.highlightedElements.has(el.id)
            );

            if (elementToClone) {
                const tempContainer = document.createElement('div');
                tempContainer.innerHTML = elementToClone.html;
                const clonedElement = tempContainer.firstElementChild as HTMLElement;

                if (clonedElement) {
                    // Apply stored styles
                    this.applyStyles(clonedElement, elementToClone.styles);
                    targetContainer.appendChild(clonedElement);
                }
            }
        };
    }

    private getComputedStyles(element: HTMLElement): string {
        const computed = window.getComputedStyle(element);
        const styles: Record<string, string> = {};

        for (const prop of computed) {
            styles[prop] = computed.getPropertyValue(prop);
        }

        return JSON.stringify(styles);
    }

    private applyStyles(element: HTMLElement, stylesJson: string) {
        const styles = JSON.parse(stylesJson);
        for (const [prop, value] of Object.entries(styles)) {
            try {
                if (prop !== 'length' && prop !== 'parentRule') {
                    (element.style as any)[prop] = value as string;
                }
            } catch {
                // Skip read-only properties
                console.log(`Skipping read-only property: ${prop}`);
            }
        }
    }

    private generateElementName(element: HTMLElement): string {
        const tagName = element.tagName.toLowerCase();
        const id = element.id ? `#${element.id}` : '';
        const classes = Array.from(element.classList).map(c => `.${c}`).join('');
        return `${tagName}${id}${classes}`;
    }
}

// Initialize the cloner
new ElementCloner();
