/**
 * SignalCard Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignalCard } from '../components/SignalCard';
import type { NewsArticle } from '../types/news';

const mockArticle: NewsArticle = {
  id: '1',
  title: 'Major Hurricane Threatens Florida Coast',
  link: 'https://example.com/article',
  canonicalLink: 'https://example.com/article',
  excerpt: 'A powerful hurricane is approaching Florida with potential for significant damage.',
  publishedAt: Date.now() - 60000, // 1 minute ago
  sourceId: 'nws_alerts',
  states: ['FL', 'GA'],
  lobs: ['Homeowners', 'Commercial Property'],
  carriers: ['Allstate', 'State Farm'],
  regulators: ['NAIC'],
  severity: 5,
  actionability: 'File Response',
  score: 95,
  clusterKey: 'hurricane_fl_2024',
  topics: ['catastrophe', 'hurricane'],
  confidence: 0.95,
  validationPass: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

describe('SignalCard', () => {
  it('renders article title', () => {
    render(<SignalCard article={mockArticle} />);
    expect(screen.getByText(mockArticle.title)).toBeInTheDocument();
  });

  it('renders article excerpt', () => {
    render(<SignalCard article={mockArticle} />);
    expect(screen.getByText(mockArticle.excerpt)).toBeInTheDocument();
  });

  it('renders severity badge', () => {
    render(<SignalCard article={mockArticle} />);
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
  });

  it('renders actionability badge', () => {
    render(<SignalCard article={mockArticle} />);
    expect(screen.getByText('File Response')).toBeInTheDocument();
  });

  it('renders states', () => {
    render(<SignalCard article={mockArticle} />);
    expect(screen.getByText('FL')).toBeInTheDocument();
    expect(screen.getByText('GA')).toBeInTheDocument();
  });

  it('renders LOBs', () => {
    render(<SignalCard article={mockArticle} />);
    expect(screen.getByText('Homeowners')).toBeInTheDocument();
    expect(screen.getByText('Commercial Property')).toBeInTheDocument();
  });

  it('renders carriers', () => {
    render(<SignalCard article={mockArticle} />);
    expect(screen.getByText('Allstate')).toBeInTheDocument();
    expect(screen.getByText('State Farm')).toBeInTheDocument();
  });

  it('renders score', () => {
    render(<SignalCard article={mockArticle} />);
    expect(screen.getByText(/95/)).toBeInTheDocument();
  });

  it('renders confidence percentage', () => {
    render(<SignalCard article={mockArticle} />);
    expect(screen.getByText(/95% confidence/)).toBeInTheDocument();
  });

  it('renders external link button', () => {
    render(<SignalCard article={mockArticle} />);
    const link = screen.getByRole('link', { name: mockArticle.title });
    expect(link).toHaveAttribute('href', mockArticle.link);
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('calls onExpand when expand button is clicked', async () => {
    const onExpand = jest.fn();
    render(<SignalCard article={mockArticle} clusterSize={3} onExpand={onExpand} />);

    const expandButton = screen.getByText(/Show.*3 related/);
    await userEvent.click(expandButton);

    expect(onExpand).toHaveBeenCalled();
  });

  it('shows "Hide" text when expanded', () => {
    render(<SignalCard article={mockArticle} clusterSize={3} isExpanded={true} />);
    expect(screen.getByText(/Hide/)).toBeInTheDocument();
  });

  it('renders hazard badge when hazard data exists', () => {
    const articleWithHazard = {
      ...mockArticle,
      hazard: {
        type: 'hurricane',
        geo: { lat: 25.5, lng: -80.2 },
      },
    };

    render(<SignalCard article={articleWithHazard} />);
    expect(screen.getByText('Hazard')).toBeInTheDocument();
  });

  it('displays time ago correctly', () => {
    render(<SignalCard article={mockArticle} />);
    expect(screen.getByText(/ago/)).toBeInTheDocument();
  });

  it('truncates long titles', () => {
    const longTitleArticle = {
      ...mockArticle,
      title: 'A'.repeat(200),
    };

    const { container } = render(<SignalCard article={longTitleArticle} />);
    const titleElement = container.querySelector('h3');
    expect(titleElement).toHaveClass('line-clamp-2');
  });

  it('truncates long excerpts', () => {
    const longExcerptArticle = {
      ...mockArticle,
      excerpt: 'A'.repeat(500),
    };

    const { container } = render(<SignalCard article={longExcerptArticle} />);
    const excerptElement = container.querySelector('p');
    expect(excerptElement).toHaveClass('line-clamp-2');
  });

  it('shows +N indicator for excess states', () => {
    const manyStatesArticle = {
      ...mockArticle,
      states: ['FL', 'GA', 'SC', 'NC', 'VA'],
    };

    render(<SignalCard article={manyStatesArticle} />);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });
});

