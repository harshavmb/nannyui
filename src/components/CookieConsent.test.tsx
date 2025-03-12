
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CookieConsent from './CookieConsent';

// Mock the localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

describe('CookieConsent', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  it('renders when cookies are not accepted', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(
      <BrowserRouter>
        <CookieConsent />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Cookie Consent')).toBeInTheDocument();
  });

  it('does not render when cookies are accepted', () => {
    localStorageMock.getItem.mockReturnValue('true');
    
    render(
      <BrowserRouter>
        <CookieConsent />
      </BrowserRouter>
    );
    
    expect(screen.queryByText('Cookie Consent')).not.toBeInTheDocument();
  });

  it('saves preference when accepting cookies', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(
      <BrowserRouter>
        <CookieConsent />
      </BrowserRouter>
    );
    
    fireEvent.click(screen.getByText('Accept All Cookies'));
    expect(localStorageMock.setItem).toHaveBeenCalledWith('cookiesAccepted', 'true');
  });
});
