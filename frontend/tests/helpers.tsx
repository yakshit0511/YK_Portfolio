import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { PortfolioProvider } from '../src/context/PortfolioContext';

export function renderWithPortfolio(children: ReactNode) {
  return render(<PortfolioProvider>{children}</PortfolioProvider>);
}