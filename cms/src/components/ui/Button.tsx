import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  disabled, 
  ...props 
}: ButtonProps) {
  const baseStyle = {
    padding: '0.75rem 1.5rem',
    borderRadius: 'var(--radius-full)',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  };

  let variantStyle = {};
  if (variant === 'primary') {
    variantStyle = {
      backgroundColor: 'var(--color-primary)',
      color: 'white',
    };
  } else if (variant === 'secondary') {
    variantStyle = {
      backgroundColor: 'var(--color-secondary)',
      color: 'white',
    };
  } else if (variant === 'outline') {
    variantStyle = {
      backgroundColor: 'transparent',
      color: 'var(--color-text-main)',
      border: '2px solid var(--color-border)',
    };
  } else if (variant === 'danger') {
    variantStyle = {
      backgroundColor: 'var(--color-error)',
      color: 'white',
    };
  }

  const finalStyle = {
    ...baseStyle,
    ...variantStyle,
    opacity: (disabled || isLoading) ? 0.7 : 1,
    cursor: (disabled || isLoading) ? 'not-allowed' : 'pointer',
  };

  return (
    <button style={finalStyle} disabled={disabled || isLoading} {...props}>
      {isLoading ? <span className="spinner"></span> : null}
      {children}
    </button>
  );
}
