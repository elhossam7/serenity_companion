/* @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import * as aiServiceModule from '../services/aiService';
import * as supabaseModule from '../lib/supabase';
import ChatPage from '../pages/ai-chat-support';
import { detectCrisis, chatReducer, initialChatState } from '../pages/ai-chat-support/utils.js';

vi.mock('../services/aiService');

// Supabase mock resolves without throwing
vi.spyOn(supabaseModule, 'supabase', 'get').mockReturnValue({
  from: () => ({ insert: () => Promise.resolve({ data: null, error: null }) })
});

const wrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('AI Chat Support', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
  });

  it('detectCrisis returns true for crisis terms', () => {
    expect(detectCrisis('I want to commit suicide')).toBe(true);
    expect(detectCrisis('هذا انتحار')).toBe(true);
    expect(detectCrisis('rien de spécial')).toBe(false);
  });

  it('chatReducer handles basic transitions', () => {
    const afterUser = chatReducer(initialChatState, { type: 'addUserMessage', payload: { id: '1', content: 'hello' } });
    expect(afterUser.messages).toHaveLength(1);
    expect(afterUser.messages[0].role).toBe('user');

    const loading = chatReducer(afterUser, { type: 'setLoading', payload: true });
    expect(loading.isLoading).toBe(true);

    const emergency = chatReducer(loading, { type: 'toggleEmergency', payload: true });
    expect(emergency.showEmergency).toBe(true);

    const reset = chatReducer(emergency, { type: 'reset' });
    expect(reset.messages).toHaveLength(0);
    expect(reset.isLoading).toBe(false);
    expect(reset.showEmergency).toBe(false);
  });

  it('renders and toggles emergency overlay on crisis input', async () => {
    aiServiceModule.aiService.generateSuggestions.mockResolvedValue({ success: true, data: [{ content: 'Ok' }] });

    render(<ChatPage />, { wrapper });

    const textarea = screen.getByPlaceholderText(/Type a message|اكتب رسالة|Écrire un message/i);
    fireEvent.change(textarea, { target: { value: 'I want to end my life' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      // Emergency overlay should be visible; look for a known text in overlay
      expect(screen.getByText(/Support Immédiat Disponible|الدعم الفوري متاح|Immediate/i)).toBeInTheDocument();
    });
  });

  it('saves messages in localStorage per user', async () => {
    aiServiceModule.aiService.generateSuggestions.mockResolvedValue({ success: true, data: [{ content: 'Hi there' }] });

    render(<ChatPage />, { wrapper });

    const textarea = screen.getByPlaceholderText(/Type a message|اكتب رسالة|Écrire un message/i);
    fireEvent.change(textarea, { target: { value: 'hello bot' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    await waitFor(() => expect(aiServiceModule.aiService.generateSuggestions).toHaveBeenCalled());
    // Find a stored key that matches our chat history pattern
    let foundKey = null;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('ai_chat_history_v1:')) {
        foundKey = k;
        break;
      }
    }
    expect(foundKey).toBeTruthy();
    const stored = JSON.parse(localStorage.getItem(foundKey));
    expect(Array.isArray(stored)).toBe(true);
    expect(stored.length).toBeGreaterThanOrEqual(1);
    expect(stored.length).toBeGreaterThanOrEqual(1);
  });
});
