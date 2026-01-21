import { useState, useRef, useEffect } from 'react';

// ============================================================================
// AUTOCOMPLETE INPUT COMPONENT
// Google-style autocomplete for topic/subtopic fields
// ============================================================================

export default function AutocompleteInput({
    value,
    onChange,
    suggestions = [],
    placeholder,
    label,
    autoFocus = false,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Filter suggestions based on input value
    useEffect(() => {
        if (value.trim().length === 0) {
            setFilteredSuggestions([]);
            return;
        }

        const query = value.toLowerCase();
        const filtered = suggestions
            .filter(s => s.toLowerCase().includes(query) && s.toLowerCase() !== query)
            .slice(0, 7); // Max 7 suggestions

        setFilteredSuggestions(filtered);
        setHighlightedIndex(-1);
    }, [value, suggestions]);

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (!isOpen || filteredSuggestions.length === 0) {
            if (e.key === 'ArrowDown' && filteredSuggestions.length > 0) {
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredSuggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : filteredSuggestions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0) {
                    selectSuggestion(filteredSuggestions[highlightedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setHighlightedIndex(-1);
                break;
        }
    };

    const selectSuggestion = (suggestion) => {
        onChange(suggestion);
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.focus();
    };

    const handleInputChange = (e) => {
        onChange(e.target.value);
        setIsOpen(true);
    };

    const handleFocus = () => {
        if (filteredSuggestions.length > 0) {
            setIsOpen(true);
        }
    };

    const handleBlur = (e) => {
        // Delay close to allow click on suggestion
        setTimeout(() => {
            setIsOpen(false);
            setHighlightedIndex(-1);
        }, 150);
    };

    // Highlight matching text in suggestion
    const highlightMatch = (text) => {
        if (!value.trim()) return text;

        const query = value.toLowerCase();
        const index = text.toLowerCase().indexOf(query);

        if (index === -1) return text;

        return (
            <>
                {text.slice(0, index)}
                <span className="autocomplete-match">
                    {text.slice(index, index + value.length)}
                </span>
                {text.slice(index + value.length)}
            </>
        );
    };

    return (
        <div className="form-group">
            <label className="form-label">{label}</label>
            <div className="autocomplete-container">
                <input
                    ref={inputRef}
                    type="text"
                    className="form-input"
                    placeholder={placeholder}
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    autoFocus={autoFocus}
                    autoComplete="off"
                />

                {isOpen && filteredSuggestions.length > 0 && (
                    <div className="autocomplete-dropdown" ref={dropdownRef}>
                        {filteredSuggestions.map((suggestion, index) => (
                            <div
                                key={suggestion}
                                className={`autocomplete-item ${index === highlightedIndex ? 'highlighted' : ''}`}
                                onMouseDown={() => selectSuggestion(suggestion)}
                                onMouseEnter={() => setHighlightedIndex(index)}
                            >
                                {highlightMatch(suggestion)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
