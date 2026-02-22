# Warhammer 3 Mod Manager

Mod manager for the Steam versions of Total War titles: Warhammer 3, Pharaoh, Three Kingdoms, Warhammer 2, Attila, Rome II, Shogun 2.

Features not present in the CA launcher:

- incredibly fast
- mod filtering and presets
- options to skip into videos or enable script logging
- view database tables of mods or the base game
- compatibility checker to inspect which mod will have priority and overwrite another
- can also update your mods directly like the CA launcher
- add tags/categories to organize your mods
- customize individual mods by disabling units, buildings or agents (lords and heroes)
  
&nbsp;

![App image](https://i.imgur.com/tRpqhWN.png)

## Run in development

```bash
yarn start
```

## Build for Windows

```bash
yarn make
```

Recommended toolchain is Yarn 4.12.0 (via Corepack) and Node.js v24.13.0+ (LTS line). Install with `corepack enable && corepack prepare yarn@4.12.0 --activate`, then use `yarn install --immutable`.

Note that yarn start does hot-reloading, but hot-reloading files related to the main Electron process (basically index.ts, the stuff related to the OS and files) won't work but hot-reloading the renderer process works (basically everything user facing).
