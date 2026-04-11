export function StatusBar({
  updatedAt,
  stale
}: {
  updatedAt: string;
  stale: boolean;
}) {
  return (
    <footer className="status-bar">
      <span>
        Updated{" "}
        {new Date(updatedAt).toLocaleString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Europe/London"
        })}{" "}
        UK
      </span>
      <span>{stale ? "Some data stale" : "Feeds healthy"}</span>
    </footer>
  );
}
