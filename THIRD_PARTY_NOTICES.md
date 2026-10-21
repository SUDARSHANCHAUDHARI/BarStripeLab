# Third-party notices

BarStripeLab's shape library (`lib/shapes.ts`) uses artwork from the projects below.

## Phosphor Icons

Shapes with `source: "phosphor"` are the "fill" weight of Phosphor Icons
(`@phosphor-icons/core` 2.1.1, https://phosphoricons.com), used as path data.

```
MIT License

Copyright (c) 2023 Phosphor Icons

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## game-icons.net

Shapes with `source: "game-icons"` come from game-icons.net
(https://game-icons.net, source files at https://github.com/game-icons/icons).
They are licensed under the Creative Commons Attribution 3.0 Unported license
(CC BY 3.0): https://creativecommons.org/licenses/by/3.0/

Changes made: the square background path was removed, and the icon is rescaled
and used as a mask for barcode bars.

- Shape Cupcake: cupcake by delapouite (game-icons.net), CC BY 3.0, modified (background removed, rescaled)
- Shape Cocktail: martini by lorc (game-icons.net), CC BY 3.0, modified (background removed, rescaled)
- Shape Wine: wine-bottle by delapouite (game-icons.net), CC BY 3.0, modified (background removed, rescaled)
- Shape Apple: shiny-apple by lorc (game-icons.net), CC BY 3.0, modified (background removed, rescaled)
- Shape Cat: cat by lorc (game-icons.net), CC BY 3.0, modified (background removed, rescaled)
- Shape Whale Tail: whale-tail by delapouite (game-icons.net), CC BY 3.0, modified (background removed, rescaled)
- Shape Shark Fin: shark-fin by delapouite (game-icons.net), CC BY 3.0, modified (background removed, rescaled)
- Shape Hummingbird: hummingbird by delapouite (game-icons.net), CC BY 3.0, modified (background removed, rescaled)
- Shape Horse: horse-head by delapouite (game-icons.net), CC BY 3.0, modified (background removed, rescaled)
- Shape Owl: owl by lorc (game-icons.net), CC BY 3.0, modified (background removed, rescaled)
- Shape Rabbit: rabbit by delapouite (game-icons.net), CC BY 3.0, modified (background removed, rescaled)
- Shape Meditation: meditation by lorc (game-icons.net), CC BY 3.0, modified (background removed, rescaled)
- Shape Palm Tree: palm-tree by delapouite (game-icons.net), CC BY 3.0, modified (background removed, rescaled)
- Shape Diamond: cut-diamond by lorc (game-icons.net), CC BY 3.0, modified (background removed, rescaled)

## Fonts

The site's fonts in `public/fonts` are licensed under the SIL Open Font License,
Version 1.1 (https://openfontlicense.org). The full license text for each font
sits next to it in `public/fonts`.

- Bricolage Grotesque (`BricolageGrotesque-Bold.woff2`): Copyright 2022 The Bricolage Grotesque Project Authors (https://github.com/ateliertriay/bricolage). License: `public/fonts/OFL-BricolageGrotesque.txt`
- Atkinson Hyperlegible Next (`AtkinsonHyperlegibleNext-wght.woff2`): Copyright 2020-2024 The Atkinson Hyperlegible Next Project Authors (https://github.com/googlefonts/atkinson-hyperlegible-next). License: `public/fonts/OFL-AtkinsonHyperlegibleNext.txt`
- IBM Plex Mono (`IBMPlexMono-Regular-Latin1.woff2`, `IBMPlexMono-Medium-Latin1.woff2`): Copyright © 2017 IBM Corp. with Reserved Font Name "Plex". License: `public/fonts/OFL-IBMPlexMono.txt`

## ZXing (TypeScript port)

The phone-read check uses `@zxing/library` 0.21.3 (https://github.com/zxing-js/library), licensed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0). It is loaded only when the scan check runs and is used unmodified.
