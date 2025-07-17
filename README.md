# node-spdl
A lightweight Spotify downloader and API wrapper package.
Written in Typescript, designed for Node.js, with native Node components.

![Counter](https://count.getloli.com/@:node-spdl?name=%3Anode-spdl&padding=7&offset=0&align=center&scale=1&pixelated=1&darkmode=auto)

## About

Unlike other similar package which rely on YouTube to extract tracks, `spdl` fetches content directly from Spotify’s servers, ensuring high-quality and non modified streams.

`spdl` also acts as a lightweight wrapper around commonly used Spotify internal APIs.

### Key Features
- Download music tracks in multiple formats and bitrates.
- Supports tracks and podcast episodes.
- Node.js stream support for flexible usage.

## Requirements

- Have a **valid Spotify account**
- Get a **Spotify cookie** from your browser. (or, you can use a non-anonymous Spotify access token and skip this requirement)

> A **non-anonymous** token refers to an access token which is got from a Spotify Account (logged in browser).
A cookie is always a better option due to the fact that the access token can automatically refresh after the token expiry time.

### For downloading AAC files
- A .wvd file dumped from a device (optional).

> `spdl` provides a default built-in device to decrypt AAC files without having to dump one yourself, but you can provide your own **.wvd** file if you want.

### How to get a cookie? 🍪
This section assumes you use a Chromium-based browser but you can use any browser you like.

Doesn't matter if you don't have a Spotify Premium subscription, log in with any account you prefer.

1. Go to your browser and head to the [Spotify Web Player](https://open.spotify.com).
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

First, we must authenticate with the Spotify API, which can be made by providing a cookie, a non-anonymous token or creating a session with your username and password (coming soon). 

Here's a short example for downloading a song to a file:

```js
import { createWriteStream } from "node:fs";
import { Spotify } from "spdl";

// A very basic example:
async function download() {
    const client = await Spotify.create({
        cookie: "sp_dc=your-cookie-here"
    });

    // by default downloads an Ogg Vorbis 160kbps file
    const url = "https://open.spotify.com/track/45AepEzwUs3GjhNxhh49ip";
    const stream = client.download(url);

    stream.pipe(createWriteStream("song.ogg"));
}

download();
```

> [!NOTE]  
> The ytdl-core-like syntax only works for the `spdl()` default function and is limited to downloads.
> To use other API features, you must initialize a `Spotify` class instance.

## Formats

> [!NOTE]
> For high quality formats, you **must have a Spotify Premium** account.

### Audio

| Keyword       | Bitrate | Codec  | Premium |
|:--------------|:-------:|:------:|:-------:|
| OGG_VORBIS_96 | 96kbps  | Vorbis |         |
| OGG_VORBIS_160| 160kbps | Vorbis |         |
| OGG_VORBIS_320| 320kbps | Vorbis | ✅      |
| MP4_128       | 128kbps | AAC    |         | 
| MP4_128_DUAL  | 128kbps | AAC    |         | 
| MP4_256       | 256kbps | AAC    | ✅      |
| MP4_256_DUAL  | 256kbps | AAC    | ✅      |
| MP3_96        | 96kbps  | MP3    |         |

## Disclaimer

This package does not save any username or password provided and neither sends them to third party services.
The credentials provided will only interact with the Spotify API.

With **node-spdl** you are authenticating with your own account, which essentially means you are accesing your own authorized content. The user is responsible for further actions performed with the decrypted content.
If you'd like to support your favorite artists, you can always play their tracks via the [Spotify App](https://open.spotify.com).

We are not related in any way with Spotify AB.

## Credits
- Package written by Sir [PwL](https://github.com/PwLDev).
- Thanks to [Alen't](https://github.com/ale057j0825) for inspiration.
- API inspired by [ytdl-core](https://github.com/fent/node-ytdl-core), made by [Fent](https://github.com/fent).
