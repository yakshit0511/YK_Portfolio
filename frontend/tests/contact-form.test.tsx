import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithPortfolio } from './helpers';

const contactApi = vi.hoisted(() => ({ sendContact: vi.fn() }));
vi.mock('../src/api/contact', () => ({ sendContact: contactApi.sendContact }));

import { ContactForm } from '../src/components/contact/ContactForm';

function fillValidForm() {
  fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Taylor Example' } });
  fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'taylor@example.test' } });
  fireEvent.change(screen.getByLabelText(/Message/), { target: { value: 'I would like to discuss a portfolio project.' } });
}

describe('contact form', () => {
  beforeEach(() => contactApi.sendContact.mockReset());

  it('shows field validation errors and keeps the honeypot out of tab order', () => {
    renderWithPortfolio(<ContactForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Send Message' }));
    expect(screen.getByText(/Please enter your name/)).toBeInTheDocument();
    expect(screen.getByText(/valid email address/)).toBeInTheDocument();
    const honeypot = screen.getByLabelText('Website');
    expect(honeypot).toHaveAttribute('tabindex', '-1');
  });

  it('preserves entered text after a failed request', async () => {
    contactApi.sendContact.mockResolvedValueOnce({ ok: false, kind: 'network' });
    renderWithPortfolio(<ContactForm />);
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Send Message' }));
    await screen.findByRole('alert');
    expect(screen.getByLabelText(/Name/)).toHaveValue('Taylor Example');
    expect(screen.getByLabelText(/Message/)).toHaveValue('I would like to discuss a portfolio project.');
  });

  it('shows the success card after a successful request', async () => {
    contactApi.sendContact.mockResolvedValueOnce({ ok: true });
    renderWithPortfolio(<ContactForm />);
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Send Message' }));
    await waitFor(() => expect(screen.getByText('Message sent!')).toBeInTheDocument());
  });
});