'use client';

type RecommendationActionType =
  | 'book_expert'
  | 'generate_report'
  | 'share_report'
  | 'ask_more'
  | 'custom';

interface RecommendationAction {
  label: string;
  type?: RecommendationActionType;
  onClick?: () => void;
}

interface RecommendationCardProps {
  title: string;
  description: string;
  actions: RecommendationAction[];
  className?: string;
  onAction?: (action: RecommendationAction) => void;
}

export const RecommendationCard = ({
  title,
  description,
  actions,
  className,
  onAction,
}: RecommendationCardProps) => (
  <div
    className={`rounded-xl border bg-card p-4 shadow-sm ${className ?? ''}`.trim()}
  >
    <h3 className="text-base font-semibold text-card-foreground">{title}</h3>
    <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    <div className="mt-4 flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => {
            if (action.onClick) {
              action.onClick();
              return;
            }
            onAction?.(action);
          }}
          className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary transition hover:bg-primary/20"
          type="button"
        >
          {action.label}
        </button>
      ))}
    </div>
  </div>
);

export type { RecommendationAction, RecommendationActionType };
