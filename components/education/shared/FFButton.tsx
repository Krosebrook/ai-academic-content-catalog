
import React from 'react';

interface FFButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
}

const FFButton: React.FC<FFButtonProps> = ({ children, className, style, variant = 'primary', ...props }) => {
  const variantStyles: React.CSSProperties = {
    primary: { backgroundColor: 'var(--ff-primary)', color: 'white' },
    secondary: { backgroundColor: 'var(--ff-secondary)', color: 'white' },
    accent: { backgroundColor: 'var(--ff-accent)', color: 'white' },
  }[variant];

  const baseStyle: React.CSSProperties = {
    fontFamily: 'var(--ff-font-primary)',
    fontSize: 'var(--ff-text-sm)',
    fontWeight: 'var(--ff-weight-semibold)',
    padding: 'var(--ff-space-3) var(--ff-space-6)',
    borderRadius: 'var(--ff-radius-lg)',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 150ms ease, box-shadow 150ms ease',
    ...variantStyles,
    ...style,
  };

  return (
    <button className={`disabled:opacity-50 disabled:cursor-not-allowed ${className}`} style={baseStyle} {...props}>
      {children}
    </button>
  );
};

export default FFButton;
