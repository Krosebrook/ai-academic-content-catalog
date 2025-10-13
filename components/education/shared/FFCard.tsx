
import React from 'react';

interface FFCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const FFCard: React.FC<FFCardProps> = ({ children, className, style, ...props }) => {
  const baseStyle: React.CSSProperties = {
    background: 'var(--ff-gradient-surface)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 'var(--ff-radius-lg)',
    ...style,
  };

  return (
    <div className={`p-6 ${className}`} style={baseStyle} {...props}>
      {children}
    </div>
  );
};

export default FFCard;
