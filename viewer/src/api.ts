export interface Episode {
  episode_id: string;
  title: string;
  episode_number: number;
  synopsis: string | null;
  duration_seconds: number | null;
  language: string;
  content_group: string;
  artwork: {
    poster?: string;
    banner?: string;
    thumbnail?: string;
  };
}

export interface Season {
  season_id: string;
  season_number: number;
  episodes: Episode[];
}

export interface Show {
  show_id: string;
  title: string;
  slug: string;
  section: string;
  synopsis: string | null;
  categories: string[];
  seasons: Season[];
}

export interface Catalogue {
  metadata: {
    generated_at: string;
    publish_run_id: string;
  };
  shows: Show[];
}

export async function fetchCatalogue(): Promise<Catalogue> {
  const response = await fetch('/storage/catalogue.json');
  if (!response.ok) {
    throw new Error('Failed to fetch catalogue. The catalogue might not be published yet.');
  }
  const rawData = await response.json();
  
  if (rawData.shows) {
    // Already matches expected schema
    return rawData;
  }
  
  // Transform the sections-based catalogue into the expected legacy schema
  const showsMap = new Map<string, Show>();
  
  const sections = rawData.sections || {};
  for (const [sectionName, entries] of Object.entries(sections)) {
    for (const entry of (entries as any[])) {
      if (!showsMap.has(entry.slug)) {
        showsMap.set(entry.slug, {
          show_id: entry.slug,
          title: entry.show_title,
          slug: entry.slug,
          section: entry.section || sectionName,
          synopsis: entry.synopsis || null,
          categories: [entry.section || sectionName],
          seasons: [],
        });
      }
      
      const show = showsMap.get(entry.slug)!;
      const seasonId = `${entry.slug}-s${entry.season_number}`;
      
      let season = show.seasons.find(s => s.season_number === entry.season_number);
      if (!season) {
        season = {
          season_id: seasonId,
          season_number: entry.season_number,
          episodes: [],
        };
        show.seasons.push(season);
      }
      
      const artwork: any = {};
      if (entry.artwork?.poster?.storage_key) artwork.poster = entry.artwork.poster.storage_key;
      if (entry.artwork?.banner?.storage_key) artwork.banner = entry.artwork.banner.storage_key;
      if (entry.artwork?.thumbnail?.storage_key) artwork.thumbnail = entry.artwork.thumbnail.storage_key;
      
      for (const lang of entry.languages || ['en']) {
        const episodeId = `${entry.content_group}-${lang}`;
        if (!season.episodes.find(e => e.episode_id === episodeId)) {
          season.episodes.push({
            episode_id: episodeId,
            title: entry.episode_title,
            episode_number: entry.episode_number,
            synopsis: entry.synopsis || null,
            duration_seconds: entry.duration_seconds || null,
            language: lang,
            content_group: entry.content_group,
            artwork,
          });
        }
      }
    }
  }
  
  // Sort seasons and episodes
  const shows = Array.from(showsMap.values());
  for (const show of shows) {
    show.seasons.sort((a, b) => a.season_number - b.season_number);
    for (const season of show.seasons) {
      season.episodes.sort((a, b) => a.episode_number - b.episode_number);
    }
  }
  
  return {
    metadata: {
      generated_at: new Date().toISOString(),
      publish_run_id: 'transformed',
    },
    shows,
  };
}

export function getArtworkUrl(path: string | undefined): string | undefined {
  if (!path) return undefined;
  return `/storage/${path}`;
}
