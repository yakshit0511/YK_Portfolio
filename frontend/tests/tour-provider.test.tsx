import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TourProvider, useTour } from '../src/components/guide/TourProvider';

function TourProbe() {
  const { active, currentStep, steps, start, next } = useTour();
  return <>
    <button onClick={start}>Start tour</button>
    <button onClick={next}>Next step</button>
    <output data-testid="tour-state">{`${active}:${steps.length}:${currentStep?.title ?? ''}`}</output>
  </>;
}

describe('guided tour target selection', () => {
  it('skips steps whose target selector is absent', () => {
    render(<>
      <section id="about"><div className="about-text" /></section>
      <section id="contact"><div className="contact-form" /></section>
      <TourProvider><TourProbe /></TourProvider>
    </>);

    fireEvent.click(screen.getByRole('button', { name: 'Start tour' }));
    expect(screen.getByTestId('tour-state')).toHaveTextContent('true:2:About me');
    fireEvent.click(screen.getByRole('button', { name: 'Next step' }));
    expect(screen.getByTestId('tour-state')).toHaveTextContent("true:2:Let's talk");
  });
});