import * as cheerio from "cheerio";
import type { OfficialRound } from "@/lib/dashboard/contracts";
import { fetchText } from "@/lib/server/http";

function titleCaseFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function fetchOfficialCalendar(year: number): Promise<OfficialRound[]> {
  const html = await fetchText(`https://www.formula1.com/en/racing/${year}`);
  const $ = cheerio.load(html);
  const rounds = new Map<string, OfficialRound>();

  $(`a[href^="/en/racing/${year}/"]`).each((_, element) => {
    const href = $(element).attr("href");
    if (!href) {
      return;
    }

    const segments = href.split("/").filter(Boolean);
    const slug = segments[segments.length - 1];

    if (!slug || slug === String(year)) {
      return;
    }

    const name = $(element).text().trim() || `${titleCaseFromSlug(slug)} Grand Prix`;

    rounds.set(`${slug}-${year}`, {
      slug: `${slug}-${year}`,
      name,
      status: "scheduled"
    });
  });

  return Array.from(rounds.values());
}
