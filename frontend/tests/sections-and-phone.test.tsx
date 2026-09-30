import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { describe, expect, it, vi } from 'vitest';
import { fallbackData } from '../src/data/fallbackData';

const portfolioState = vi.hoisted(() => ({ data: null as unknown }));
vi.mock('../src/context/PortfolioContext', () => ({ usePortfolio: () => ({ data: portfolioState.data }) }));
vi.mock('../src/components/hero/Hero', () => ({ Hero: () => <div data-testid="hero" /> }));
vi.mock('../src/components/sections/About', () => ({ About: () => <div data-testid="about" /> }));
vi.mock('../src/components/sections/Skills', () => ({ Skills: () => <div data-testid="skills" /> }));
vi.mock('../src/components/sections/Projects', () => ({ Projects: () => <div data-testid="projects" /> }));
vi.mock('../src/components/sections/Education', () => ({ Education: () => <div data-testid="education" /> }));
vi.mock('../src/components/sections/Experience', () => ({ Experience: () => <div data-testid="experience" /> }));
vi.mock('../src/components/sections/Contact', () => ({ Contact: () => <div data-testid="contact" /> }));

import { Home } from '../src/pages/Home';
import { ContactInfo } from '../src/components/contact/ContactInfo';

describe('portfolio visibility', () => {
  it('does not render hidden sections or an empty experience section', () => {
    portfolioState.data = {
      ...fallbackData,
      experience: [],
      sections: [
        { key: 'about', title: 'About', visible: true, order: 0 },
        { key: 'skills', title: 'Skills', visible: false, order: 1 },
        { key: 'experience', title: 'Experience', visible: true, order: 2 },
        { key: 'contact', title: 'Contact', visible: true, order: 3 },
      ],
    };

    render(<HelmetProvider><Home /></HelmetProvider>);
    expect(screen.getByTestId('about')).toBeInTheDocument();
    expect(screen.queryByTestId('skills')).not.toBeInTheDocument();
    expect(screen.queryByTestId('experience')).not.toBeInTheDocument();
    expect(screen.getByTestId('contact')).toBeInTheDocument();
  });

  it('includes the internship entries in the default experience data', () => {
    expect(fallbackData.experience).toHaveLength(2);
    expect(fallbackData.experience.map((item) => item.company)).toEqual([
      'TechnoHacks Solutions',
      'DZ Infotech Bhavnagar, Gujarat, India (Remote)',
    ]);
    expect(fallbackData.experience[0].role).toBe('Full Stack Web Development Intern');
    expect(fallbackData.experience[1].role).toBe('Full Stack Web Development Intern');
  });

  it('does not show phone or WhatsApp links when no public phone is set', () => {
    portfolioState.data = fallbackData;
    render(<ContactInfo />);
    expect(document.querySelector('a[href^="tel:"]')).toBeNull();
    expect(document.querySelector('a[href^="https://wa.me/"]')).toBeNull();
    expect(screen.queryByText(/8780150610/)).not.toBeInTheDocument();
  });
});