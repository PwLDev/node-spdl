# node-spdl
A lightweight package to download directly from Spotify's servers. Written in Typescript, designed for Node.js, with native Node components.

![Counter](https://count.getloli.com/@:node-spdl?name=%3Anode-spdl&padding=7&offset=0&align=center&scale=1&pixelated=1&darkmode=auto)

> Note: For now, only Ogg Vorbis is supported.
> AAC (mp4) support will be added soon.

## Table of Contents

- [About](#about)
- [Requirements](#requirements)
- [Quickstart](#quickstart)
- [Formats](#formats)
- [API](#api)
- [Disclaimer](#disclaimer)
- [Credits](#credits)

## About

Unlike other similar package which rely on YouTube to extract tracks, `node-spdl` fetches content directly from Spotify’s servers, ensuring high-quality, uncompressed streams.

### Key Features
- Download music tracks in multiple formats and bitrates.
- Supports downloading playlists and podcast episodes.
- Metadata tagging and synced lyrics export.
- Node.js stream support for flexible usage.

## Requirements

- Have a **valid Spotify account**.
- Get a **Spotify cookie** from your browser. (or, you can use a non-anonymous Spotify access token and skip this requirement)

**Non-anonymous** token refers to an access token which is got from a Spotify Account (logged in browser).
A cookie is always a better option due to the fact that the access token can automatically refresh after expiry time.

### How to get a cookie? 🍪
This section assumes you use a Chromium-based browser but you can use any browser you like.

Doesn't matter if you don't have a Spotify Premium subscription, log in with any account you prefer.

1. Go to your browser and head to the **[Spotify Web Player](https://open.spotify.com)**.
2. Open the **Developer tools** (with F12 or whatever). 
3. Go to the **Application** section, next head to **Cookies** and look for "https://open.spotify.com" inside.
4. Select that and in the list, look for the **sp_dc** cookie. 
5. Copy the **sp_dc** cookie value and you're good!

If you can't find the **sp_dc** cookie, then make sure you're logged in.

## Installation

You can install the package via npm:
```sh
npm install spdl
```

For yarn users:
```sh
yarn add spdl
```

## Quickstart

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
const stream = spdl(url, {
    cookie: "your-cookie-here"
});
```

**As simple as that!** (of course if you don't need anything specific rather than getting a stream).


## Formats

> [!NOTE]
> For high quality formats, you **must have a Spotify Premium** account.

### Audio

| Keyword       | Bitrate | Codec  | Premium |
|:--------------|:-------:|:------:|:-------:|
| vorbis-low    | 96kbps  | Vorbis |         |
| vorbis-medium | 160kbps | Vorbis |         |
| vorbis-high   | 320kbps | Vorbis | ✅      |
| aac-low       | 128kbps | AAC    |         | 
| acc-high      | 256kbps | AAC    | ✅      |


## API (WIP)

### `spdl(url: string, options: SpdlOptions | SpdlAuth)`

## Disclaimer

This package does not save any username or password provided and neither sends them to third party services.
The credentials provided will only interact with the Spotify API.

With **node-spdl** you are authenticating with your own account, which essentially means you are accesing your own authorized content.

The user is responsible for further actions performed with it's decrypted content.
If you'd like to support your favorite artists, you can always play their tracks via the [Spotify App](https://open.spotify.com).

Anyways, I made this package just for fun and experimentation, please use this tool with caution.

We are not related in any way with Spotify AB.

## Credits
- Package written by Sir [PwL](https://github.com/PwLDev).
- Thanks to [Alen't](https://github.com/ale057j0825) for inspiration.
- API inspired by [ytdl-core](https://github.com/fent/node-ytdl-core), made by [Fent](https://github.com/fent).
