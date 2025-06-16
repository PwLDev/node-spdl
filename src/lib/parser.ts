import { Album, Artist, Episode, EpisodeMetadata, Playlist, PlaylistTrack, Podcast, Track, TrackMetadata, User } from "./types";

// This code is based on Librespot
// https://codeberg.org/lucida/librespot-js/src/branch/main/src/utils/parse.ts

export const parseAlbum = (payload: Record<string, any>): Album => {
    const album: Album = {
		albumType: payload.album_type,
		availableMarkets: payload.available_markets,
		artists: payload.artists.map(parseArtist),
		name: payload.name,
		releaseDate: new Date(payload.release_date),
		totalTracks: payload.total_tracks,
		coverArtwork: payload.images,
		id: payload.id,
		uri: payload.uri,
		externalUrl: payload.external_urls?.spotify,
		externalIds: payload.external_ids || {}
	}

	if (payload.label) album.label = payload.label;
	if (payload.tracks) album.tracks = payload.tracks?.items.map(parseTrack);

	return album;
}

export const parseArtist = (payload: Record<string, any>): Artist => {
	const artist: Artist = {
		name: payload.name,
		id: payload.id,
		uri: payload.uri,
		externalUrl: payload.external_urls?.spotify
	}

	if (payload.followers) artist.followerCount = payload.followers.total;
	if (payload.genres) artist.genres = payload.genres;
	if (payload.images) artist.avatar = payload.images;

	return artist;
}

export const parseEpisode = (payload: Record<string, any>): Episode => {
	return {
		name: payload.name,
		description: payload.description,
		htmlDescription: payload.html_description,
		explicit: payload.explicit,
		language: payload.language,
		languages: payload.languages,
		coverArtwork: payload.images,
		durationMs: payload.duration_ms,
		isPlayable: payload.is_playable,
		isPaywalled: payload.is_paywall_content,
		releaseDate: new Date(payload.release_date),
		id: payload.id,
		uri: payload.uri,
		externalUrl: payload.external_urls?.spotify
	}
}

export const parseEpisodeMetadata = (payload: Record<string, any>): EpisodeMetadata => {
    const episode: EpisodeMetadata = {
        files: payload.audio.map((f: any) => ({ id: f.file_id, format: f.format })),
		description: payload.description,
		htmlDescription: payload.html_description,
		explicit: payload.explicit,
		name: payload.name,
		language: payload.language,
		restriction: payload.restriction,
    };

	if (payload.audio_preview) episode.files = episode.files.concat(payload.audio_preview.map((f: any) => ({ id: f.file_id, format: f.format })));
	
    return episode;
}

export const parsePlaylist = (payload: Record<string, any>): Playlist => {
	return {
		owner: parseUser(payload.owner),
		name: payload.name,
		description: payload.description,
		collaborative: payload.collaborative,
		onProfile: payload.public,
		tracks: payload.tracks.items?.map(parsePlaylistTrack),
		totalTracks: payload.tracks.total,
		coverArtwork: payload.images,
		id: payload.id,
		uri: payload.uri,
		externalUrl: payload.external_urls?.spotify
	}
}

export const parsePlaylistTrack = (payload: Record<string, any>): PlaylistTrack => {
	return {
		...parseTrack(payload.track),
		addedAt: new Date(payload.added_at),
		addedBy: parseUser(payload.added_by)
	}
}

export const parsePodcast = (payload: Record<string, any>): Podcast => {
	return {
		name: payload.name,
		description: payload.description,
		htmlDescription: payload.html_description,
		explicit: payload.explicit,
		languages: payload.languages,
		mediaType: payload.media_type,
		coverArtwork: payload.images,
		publisher: payload.publisher,
		episodes: payload.episodes?.items.map(parseEpisode),
		totalEpisodes: payload.total_episodes,
		id: payload.id,
		uri: payload.uri,
		externalUrl: payload.external_urls?.spotify
	}
}

export const parseTrack = (payload: Record<string, any>): Track => {
	const track: Track = {
		discNumber: payload.disc_number,
		trackNumber: payload.track_number,
		durationMs: payload.duration_ms,
		explicit: payload.explicit,
		id: payload.id,
		uri: payload.uri,
		isLocal: payload.is_local,
		name: payload.name,
		externalUrl: payload.external_urls?.spotify,
		externalIds: payload.external_ids || {}
	}

	return track;
}

export const parseTrackMetadata = (payload: Record<string, any>): TrackMetadata => {
    const track: TrackMetadata = {
        files: payload.file.map((f: any) => ({ id: f.file_id, format: f.format })),
        hasLyrics: payload.has_lyrics || false,
        languages: payload.language_of_performance,
        release: new Date(payload.earliest_live_timestamp),
        ...parseTrack(payload)
    };

	if (payload.preview) track.files = track.files.concat(payload.preview.map((f: any) => ({ id: f.file_id, format: f.format })));
	
    return track;
}

export const parseUser = (payload: Record<string, any>): User => {
	const user: User = {
		name: payload.display_name,
		id: payload.id,
		uri: payload.uri,
		externalUrl: payload.external_urls?.spotify
	}

	if (payload.followers) user.followerCount = payload.followers.total;
	if (payload.images) user.avatar = payload.images;
	return user;
}