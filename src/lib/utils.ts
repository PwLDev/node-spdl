const validDomains = new Set([
    "spotify.com",
    "play.spotify.com",
    "open.spotify.com",
    "spotify:"
]);

const getIdFromURL = (link: string) => {
    const url = new URL(link.trim());
    const paths = url.pathname.split("/");
    let id = paths[1].trim();

    if (url.hostname && !validDomains.has(url.hostname)) {
        throw new Error("The link provided is not a Spotify URL domain.");
    } else {
        id = url.hostname == "spoti.fi" ? paths[0].trim() : paths[1].trim(); 
    }

    if (!id) {
        throw new Error("No Spotify ID was resolved.");
    }
    id = id.substring(0, 22);

    return id;
};

const validateURL = (query: string) => {
    try {
        getIdFromURL(query);
        return true;
    } catch (e) { 
        return false;
    }
};