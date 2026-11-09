import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Editor from './Editor';
import { usePhotos } from '../context/usePhotos';
import { usePhotoUrl } from '../hooks/usePhotoUrl';
import type { Photo } from '../types/types';

// Mock the hooks
vi.mock('../context/usePhotos', () => ({
  usePhotos: vi.fn(),
}));

vi.mock('../hooks/usePhotoUrl', () => ({
  usePhotoUrl: vi.fn(),
}));

const mockPhoto: Photo = {
  id: '1',
  url: 'test-url.jpg',
  alt: 'Test Photo',
  date: '2024-01-01',
  isFavorite: false,
  albumIds: [],
  tags: [],
  storage: 'remote',
  metadata: { device: 'Test', resolution: '1x1', date: 'now' },
  adjustments: { brightness: 0, contrast: 0, saturation: 0, filter: '', rotation: 0, aspectRatio: 'original' },
};

describe('Editor Component', () => {
  const mockUpdateAdjustments = vi.fn();
  const mockResetAdjustments = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePhotos).mockReturnValue({
      photos: [mockPhoto],
      albums: [],
      isLoading: false,
      toggleFavorite: vi.fn(),
      updateAdjustments: mockUpdateAdjustments,
      resetAdjustments: mockResetAdjustments,
      addPhotos: vi.fn(),
      deletePhoto: vi.fn(),
      deletePhotos: vi.fn(),
      createAlbum: vi.fn(),
      updateAlbum: vi.fn(),
      deleteAlbum: vi.fn(),
      addPhotosToAlbum: vi.fn(),
      removePhotoFromAlbum: vi.fn(),
      setAlbumCover: vi.fn(),
      getPhotoUrl: vi.fn().mockResolvedValue('mocked-url.jpg'),
      analyzePhoto: vi.fn(),
      analyzeAllPhotos: vi.fn(),
    });
    vi.mocked(usePhotoUrl).mockReturnValue('mocked-url.jpg');
  });

  it('renders the editor with photo and controls', () => {
    render(<Editor photo={mockPhoto} onClose={mockOnClose} />);

    expect(screen.getByAltText('Test Photo')).toBeInTheDocument();
    expect(screen.getByText('Enregistrer')).toBeInTheDocument();
    expect(screen.getByText('Brightness')).toBeInTheDocument();
  });

  it('updates brightness slider', () => {
    render(<Editor photo={mockPhoto} onClose={mockOnClose} />);

    const slider = screen.getByLabelText(/Brightness/i);
    fireEvent.change(slider, { target: { value: '50' } });

    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('applies auto adjustments preset', () => {
    render(<Editor photo={mockPhoto} onClose={mockOnClose} />);

    const autoButton = screen.getByText(/Auto-Ajustement/i).closest('button');
    expect(autoButton).not.toBeNull();
    fireEvent.click(autoButton!);

    // Auto-ajustement applies brightness 10, contrast 20, saturation 15
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getAllByText('15').length).toBeGreaterThanOrEqual(1);
  });

  it('calls updateAdjustments and onClose when saving', () => {
    render(<Editor photo={mockPhoto} onClose={mockOnClose} />);

    const saveButton = screen.getByText('Enregistrer');
    fireEvent.click(saveButton);

    expect(mockUpdateAdjustments).toHaveBeenCalledWith(mockPhoto.id, expect.any(Object));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('rotates the image', () => {
    render(<Editor photo={mockPhoto} onClose={mockOnClose} />);

    const rotateButton = screen.getByText(/Pivoter/i).closest('button');
    expect(rotateButton).not.toBeNull();
    fireEvent.click(rotateButton!);

    fireEvent.click(screen.getByText('Enregistrer'));
    expect(mockUpdateAdjustments).toHaveBeenCalledWith(
      mockPhoto.id,
      expect.objectContaining({ rotation: 90 })
    );
  });
});
