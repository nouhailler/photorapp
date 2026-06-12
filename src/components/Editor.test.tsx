import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Editor from './Editor';
import { usePhotos } from '../context/PhotoContext';
import { usePhotoUrl } from '../hooks/usePhotoUrl';
import React from 'react';

// Mock the hooks
vi.mock('../context/PhotoContext', () => ({
  usePhotos: vi.fn(),
}));

vi.mock('../hooks/usePhotoUrl', () => ({
  usePhotoUrl: vi.fn(),
}));

const mockPhoto = {
  id: '1',
  url: 'test-url.jpg',
  alt: 'Test Photo',
  date: '2024-01-01',
  isFavorite: false,
  albumIds: [],
  tags: [],
  storage: 'remote' as const,
  metadata: { device: 'Test', resolution: '1x1', date: 'now' },
  adjustments: { brightness: 0, contrast: 0, saturation: 0, filter: '', rotation: 0, aspectRatio: 'original' }
};

describe('Editor Component', () => {
  const mockUpdateAdjustments = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (usePhotos as any).mockReturnValue({
      updateAdjustments: mockUpdateAdjustments,
    });
    (usePhotoUrl as any).mockReturnValue('mocked-url.jpg');
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

  it('applies magic adjustments', () => {
    render(<Editor photo={mockPhoto} onClose={mockOnClose} />);
    
    const magicButton = screen.getByText('Magic').parentElement;
    fireEvent.click(magicButton!);
    
    // Magic applies 10 brightness, 20 contrast, 15 saturation
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
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
    
    const rotateButton = screen.getByText('Rotate').parentElement;
    fireEvent.click(rotateButton!);
    
    // We can't easily check the image style in jsdom without more setup, 
    // but we can check if the state would be passed to save
    fireEvent.click(screen.getByText('Enregistrer'));
    expect(mockUpdateAdjustments).toHaveBeenCalledWith(mockPhoto.id, expect.objectContaining({ rotation: 90 }));
  });
});
