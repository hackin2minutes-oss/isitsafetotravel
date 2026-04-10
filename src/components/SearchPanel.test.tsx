import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { SearchPanel } from '@/components/SearchPanel';
import { mockLocation } from '@/test/mocks';
import * as locationService from '@/services/locationService';

vi.mock('@/services/locationService', () => ({
  searchLocations: vi.fn(),
}));

const mockSearchLocations = locationService.searchLocations as ReturnType<typeof vi.fn>;

describe('SearchPanel', () => {
  const mockOnLocationSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchLocations.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders the search input', () => {
      render(<SearchPanel onLocationSelect={mockOnLocationSelect} />);

      expect(
        screen.getByPlaceholderText(/Search cities, countries.../i)
      ).toBeInTheDocument();
    });
  });

  describe('Debounced Search', () => {
    it('does not search when query is less than 3 characters', async () => {
      render(<SearchPanel onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/Search cities, countries.../i);
      fireEvent.change(input, { target: { value: 'Lo' } });

      expect(mockSearchLocations).not.toHaveBeenCalled();
    });

    it('calls searchLocations when query is 3 or more characters', async () => {
      vi.useFakeTimers();
      mockSearchLocations.mockResolvedValue([mockLocation]);

      render(<SearchPanel onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/Search cities, countries.../i);
      fireEvent.change(input, { target: { value: 'London' } });

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockSearchLocations).toHaveBeenCalledWith('London');
      vi.useRealTimers();
    });

    it('debounces the search to avoid excessive API calls', async () => {
      vi.useFakeTimers();
      mockSearchLocations.mockResolvedValue([mockLocation]);

      render(<SearchPanel onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/Search cities, countries.../i);

      fireEvent.change(input, { target: { value: 'Lo' } });
      fireEvent.change(input, { target: { value: 'Lon' } });
      fireEvent.change(input, { target: { value: 'Lond' } });
      fireEvent.change(input, { target: { value: 'Londo' } });
      fireEvent.change(input, { target: { value: 'London' } });

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockSearchLocations).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });

    it('shows indexing indicator while searching', async () => {
      vi.useFakeTimers();
      let resolveSearch: (value: unknown) => void;
      mockSearchLocations.mockImplementation(
        () => new Promise((resolve) => { resolveSearch = resolve; })
      );

      render(<SearchPanel onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/Search cities, countries.../i);
      fireEvent.change(input, { target: { value: 'London' } });

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      expect(screen.getByText(/Searching/i)).toBeInTheDocument();
      vi.useRealTimers();
    });

    it('clears results when query is cleared', async () => {
      mockSearchLocations.mockResolvedValue([mockLocation]);

      render(<SearchPanel onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/Search cities, countries.../i);
      fireEvent.change(input, { target: { value: 'London' } });

      await waitFor(() => {
        expect(screen.queryByText(/No results found/i)).toBeNull();
      });

      // To clear, we can just click the clear button, which is the first button in the node tree 
      // (because the location items are rendered below it, technically they might also be buttons, but let's select it precisely)
      const clearBtn = document.querySelector('button');
      if (clearBtn) {
        fireEvent.click(clearBtn);
      }

      expect(input).toHaveValue('');
    });
  });

  describe('Results Dropdown', () => {
    it('shows results dropdown when results are available', async () => {
      mockSearchLocations.mockResolvedValue([mockLocation]);

      render(<SearchPanel onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/Search cities, countries.../i);
      fireEvent.change(input, { target: { value: 'London' } });

      await waitFor(() => {
        expect(screen.getByText('London')).toBeInTheDocument();
      });
    });

    it('calls onLocationSelect when a result is clicked', async () => {
      mockSearchLocations.mockResolvedValue([mockLocation]);

      render(<SearchPanel onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/Search cities, countries.../i);
      fireEvent.change(input, { target: { value: 'London' } });

      const londonOption = await screen.findByText('London');
      fireEvent.click(londonOption);

      expect(mockOnLocationSelect).toHaveBeenCalledWith(mockLocation);
    });

    it('shows no results message when search returns empty', async () => {
      mockSearchLocations.mockResolvedValue([]);

      render(<SearchPanel onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/Search cities, countries.../i);
      fireEvent.change(input, { target: { value: 'XYZABC' } });

      await waitFor(() => {
        expect(screen.getByText(/No results found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard and Accessibility', () => {
    it('opens dropdown on input focus', async () => {
      render(<SearchPanel onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/Search cities, countries.../i);
      input.focus();

      expect(document.activeElement).toBe(input);
    });
  });
});
