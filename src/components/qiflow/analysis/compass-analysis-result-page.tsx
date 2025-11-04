import React from 'react';

export type CompassAnalysisResultPageProps = {
  title?: string;
  locale?: string;
  direction?: number;
  theme?: string;
  timestamp?: string;
};

export const CompassAnalysisResultPage = ({
  title = 'Compass Analysis Result',
  locale,
  direction = 0,
  theme = 'luxury',
  timestamp,
}: CompassAnalysisResultPageProps) => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">
        Placeholder component for build stability during tests.
      </p>
      <div className="mt-4 space-y-2 text-sm">
        <p>Locale: {locale}</p>
        <p>Direction: {direction}°</p>
        <p>Theme: {theme}</p>
        <p>Timestamp: {timestamp}</p>
      </div>
    </div>
  );
};
