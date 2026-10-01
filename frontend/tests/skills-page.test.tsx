import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SkillData } from '../src/admin/api/adminApi';

const adminApi = vi.hoisted(() => ({
  getSkills: vi.fn(),
  createSkill: vi.fn(),
  deleteSkill: vi.fn(),
  reorderSkills: vi.fn(),
  updateSkill: vi.fn(),
  showToast: vi.fn(),
  currentSkill: null as SkillData | null,
}));

vi.mock('../src/admin/api/adminApi', () => adminApi);
vi.mock('../src/admin/components/Toast', () => ({ useToast: () => ({ showToast: adminApi.showToast }) }));

import { SkillsPage } from '../src/admin/pages/SkillsPage';

describe('SkillsPage save changes', () => {
  beforeEach(() => {
    const initialSkill: SkillData = {
      _id: 'skill-react',
      name: 'React.js',
      category: 'Frontend',
      level: 90,
      visible: true,
      order: 0,
    };
    adminApi.currentSkill = initialSkill;
    adminApi.getSkills.mockImplementation(async () => adminApi.currentSkill ? [adminApi.currentSkill] : []);
    adminApi.updateSkill.mockImplementation(async (_id: string, payload: Partial<SkillData>) => {
      adminApi.currentSkill = { ...initialSkill, ...payload };
      return adminApi.currentSkill;
    });
    adminApi.reorderSkills.mockResolvedValue([]);
    adminApi.createSkill.mockResolvedValue({});
    adminApi.deleteSkill.mockResolvedValue({});
  });

  it('saves edited name and level together and keeps the saved name in the field', async () => {
    render(<SkillsPage />);

    const nameInput = await screen.findByRole('textbox', { name: 'Frontend skill name' });
    fireEvent.change(nameInput, { target: { value: 'React.js Advanced' } });
    fireEvent.change(screen.getByRole('slider', { name: 'React.js Advanced level' }), { target: { value: '96' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(adminApi.updateSkill).toHaveBeenCalledWith('skill-react', expect.objectContaining({
      name: 'React.js Advanced',
      level: 96,
    })));
    expect(await screen.findByRole('textbox', { name: 'Frontend skill name' })).toHaveValue('React.js Advanced');
    expect(screen.getByText('96')).toBeInTheDocument();
  });
});