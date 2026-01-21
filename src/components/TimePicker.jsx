import { secondsToHMS, hmsToSeconds } from '../utils/format';

// ============================================================================
// TIME PICKER COMPONENT - Scrollable wheels (alarm-style)
// ============================================================================

export default function TimePicker({ value, onChange, showHours = true, compact = false }) {
    const hms = secondsToHMS(value);

    const handleChange = (field, newValue) => {
        const updated = { ...hms, [field]: parseInt(newValue) || 0 };
        onChange(hmsToSeconds(updated));
    };

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutesSeconds = Array.from({ length: 60 }, (_, i) => i);

    const containerClass = compact ? 'time-picker time-picker-compact' : 'time-picker';
    const selectClass = compact ? 'time-picker-select time-picker-select-compact' : 'time-picker-select';

    return (
        <div className={containerClass}>
            {showHours && (
                <>
                    <div className="time-picker-wheel">
                        {!compact && <label className="time-picker-label">H</label>}
                        <select
                            className={selectClass}
                            value={hms.hours}
                            onChange={(e) => handleChange('hours', e.target.value)}
                        >
                            {hours.map(h => (
                                <option key={h} value={h}>{h.toString().padStart(2, '0')}</option>
                            ))}
                        </select>
                    </div>
                    <span className="time-picker-separator">:</span>
                </>
            )}
            <div className="time-picker-wheel">
                {!compact && <label className="time-picker-label">M</label>}
                <select
                    className={selectClass}
                    value={hms.minutes}
                    onChange={(e) => handleChange('minutes', e.target.value)}
                >
                    {minutesSeconds.map(m => (
                        <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                    ))}
                </select>
            </div>
            <span className="time-picker-separator">:</span>
            <div className="time-picker-wheel">
                {!compact && <label className="time-picker-label">S</label>}
                <select
                    className={selectClass}
                    value={hms.seconds}
                    onChange={(e) => handleChange('seconds', e.target.value)}
                >
                    {minutesSeconds.map(s => (
                        <option key={s} value={s}>{s.toString().padStart(2, '0')}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
