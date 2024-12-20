# node-spdl
A module to download content directly from Spotify's servers, written in Typescript, for Node.js, with native Node components.

## WIP, not functional yet...
Once it's functional, it'll be published to the npm registry.

![Counter](https://count.getloli.com/@:node-spdl?name=%3Anode-spdl&theme=moebooru&padding=7&offset=0&align=center&scale=1&pixelated=1&darkmode=auto)

## About

In contrast to other similar packages which download the song from YouTube, this package directly downloads from Spotify's servers, delivering a high-quality, uncompressed Readable stream.

- Downloads music tracks in different formats.
- Downloads playlists.
- Downloads podcast episodes.
- Easy to use Node based streaming.
- Metadata tagging.
- Exports synced lyrics.

## Requirements

- Have a **valid Spotify account**.
- Get a **Spotify cookie** from your browser. (or, you can use a non-anonymous Spotify access token and skip this requirement)

**Non-anonymous** token refers to an access token which is got from a Spotify Account (logged in browser).
Yet a cookie is a better option due to the fact that the access token can automatically refresh after expiry time.

### How to get a cookie? 🍪

This section assumes you use a Chromium-based browser but you can use any browser you like.

Doesn't matter if you don't have a Spotify Premium subscription, log in with any account you prefer.

1. Go to your browser and head to the **[Spotify Web Player](https://open.spotify.com)**.
2. Open the **Developer tools** (with F12 or whatever). 
3. Go to the **Application** section, next head to **Cookies** and look for "https://open.spotify.com" inside.
4. Select that and in the list, look for the **sp_dc** cookie. 
5. Copy the **sp_dc** cookie value and you're good!

If you can't find the **sp_dc** cookie, then make sure you're logged in.

## Quickstart

### Download content

The base function of this package, which most likely you're here for: **downloading tracks!**

You can directly import the package, which **is hybrid**, you can use it either in CJS or ES modules, and use it as a function.
Also note that this package is **properly typed**, so you shouldn't have any issue when using Typescript.

Firstly, we must authenticate with the Spotify API, which can be made by providing a cookie, a non-anonymous token or creating a session with your username and password (coming soon). 

```js
import spdl from "spdl";
// CJS import:
// const spdl = require("spdl");

// A very basic example
const url = "https://open.spotify.com/track/6c2OfsMKs7pv7qhD0sGGeM";

const auth = new spdl.SpdlAuth({
    cookie: "your cookie here"
});
const stream = spdl(url, { auth: auth });
```

**As simple as that!** (of course if you don't need anything specific rather than getting a stream).

Spotify streams it's content with two possible codecs: **AAC** or **Vorbis**.


## Formats

> [!NOTE]
> For most high quality formats, you **must have a Spotify Premium** account.

### Audio

| Keyword       | Bitrate | Codec  | Premium |
|:--------------|:-------:|:------:|:-------:|
| vorbis-low    | 96kbps  | Vorbis |         |
| vorbis-medium | 160kbps | Vorbis |         |
| vorbis-high   | 320kbps | Vorbis | ✅      |
| aac-low       | 128kbps | AAC    |         | 
| acc-high      | 256kbps | AAC    | ✅      |

The default extension format for Vorbis is **.ogg**, and for AAC is **.m4a**. However this package can auto convert these extensions to **.mp3** using **FFmpeg**.

## API

TODO: documentation

## Disclaimer

This package does not save any username or password provided and neither sends them to third party services.
The credentials provided will only interact with the Spotify API.

We are not related in any way with Spotify AB.

## Legal Disclaimer

**We do not encourage, promote or perform piracy.**

With **node-spdl** you are authenticating with your own account, which essentially means you are accesing your own authorized content.

The user is responsible for further actions performed with it's decrypted content.
If you'd like to support your favorite artists, you can always play their tracks on the [Spotify App](https://open.spotify.com).

We don't guarantee that your account won't be taken down, use this tool at your own risk!

**Important note:** My account got suspended while testing this package, most likely due to the high amount of invalid requests I made. I highly encourage you to add `delay` when running `spdl.playlist()` and avoid making high quantity bulk requests.

## Credits
- Package written by Sir [PwL](https://github.com/PwLDev).
- Thanks to [Alen't](https://github.com/ale057j0825) for inspiration.
- Syntax and usage inspired by [ytdl-core](https://github.com/fent/node-ytdl-core), made by [Fent](https://github.com/fent).
