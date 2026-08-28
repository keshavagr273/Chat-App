import React from 'react';

const Avatar = ({ src, name, className = '', isOnline = false, showStatus = false }) => {
  let finalSrc = src;

  // If the src is the default ui-avatars URL without a name, append the name
  if (src === 'https://ui-avatars.com/api/?background=random' || !src) {
    const safeName = name ? encodeURIComponent(name) : 'User';
    finalSrc = `https://ui-avatars.com/api/?background=171b26&color=4edea3&bold=true&name=${safeName}`;
  }

  return (
    <div className={`relative inline-flex shrink-0 rounded-full ${className}`}>
      <img
        src={finalSrc}
        alt={name || 'Avatar'}
        className="w-full h-full object-cover rounded-full bg-surface-container-highest shadow-sm"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = `https://ui-avatars.com/api/?background=171b26&color=4edea3&bold=true&name=${name ? encodeURIComponent(name) : 'User'}`;
        }}
      />
      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface-container z-10 ${
            isOnline ? 'bg-primary shadow-[0_0_8px_rgba(16,185,129,0.7)]' : 'bg-outline/60'
          }`}
        />
      )}
    </div>
  );
};

export default Avatar;
