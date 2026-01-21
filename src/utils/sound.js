// Play a sound using Web Audio API
export function playSound(type = 'timeout') {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (type === 'timeout') {
            oscillator.frequency.value = 440;
            oscillator.type = 'square';
            gainNode.gain.value = 0.3;
        } else if (type === 'warning') {
            oscillator.frequency.value = 330;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.2;
        } else if (type === 'complete') {
            oscillator.frequency.value = 660;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.3;
        }

        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Audio not available');
    }
}
