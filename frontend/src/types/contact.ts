export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
  startedAt: number;
}

export type ContactErrors = Partial<Record<'name' | 'email' | 'subject' | 'message', string>>;