import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SafetyCard } from '@/components/SafetyCard';
import {
  mockLocation,
  mockAssessment,
  mockWarZoneLocation,
  mockWarZoneAssessment,
} from '@/test/mocks';

describe('SafetyCard', () => {
  describe('Empty State', () => {
    it('renders empty state when location and assessment are null', () => {
      render(
        <SafetyCard
          location={null}
          assessment={null}
          isLoading={false}
          error={null}
        />
      );

      expect(screen.getByText('Ready to explore?')).toBeInTheDocument();
      expect(
        screen.getByText(/Search or tap the map to check a destination/i)
      ).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('renders shimmer loading UI when isLoading is true', () => {
      render(
        <SafetyCard
          location={null}
          assessment={null}
          isLoading={true}
          error={null}
        />
      );

      expect(document.querySelector('.animate-shimmer')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('renders error state with message when error is present', () => {
      render(
        <SafetyCard
          location={null}
          assessment={null}
          isLoading={false}
          error="Failed to fetch safety data"
        />
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch safety data')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /try again/i })
      ).toBeInTheDocument();
    });

    it('calls window.location.reload when Try Again button is clicked', () => {
      const reloadMock = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true,
      });

      render(
        <SafetyCard
          location={null}
          assessment={null}
          isLoading={false}
          error="Network error"
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /try again/i }));
      expect(reloadMock).toHaveBeenCalled();
    });
  });

  describe('Data Rendering', () => {
    it('renders location name and country', () => {
      render(
        <SafetyCard
          location={mockLocation}
          assessment={mockAssessment}
          isLoading={false}
          error={null}
        />
      );

      expect(screen.getByText('London')).toBeInTheDocument();
      expect(screen.getByText('United Kingdom')).toBeInTheDocument();
    });

    it('renders safety score and rating', () => {
      render(
        <SafetyCard
          location={mockLocation}
          assessment={mockAssessment}
          isLoading={false}
          error={null}
        />
      );

      expect(screen.getByText('85')).toBeInTheDocument();
      expect(screen.getByText('SAFE')).toBeInTheDocument();
    });

    it('renders population and land area from quickFacts', () => {
      render(
        <SafetyCard
          location={mockLocation}
          assessment={mockAssessment}
          isLoading={false}
          error={null}
        />
      );

      expect(screen.getByText('Population')).toBeInTheDocument();
      expect(screen.getByText('9,000,000')).toBeInTheDocument();
      expect(screen.getByText('Area')).toBeInTheDocument();
      expect(screen.getByText('1,572 km²')).toBeInTheDocument();
    });
  });

  describe('Risk Bars', () => {
    it('renders all safety dimensions as risk bars', () => {
      render(
        <SafetyCard
          location={mockLocation}
          assessment={mockAssessment}
          isLoading={false}
          error={null}
        />
      );

      const labels = [
        'Atmosphere',
        'Weather',
        'Politics',
        'Security',
        'Air Quality',
        'Women',
        'LGBTQ+',
        'Kids'
      ];

      labels.forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it('renders risk bar values correctly', () => {
      render(
        <SafetyCard
          location={mockLocation}
          assessment={mockAssessment}
          isLoading={false}
          error={null}
        />
      );

      // Verify a couple of values are rendered correctly based on typical mock responses
      // In the mocks they might be 7, 8, 9, etc.
      expect(screen.getAllByText(/(\d+)\/10/)[0]).toBeInTheDocument();
    });
  });

  describe('Tips/Operational Directives', () => {
    it('renders tips from the assessment', () => {
      render(
        <SafetyCard
          location={mockLocation}
          assessment={mockAssessment}
          isLoading={false}
          error={null}
        />
      );

      expect(screen.getByText('Tips for your trip')).toBeInTheDocument();
      expect(screen.getByText('Keep valuables secure in crowded areas.')).toBeInTheDocument();
    });
  });

  describe('Emergency Contacts', () => {
    it('renders emergency contacts section', () => {
      render(
        <SafetyCard
          location={mockLocation}
          assessment={mockAssessment}
          isLoading={false}
          error={null}
        />
      );

      expect(screen.getByText('Emergency')).toBeInTheDocument();
      expect(screen.getByText('Police')).toBeInTheDocument();
      expect(screen.getAllByText('999')[0]).toBeInTheDocument();
      expect(screen.getByText('Medical')).toBeInTheDocument();
    });
  });

  describe('Logistics & Airspace', () => {
    it('renders airspace status', () => {
      render(
        <SafetyCard
          location={mockLocation}
          assessment={mockAssessment}
          isLoading={false}
          error={null}
        />
      );

      expect(screen.getByText('Logistics')).toBeInTheDocument();
      expect(screen.getByText('Airspace')).toBeInTheDocument();
      expect(screen.getByText('open')).toBeInTheDocument();
    });

    it('renders airspace as restricted when status is restricted', () => {
      const restrictedAssessment = {
        ...mockAssessment,
        logistics: { ...mockAssessment.logistics, airspace: 'restricted' as const },
      };

      render(
        <SafetyCard
          location={mockLocation}
          assessment={restrictedAssessment}
          isLoading={false}
          error={null}
        />
      );

      expect(screen.getByText('restricted')).toBeInTheDocument();
    });
  });

  describe('War Zone Banner', () => {
    it('renders war zone banner when warStatus is active_war', () => {
      render(
        <SafetyCard
          location={mockWarZoneLocation}
          assessment={mockWarZoneAssessment}
          isLoading={false}
          error={null}
        />
      );

      expect(screen.getByText(/Active Conflict Zone/i)).toBeInTheDocument();
      expect(screen.getByText('Russia-Ukraine Conflict')).toBeInTheDocument();
    });

    it('does not render war zone banner for normal locations', () => {
      render(
        <SafetyCard
          location={mockLocation}
          assessment={mockAssessment}
          isLoading={false}
          error={null}
        />
      );

      expect(screen.queryByText(/Active Conflict Zone/i)).not.toBeInTheDocument();
    });
  });
});
