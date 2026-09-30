import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const motionSetting = vi.hoisted(() => ({ reduced: false }));
const titles = ['A', 'B'];
vi.mock('../src/hooks/useReducedMotion', () => ({ useReducedMotion: () => motionSetting.reduced }));

import { TypingText } from '../src/components/hero/TypingText';

describe('TypingText', () => {
  beforeEach(() => { motionSetting.reduced = false; });

  it('shows a static title when reduced motion is preferred', () => {
    motionSetting.reduced = true;
    render(<TypingText titles={['Static role', 'Second role']} />);
    expect(screen.getByLabelText('Static role')).toHaveTextContent('Static role');
  });

  it('cycles to the next title when motion is allowed', async () => {
    render(<TypingText titles={titles} />);
    await screen.findByLabelText('B', {}, { timeout: 5000 });
    await waitFor(() => expect(screen.getByLabelText('B')).toHaveTextContent('B'));
  });
});