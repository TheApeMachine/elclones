# El Clones

El Clones is a powerful Chrome extension that allows you to clone HTML elements from any webpage and reuse them elsewhere. It's perfect for developers and designers who want to quickly replicate UI components across different pages or websites.

## Features

- 🎯 **Element Selection**: Hover over any element to see it highlighted
- 💾 **Element Storage**: Click to store elements with their complete structure and styles
- 📋 **Smart Cloning**: Clone elements while preserving their styles and structure
- 🔄 **Easy Management**: Toggle between selection and cloning modes
- 💼 **Persistent Storage**: Elements are stored in IndexedDB for later use
- 🎨 **Style Preservation**: Maintains computed styles of cloned elements

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/yourusername/elclones.git
   cd elclones
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Build the extension:

   ```bash
   pnpm build
   ```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `dist` directory

## Usage

1. **Storing Elements**:
   - Click the El Clones icon in your Chrome toolbar
   - Toggle the main switch ON to enter selection mode
   - Hover over elements to see them highlighted
   - Click an element to store it

2. **Cloning Elements**:
   - Toggle the main switch OFF to enter cloning mode
   - In the popup, toggle individual elements you want to clone
   - Hover over target containers on the page
   - Click a container to clone the selected element into it

## Development

- Start development server:
  
  ```bash
  pnpm start
  ```

- Build for production:
  
  ```bash
  pnpm build
  ```

## Technical Details

The extension is built with:

- TypeScript for type-safe code
- Chrome Extension Manifest V3
- IndexedDB for element storage
- Parcel for bundling

Key components:

- `popup.ts`: Manages the extension popup UI
- `content.ts`: Handles DOM manipulation and element cloning
- `background.ts`: Manages extension state and initialization

## License

MIT License - feel free to use and modify as needed!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 