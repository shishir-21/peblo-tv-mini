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
  return response.json();
}

export function getArtworkUrl(path: string | undefined): string | undefined {
  if (!path) return undefined;
  return `/storage/${path}`;
}
