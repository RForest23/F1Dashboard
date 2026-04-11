import * as cheerio from "cheerio";
import type { HeadlineItem } from "@/lib/dashboard/contracts";
import { fetchText } from "@/lib/server/http";

export async function fetchHeadlines(): Promise<HeadlineItem[]> {
  const html = await fetchText("https://www.formula1.com/en/latest/all.html");
  const $ = cheerio.load(html);
  const headlines = new Map<string, HeadlineItem>();

  $("a[href*='/en/latest/article']").each((_, node) => {
    const href = $(node).attr("href");
    const title = $(node).text().trim();

    if (!href || !title) {
      return;
    }

    const url = new URL(href, "https://www.formula1.com").toString();

    if (!headlines.has(url)) {
      headlines.set(url, { title, url });
    }
  });

  return Array.from(headlines.values()).slice(0, 6);
}
