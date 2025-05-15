# Tag-&-Image-Extractor Chrome Extension

A powerful Chrome extension that extracts HTML elements and their styling properties from any webpage and exports them as a CSV file.

## Description

Tag-&-Image-Extractor lets you collect content from specific HTML tags (headings, paragraphs, spans, and images) along with their style information such as text color, background color, and font size. Each element is uniquely identified and preserved in chronological order, allowing you to analyze webpage structure and content efficiently.

## Features

- **Element Selection**: Choose which HTML elements to extract (h1-h5, p, span, img)
- **Chronological Extraction**: Elements are saved in the same order they appear in the DOM
- **Unique Identification**: Each element is labeled with a unique ID (e.g., h1-1, p-2)
- **Style Properties**: Captures text color, background color, and font size
- **Image Support**: Extracts image URLs and alt text
- **CSV Export**: Downloads results as a CSV file with webpage URL in the filename
- **Simple Interface**: User-friendly popup with checkboxes for element selection

## Installation

### From Chrome Web Store
*(Note: Once published to Chrome Web Store, add link here)*

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension folder
5. The extension should now appear in your Chrome toolbar

## How to Use

1. Navigate to any webpage you want to analyze
2. Click the Tag-&-Image-Extractor icon in your Chrome toolbar
3. Select which HTML elements you want to extract (all are selected by default)
4. Click the "Elemente extrahieren" button
5. A CSV file will be automatically downloaded containing your extracted data

## CSV Output Format

The generated CSV file contains the following columns:

| Column | Description |
|--------|-------------|
| element_id | Unique identifier for the element (e.g., h1-1, p-3) |
| tag | HTML tag name (h1, p, img, etc.) |
| content | Text content or image URL |
| text_color | Computed text color (CSS) |
| background_color | Computed background color (CSS) |
| font_size | Computed font size (CSS) |
| notes | Additional information (e.g., alt text for images) |

## File Structure

- `manifest.json`: Extension configuration
- `popup.html`: User interface
- `popup.js`: Popup logic
- `popup.css`: Popup styling
- `background.js`: Service worker for communication and data processing
- `content.js`: Script for DOM manipulation and data extraction
- `icons/`: Extension icons

## Requirements

- Chrome version 90 or higher (Manifest V3 compatible)
- Also works with other Chromium-based browsers like Edge and Brave

## Development

### Dependencies
This extension doesn't have external dependencies. It's built with vanilla JavaScript for maximum performance and simplicity.

### Build Process
No build process is required. The extension can be loaded directly in Chrome's developer mode.

## Privacy

Tag-&-Image-Extractor only accesses the webpage when you click the extract button. It doesn't send any data to remote servers, and all processing happens locally in your browser. The extension only requires the minimum permissions needed for its functionality.

## Author

Robert Julian Kratz

---

## Contributing

Contributions are welcome! Feel free to submit pull requests or create issues for bugs and feature requests.

## Acknowledgments

- Icons created with [Tool Name]
- Thanks to [Name] for testing and feedback