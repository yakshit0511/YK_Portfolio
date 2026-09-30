import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LoaderCircle, Send } from 'lucide-react';
import { sendContact } from '../../api/contact';
import type { ContactErrors, ContactPayload } from '../../types/contact';
import { usePortfolio } from '../../context/PortfolioContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { GlowButton } from '../ui/GlowButton';
import { GlassCard } from '../ui/GlassCard';
import { SuccessCard } from './SuccessCard';

type ContactValues = Omit<ContactPayload, 'startedAt'>;
type ContactField = keyof Pick<ContactValues, 'name' | 'email' | 'subject' | 'message'>;

const emptyValues: ContactValues = { name: '', email: '', subject: '', message: '', website: '' };

function validate(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  const nameLength = values.name.trim().length;
  if (nameLength < 2 || values.name.length > 100) errors.name = 'Please enter your name (at least 2 characters).';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()) || values.email.trim().length > 254) {
    errors.email = 'Please enter a valid email address.';
  }
  if (values.subject.length > 150) errors.subject = 'Subject must be 150 characters or fewer.';
  if (values.message.trim().length < 10 || values.message.length > 3000) {
    errors.message = 'Please enter a message between 10 and 3000 characters.';
  }
  return errors;
}

export function ContactForm() {
  const { data } = usePortfolio();
  const reducedMotion = useReducedMotion();
  const [values, setValues] = useState<ContactValues>(emptyValues);
  const [fieldErrors, setFieldErrors] = useState<ContactErrors>({});
  const [formError, setFormError] = useState('');
  const [errorKind, setErrorKind] = useState<'rate_limit' | 'network' | 'server' | ''>('');
  const [isSending, setIsSending] = useState(false);
  const [serverWaking, setServerWaking] = useState(false);
  const [success, setSuccess] = useState(false);
  const startedAt = useRef(Date.now());
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const refs = { name: nameRef, email: emailRef, subject: subjectRef, message: messageRef };
  const email = data.profile?.email;

  useEffect(() => {
    if (!isSending) {
      setServerWaking(false);
      return;
    }
    const timeout = window.setTimeout(() => setServerWaking(true), 5000);
    return () => window.clearTimeout(timeout);
  }, [isSending]);

  const changeField = (field: keyof ContactValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (field in fieldErrors) {
      setFieldErrors((current) => {
        const next = { ...current };
        delete next[field as ContactField];
        return next;
      });
    }
  };

  const blurField = (field: ContactField) => {
    const errors = validate(values);
    setFieldErrors((current) => {
      const next = { ...current };
      if (errors[field]) next[field] = errors[field];
      else delete next[field];
      return next;
    });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSending) return;

    const errors = validate(values);
    setFieldErrors(errors);
    setFormError('');
    setErrorKind('');
    const firstInvalidField = (['name', 'email', 'subject', 'message'] as const).find((field) => errors[field]);
    if (firstInvalidField) {
      refs[firstInvalidField].current?.focus();
      return;
    }

    setIsSending(true);
    try {
      const result = await sendContact({ ...values, startedAt: startedAt.current });
      if (result.ok) {
        setSuccess(true);
        return;
      }

      if (result.kind === 'validation') {
        setFieldErrors(result.fieldErrors || {});
        const firstServerField = (['name', 'email', 'subject', 'message'] as const).find((field) => result.fieldErrors?.[field]);
        if (firstServerField) refs[firstServerField].current?.focus();
        else setFormError(result.message);
        return;
      }

      setErrorKind(result.kind);
      setFormError(result.kind === 'rate_limit'
        ? `You've sent a few messages already. Please try again later${email ? `, or email me directly at ${email}` : ''}.`
        : `Something went wrong sending your message. Please try again${email ? `, or email me directly at ${email}` : ''}.`);
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setValues(emptyValues);
    setFieldErrors({});
    setFormError('');
    setErrorKind('');
    setSuccess(false);
    startedAt.current = Date.now();
  };

  const describedBy = (field: ContactField, extraId?: string) =>
    [`contact-${field}-error`, extraId || ''].filter(Boolean).join(' ');

  return <GlassCard className="contact-form" layout>
    <AnimatePresence mode="wait" initial={false}>
      {success ? <SuccessCard key="success" firstName={values.name.trim().split(/\s+/)[0]} email={values.email} onSendAnother={resetForm} /> :
        <motion.form
          key="form"
          className="contact-form-fields"
          noValidate
          onSubmit={submit}
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: reducedMotion ? 0.1 : 0.22 }}
        >
          <div className="contact-field-row">
            <div className="contact-field">
              <label htmlFor="contact-name">Name <span>*</span></label>
              <input ref={nameRef} id="contact-name" name="name" value={values.name} onChange={(event) => changeField('name', event.target.value)} onBlur={() => blurField('name')} autoComplete="name" maxLength={100} required aria-invalid={Boolean(fieldErrors.name)} aria-describedby={describedBy('name')} />
              <span id="contact-name-error" className="contact-field-error" aria-live="polite">{fieldErrors.name}</span>
            </div>
            <div className="contact-field">
              <label htmlFor="contact-email">Email <span>*</span></label>
              <input ref={emailRef} id="contact-email" name="email" type="email" value={values.email} onChange={(event) => changeField('email', event.target.value)} onBlur={() => blurField('email')} autoComplete="email" maxLength={254} required aria-invalid={Boolean(fieldErrors.email)} aria-describedby={describedBy('email')} />
              <span id="contact-email-error" className="contact-field-error" aria-live="polite">{fieldErrors.email}</span>
            </div>
          </div>
          <div className="contact-field">
            <label htmlFor="contact-subject">Subject <span className="contact-optional">Optional</span></label>
            <input ref={subjectRef} id="contact-subject" name="subject" value={values.subject} onChange={(event) => changeField('subject', event.target.value)} onBlur={() => blurField('subject')} maxLength={150} aria-invalid={Boolean(fieldErrors.subject)} aria-describedby={describedBy('subject')} />
            <span id="contact-subject-error" className="contact-field-error" aria-live="polite">{fieldErrors.subject}</span>
          </div>
          <div className="contact-field">
            <label htmlFor="contact-message">Message <span>*</span></label>
            <textarea ref={messageRef} id="contact-message" name="message" value={values.message} onChange={(event) => changeField('message', event.target.value)} onBlur={() => blurField('message')} rows={6} maxLength={3000} required aria-invalid={Boolean(fieldErrors.message)} aria-describedby={describedBy('message', 'contact-message-count')} />
            <span id="contact-message-error" className="contact-field-error" aria-live="polite">{fieldErrors.message}</span>
            <span id="contact-message-count" className={`contact-character-count${values.message.length >= 2850 ? ' is-near-limit' : ''}`}>{values.message.length}/3000</span>
          </div>
          <div className="contact-honeypot" aria-hidden="true">
            <label htmlFor="contact-website">Website</label>
            <input id="contact-website" name="website" value={values.website} onChange={(event) => changeField('website', event.target.value)} tabIndex={-1} autoComplete="off" />
          </div>
          <div className="contact-form-feedback">
            {serverWaking && <p className="contact-waking-note" role="status">The server is waking up, this can take a few seconds...</p>}
            {formError && <div className="contact-error-banner" role="alert">
              <p>{formError}</p>
              {email && errorKind && <a href={`mailto:${email}`}>Email me directly</a>}
            </div>}
          </div>
          <GlowButton as="button" type="submit" className="contact-submit" disabled={isSending}>
            {isSending ? <><LoaderCircle className="contact-spinner" size={17} aria-hidden="true" />Sending...</> : <><Send size={16} aria-hidden="true" />Send Message</>}
          </GlowButton>
        </motion.form>}
    </AnimatePresence>
  </GlassCard>;
}