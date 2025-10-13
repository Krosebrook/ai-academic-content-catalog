
import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value }) => {
  const progress = Math.max(0, Math.min(100, value));

  return (
    <div className="w-full bg-ff-surface rounded-full h-2.5" style={{ borderRadius: 'var(--ff-radius-md)' }}>
      <div
        className="bg-ff-primary h-2.5 rounded-full transition-all duration-300 ease-in-out"
        style={{
          width: `${progress}%`,
          borderRadius: 'var(--ff-radius-md)',
          background: 'var(--ff-primary)'
        }}
      ></div>
    </div>
  );
};

export default ProgressBar;
