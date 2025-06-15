
import React from 'react';

const TestInput = () => {
  return (
    <div
      style={{
        zIndex: 99998,
        position: 'relative',
        background: 'rgba(255,255,0,0.12)',
        padding: 8,
        pointerEvents: 'auto'
      }}
    >
      <h3 style={{ fontWeight: 'bold', marginBottom: 8 }}>iOS PWA Input Test (Bare)</h3>
      <input
        type="text"
        placeholder="Try typing here…"
        style={{
          width: '100%',
          height: 44,
          padding: 8,
          fontSize: 16,
          border: '1px solid #aaa',
          borderRadius: 6,
          background: 'white',
          color: '#333',
          zIndex: 99999,
          pointerEvents: 'auto',
          position: 'relative'
        }}
        tabIndex={0}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        readOnly={false}
        onClick={e => {
          console.log('TestInput: CLICK', e.target);
        }}
        onFocus={e => {
          console.log('TestInput: FOCUS', e.target);
        }}
        onInput={e => {
          console.log('TestInput: INPUT', (e.target as HTMLInputElement).value);
        }}
      />
    </div>
  );
};

export default TestInput;
