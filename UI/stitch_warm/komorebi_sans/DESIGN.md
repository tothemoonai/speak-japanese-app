```markdown
# Design System Document

## 1. Overview & Creative North Star: "The Digital Engawa"
In traditional Japanese architecture, the *Engawa* is a sun-drenched wooden veranda that bridges the interior of the home with the garden. It is a space of transition, comfort, and observation. 

This design system adopts the **"Digital Engawa"** as its Creative North Star. To reduce the inherent anxiety of learning a complex language like Japanese, the UI must move away from the rigid, "flashcard-grid" aesthetics of traditional EdTech. Instead, we employ a **High-End Editorial** approach: using intentional asymmetry, generous whitespace (ma), and a sophisticated layering of warm tones to create a sanctuary for study. 

We break the "template" look by treating the screen not as a container for data, but as a series of tactile, stacked papers that invite the user to lean in and stay a while.

---

## 2. Color & Tonal Depth
The palette is rooted in warmth, designed to simulate the soft glow of a paper lantern.

### The "No-Line" Rule
To maintain a premium, high-end feel, **1px solid borders are strictly prohibited** for sectioning. Structural definition must be achieved through background shifts using the `surface-container` tiers or subtle tonal transitions. If an element requires separation, use a change from `surface` (#fdf9ee) to `surface-container-low` (#f7f3e8).

### Surface Hierarchy & Nesting
Treat the UI as a physical stack. Importance is signaled by "lifting" an element through tone:
- **Base Layer:** `surface` (#fdf9ee)
- **Secondary Sections:** `surface-container-low` (#f7f3e8)
- **Interactive Cards:** `surface-container-lowest` (#ffffff) sitting on a `surface-container` base.
- **Active Overlays:** `surface-bright` (#fdf9ee)

### Signature Textures & Glassmorphism
- **The "Amber Glow" CTA:** Main actions should not be flat. Use a subtle linear gradient from `primary` (#855300) to `primary-container` (#f59e0b) at a 135° angle to give buttons a three-dimensional "soul."
- **Frosted Shoji Effects:** For floating navigation or modals, use `surface-container-lowest` with a 70% opacity and a `backdrop-blur` of 12px. This allows the warm background tones to bleed through, softening the interface.

---

## 3. Typography: Editorial Authority
We use **Plus Jakarta Sans** to balance professional IT terminology with a friendly, approachable cadence.

- **Display (Large/Med):** Used for "Aha!" moments or lesson milestones. These should be set with tight letter-spacing (-0.02em) to feel like a modern magazine header.
- **Headline (Sm/Med):** Used for kanji characters and primary concepts. High contrast against `on-surface` (#1c1c15) ensures legibility without the harshness of pure black.
- **Body (Lg/Md):** The workhorse for definitions and explanations. Use `body-lg` for Japanese text to provide the necessary visual weight for complex strokes.
- **Labels:** Reserved for "IT Metadata" (e.g., syntax types, tags). These should be tracked out (+0.05em) and set in `secondary` (#a93349) to distinguish them from the primary learning flow.

---

## 4. Elevation & Depth: The Layering Principle
We reject the heavy, "muddy" shadows of generic Material design.

- **Ambient Shadows:** Only use shadows for floating elements (FABs, Modals). Use a blur of 24px-32px with an opacity of 6% using a tint of `on-surface-variant` (#534434). This mimics natural light passing through a room.
- **Tonal Lift:** For standard cards (Lessons, Vocabulary), use a `surface-container-highest` (#e6e2d8) background with no shadow. The 16px (`xl`) rounded corners provide the necessary organic silhouette.
- **The "Ghost Border" Fallback:** If a layout requires extreme precision (e.g., code blocks), use the `outline-variant` (#d8c3ad) at 15% opacity. Never use 100% opaque lines.

---

## 5. Components

### Buttons & Actions
- **Primary:** Gradient-filled (`primary` to `primary-container`), 16px (`xl`) radius. Text is `on-primary` (#ffffff).
- **Secondary:** `secondary-container` (#fe7488) background with `on-secondary-container` (#730425) text. Used for "Soft" actions like "Show Hint."
- **Tertiary:** No background. Text in `primary` (#855300) with an icon.

### Cards & Lesson Items
- **Rule:** Forbid divider lines between list items. Use `3` (1rem) spacing between items and alternate background tints (`surface-container-low` vs `surface-container`) to distinguish rows.
- **Padding:** Always use a minimum of `5` (1.7rem) internal padding for cards to ensure content feels "un-cramped."

### Input Fields (Kanji/Text)
- **Base:** `surface-container-highest` (#e6e2d8) with a 2px bottom-heavy "Ghost Border." 
- **Focus State:** Background shifts to `surface-container-lowest` (#ffffff) with a 2px `primary` bottom border to signal active engagement.

### Signature Component: The "Zen Progress" Bar
Instead of a thin, technical line, use a thick (12px) track with `surface-container-highest`. The progress fill should be a soft gradient of `tertiary-container` (#1abdff) to `tertiary` (#00658b), representing the flow of knowledge.

---

## 6. Do’s and Don’ts

### Do
- **Use Asymmetry:** Place hero images or kanji characters slightly off-center to create a dynamic, editorial feel.
- **Embrace White Space:** If in doubt, increase the spacing scale by one increment. Learning requires room to breathe.
- **Tone-on-Tone:** Place `primary-fixed` (#ffddb8) tags on `surface-container-low` (#f7f3e8) backgrounds for a sophisticated, low-contrast look.

### Don't
- **Don't use pure black:** It creates "visual vibration" against the cream background and increases eye strain.
- **Don't use sharp corners:** Any radius below 8px (`md`) is too aggressive for the "Digital Engawa" philosophy.
- **Don't use dividers:** Horizontal rules (`<hr>`) are the enemy of this system. Use spatial gaps or tonal shifts instead.

---
*Document Version: 1.0 | Prepared for the Junior Design Team*```