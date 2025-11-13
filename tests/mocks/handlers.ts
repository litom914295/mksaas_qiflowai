import { http, HttpResponse } from 'msw';

// 基础 API URL
const API_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';

export const handlers = [
  // Health check endpoint
  http.get(`${API_URL}/api/health`, () => {
    return HttpResponse.json({
      ok: true,
      time: new Date().toISOString(),
    });
  }),

  // Mock Supabase Auth
  http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'authenticated',
      },
    });
  }),

  // Mock Credits API
  http.get(`${API_URL}/api/credits/balance`, () => {
    return HttpResponse.json({
      balance: 100,
      userId: 'test-user-id',
    });
  }),

  // Mock Bazi Analysis
  http.post(`${API_URL}/api/bazi/analyze`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: {
        fourPillars: {
          year: { stem: '甲', branch: '子' },
          month: { stem: '乙', branch: '丑' },
          day: { stem: '丙', branch: '寅' },
          hour: { stem: '丁', branch: '卯' },
        },
        elements: ['木', '水', '火', '土', '金'],
        analysis: 'Mock analysis result',
      },
    });
  }),

  // Mock AI Chat
  http.post(`${API_URL}/api/chat`, async () => {
    return new HttpResponse(
      new ReadableStream({
        async start(controller) {
          controller.enqueue(
            new TextEncoder().encode('data: {"content":"Hello"}\n\n')
          );
          controller.enqueue(
            new TextEncoder().encode('data: {"content":" from"}\n\n')
          );
          controller.enqueue(
            new TextEncoder().encode('data: {"content":" AI"}\n\n')
          );
          controller.close();
        },
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      }
    );
  }),

  // Mock Stripe webhook
  http.post(`${API_URL}/api/stripe/webhook`, () => {
    return HttpResponse.json({
      received: true,
    });
  }),

  // Mock OpenAI API (for AI services)
  http.post('https://api.openai.com/v1/chat/completions', () => {
    return HttpResponse.json({
      id: 'chatcmpl-test',
      object: 'chat.completion',
      created: Date.now(),
      model: 'gpt-3.5-turbo',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: 'This is a mock response from OpenAI',
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 10,
        total_tokens: 20,
      },
    });
  }),
];
