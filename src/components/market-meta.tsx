export function UnavailableState({
  onRetry,
  title = "No verified market price available",
  message = "No official market record is available for this crop and location right now.",
}: {
  onRetry?: () => void;
  title?: string;
  message?: string;
}) {
  return (
    <div className="card-surface p-5">
      <p className="text-sm font-bold">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {message} MarketMitra never shows an estimated or generated price.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="press mt-3 rounded-full bg-muted px-4 py-2 text-xs font-bold"
        >
          Try again
        </button>
      )}
    </div>
  );
}
