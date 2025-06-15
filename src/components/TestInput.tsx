
import React from 'react';

const TestInput = () => {
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    console.log('Input focused:', e.target);
  };

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    console.log('Input clicked:', e.target);
  };

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-bold mb-4">iOS PWA Input Test</h3>
      <input
        type="text"
        placeholder="Test typing here..."
        className="w-full p-3 border border-gray-300 rounded-md"
        style={{
          fontSize: '16px',
          WebkitAppearance: 'none',
          WebkitUserSelect: 'text',
          userSelect: 'text',
          touchAction: 'manipulation',
          pointerEvents: 'auto',
          backgroundColor: 'white',
          position: 'relative',
          zIndex: 1,
          transform: 'translateZ(0)'
        }}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        onFocus={handleFocus}
        onClick={handleClick}
      />
    </div>
  );
};

export default TestInput;
