
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBanner from './ErrorBanner';

describe('ErrorBanner', () => {
  it('renders with default message', () => {
    render(<ErrorBanner />);
    
    expect(screen.getByText(/We're experiencing issues connecting to our servers/i)).toBeInTheDocument();
  });
  
  it('renders with custom message', () => {
    const message = "Custom error message";
    render(<ErrorBanner message={message} />);
    
    expect(screen.getByText(message)).toBeInTheDocument();
  });
  
  it('calls onDismiss when close button is clicked', () => {
    const onDismiss = vi.fn();
    render(<ErrorBanner onDismiss={onDismiss} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
  
  it('hides the banner when dismissed', () => {
    render(<ErrorBanner />);
    
    // Banner should be visible initially
    expect(screen.getByText(/We're experiencing issues/i)).toBeInTheDocument();
    
    // Click the dismiss button
    fireEvent.click(screen.getByRole('button'));
    
    // Banner should no longer be in the document
    expect(screen.queryByText(/We're experiencing issues/i)).not.toBeInTheDocument();
  });
});
