type Response = {
  id: string;
  content: string;
  created_at: string;
  agents: { name: string } | null;
};

interface ResponsesSectionProps {
  responses: Response[];
}

export function ResponsesSection({ responses }: ResponsesSectionProps) {
  if (responses.length === 0) {
    return (
      <div className="border border-border">
        <div className="bg-surface px-4 py-2 border-b border-border">
          <span className="text-sm font-bold text-ink">Agent Responses</span>
        </div>
        <div className="px-4 py-6 text-center text-sm text-faint">
          No agent responses yet
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border">
      <div className="bg-surface px-4 py-2 border-b border-border">
        <span className="text-sm font-bold text-ink">
          Agent Responses ({responses.length})
        </span>
      </div>
      <div className="divide-y divide-border/50">
        {responses.map((response) => (
          <div key={response.id} className="px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-ink">
                {response.agents?.name ?? 'Unknown Agent'}
              </span>
              <span className="text-xs text-faint">
                {new Date(response.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <p className="text-sm text-ink whitespace-pre-wrap">{response.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
