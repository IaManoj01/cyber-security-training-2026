export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="error-box">
      <strong>Something went wrong</strong>
      <span>{message}</span>
      {onRetry && <button className="btn btn-secondary" onClick={onRetry}>Try again</button>}
    </div>
  );
}