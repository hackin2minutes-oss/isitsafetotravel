import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchPanel } from '@/components/SearchPanel';
import { mockLocation } from '@/test/mocks';
import * as locationService from '@/services/locationService';

vi.mock('@/services/locationService', () => ({
  searchLocations: vi.fn(),
}));

const mockSearchLocations = locationService.searchLocations as ReturnType<typeof vi.fn>;

vi.mock('@/store/safetyStore', () => ({
  useSafetyStore: vi.fn(() => ({
    originCountry: 'US',
    setOriginCountry: vi.fn(),
  })),
}));

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
        screen.getByPlaceholderText(/Search for a city or country/i)
      ).toBeInTheDocument();
    });

    it('renders the Search_Global_Database label', () => {
      render(<SearchPanel onLocationSelect={mockOnLocationSelect} />);

      expect(screen.getByText(/Search_Global_Database/i)).toBeInTheDocument();
    });

    it('renders the Free_Data keyboard hint', () => {
      render(<SearchPanel onLocationSelect={mockOnLocationSelect} />);

      expect(screen.getByText(/Free_Data/i)).toBeInTheDocument();
    });

    it('renders the passport/origin country selector', () => {
      render(<SearchPanel onLocationSelect={mockOnLocationSelect} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText(/Passport/i)).toBeInTheDocument();
    });
  });

  describe('Debounced Search', () => {
    it('does not search when query is less than 3 characters', async () => {
      render(<SearchPanel onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/Search for a city or country/i);
      await userEvent.type(input, 'Lo');

      expect(mockSearchLocations).not.toHaveBeenCalled();
    });

    it('calls searchLocations when query is 3 or more characters', async () => {
      vi.useFakeTimers();
      mockSearchLocations.mockResolvedValue([mockLocation]);

      render(<SearchPanel onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/Search for a city or country/i);
      await userEvent.type(input, 'London');

      await act(async () => {
        await vi.runAllTimers();
      });

      expect(mockSearchLocations).toHaveBeenCalledWith('London');
      vi.useRealTimers();
    });

    it('debounces the search to avoid excessive API calls', async () => {
      vi.useFakeTimers();
      mockSearchLocations.mockResolvedValue([mockLocation]);

      render(<SearchPanel onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/Search for a city or country/i);

      await userEvent.type(input, 'Lo');
      await userEvent.type(input, 'n');
      await userEvent.type(input, 'd');
      await userEvent.type(input, 'o');
      await userEvent.type(input, 'n');

      await act(async () => {
        await vi.advanceTimersByTime(800);
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

      const input = screen.getByPlaceholderText(/Search for a city or country/i);
      await userEvent.type(input, 'London');

      await act(async () => {
        await vi.advanceTimersByTime(800);
      });

      expect(screen.queryByText(/Indexing/i)).toBeInTheDocument();
      vi.useRealTimers();
    });

    it('clears results when query is cleared', async () => {
      mockSearchLocations.mockResolvedValue([mockLocation]);

      render(<SearchPanel onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/Search for a city or country/i);
      await userEvent.type(input, 'London');

      await waitFor(() => {
        expect(screen.queryByText(/No Tactical Contacts Found/i)).toBeNull();
      });

      const clearBtn = screen.getByRole('button', { name: '' });
      await userEvent.click(clearBtn);

      expect(screen.queryByText('London')).toBeNull();
    });
  });

  describe('Results Dropdown', () => {
    it('shows results dropdown when results are available', async () => {
      vi.useFakeTimers();
      mockSearchLocations.mockResolvedValue([mockLocation]);

      render(<SearchPanel onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/Search for a city or country/i);
      await userEvent.type(input, 'London');

      await act(async () => {
        await vi.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByText('London')).toBeInTheDocument();
      });
      vi.useRealTimers();
    });

    it('calls onLocationSelect when a result is clicked', async () => {
      vi.useFakeTimers();
      mockSearchLocations.mockResolvedValue([mockLocation]);

      render(<SearchPanel onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/Search for a city or country/i);
      await userEvent.type(input, 'London');

      await act(async () => {
        await vi.runAllTimers();
      });

      const londonOption = await screen.findByText('London');
      await userEvent.click(londonOption);

      expect(mockOnLocationSelect).toHaveBeenCalledWith(mockLocation);
      vi.useRealTimers();
    });

    it('shows no results message when search returns empty', async () => {
      vi.useFakeTimers();
      mockSearchLocations.mockResolvedValue([]);

      render(<SearchPanel onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/Search for a city or country/i);
      await userEvent.type(input, 'XYZABC');

      await act(async () => {
        await vi.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByText(/No Tactical Contacts Found/i)).toBeInTheDocument();
      });
      vi.useRealTimers();
    });

    it('displays country name and coordinates for each result', async () => {
      vi.useFakeTimers();
      mockSearchLocations.mockResolvedValue([mockLocation]);

      render(<SearchPanel onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/Search for a city or country/i);
      await userEvent.type(input, 'London');

      await act(async () => {
        await vi.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByText('United Kingdom')).toBeInTheDocument();
        expect(screen.getByText(/51.51/i)).toBeInTheDocument();
        expect(screen.getByText(/-0.13/i)).toBeInTheDocument();
      });
      vi.useRealTimers();
    });
  });

  describe('Keyboard and Accessibility', () => {
    it('clears input when clear button is clicked', async () => {
      render(<SearchPanel onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/Search for a city or country/i) as HTMLInputElement;
      await userEvent.type(input, 'London');

      expect(input.value).toBe('London');

      const clearBtn = screen.getByRole('button', { name: '' });
      await userEvent.click(clearBtn);

      expect(input.value).toBe('');
    });

    it('opens dropdown on input focus', async () => {
      render(<SearchPanel onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/Search for a city or country/i);
      fireEvent.focus(input);

      expect(input).toHaveFocus();
    });
  });

  describe('Origin Country Selection', () => {
    it('renders origin country options', async () => {
      render(<SearchPanel onLocationSelect={mockOnLocationSelect} />);

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      await userEvent.selectOptions(select, 'UA');

      expect(select.value).toBe('UA');
    });
  });
});
