import React from 'react';

const Avatar = ({ src, name, className }) => {
  let finalSrc = src;

  // If the src is the default ui-avatars URL without a name, append the name
  if (src === 'https://ui-avatars.com/api/?background=random' || !src) {
    // If no name is provided, default to 'User'
    const safeName = name ? encodeURIComponent(name) : 'User';
    finalSrc = `https://ui-avatars.com/api/?background=random&name=${safeName}`;
  }

  return (
    <img
      src={finalSrc}
      alt={name || 'Avatar'}
      className={`object-cover rounded-full bg-[#111] ${className || ''}`}
      onError={(e) => {
        // Fallback if image fails to load
        e.target.onerror = null; 
        e.target.src = `https://ui-avatars.com/api/?background=random&name=${name ? encodeURIComponent(name) : 'User'}`;
      }}
    />
  );
};

export default Avatar;
