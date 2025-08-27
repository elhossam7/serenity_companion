import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: '1' }, error: null }),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { id: '1' }, error: null }),
        }),
      }
      return chain
    }),
  },
}));

import { journalService } from '../../src/services/journalService';

describe('journalService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a journal entry', async () => {
    const res = await journalService.createJournalEntry({ content: 'hello' });
    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
  });

  it('fetches journal entries (handles error -> fallback)', async () => {
    const mockFrom = vi.fn(() => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
    }));
    const { supabase } = await import('../../src/lib/supabase');
    supabase.from = mockFrom;
    mockFrom().order.mockResolvedValue({ data: [], error: null });
    const res = await journalService.getJournalEntries('user-1');
    expect(res.success).toBe(true);
    expect(res.data).toEqual([]);
  });
});
