/* eslint-disable @typescript-eslint/no-require-imports */
// Early polyfills for Jest environment before modules load
try {
  const { TextEncoder, TextDecoder } = require('util');
  if (typeof globalThis.TextEncoder === 'undefined')
    globalThis.TextEncoder = TextEncoder;
  if (typeof globalThis.TextDecoder === 'undefined')
    globalThis.TextDecoder = TextDecoder;
} catch {}

// Web Streams (ReadableStream etc.)
try {
  const {
    ReadableStream,
    WritableStream,
    TransformStream,
  } = require('node:stream/web');
  if (typeof globalThis.ReadableStream === 'undefined')
    globalThis.ReadableStream = ReadableStream;
  if (typeof globalThis.WritableStream === 'undefined')
    globalThis.WritableStream = WritableStream;
  if (typeof globalThis.TransformStream === 'undefined')
    globalThis.TransformStream = TransformStream;
} catch {}

// MessageChannel/MessagePort for undici internals
try {
  const { MessageChannel, MessagePort } = require('node:worker_threads');
  if (typeof globalThis.MessageChannel === 'undefined')
    globalThis.MessageChannel = MessageChannel;
  if (typeof globalThis.MessagePort === 'undefined')
    globalThis.MessagePort = MessagePort;
} catch {}

// fetch/Request/Response/Headers via undici
try {
  const {
    fetch,
    Request,
    Response,
    Headers,
    FormData,
    File,
  } = require('undici');
  if (typeof globalThis.fetch === 'undefined') globalThis.fetch = fetch;
  if (typeof globalThis.Request === 'undefined') globalThis.Request = Request;
  if (typeof globalThis.Response === 'undefined')
    globalThis.Response = Response;
  if (typeof globalThis.Headers === 'undefined') globalThis.Headers = Headers;
  if (typeof globalThis.FormData === 'undefined')
    globalThis.FormData = FormData;
  if (typeof globalThis.File === 'undefined') globalThis.File = File;
} catch {}

// Patch timers/clearImmediate for undici in jsdom tests
if (typeof global.clearImmediate === 'undefined') {
  global.clearImmediate = id => clearTimeout(id);
}

// Patch markResourceTiming used by undici when performance API is limited
try {
  if (typeof globalThis.performance === 'undefined') {
    globalThis.performance = { now: () => Date.now(), timeOrigin: Date.now() };
  }
  if (typeof globalThis.performance.markResourceTiming === 'undefined') {
    globalThis.performance.markResourceTiming = () => {};
  }
} catch {}

// Minimal URL/URLPattern polyfills if needed
try {
  if (typeof globalThis.URLPattern === 'undefined') {
    // next/server may not require URLPattern directly in tests; skip heavy polyfill
    globalThis.URLPattern = class {};
  }
} catch {}
