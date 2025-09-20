import { News } from "../models/News";

export interface RssItem {
  title: string;
  description: string;
  pubDate: string;
  link: string;
}

export default class RssService {
  
  public async fetchRssItems(rssUrl: string, startDate: Date, endDate: Date): Promise<News[]> {
    try {
      const response = await fetch(rssUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml',
        }
      });

      if (!response.ok) {
        console.error(`Failed to fetch RSS feed: ${response.status}`);
        return [];
      }

      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

      const items = xmlDoc.querySelectorAll('item');
      const newsItems: News[] = [];

      items.forEach(item => {
        const title = item.querySelector('title')?.textContent?.trim() || '';
        const description = item.querySelector('description')?.textContent?.trim() || '';
        const pubDateStr = item.querySelector('pubDate')?.textContent?.trim() || '';
        
        if (title && description && pubDateStr) {
          const publishDate = new Date(pubDateStr);
          
          if (this.isDateInRange(publishDate, startDate, endDate)) {
            newsItems.push({
              title,
              content: this.stripHtml(description),
              publishDate,
              rssUrl
            });
          }
        }
      });

      return newsItems.sort((a, b) => a.publishDate.getTime() - b.publishDate.getTime());
    } catch (error) {
      console.error(`Error fetching RSS feed from ${rssUrl}:`, error);
      return [];
    }
  }

  public async fetchMultipleRssFeeds(rssUrls: string[], startDate: Date, endDate: Date): Promise<News[]> {
    const promises = rssUrls.map(url => this.fetchRssItems(url, startDate, endDate));
    const results = await Promise.allSettled(promises);
    
    const allItems: News[] = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allItems.push(...result.value);
      } else {
        console.error(`Failed to fetch RSS feed ${rssUrls[index]}:`, result.reason);
      }
    });

    return allItems.sort((a, b) => a.publishDate.getTime() - b.publishDate.getTime());
  }

  private isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
    return date >= startDate && date <= endDate;
  }

  private stripHtml(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || doc.body.innerText || '';
  }
}