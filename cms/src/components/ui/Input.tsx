import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
    marginBottom: '1rem',
  };

  const labelStyle = {
    fontWeight: 600,
    fontSize: '0.875rem',
    color: 'var(--color-text-main)',
  };

  const inputStyle = {
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  const errorStyle = {
    color: 'var(--color-error)',
    fontSize: '0.75rem',
    fontWeight: 500,
  };

  return (
    <div style={containerStyle}>
      <label style={labelStyle}>{label}</label>
      <input style={inputStyle} {...props} />
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
}
