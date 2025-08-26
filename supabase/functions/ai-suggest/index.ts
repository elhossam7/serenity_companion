// @ts-nocheck
// Supabase Edge Function: ai-suggest
// Generates culturally sensitive journaling suggestions server-side with basic safety + rate limiting.
// Env required: SUPABASE_URL, SUPABASE_ANON_KEY
// Providers (set in Functions env):
// - GEMINI_API_KEY (preferred)
// - OPENAI_API_KEY (fallback)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
// Gemini model is configurable via env GEMINI_MODEL (e.g., gemini-1.5-flash or gemini-2.0-flash)
// Default remains 1.5-flash for broad availability.
const getGeminiUrl = () => {
  const model = Deno.env.get('GEMINI_MODEL') || 'gemini-1.5-flash';
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
};
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

// Very lightweight safety filter (augment with a proper provider in production)
function isUnsafe(text: string): { unsafe: boolean; reason?: string } {
  const lowered = (text || "").toLowerCase();
  const disallowed = [
    // self-harm / suicide
    /kill myself|suicide|end my life|self[- ]?harm|hopeless|worthless|cut myself|hurt myself/,
    // sexual explicit
    /porn|sexual|explicit|nsfw|rape|child|underage/, 
    // violence
    /kill|murder|bomb|terror|assault|abuse/,
  ];
  for (const re of disallowed) {
    if (re.test(lowered)) return { unsafe: true, reason: `content flagged by safety filter (${re})` };
  }
  return { unsafe: false };
}

function buildSystemPrompt(language: string, mood: string) {
  const base = `You are a culturally-sensitive journaling assistant for Moroccan users.
- Be supportive, non-clinical, and avoid medical or diagnostic language.
- Keep responses short (1-2 sentences) and actionable.
- Prefer neutral, compassionate tone; avoid judgment.
- Never include PII or request secrets. Never output harmful content.
- If user content appears at risk, advise seeking professional help calmly and suggest local resources, without sounding alarming.`;
  const localized = language === 'ar'
    ? `اكتب الردود باللغة العربية الفصحى المبسطة. كن لطيفًا وحساسًا ثقافيًا.`
    : `Write responses in simple, clear French.`;
  const moodHint = mood ? `User mood context: ${mood}.` : '';
  return `${base}\n${localized}\n${moodHint}`;
}

type SuggestRequest = {
  language?: 'fr' | 'ar';
  mood?: string;
  content?: string; // current journal text
};

type Suggestion = { id: string; type: 'continuation' | 'reflection' | 'support' | 'coping' | 'exploration'; content: string; icon: string };

type SuggestResponse = { suggestions: Suggestion[] };

serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
    }

    const authHeader = req.headers.get('Authorization') ?? '';
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  const geminiKey = Deno.env.get('GEMINI_API_KEY');
  const rlMax = parseInt(Deno.env.get('AI_RATE_LIMIT_MAX') || '20');
  const rlWindowMin = parseInt(Deno.env.get('AI_RATE_LIMIT_WINDOW_MIN') || '60');
  const devMode = (Deno.env.get('AI_DEV_MODE') || 'false').toLowerCase() === 'true';

    if (!supabaseUrl || !anonKey) {
      return new Response(JSON.stringify({ error: 'Server configuration missing' }), { status: 500, headers: corsHeaders });
    }

  const client = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: userRes, error: userErr } = await client.auth.getUser();
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }
    const user = userRes.user;

    const payload = (await req.json()) as SuggestRequest;
    const language = payload.language === 'ar' ? 'ar' : 'fr';
    const mood = payload.mood || 'neutral';
    const content = (payload.content || '').slice(0, 4000); // cap input length

    // Basic safety gate
    const safety = isUnsafe(content);
    if (safety.unsafe) {
  return new Response(JSON.stringify({ error: 'Content flagged by safety filters', reason: safety.reason }), { status: 400, headers: corsHeaders });
    }

    // Rate limit (configurable: default 20 per 60 minutes) — skip in dev mode
    const windowMs = rlWindowMin * 60 * 1000;
    let recentCount = 0;
    if (!devMode) {
      const sinceIso = new Date(Date.now() - windowMs).toISOString();
      const { count: rlCount, error: rlErr } = await client
        .from('ai_usage_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', sinceIso);

      if (rlErr) {
        // fail-open quietly but log
        console.warn('Rate-limit check failed:', rlErr.message);
      }
      recentCount = rlCount ?? 0;
      if (recentCount >= rlMax) {
        if (devMode) {
          const fallback: SuggestResponse = {
            suggestions: [
              { id: crypto.randomUUID(), type: 'reflection', icon: 'Lightbulb', content: language === 'ar' ? 'اكتب فكرة واحدة تشعرك بالامتنان الآن.' : "Notez une chose pour laquelle vous êtes reconnaissant maintenant." },
              { id: crypto.randomUUID(), type: 'continuation', icon: 'PenTool', content: language === 'ar' ? 'أكمل: اليوم تعلمت أن...' : "Complétez: aujourd'hui, j'ai appris que..." }
            ]
          };
          try { await client.from('ai_usage_logs').insert({ user_id: user.id, tokens_used: 0 }); } catch {}
          return new Response(
            JSON.stringify({ ...fallback, meta: { provider: 'fallback-rl', rateLimit: { max: rlMax, windowMin: rlWindowMin, count: recentCount } } }),
            { status: 200, headers: corsHeaders }
          );
        }
        const retryAfterSec = Math.ceil(windowMs / 1000);
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.', meta: { rateLimit: { max: rlMax, windowMin: rlWindowMin, count: recentCount } } }),
          { status: 429, headers: { ...corsHeaders, 'Retry-After': String(retryAfterSec) } }
        );
      }
    }

    // If no provider key, return a small on-box heuristic suggestion
    if (!openaiKey && !geminiKey) {
      const fallback: SuggestResponse = {
        suggestions: [
          { id: crypto.randomUUID(), type: 'reflection', icon: 'Lightbulb', content: language === 'ar' ? 'خُذ نفسًا عميقًا وفكّر: ما الشيء الصغير الذي جعلك تشعر بتحسن اليوم؟' : 'Inspirez profondément et notez: quel petit détail a amélioré votre journée ?' },
          { id: crypto.randomUUID(), type: 'continuation', icon: 'PenTool', content: language === 'ar' ? 'أكمل: اليوم شعرت بـ... لأن...' : "Complétez: aujourd'hui, je me suis senti(e) ... parce que ..." }
        ]
      };
      // log usage
  try { await client.from('ai_usage_logs').insert({ user_id: user.id, tokens_used: 0 }); } catch {}
  return new Response(JSON.stringify({ ...fallback, meta: { provider: 'fallback' } }), { status: 200, headers: corsHeaders });
    }

    const system = buildSystemPrompt(language, mood);
    const userPrompt = `${language === 'ar' ? 'نص اليوم' : "Texte d'aujourd'hui"}:
"""
${content}
"""

Générez 3 courtes suggestions adaptées (max 25 mots chacune) pour poursuivre l’écriture. Répondez en ${language === 'ar' ? 'العربية' : 'français'} dans un objet JSON strict: {"suggestions":[{"type":"continuation|reflection|support|coping|exploration","content":"..."}, ...]}.`;

    // Helper to normalize parsed suggestions
    const toCleaned = (parsed: any): Suggestion[] => {
      return (parsed?.suggestions || [])
        .slice(0, 3)
        .map((s: any) => ({
          id: crypto.randomUUID(),
          type: (s?.type || 'reflection') as Suggestion['type'],
          content: String(s?.content || '').slice(0, 300),
          icon: s?.type === 'support' ? 'Shield' : s?.type === 'coping' ? 'Coffee' : s?.type === 'exploration' ? 'Compass' : s?.type === 'continuation' ? 'PenTool' : 'Lightbulb'
        }))
        .filter(s => !isUnsafe(s.content).unsafe);
    };

    // Prefer Gemini if key present, else OpenAI
    if (geminiKey) {
      const prompt = `${system}\n\n${userPrompt}`;
      const gBody = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 180 }
      };
  const gRes = await fetch(`${getGeminiUrl()}?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gBody)
      });
      if (!gRes.ok) {
        const errTxt = await gRes.text();
        console.error('Gemini error:', errTxt);
      } else {
        const gJson = await gRes.json();
        const raw = gJson?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        let parsed: SuggestResponse | null = null;
        try {
          const start = raw.indexOf('{');
          const end = raw.lastIndexOf('}');
          const jsonSlice = start >= 0 && end >= 0 ? raw.slice(start, end + 1) : '{}';
          parsed = JSON.parse(jsonSlice);
        } catch (e) {
          console.warn('Failed to parse Gemini JSON:', e);
        }
        const cleaned = toCleaned(parsed);
        if (cleaned.length > 0) {
          try { await client.from('ai_usage_logs').insert({ user_id: user.id, tokens_used: gJson?.usageMetadata?.totalTokenCount || 0 }); } catch {}
          return new Response(JSON.stringify({ suggestions: cleaned, meta: { provider: 'gemini' } }), { status: 200, headers: corsHeaders });
        }
      }
      // fall through to OpenAI or fallback if Gemini fails to produce
    }

    if (openaiKey) {
      const body = {
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 180
      };
      const aiRes = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      if (aiRes.ok) {
        const aiJson = await aiRes.json();
        const raw = aiJson?.choices?.[0]?.message?.content?.trim() || '';
        let parsed: SuggestResponse | null = null;
        try {
          const start = raw.indexOf('{');
          const end = raw.lastIndexOf('}');
          const jsonSlice = start >= 0 && end >= 0 ? raw.slice(start, end + 1) : '{}';
          parsed = JSON.parse(jsonSlice);
        } catch (e) {
          console.warn('Failed to parse provider JSON:', e);
        }
        const cleaned = toCleaned(parsed);
        if (cleaned.length > 0) {
          try { await client.from('ai_usage_logs').insert({ user_id: user.id, tokens_used: aiJson?.usage?.total_tokens || 0 }); } catch {}
          return new Response(JSON.stringify({ suggestions: cleaned, meta: { provider: 'openai' } }), { status: 200, headers: corsHeaders });
        }
      } else {
        const errTxt = await aiRes.text();
        console.error('OpenAI error:', errTxt);
      }
    }

    // Provider failed or returned unusable content — return graceful fallback
    const fallback: SuggestResponse = {
      suggestions: [
        { id: crypto.randomUUID(), type: 'reflection', icon: 'Lightbulb', content: language === 'ar' ? 'اكتب فكرة واحدة تشعرك بالامتنان الآن.' : "Notez une chose pour laquelle vous êtes reconnaissant maintenant." },
        { id: crypto.randomUUID(), type: 'continuation', icon: 'PenTool', content: language === 'ar' ? 'أكمل: اليوم تعلمت أن...' : 'Complétez la phrase: aujourd\'hui, j\'ai appris que...' }
      ]
    };
    try { await client.from('ai_usage_logs').insert({ user_id: user.id, tokens_used: 0 }); } catch {}
  return new Response(JSON.stringify({ ...fallback, meta: { provider: 'fallback' } }), { status: 200, headers: corsHeaders });
  } catch (e) {
    console.error('ai-suggest error:', e);
    // total failure: return minimal fallback so client UI doesn’t break
    const fallback: SuggestResponse = {
      suggestions: [
        { id: crypto.randomUUID(), type: 'reflection', icon: 'Lightbulb', content: 'Take a breath and write one small thing that went well today.' }
      ]
    };
    return new Response(JSON.stringify(fallback), { status: 200, headers: corsHeaders });
  }
});
