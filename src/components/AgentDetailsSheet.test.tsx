
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AgentDetailsSheet from './AgentDetailsSheet';

describe('AgentDetailsSheet component', () => {
  const mockAgent = {
    id: 'agent-123',
    hostname: 'test-server',
    status: 'online',
    version: 'v1.5.0',
    location: 'US East',
    created_at: '30 mins ago',
    ip_address: '10.0.0.1',
    type: 'Development',
    kernel_version: '5.4.0-42-generic',
    os_version: 'Ubuntu 20.04 LTS',
    user_id: 'user-123456'
  };

  const mockOnOpenChange = vi.fn();

  it('should render correctly when open', () => {
    render(
      <AgentDetailsSheet 
        agent={mockAgent} 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    // Verify agent details are displayed
    expect(screen.getByText(mockAgent.hostname)).toBeInTheDocument();
    expect(screen.getByText(mockAgent.type + ' agent •')).toBeInTheDocument();
    expect(screen.getByText('Online')).toBeInTheDocument();
    expect(screen.getByText(mockAgent.id)).toBeInTheDocument();
    expect(screen.getByText(mockAgent.ip_address)).toBeInTheDocument();
    expect(screen.getByText(mockAgent.location)).toBeInTheDocument();
    expect(screen.getByText(mockAgent.version)).toBeInTheDocument();
    expect(screen.getByText(mockAgent.user_id)).toBeInTheDocument();
    expect(screen.getByText(mockAgent.os_version)).toBeInTheDocument();
    expect(screen.getByText(mockAgent.kernel_version)).toBeInTheDocument();
  });

  it('should display "Not available" for missing system information', () => {
    const agentWithMissingInfo = {
      ...mockAgent,
      kernel_version: undefined,
      os_version: undefined
    };

    render(
      <AgentDetailsSheet 
        agent={agentWithMissingInfo} 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    // Verify "Not available" is shown for missing info
    expect(screen.getAllByText('Not available')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Not available')[1]).toBeInTheDocument();
  });

  it('should call onOpenChange when close button is clicked', () => {
    render(
      <AgentDetailsSheet 
        agent={mockAgent} 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    // Find and click close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    // Verify onOpenChange was called with false
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should display offline status correctly', () => {
    const offlineAgent = {
      ...mockAgent,
      status: 'offline'
    };

    render(
      <AgentDetailsSheet 
        agent={offlineAgent} 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    // Verify offline status is displayed
    expect(screen.getByText('Offline')).toBeInTheDocument();
    
    // Check last seen time for offline agent
    expect(screen.getByText('5h ago')).toBeInTheDocument();
  });

  it('should display the timeline information correctly', () => {
    render(
      <AgentDetailsSheet 
        agent={mockAgent} 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    // Verify timeline information
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText(mockAgent.created_at)).toBeInTheDocument();
    expect(screen.getByText('Last Seen')).toBeInTheDocument();
    expect(screen.getByText('Just now')).toBeInTheDocument();
  });

  it('should render the Run Command button', () => {
    render(
      <AgentDetailsSheet 
        agent={mockAgent} 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    // Verify Run Command button is present
    expect(screen.getByText('Run Command')).toBeInTheDocument();
  });
});
