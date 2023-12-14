# dungeon-mystery

[![npm](https://img.shields.io/npm/v/dungeon-mystery)](https://www.npmjs.com/package/dungeon-mystery)

![dungeon-mystery512x487](https://github.com/EpicYoshiMaster/dungeon-mystery/assets/32598419/8aeb7f74-c97d-473b-943a-115f4c83e015)

Logo by [@sgtmug](https://twitter.com/sergeantmug)
 
dungeon-mystery is a Typescript implementation of Pokémon Mystery Dungeon: Explorers of Sky's dungeon algorithm.

This package is the main code behind [Pokémon Dungeoneer](https://github.com/EpicYoshiMaster/pokemon-dungeoneer), a web tool for generating and visualizing PMD layouts.

It's built to replicate the original algorithm as closely as possible, while also being much more readable and useful as a reference.

This package features:

- Fully commented functions with address references for the NA version of Explorers of Sky
- Complete map generation, returning all relevant data associated with the map as used in the game.

## Installation

```bash
npm install dungeon-mystery
```

## Documentation

Documentation is available [here](https://epicyoshimaster.github.io/dungeon-mystery/)!

## License

[GNU GPL v3](LICENSE)

## Sources

This project could not exist without the amazing work by members of the community who have researched and documented the map generation process extensively.

[pmdsky-debug](https://github.com/UsernameFodder/pmdsky-debug) - Central resource for debugging information to reverse engineer Explorers of Sky

[dungeon-eos](https://github.com/SkyTemple/dungeon-eos) - Python implementation of the dungeon algorithm used as part of [SkyTemple](https://skytemple.org/)

[Map generation](https://docs.google.com/document/d/1HuJIEOtTYCtSHK6R-sp4LC2gk1RDL_mfoFL6Qn_wdkE/edit) - Document by End45 detailing the map generation process

[Dungeon data](https://docs.google.com/document/d/1UfiFz4xAPtGd-1X2JNE0Jy2z-BLkze1PE4Fo9u-QeYo/edit) - Document by End45 detailing how dungeon-related data is organized and structured
