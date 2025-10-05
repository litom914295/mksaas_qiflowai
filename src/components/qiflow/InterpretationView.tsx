import * as React from 'react';

export type InterpretationData = {
  overview?: string;
  highlights?: string[];
  suggestions?: string[];
  relations?: string[];
  nayin?: string[];
  breakdown?: string[];
};

export function InterpretationView({ data }: { data?: InterpretationData }) {
  const d = data || {};
  return (
    <div className="rounded-lg border bg-card p-3 text-sm">
      {d.overview && (
        <p className="mb-1 whitespace-pre-wrap break-words">{d.overview}</p>
      )}

      {Array.isArray(d.highlights) && d.highlights.length > 0 && (
        <ul className="list-inside list-disc break-words">
          {d.highlights.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      )}

      {Array.isArray(d.suggestions) && d.suggestions.length > 0 && (
        <div className="mt-2">
          <span className="font-medium">建议：</span>
          <span className="text-muted-foreground break-words">
            {d.suggestions.join('；')}
          </span>
        </div>
      )}

      {Array.isArray(d.relations) && d.relations.length > 0 && (
        <div className="mt-2">
          <span className="font-medium">十神关系：</span>
          <span className="text-muted-foreground break-words">
            {d.relations.join('；')}
          </span>
        </div>
      )}

      {Array.isArray(d.nayin) && d.nayin.length > 0 && (
        <div className="mt-2">
          <span className="font-medium">纳音：</span>
          <span className="text-muted-foreground break-words">
            {d.nayin.join('；')}
          </span>
        </div>
      )}

      {Array.isArray(d.breakdown) && d.breakdown.length > 0 && (
        <div className="mt-2">
          <span className="font-medium">运期分解：</span>
          <span className="text-muted-foreground break-words">
            {d.breakdown.join('；')}
          </span>
        </div>
      )}
    </div>
  );
}
