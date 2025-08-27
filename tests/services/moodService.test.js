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

import { moodService } from '../../src/services/moodService';

describe('moodService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a mood entry', async () => {
    const res = await moodService.createMoodEntry({ userId: 'u1', moodLevel: 'good' });
    expect(res.success).toBe(true);
  });

  it('fetches mood entries', async () => {
    const mockFrom = vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    }));
    const { supabase } = await import('../../src/lib/supabase');
    supabase.from = mockFrom;
    mockFrom().order.mockResolvedValue({ data: [], error: null });
    const res = await moodService.getMoodEntries('u1');
    expect(res.success).toBe(true);
    expect(res.data).toEqual([]);
  });
});
