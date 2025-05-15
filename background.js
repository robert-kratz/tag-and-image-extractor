// Service Worker für die Tag-&-Image-Extractor Extension

// Listener für Messages vom Popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Überprüfen, ob es sich um eine Extraktion-Anfrage handelt
    if (message.action === 'extractTags') {
        handleExtraction(message.tabId, message.selectedTags)
            .then(sendResponse)
            .catch(error => {
                console.error('Extraction error:', error);
                sendResponse({ success: false, error: error.message });
            });

        // Wichtig: true zurückgeben, damit Chrome weiß, dass wir asynchron antworten werden
        return true;
    }
});

/**
 * Verarbeitet die Extraktion von Tags in der angegebenen Tab
 * @param {number} tabId - ID der Tab, in der extrahiert werden soll
 * @param {string[]} selectedTags - Array mit auszuwählenden Tag-Namen
 * @returns {Promise<Object>} - Ergebnis der Extraktion
 */
async function handleExtraction(tabId, selectedTags) {
    try {
        // Content Script ausführen, um die Elemente zu extrahieren
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: extractElements,
            args: [selectedTags]
        });

        // Ergebnisse vom Content Script extrahieren
        const extractedData = results[0].result;

        if (!extractedData || extractedData.length === 0) {
            return {
                success: false,
                error: 'Keine passenden Elemente auf der Seite gefunden.'
            };
        }

        // CSV aus den extrahierten Daten erstellen
        const csv = convertToCSV(extractedData);

        // Seiteninformationen für den Dateinamen holen
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        let url = new URL(tab.url);
        // URL für den Dateinamen aufbereiten, indem Sonderzeichen entfernt werden
        const urlForFilename = url.hostname + url.pathname.replace(/\//g, '_');
        const safeUrlFilename = urlForFilename.replace(/[^a-z0-9_\-]/gi, '').substring(0, 50);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${safeUrlFilename}_tags_${timestamp}.csv`;

        // CSV-Datei herunterladen
        await downloadCSV(csv, filename);

        return {
            success: true,
            count: extractedData.length,
            message: `${extractedData.length} Elemente erfolgreich extrahiert!`
        };
    } catch (error) {
        console.error('Extraction failed:', error);
        return {
            success: false,
            error: error.message || 'Unbekannter Fehler bei der Extraktion.'
        };
    }
}

/**
 * Konvertiert extrahierte Daten in CSV-Format
 * @param {Array<Object>} data - Extrahierte Elemente
 * @returns {string} - CSV-Inhalt als String
 */
function convertToCSV(data) {
    // CSV Header mit erweiterten Spalten
    let csv = 'ID,Tag,Inhalt,Text Farbe,Hintergrundfarbe,Schriftgröße,Notizen,Änderung\n';

    // Daten Zeile für Zeile hinzufügen, mit Escaping für CSV
    data.forEach(item => {
        // CSV escaping: Anführungszeichen verdoppeln und Content in Anführungszeichen setzen
        const escapedContent = item.content.replace(/"/g, '""');
        const escapedNotes = item.notes ? item.notes.replace(/"/g, '""') : '';

        csv += `${item.elementId},"${item.tag}","${escapedContent}","${item.textColor}","${item.bgColor}","${item.fontSize}","${escapedNotes}","Nein"\n`;
    });

    return csv;
}

/**
 * Lädt eine CSV-Datei herunter
 * @param {string} csvContent - CSV-Inhalt
 * @param {string} filename - Name der CSV-Datei
 * @returns {Promise<void>}
 */
function downloadCSV(csvContent, filename) {
    return new Promise((resolve, reject) => {
        // Data URL direkt aus dem CSV-String erstellen
        const base64CSV = btoa(unescape(encodeURIComponent(csvContent)));
        const dataUrl = `data:text/csv;charset=utf-8;base64,${base64CSV}`;

        // Chrome Download API verwenden
        chrome.downloads.download({
            url: dataUrl,
            filename: filename,
            saveAs: false
        }, (downloadId) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(downloadId);
            }
        });
    });
}

/**
 * Diese Funktion wird im Kontext der Webpage ausgeführt, um die gewünschten Elemente zu extrahieren.
 * @param {string[]} selectedTags - Array mit auszuwählenden Tag-Namen
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