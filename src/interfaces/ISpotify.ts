export interface ISpotifyPaginated {
    totalItems: number;
    page: number;
    pageSize: number;
    totalPages: number;
    items: ISpotifyValuesResponse[];
}

export interface ISpotifyValuesResponse {
    id: number;
    ts: string;
    platform: string | null;
    ms_played: number;
    conn_country: string | null;
    ip_addr: string | null;
    master_metadata_track_name: string | null;
    master_metadata_album_artist_name: string | null;
    master_metadata_album_album_name: string | null;
    spotify_track_uri: string | null;
    episode_name: string | null;
    episode_show_name: string | null;
    spotify_episode_uri: string | null;
    audiobook_title: string | null;
    audiobook_uri: string | null;
    audiobook_chapter_uri: string | null;
    audiobook_chapter_title: string | null;
    reason_start: string | null;
    reason_end: string | null;
    shuffle: boolean;
    skipped: boolean;
    offline: boolean;
    offline_timestamp: number;
    incognito_mode: boolean;
}

export interface Column {
  key: keyof ISpotifyValuesResponse;
  label: string;
  visible: boolean;
}
