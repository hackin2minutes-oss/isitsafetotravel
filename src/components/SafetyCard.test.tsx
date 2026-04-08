import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SafetyCard } from '@/components/SafetyCard';
import {
  mockLocation,
  mockAssessment,
  mockWarZoneLocation,
  mockWarZoneAssessment,
} from '@/test/mocks';

vi.mock('@/components/BriefGenerator', () => ({
  BriefGenerator: ({ location, assessment }: any) => (
    <div data-testid="brief-generator">
      Brief for {location?.name} - Score: {assessment?.score}
    </div>
  ),
}));

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

      expect(screen.getByText('Select a Destination')).toBeInTheDocument();
      expect(
        screen.getByText(/Pick a point on the map to begin/i)
      ).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('renders skeleton loading UI when isLoading is true', () => {
      render(
        <SafetyCard
          location={null}
          assessment={null}
          isLoading={true}
          error={null}
        />
      );

      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
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

      expect(screen.getByText('Analysis Failure')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch safety data')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /reinitialize system/i })
      ).toBeInTheDocument();
    });

    it('calls window.location.reload when Reinitialize button is clicked', () => {
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

      fireEvent.click(screen.getByRole('button', { name: /reinitialize system/i }));
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

      expect(screen.getByText('Census Population')).toBeInTheDocument();
      expect(screen.getByText('9,000,000')).toBeInTheDocument();
      expect(screen.getByText('Total Land Area')).toBeInTheDocument();
      expect(screen.getByText('1,572 km²')).toBeInTheDocument();
    });
  });

  describe('Risk Bars', () => {
    it('renders all 8 safety dimensions as risk bars', () => {
      render(
        <SafetyCard
          location={mockLocation}
          assessment={mockAssessment}
          isLoading={false}
          error={null}
        />
      );

      const labels = [
        'Crime Safety',
        'Political Stability',
        'Health Infrastructure',
        'Terrorism Risk',
        'Natural Disaster',
        'Transport Safety',
        "Women's Safety",
        'LGBTQ+ Safety',
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

      expect(screen.getByText('7/10')).toBeInTheDocument();
      expect(screen.getByText('8/10')).toBeInTheDocument();
      expect(screen.getByText('9/10')).toBeInTheDocument();
    });
  });

  describe('Tips/Operational Directives', () => {
    it('renders all tips from the assessment', () => {
      render(
        <SafetyCard
          location={mockLocation}
          assessment={mockAssessment}
          isLoading={false}
          error={null}
        />
      );

      expect(screen.getByText('Operational Directives')).toBeInTheDocument();
      expect(screen.getByText('Keep valuables secure in crowded areas.')).toBeInTheDocument();
      expect(screen.getByText('Use registered taxi services.')).toBeInTheDocument();
      expect(screen.getByText('Stay aware of your surroundings.')).toBeInTheDocument();
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
      expect(screen.getByText('999')).toBeInTheDocument();
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

      expect(screen.getByText('Aviation & Logistics')).toBeInTheDocument();
      expect(screen.getByText('Airspace')).toBeInTheDocument();
      expect(screen.getByText('OPEN')).toBeInTheDocument();
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

      expect(screen.getByText('RESTRICTED')).toBeInTheDocument();
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

      expect(screen.getByText(/active armed conflict/i)).toBeInTheDocument();
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

      expect(screen.queryByText(/active armed conflict/i)).not.toBeInTheDocument();
    });
  });

  describe('View Mode Toggle', () => {
    it('renders view mode toggle buttons', () => {
      render(
        <SafetyCard
          location={mockLocation}
          assessment={mockAssessment}
          isLoading={false}
          error={null}
        />
      );

      expect(screen.getByRole('button', { name: /monitor/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /smartphone/i })).toBeInTheDocument();
    });

    it('starts in desktop view mode by default', () => {
      render(
        <SafetyCard
          location={mockLocation}
          assessment={mockAssessment}
          isLoading={false}
          error={null}
        />
      );

      const desktopBtn = screen.getByRole('button', { name: /monitor/i });
      expect(desktopBtn.closest('button')).toHaveClass('text-emerald-500');
    });
  });

  describe('BriefGenerator Integration', () => {
    it('renders BriefGenerator component with location and assessment', () => {
      render(
        <SafetyCard
          location={mockLocation}
          assessment={mockAssessment}
          isLoading={false}
          error={null}
        />
      );

      const briefGen = screen.getByTestId('brief-generator');
      expect(briefGen).toHaveTextContent(`Brief for London`);
      expect(briefGen).toHaveTextContent('Score: 85');
    });
  });
});
