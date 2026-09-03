import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';
import React from 'react';

describe('Button Component', () => {
  it('renders children correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeDefined();
  });

  it('shows loading state', () => {
    const { container } = render(<Button isLoading>Submit</Button>);
    expect(container.querySelector('.spinner')).toBeDefined();
    const btn = screen.getByText('Submit').closest('button');
    expect(btn?.disabled).toBe(true);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const btn = screen.getByText('Disabled').closest('button');
    expect(btn?.disabled).toBe(true);
  });
});
