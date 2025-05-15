/**
 * Content Script für Tag-&-Image-Extractor
 * Wird vom Service Worker via chrome.scripting.executeScript injiziert
 */

/**
 * Extrahiert Elemente von der Webseite basierend auf den ausgewählten Tags
 * @param {string[]} selectedTags - Array mit Tag-Namen, die extrahiert werden sollen
 * @returns {Array<Object>} - Array mit extrahierten Elementen
 */
function extractElements(selectedTags) {
    const extractedElements = [];

    // Counter für jeden Tag-Typ initialisieren
    const counters = {};
    selectedTags.forEach(tag => counters[tag] = 0);

    // Alle Elemente im DOM in chronologischer Reihenfolge durchgehen
    const allElements = document.querySelectorAll('*');

    // Hilfsfunktion zum Abrufen des berechneten Stils
    function getComputedStyleProperty(element, property) {
        const style = window.getComputedStyle(element);
        return style.getPropertyValue(property);
    }

    // Alle DOM-Elemente durchgehen und die ausgewählten Typen extrahieren
    Array.from(allElements).forEach(element => {
        // Prüfen, ob das aktuelle Element zu den ausgewählten Tags gehört
        const tagName = element.tagName.toLowerCase();
        if (!selectedTags.includes(tagName)) {
            return;
        }

        // Counter für diesen Tag-Typ erhöhen
        counters[tagName]++;
        const elementId = `${tagName}-${counters[tagName]}`;

        let content = '';
        let notes = '';

        // Unterschiedliche Verarbeitung je nach Elementtyp
        if (tagName === 'img') {
            // Bei Bildern die URL und Alt-Text extrahieren
            content = element.src;

            // Alt-Text als Anmerkung hinzufügen, falls vorhanden
            if (element.alt) {
                notes = `Alt-Text: ${element.alt}`;
            }
        } else {
            // Bei Text-Elementen den inneren Text extrahieren
            content = element.innerText.trim();

            // Leere Elemente überspringen
            if (!content) return;
        }

        // Stileigenschaften extrahieren
        const textColor = getComputedStyleProperty(element, 'color');
        const bgColor = getComputedStyleProperty(element, 'background-color');
        const fontSize = getComputedStyleProperty(element, 'font-size');

        // Elementinformationen speichern
        extractedElements.push({
            elementId: elementId,
            tag: tagName,
            content: content,
            textColor: textColor,
            bgColor: bgColor,
            fontSize: fontSize,
            notes: notes
        });
    });

    return extractedElements;
}

// Hinweis: Dieses Script wird nicht direkt geladen, sondern via chrome.scripting.executeScript
// vom Service Worker injiziert. Die extractElements Funktion ist auch im Service Worker definiert,
// da sie von dort aus injiziert wird.