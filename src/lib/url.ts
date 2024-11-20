export const validateURL = (url: string): boolean => {
    const urlRegex = /^https?:\/\/(?:open\.spotify\.com\/(?:track|playlist|album|artist|episode|show|user)|spoti\.fi\/)/;
    return urlRegex.test(url); 
}

export const getIDFromURL = (url: string): string | null => {
    const trackRegex = /^https?:\/\/(?:open\.spotify\.com\/track\/|spoti\.fi\/)([a-zA-Z0-9]+)(?:\?.*)?$/;
    const match = url.match(trackRegex);

    return match ? match[1] : null;
}