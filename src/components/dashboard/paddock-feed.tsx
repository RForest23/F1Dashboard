import type { HeadlineItem } from "@/lib/dashboard/contracts";

export function PaddockFeed({ headlines }: { headlines: HeadlineItem[] }) {
  const items = headlines.length
    ? [...headlines, ...headlines]
    : [{ title: "No current headlines available", url: "#" }];

  return (
    <section className="feed panel">
      <div className="section-eyebrow">Paddock Feed</div>
      <div className="feed-track">
        {items.map((item, index) => (
          <a
            className="feed-item"
            href={item.url}
            key={`${item.url}-${index}`}
            target="_blank"
            rel="noreferrer"
          >
            {item.title}
          </a>
        ))}
      </div>
    </section>
  );
}
