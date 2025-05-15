document.addEventListener('DOMContentLoaded', () => {
    const extractButton = document.getElementById('extract-button');
    const statusDiv = document.getElementById('status');
    const loadingDiv = document.getElementById('loading');
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

    // Event Listener für den Extract-Button
    extractButton.addEventListener('click', async () => {
        // Status zurücksetzen
        statusDiv.className = 'status';
        statusDiv.textContent = '';

        // Loading anzeigen
        loadingDiv.classList.remove('hidden');

        // Ausgewählte Tags sammeln
        const selectedTags = Array.from(checkboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        // Prüfen ob mindestens ein Tag ausgewählt ist
        if (selectedTags.length === 0) {
            showStatus('error', 'Bitte wähle mindestens einen Tag aus.');
            loadingDiv.classList.add('hidden');
            return;
        }

        try {
            // Aktive Tab ID abrufen
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // Message an den Service Worker senden
            const response = await chrome.runtime.sendMessage({
                action: 'extractTags',
                tabId: tab.id,
                selectedTags: selectedTags
            });

            if (response.success) {
                showStatus('success', `Extraktion erfolgreich! ${response.count} Elemente wurden in chronologischer Reihenfolge extrahiert. CSV mit Stil-Eigenschaften wurde gespeichert.`);
            } else {
                showStatus('error', `Fehler: ${response.error}`);
            }
        } catch (error) {
            showStatus('error', `Ein Fehler ist aufgetreten: ${error.message}`);
        } finally {
            loadingDiv.classList.add('hidden');
        }
    });

    // Hilfsfunktion zum Anzeigen von Status-Nachrichten
    function showStatus(type, message) {
        statusDiv.className = `status ${type}`;
        statusDiv.textContent = message;
    }

    // Tastaturnavigation für Checkboxen
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                checkbox.checked = !checkbox.checked;
            }
        });
    });
});