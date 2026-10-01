# Friends comic opening

The opening borrows the layered illustration and scroll storytelling approach of [Ponpon Mania](https://ponpon-mania.com/). It uses original scenery, existing local Pikmin assets, Vue, and GSAP. No artwork from the reference website is used.

## Assets

- `public/images/friends-comic/clearing.webp`: woodland background, 1536 × 1024.
- `public/images/friends-comic/meadow.webp`: foreground plants with genuine alpha, 1536 × 1024.
- `public/images/friends-comic/pikmin-red.png`: 464 × 956, [Pikmin 4 artwork source](https://www.pikminwiki.com/File:P4_Red_Pikmin.png).
- `public/images/friends-comic/pikmin-yellow.png`: 428 × 900, [Pikmin 4 artwork source](https://www.pikminwiki.com/File:P4_Yellow_Pikmin.png).
- `public/images/friends-comic/pikmin-blue.png`: 366 × 964, [Pikmin 4 artwork source](https://www.pikminwiki.com/File:P4_Blue_Pikmin.png).

The character files are original-resolution game artwork credited to Nintendo, retrieved through Pikipedia. These replace the small color-powder thumbnails in the opening only. Native alpha and proportions are preserved; the rendered size stays within the source resolution on phone displays.

Generated using the built-in imagegen tool. The original PNG files remain in the Codex generated image directory; the project assets are WebP exports with transparency preserved.

## Background prompt

Use case: illustration-story. Asset type: original background artwork for a mobile-first Pikmin fan community friends page. Create one exquisitely art-directed hand-drawn paper comic woodland clearing landscape, wide 3:2 composition. Original scene, no copied website artwork. Warm ivory paper, moss and mint greens, deep forest ink outlines, a little apricot and butter yellow. Confident slightly irregular pen contours and very subtle printed grain, colorful approachable illustrated comic style with tactile layered paper depth, NOT crude polygons, NOT thin random SVG lines, NOT photorealistic or generic 3D. Composition: upper half calm warm cream sky with two elegant puffy clouds, midground rounded forest trees and small distant hills, lower half a grassy clearing with winding ochre path to a cozy small wooden gathering hut at right-middle, a tiny turquoise pond at left-middle, charming rounded red mushrooms. Important: broad quiet empty clearing in center-bottom for separate animated characters to be placed later, no characters or faces anywhere, no text, no UI, no lettering, no border. Carefully balanced simple shapes, high quality illustration, beautiful foliage, light direction upper left. This is a background layer to crop responsively, keep focal objects inside center 60% horizontally.

## Foreground prompt

Use case: illustration-story. Asset type: foreground illustration layer for mobile-first paper comic woodland community website. One wide 3:2 original illustrated strip of lush meadow plants, wildflowers and small mushrooms emerging ONLY from bottom edge. The entire upper two thirds are genuinely transparent, including gaps between leaves. Style: exquisitely art-directed hand-drawn paper comic, confident dark forest green ink outlines with slightly irregular hand-drawn contours, delicate printed paper grain inside shapes, rounded friendly organic shapes, no geometric polygon leaves, no photorealism, no 3D rendering. Moss green and mint leaves, two beautifully shaped butter-yellow daisies on left, small ivory flowers at right, warm apricot buds, two charming red mushrooms on right. Composition: plants higher on far left/right corners and lower at middle, middle region mostly open, all plants rooted below bottom edge, modest continuous grassy baseline. No people, no faces, no text, no icons, no letters, no scene background, no shadows outside painted plants. Elegant restrained playful composition suitable as the foremost layer over a warm ivory green paper-comic woodland scene.

## Motion and access

The scene uses a short native scroll range with a CSS sticky stage. Background, foreground, characters, and the invitation have separate transforms. The browse button skips directly to the board. Hidden controls are inert; reduced motion removes the sticky scroll range and preserves greetings and browsing. The first available real recommendation supplies the invitation and its copy action.
