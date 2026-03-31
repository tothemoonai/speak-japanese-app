```markdown
# Design System Specification: Editorial Tech-Zen

## 1. Overview & Creative North Star: "The Digital Sensei"
The "Digital Sensei" is the Creative North Star for this design system. It moves beyond the clinical nature of typical "EdTech" apps to create an environment that feels like a high-end, Tokyo-based architectural studio. It is where the precision of **High-Tech Modernism** (clean lines, data-driven layouts) meets the soul of **Japanese Minimalism** (intentional negative space, rhythmic pacing).

To break the "template" look, we utilize **Intentional Asymmetry**. Key headers are often offset, and data visualization elements break the container bounds slightly to suggest a "living" AI interface. We avoid the rigid 1:1 grid in favor of an editorial layout that prioritizes content breathing room over information density.

---

## 2. Colors & Surface Philosophy
The palette is rooted in the deep obsidian of a midnight sky, contrasted with the surgical precision of neon teal.

### The Color Logic
- **Primary (`#57f1db`):** Use for active learning states and high-priority interactions.
- **Secondary (`#b9c8de`):** Used for "inactive" but present UI elements, mimicking brushed aluminum.
- **Tertiary (`#ffd29f`):** Reserved exclusively for 'S' grade achievements and "Moment of Delight" milestones.
- **Surface (`#0b1326`):** The canvas. Never pure black, but a deep, atmospheric navy.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Separation must be achieved via:
1. **Background Shifts:** Placing a `surface-container-low` card on a `surface` background.
2. **Negative Space:** Using the `10` (2.5rem) or `12` (3rem) spacing tokens to define cognitive groups.
3. **Soft Tonal Transitions:** Using a subtle linear gradient from `surface-container` to `surface-dim` to define headers.

### Glass & Texture
For floating character cards or AI feedback modals, use **Glassmorphism**. Apply `surface-variant` at 60% opacity with a `backdrop-filter: blur(20px)`. This creates a "frosted glass" effect that allows the underlying progress trackers to bleed through, maintaining a sense of spatial depth.

---

## 3. Typography: The Editorial Voice
Our typography scale creates an authoritative, tech-literate atmosphere.

- **Display & Headlines (`Space Grotesk`):** A geometric sans-serif that feels engineered. Use `display-md` (2.75rem) for achievement scores and `headline-sm` (1.5rem) for lesson titles.
- **Body & Titles (`Manrope`):** A versatile sans-serif for high readability in technical IT contexts. 
- **Japanese Text:** Use **Yu Mincho** for literary or formal vocabulary examples to evoke traditional Japanese elegance, and **Hiragino Sans** (Gothic) for technical IT terminology to maintain modernism.
- **Labels (`Plus Jakarta Sans`):** Used for micro-copy and data points.

**Hierarchy Note:** Always pair a `display-lg` achievement number with a `label-md` descriptive tag in 50% opacity `on-surface-variant` to create a "High-Contrast Editorial" look.

---

## 4. Elevation & Tonal Layering
We do not use shadows to simulate height; we use **Tonal Stacking**.

- **The Layering Principle:**
    - Level 0 (Base): `surface`
    - Level 1 (Sections): `surface-container-low`
    - Level 2 (Interactive Cards): `surface-container-high`
    - Level 3 (Active Pop-overs): `surface-container-highest` + 8% Opacity Shadow.
    
- **Ambient Shadows:** When a "floating" effect is mandatory, use a blur of `24px` with a color derived from `on-secondary-fixed-variant` at 5% opacity. It should look like a soft glow of light, not a dark smudge.
- **Ghost Borders:** For accessibility on input fields, use `outline-variant` at **15% opacity**. This provides a "suggestion" of a boundary without cluttering the Zen-like interface.

---

## 5. Signature Components

### The Pulse Recording Button
- **Base:** A perfect circle using `primary-container`.
- **States:** When active, two concentric rings of `primary` at 20% and 10% opacity expand outward using a CSS-sine wave animation.
- **Styling:** No icons. Use a single, elegant `label-md` text "REC" or the Japanese "録音" centered.

### Character & Vocabulary Cards
- **Structure:** No borders. Use `surface-container-low`.
- **Corner Radius:** Use `xl` (0.75rem) for the outer container and `md` (0.375rem) for internal elements like "Kanji" tags.
- **Layout:** The Japanese character should be set in `display-sm` (Mincho) on the left, with the IT definition in `body-md` (Manrope) on the right, separated by 2rem of whitespace.

### Progress & Data Viz Cards
- **The "IT-Metric" Look:** Use thin, 2px stroke lines for progress bars using `primary`.
- **The Gold Standard:** When a user hits 'S' grade, the card background shifts to a subtle radial gradient of `tertiary-container` to `surface-container-high`.

### Input Fields
- **Interaction:** On focus, the background shifts from `surface-container-low` to `surface-container-highest`. The label moves from `body-md` to `label-sm` and changes color to `primary`.

---

## 6. Do’s and Don’ts

### Do:
- **Use "Asymmetric Padding":** Try giving a container 2rem padding on the left and 1.5rem on the right to create a modern, rhythmic feel.
- **Embrace "Ma" (Negative Space):** If a screen feels crowded, remove a decorative element before you reduce text size.
- **Use Tonal Depth:** Always check if a background color shift can replace a divider line.

### Don't:
- **No 100% Opacity Borders:** They break the "Zen" flow and feel like legacy software.
- **No Harsh Shadows:** Avoid `offset-y: 5px` black shadows. Our light source is ambient and digital.
- **No Standard Icons:** Avoid generic "Home" or "Settings" icons. Use minimalist, thin-stroke (1.5px) custom icons that match the `primary` color.
- **No Over-saturation:** Keep `Gold (#F59E0B)` strictly for 'S' grade achievements to maintain its psychological value as a "premium" reward.```