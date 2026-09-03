import React, { HTMLAttributes } from 'react';

export function Card({ children, style, ...props }: HTMLAttributes<HTMLDivElement>) {
  const cardStyle = {
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-md)',
    padding: '1.5rem',
    ...style,
  };

  return (
    <div style={cardStyle} {...props}>
      {children}
    </div>
  );
}
