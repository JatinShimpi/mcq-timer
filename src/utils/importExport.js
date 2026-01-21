// Export sessions to JSON file
export function exportData(sessions) {
    const data = JSON.stringify(sessions, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mcq-timer-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Import sessions from JSON file
export function importData(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (Array.isArray(data)) {
                callback(data);
            } else {
                alert('Invalid file format');
            }
        } catch {
            alert('Failed to parse file');
        }
    };
    reader.readAsText(file);
}
