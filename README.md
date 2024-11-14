# node-spdl
A module to download tracks and videos from Spotify, directly from Spotify's servers written in Typescript.
For Javascripters and Typescripters.

<div align="center">
    <img src="https://cdn.discordapp.com/attachments/1091932806206201857/1306323801700700212/NodeSpdl.png?ex=67364058&is=6734eed8&hm=6ee94ff12bc28bf4e7fbf8f552751a06417e32f5cc725f2fe10f3c6291278440&" alt="node-spdl graphic">
</div>

> [!WARNING]
> There is no guarantee your account will not be lost or taken down for using this package.
> So use it at your own risk!

## Features
- Download music tracks in AAC or Vorbis.
- Download videos in MP4 or Webm.
- Easy to use interface with Node based streaming.
- ID3 tagging for MP3 files.
- Export synced lyrics.

## Requirements

Before you start with downloading your favorite songs, you first need to do some stuff first.

- Node.js Version >= 18.
- Have a **valid Spotify account**.
- Get a **Spotify cookie** from your browser.

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

> This package uses **FFmpeg**, so you should install it on your system PATH or you can install [ffmpeg-static](https://npmjs.com/package/ffmpeg-static) as a portable solution or specify the path to the API.

### Download content

The base function of this package, which most likely you're here for: **downloading tracks!**

> You can directly import the package, which **is hybrid**, you can use it either in CJS or ES modules, and use it as a function.
> Also note that this package is **properly typed**, so you shouldn't have any issue when using Typescript.

```js
const spdl = require("spdl");
// In Typescript or ES modules:
// import spdl from "spdl";

const url = "https://open.spotify.com/track/6c2OfsMKs7pv7qhD0sGGeM";
const stream = spdl(url);
```

**As simple as that!** (of course if you don't need anything specific rather than getting a stream).

But maybe you're wondering, how can I get this more customized?
Note that **<u>this package sticks to what Spotify natively provides</u>** from it's servers.

> Spotify streams it's content with two possible codecs: **AAC** or **Vorbis**.

## Formats

> [!NOTE]
> For most high quality formats, you **must have a Spotify Premium** account.

### Audio

| Keyword | Bitrate | Codec  | Premium |
|:-------:|:-------:|:------:|:-------:|
|         | 128kbps | AAC    | ❌      | 
|         | 256kbps | AAC    | ✅      |
|         | 96kbps  | Vorbis | ❌      |
|         | 128kbps | Vorbis | ❌      |
|         | 320kbps | Vorbis | ✅      |

> The default extension format for Vorbis is **.ogg**, and for AAC is **.m4a**. However this package can auto convert these extensions to **.mp3** using **FFmpeg**.

## Disclaimer

This package doesn't ensure your Spotify account won't be taken down. 
So, use it at your risk.

## Credits
- Package written by Sir [PwL](https://github.com/PwLDev).
- Thanks to [Alen't](https://github.com/ale057j0825) for inspiration.
- Syntax and usage inspired by [ytdl-core](https://github.com/fent/node-ytdl-core), made by [Fent](https://github.com/fent).