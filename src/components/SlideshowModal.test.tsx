import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SlideshowModal } from './SlideshowModal';
import type { Photo } from '../types/types';

vi.mock('../hooks/usePhotoUrl', () => ({
  usePhotoUrl: (photo: Photo) => photo.url || 'mocked-photo.jpg',
}));

const mockPhotos: Photo[] = [
  {
    id: 'p1',
    url: 'http://example.com/p1.jpg',
    alt: 'First Photo',
    date: '2024-01-01',
    isFavorite: true,
    albumIds: [],
    tags: [],
    metadata: { device: 'Camera 1', resolution: '100x100', date: '2024-01-01' },
  },
  {
    id: 'p2',
    url: 'http://example.com/p2.jpg',
    alt: 'Second Photo',
    date: '2024-01-02',
    isFavorite: false,
    albumIds: [],
    tags: [],
    metadata: { device: 'Camera 2', resolution: '100x100', date: '2024-01-02' },
  },
];

describe('SlideshowModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <SlideshowModal photos={mockPhotos} isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when photos list is empty', () => {
    const { container } = render(
      <SlideshowModal photos={[]} isOpen={true} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders single photo gracefully', () => {
    render(
      <SlideshowModal photos={[mockPhotos[0]]} isOpen={true} onClose={mockOnClose} />
    );
    expect(screen.getByText('First Photo')).toBeInTheDocument();
    expect(screen.getByText(/Diaporama \(1 \/ 1\)/i)).toBeInTheDocument();
  });

  it('navigates next and previous photos', () => {
    render(
      <SlideshowModal photos={mockPhotos} isOpen={true} onClose={mockOnClose} />
    );

    expect(screen.getByText('First Photo')).toBeInTheDocument();

    const nextButtons = screen.getAllByRole('button').filter((b) =>
      b.textContent?.includes('chevron_right') || b.textContent?.includes('skip_next')
    );
    expect(nextButtons.length).toBeGreaterThan(0);
    fireEvent.click(nextButtons[0]);

    expect(screen.getByText('Second Photo')).toBeInTheDocument();

    const prevButtons = screen.getAllByRole('button').filter((b) =>
      b.textContent?.includes('chevron_left') || b.textContent?.includes('skip_previous')
    );
    fireEvent.click(prevButtons[0]);

    expect(screen.getByText('First Photo')).toBeInTheDocument();
  });

  it('toggles pause and play state on click', () => {
    render(
      <SlideshowModal photos={mockPhotos} isOpen={true} onClose={mockOnClose} />
    );

    // Initial isPlaying is true -> icon is pause
    const playPauseBtn = screen.getByText('pause').closest('button');
    expect(playPauseBtn).not.toBeNull();
    fireEvent.click(playPauseBtn!);

    // Should now show play_arrow icon
    expect(screen.getByText('play_arrow')).toBeInTheDocument();
  });

  it('toggles shuffle button state', () => {
    render(
      <SlideshowModal photos={mockPhotos} isOpen={true} onClose={mockOnClose} />
    );

    const shuffleBtn = screen.getByTitle('Lecture aléatoire');
    expect(shuffleBtn).toBeInTheDocument();
    fireEvent.click(shuffleBtn);
    expect(shuffleBtn.className).toContain('bg-primary');
  });

  it('calls onClose when close button is clicked or Escape key pressed', () => {
    render(
      <SlideshowModal photos={mockPhotos} isOpen={true} onClose={mockOnClose} />
    );

    const closeBtn = screen.getByText('close').closest('button');
    fireEvent.click(closeBtn!);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });
});
