<p align="center">
  <img src="static/app-icons/icon.png" width="256">
</p>

<div align="center">
  <h1>Weaver</h1>

Weaver is an extensible and privacy-focused web browser with a totally different user experience, built on top of `Electron`, `TypeScript`, `React` and `styled-components`. It aims to be fast, private, beautiful, extensible and functional.
The main idea of the browser is to easily navigate the permaweb by [Arweave](https://arweave.org), and all it's amazing features.
Weaver is based on the `wexond` source. Big thanks to them.

</div>

# Features

- **ArweaveApps** - Arweave Apps are accessible directly from the intro screen.
- **Arweave Shield** - Browse the web without any ads and don't let websites to track you. Thanks to the Arweave Shield, websites can load even 2 times faster!
- **Beautiful and minimalistic UI** - The address bar is hidden in Overlay to take less space, but it doesn't impact on usability in any way. It's even better!
- **Tab groups** - Easily group tabs to groups and access them really fast.
- **Partial support for Chrome extensions** - Install some extensions from Chrome Web Store
- **Overlay** - It contains everything you will need. Search box, bookmarks, menu, your custom components and much more!
- **Packages** - Extend Weaver for your needs, by installing or developing your own packages. They can theme the browser and even add custom components to the Overlay!

# Screenshots

![](static/screenshots/home.png)

# Contributing

If you have found any bugs or just want to see some new features in Weaver, feel free to open an issue. I'm open to any suggestions and bug reports would be really helpful for me and appreciated very much. Weaver Browser is in heavy development and some bugs may occur. Also, please don't hesitate to open a pull request. This is really important to me and for the further development of this project.

## Running

Before running Weaver, please ensure you have [`Node.js`](https://nodejs.org/en/) installed on your machine.

Firstly, run this command to install all needed dependencies. If you have encountered any problems, please report it. I will try to help as much as I can.

```bash
$ npm install
```

The given command below will run Weaver in the development mode.

```bash
$ npm run dev
```

## Other commands

You can also run other commands, for other tasks like building the app or linting the code, by using the commands described below.

### Usage:

```bash
$ npm run <command>
```

#### List of available commands:

| Command          | Description                                 |
| ---------------- | ------------------------------------------- |
| `build`          | Bundles Weaver's source in production mode. |
| `compile-win32`  | Compiles Weaver binaries for Windows.       |
| `compile-darwin` | Compiles Weaver binaries for macOS.         |
| `compile-linux`  | Compiles Weaver binaries for Linux.         |
| `lint`           | Lints code.                                 |
| `lint-fix`       | Fixes eslint errors if any                  |
| `start`          | Starts Weaver.                              |
| `dev`            | Starts Weaver in the development mode       |

### Changelog
```
v1.0.4
- P2P (Wildfire) feature enabled.
- Renamed .arweave-browser app data file to .weaver

v1.0.3
- You can add your wallets JSON files to the browser.
- When a wallet is added, easily login by drag & drop for the wallet icon.
- Set a master password to encrypt your browser wallet files.
- CTRL + Click to set a new wallet as default (1st wallet is set by default).
- Click on the wallet address to copy to clipboard. 
- Arweave Browser is now "Weaver". New name!

v1.0.2
- Blockchain download for local/offline requests.
- App links now appear without the path/IP on the search/url bar.
- Local requests for arweave websites.
- Better nodes error handling

v1.0.1
- Showing apps as list while clicking the apps button.
- Changed the apps icon on about:blank.
- Apps search directly in the browser.
- Navigate to an arweave transaction with only it's ID.

v1.0.0
- Showing apps on about:blank.
- Initial commit.
```
