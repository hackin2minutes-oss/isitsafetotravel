import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BriefGenerator } from '@/components/BriefGenerator';
import { mockLocation, mockAssessment } from '@/test/mocks';

vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return { ...actual, clipboard: { writeText: vi.fn() } };
});

const mockClipboard = {
  writeText: vi.fn(),
};

Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
});

describe('BriefGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClipboard.writeText.mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('renders the Tactical Brief heading', () => {
      render(<BriefGenerator location={mockLocation} assessment={mockAssessment} />);
      expect(screen.getByText('Tactical Brief')).toBeInTheDocument();
    });

    it('renders the Export Intel Dossier subtitle', () => {
      render(<BriefGenerator location={mockLocation} assessment={mockAssessment} />);
      expect(screen.getByText('Export Intel Dossier')).toBeInTheDocument();
    });

    it('renders a description about the brief', () => {
      render(<BriefGenerator location={mockLocation} assessment={mockAssessment} />);
      expect(
        screen.getByText(/standardized text-based briefing/i)
      ).toBeInTheDocument();
    });
  });

  describe('Copy to Clipboard', () => {
    it('copies the brief text to clipboard when copy button is clicked', async () => {
      render(<BriefGenerator location={mockLocation} assessment={mockAssessment} />);

      const copyBtn = screen.getByRole('button');
      fireEvent.click(copyBtn);

      expect(mockClipboard.writeText).toHaveBeenCalledTimes(1);
      const copiedText = mockClipboard.writeText.mock.calls[0][0] as string;
      expect(copiedText).toContain('[ SENTINEL TACTICAL BRIEF ]');
      expect(copiedText).toContain('LOCATION: LONDON');
      expect(copiedText).toContain('SECURITY RATING: SAFE');
      expect(copiedText).toContain('Airspace: OPEN');
    });

    it('shows Check icon after copying', async () => {
      render(<BriefGenerator location={mockLocation} assessment={mockAssessment} />);

      const copyBtn = screen.getByRole('button');
      fireEvent.click(copyBtn);

      const checkIcon = await screen.findByTestId('check-icon');
      expect(checkIcon).toBeInTheDocument();
    });
  });

  describe('Brief Content', () => {
    it('includes location name in the brief', () => {
      render(<BriefGenerator location={mockLocation} assessment={mockAssessment} />);

      fireEvent.click(screen.getByRole('button'));

      const copiedText = mockClipboard.writeText.mock.calls[0][0] as string;
      expect(copiedText).toContain('LOCATION: LONDON');
    });

    it('includes security rating and score in the brief', () => {
      render(<BriefGenerator location={mockLocation} assessment={mockAssessment} />);

      fireEvent.click(screen.getByRole('button'));

      const copiedText = mockClipboard.writeText.mock.calls[0][0] as string;
      expect(copiedText).toContain('SECURITY RATING: SAFE (Score: 85/100)');
    });

    it('includes emergency contacts in the brief', () => {
      render(<BriefGenerator location={mockLocation} assessment={mockAssessment} />);

      fireEvent.click(screen.getByRole('button'));

      const copiedText = mockClipboard.writeText.mock.calls[0][0] as string;
      expect(copiedText).toContain('Police: 999');
      expect(copiedText).toContain('Ambulance: 999');
      expect(copiedText).toContain('Fire: 999');
      expect(copiedText).toContain('Helpline: 111');
    });

    it('includes travel requirements in the brief', () => {
      render(<BriefGenerator location={mockLocation} assessment={mockAssessment} />);

      fireEvent.click(screen.getByRole('button'));

      const copiedText = mockClipboard.writeText.mock.calls[0][0] as string;
      expect(copiedText).toContain('TRAVEL REQUIREMENTS');
      expect(copiedText).toContain('Visa: Required for most nationalities');
    });

    it('includes tips/operational directives in the brief', () => {
      render(<BriefGenerator location={mockLocation} assessment={mockAssessment} />);

      fireEvent.click(screen.getByRole('button'));

      const copiedText = mockClipboard.writeText.mock.calls[0][0] as string;
      expect(copiedText).toContain('OPERATIONAL DIRECTIVES');
      expect(copiedText).toContain('1. Keep valuables secure in crowded areas.');
    });

    it('includes logistics and airspace info in the brief', () => {
      render(<BriefGenerator location={mockLocation} assessment={mockAssessment} />);

      fireEvent.click(screen.getByRole('button'));

      const copiedText = mockClipboard.writeText.mock.calls[0][0] as string;
      expect(copiedText).toContain('LOGISTICS & AIRSPACE');
      expect(copiedText).toContain('Airspace: OPEN');
    });

    it('includes population and land area in the brief', () => {
      render(<BriefGenerator location={mockLocation} assessment={mockAssessment} />);

      fireEvent.click(screen.getByRole('button'));

      const copiedText = mockClipboard.writeText.mock.calls[0][0] as string;
      expect(copiedText).toContain('GLOBAL CENSUS DATA');
      expect(copiedText).toContain('Population: 9,000,000');
      expect(copiedText).toContain('Land Area: 1,572 km²');
    });

    it('includes news items in the brief', () => {
      render(<BriefGenerator location={mockLocation} assessment={mockAssessment} />);

      fireEvent.click(screen.getByRole('button'));

      const copiedText = mockClipboard.writeText.mock.calls[0][0] as string;
      expect(copiedText).toContain('GEOPOLITICAL INTELLIGENCE');
      expect(copiedText).toContain('London announces new cycling infrastructure');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty tips array gracefully', () => {
      const noTipsAssessment = { ...mockAssessment, tips: [] };

      render(<BriefGenerator location={mockLocation} assessment={noTipsAssessment} />);

      fireEvent.click(screen.getByRole('button'));

      const copiedText = mockClipboard.writeText.mock.calls[0][0] as string;
      expect(copiedText).toContain('No recent headlines detected');
    });

    it('handles empty news array gracefully', () => {
      const noNewsAssessment = { ...mockAssessment, news: [] };

      render(<BriefGenerator location={mockLocation} assessment={noNewsAssessment} />);

      fireEvent.click(screen.getByRole('button'));

      const copiedText = mockClipboard.writeText.mock.calls[0][0] as string;
      expect(copiedText).toContain('No recent headlines detected');
    });

    it('handles restricted airspace in the brief', () => {
      const restrictedAssessment = {
        ...mockAssessment,
        logistics: { ...mockAssessment.logistics, airspace: 'restricted' as const },
      };

      render(<BriefGenerator location={mockLocation} assessment={restrictedAssessment} />);

      fireEvent.click(screen.getByRole('button'));

      const copiedText = mockClipboard.writeText.mock.calls[0][0] as string;
      expect(copiedText).toContain('Airspace: RESTRICTED');
    });

    it('handles closed airspace in the brief', () => {
      const closedAssessment = {
        ...mockAssessment,
        logistics: { ...mockAssessment.logistics, airspace: 'closed' as const },
      };

      render(<BriefGenerator location={mockLocation} assessment={closedAssessment} />);

      fireEvent.click(screen.getByRole('button'));

      const copiedText = mockClipboard.writeText.mock.calls[0][0] as string;
      expect(copiedText).toContain('Airspace: CLOSED');
    });
  });
});
