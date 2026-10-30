import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';

describe('SkillBridge Frontend UI Component Tests', () => {
  it('renders Button with text and handles loading state', () => {
    const { rerender } = render(<Button>Submit Evidence</Button>);
    expect(screen.getByText('Submit Evidence')).toBeInTheDocument();

    rerender(<Button isLoading>Submit Evidence</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders Badge with custom variants and text', () => {
    render(<Badge variant="success">Verified</Badge>);
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('renders Card with children', () => {
    render(<Card>Skill Profile Content</Card>);
    expect(screen.getByText('Skill Profile Content')).toBeInTheDocument();
  });

  it('renders ProgressBar with percentage and ARIA values', () => {
    render(<ProgressBar value={75} max={100} label="Readiness" />);
    expect(screen.getByText('Readiness')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '75');
  });
});
