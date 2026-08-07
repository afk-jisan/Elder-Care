# Clairluna Design System

A reusable design language extracted from the homepage. Intended as a reference for recreating the same visual identity on other pages or projects.

---

## Typography

Three Google Fonts are loaded:

```
@import url('https://fonts.googleapis.com/css2?family=Questrial&family=Lexend:wght@300;400;500;700&family=Inter:wght@400;500;600;700&display=swap');
```

| Role | Font | Usage |
|---|---|---|
| Display / Headlines | `Lexend` | `h1`, `h2`, `h3` — large section headings |
| Body / Utility | `Questrial` | Subtext, captions, labels, marquee, badges, nav links |
| UI Controls | `Inter` | Buttons, input fields, nav CTAs |

**Font class pattern:**

```html
font-['Lexend',sans-serif]
font-['Questrial',sans-serif]
font-['Inter',sans-serif]
```

**Heading scale (responsive):**

```html
text-3xl md:text-4xl lg:text-5xl   <!-- Section h2 standard -->
text-4xl sm:text-5xl md:text-6xl lg:text-7xl  <!-- Hero h1 -->
text-[72px]   <!-- Decorative step numbers (low opacity) -->
text-3xl md:text-4xl   <!-- Card h3 -->
text-lg   <!-- Small card titles / h3 inline -->
text-[15px]   <!-- FAQ questions, feature titles -->
text-sm   <!-- Labels, CTA links -->
text-xs text-[11px] text-[10px]   <!-- Badges, uppercase labels, marquee -->
```

**Decorative headline pattern** — light word + color accent + light word:

```tsx
<h2 className="font-['Lexend',sans-serif] text-[#0c1820] leading-tight">
  <span className="text-3xl md:text-4xl lg:text-5xl">Simple, intentional,</span>
  <br />
  <span className="text-3xl md:text-4xl lg:text-5xl">and </span>
  <span className="text-3xl md:text-4xl lg:text-5xl text-[#5ba2a5]">grounded.</span>
</h2>
```

**Section eyebrow label pattern:**

```html
font-['Questrial',sans-serif] text-[#3673a3] uppercase tracking-[2px] text-xs mb-3
```

---

## Color Palette

### Brand Colors

| Token | Hex | Usage |
|---|---|---|
| Primary blue | `#3673a3` / `#3972a5` | Primary CTA buttons, icons, links, borders |
| Teal accent | `#5ba2a5` / `#24a0b5` | Headline accent word, decorative gradient endpoints |
| Dark navy | `#0c1820` | Body headings, dark card backgrounds |
| Charcoal | `#4b4e4d` | Navbar CTAs (secondary dark tone) |

### Backgrounds

| Color | Usage |
|---|---|
| `#ffffff` | Default white sections |
| `#f7f4ef` | Warm off-white — alternating content sections, testimonial cards |
| `#e6f4f7` | Pale teal — advisor CTA section, tag chips in session card |
| `#3972a5` (solid) | Full-bleed CTA banner section, walk-in card background |

### Text Colors

| Color | Usage |
|---|---|
| `#0c1820` | Strong headings on light backgrounds |
| `#2d3748` | Hero headline |
| `#4d6470` | Body paragraphs, secondary descriptive text |
| `#7b9099` | Light secondary text, card descriptions |
| `#9ca3af` | Input placeholder |
| `#3673a3` | Eyebrow labels, links, inline accent |

### Status / Semantic

| Color | Usage |
|---|---|
| `#4ADE80` (green) | Online Now indicator dot |
| `#E03838` (red) | Offline indicator dot |
| `#C8A84A` (amber) | Busy indicator dot, star ratings |
| `#FDE047` (yellow) | "Top Rated" badge text |
| `#d4183d` | Destructive / error (from theme) |

### Section Background Pattern
Sections alternate in a repeating pattern to create rhythm:
```
white → #f7f4ef → white → white → #f7f4ef → white → #e6f4f7 → #3972a5 (CTA)
```

---

## Layout

### Max Width Container

All section content is constrained to:

```html
max-w-[1200px] mx-auto px-6 md:px-10
```

The hero section uses a slightly wider container:

```html
max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16
```

### Section Padding

```html
py-16 md:py-24
```

### Two-Column Layout (image + content)

Standard split: `flex-col lg:flex-row gap-12 lg:gap-16 lg:items-stretch`
- Image side: `w-full lg:w-[380px] shrink-0` or `lg:w-[42%]` or `lg:w-[50%]`
- Content side: `flex-1`

---

## Buttons

### Primary — Solid Blue

```html
bg-[#3673a3] text-white font-['Inter',sans-serif] font-semibold px-8 py-3.5 rounded-full hover:bg-[#2d6490] transition-colors
```

### Secondary — Dark Outlined

```html
border border-[#1f2937] text-[#1f2937] font-['Inter',sans-serif] font-semibold px-8 py-3.5 rounded-full hover:bg-gray-50 transition-colors
```

### Secondary — Outline Blue (for darker/colored contexts)

```html
border border-[#3673a3] text-[#3673a3] font-['Questrial',sans-serif] text-sm px-6 py-3 rounded-full hover:bg-[#3673a3] hover:text-white transition-colors
```

### Ghost — White on Dark Background

```html
bg-white/10 border border-white/20 text-white font-['Questrial',sans-serif] text-xs py-2.5 rounded-full hover:bg-white/20 transition-colors
```

### Icon Circle Button

```html
border border-[#1f2937] text-[#1f2937] w-[50px] h-[50px] rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors
```

### Pricing CTA — Dark Fill (most-booked)

```html
bg-[#0c1820] text-white py-3 rounded-full font-['Lexend',sans-serif] font-bold text-sm hover:opacity-90 transition-opacity
```

### CTA on Blue Section — Inverted White

```html
bg-white text-[#3972a5] font-['Questrial',sans-serif] text-sm px-7 py-3 rounded-full hover:bg-gray-100 transition-colors inline-flex items-center gap-2
```

---

## Cards

### Advisor/Profile Card (dark image overlay)

Full-bleed image with gradient overlay and content pinned to the bottom:

```tsx
<div
  className="relative rounded-3xl overflow-hidden aspect-[350/490] cursor-pointer group"
  style={{ backgroundImage: "linear-gradient(155deg, rgb(58,104,120) 0%, rgb(12,30,44) 100%)" }}
>
  <img src={img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
  <div className="absolute inset-0 bg-gradient-to-b from-transparent/10 via-transparent to-black/80" />
  <div className="absolute bottom-4 left-0 right-0 px-5">
    {/* name, specialty, price, CTA buttons */}
  </div>
</div>
```

### Service / Feature Card (white box)

```html
bg-white border border-[#e0e9ec] rounded-3xl p-6 flex flex-col
```

### Testimonial Card

```html
bg-[#f7f4ef] border border-[#e0e9ec] rounded-3xl p-7
```

### Glassmorphism Overlay Card (on dark image)

Used for bottom caption overlays on image cards:

```html
backdrop-blur-lg bg-[#0c1820]/80 border border-white/10 rounded-2xl p-5
```

### Session Type — Walk-in (solid brand blue)

```html
bg-[#3972a5] rounded-[32px] p-8 md:p-10 text-white relative overflow-hidden
```

### Session Type — Scheduled (pale teal)

```html
bg-[#e6f4f7] border border-[#e0e9ec] rounded-[32px] p-8 md:p-10 relative overflow-hidden
```

---

## Badges & Chips

### Social Proof Badge (white pill)

```html
bg-white rounded-full shadow-sm px-4 py-2 flex items-center gap-2
```
Inner icon container: `bg-[#3673a3] rounded-full p-1`

### Advisor Status Badge (glassmorphism pill)

```html
backdrop-blur-sm bg-white/12 border border-white/18 rounded-full px-3 py-1 flex items-center gap-2
```
Status dot: `w-1.5 h-1.5 rounded-sm` with color from `statusColors` map.

### Eyebrow / Label Badge (e.g. "Top Rated")

```html
px-3 py-1.5 rounded-full border backdrop-blur-md bg-black/50 text-[10px] font-['Lexend',sans-serif] font-medium tracking-wide uppercase
```
Border and text color are dynamic (`borderColor: design.border`, `color: design.color`).

### "Most Booked" Pricing Badge

```html
absolute -top-3 right-4 bg-[#3972a5] text-white font-['Inter',sans-serif] font-bold text-[10px] px-4 py-1.5 rounded-full border-4 border-white shadow-md z-10
```

### Session Duration Tag Chip

On blue card: `bg-white/10 rounded-full px-5 py-2 text-white/80 text-sm`
On teal card: `bg-white border border-[#e0e9ec] rounded-full px-5 py-2 text-[#3673a3] text-sm`

---

## Icons

- **Library:** Lucide (`lucide-react`) for UI icons (Search, Star, ArrowUpRight, Menu, X, Heart, LogOut, User)
- **Brand icons:** Custom inline SVG paths (`svgPaths`) at `#3673A3` stroke/fill color
- **Extended icons:** `@hugeicons/react` for additional specialty icons
- **Star ratings:** Unicode `★` character at `text-[#c8a84a]`
- **Checkmarks in pricing:** Custom inline SVG at `#3972A5` stroke color

---

## Animations

### Page Load — GSAP Staggered Entry (HeroSection)

Using a timeline, each element enters bottom-to-top with opacity:

```js
gsap.timeline({ defaults: { ease: "power4.out" } })
  .from(imageRef.current,   { y: 34, opacity: 0, duration: 0.72, delay: 0.08 })
  .from(badgeRef.current,   { y: 28, opacity: 0, duration: 0.62 }, "-=0.34")
  .from(headlineRef.current,{ y: 44, opacity: 0, duration: 0.8  }, "-=0.36")
  .from(subRef.current,     { y: 32, opacity: 0, duration: 0.62 }, "-=0.4")
  .from(ctaRef.current,     { y: 22, opacity: 0, duration: 0.55 }, "-=0.3")
  .from(statsRef.current,   { y: 18, opacity: 0, duration: 0.5  }, "-=0.25");
```

### Scroll-Triggered — GSAP + ScrollTrigger (VisionSection)

Sections animate in when they reach 80% of the viewport:

```js
gsap.from(el, {
  y: 40, opacity: 0, duration: 0.8,
  scrollTrigger: { trigger: sectionRef.current, start: "top 80%" }
});
```
Staggered children use `delay: i * 0.1` for wave effect.

### Image Hover Scale (Advisor Cards)

```html
transition-transform duration-500 group-hover:scale-105
```
Parent needs `group` class.

### Marquee (MarqueeBanner)

CSS keyframe defined in `fonts.css`:

```css
@keyframes marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-33.333%); }
}
```
Applied via Tailwind: `animate-[marquee_30s_linear_infinite]`.
Content is triplicated (`[...items, ...items, ...items]`) to create a seamless loop.

### FAQ Accordion Toggle

Icon rotates 45° on open, background flips:

```html
<!-- Closed -->
bg-[#f7f4ef] border border-[#e0e9ec] text-[#4d6470]
<!-- Open -->
bg-[#3673a3] text-white rotate-45
```
Applied via: `transition-transform` on the `+` character container.

### Button Transitions

All buttons use `transition-colors` or `transition-opacity` for hover states.

---

## Backgrounds & Gradients

### Hero Section Background (multi-layer radial)

```js
backgroundImage:
  "radial-gradient(ellipse at 15% 40%, rgba(255,255,255,0.7) 0%, transparent 40%), " +
  "radial-gradient(ellipse at 85% 20%, rgba(255,255,255,0.6) 0%, transparent 50%), " +
  "radial-gradient(ellipse at 50% 70%, rgba(255,255,255,0.5) 0%, transparent 60%), " +
  "linear-gradient(rgb(202,235,252) 0%, rgb(224,244,255) 45%, rgb(242,251,255) 100%)"
```

### Advisor Image Card Background (dark fallback)

```js
backgroundImage: "linear-gradient(155deg, rgb(58,104,120) 0%, rgb(12,30,44) 100%)"
```

### Image Card Gradient Overlay

```html
absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80
```

### Featured Advisor / Specialty Section Card

```js
backgroundImage: "linear-gradient(145deg, rgb(29,127,145) 0%, rgb(12,40,48) 60%, rgb(16,37,53) 100%)"
```

### SessionType Card — Decorative Radial Blob

```html
absolute -top-20 -right-52 w-[450px] h-[320px] rounded-[160px] opacity-30
style={{ backgroundImage: "radial-gradient(ellipse at center, rgba(29,127,145,0.3) 0%, transparent 70%)" }}
```

---

## Spacing & Borders

### Section dividers between feature list items

```html
border-b border-[#e0e9ec] py-5
```

### Step column divider (vertical, desktop only)

```html
lg:border-r border-[#e0e9ec]
```

### Default card border

```html
border border-[#e0e9ec]
```
or
```html
border border-[#e2e2e2]
```

### Border radius scale

| Class | Use |
|---|---|
| `rounded-full` | Buttons, badges, pills |
| `rounded-3xl` | Standard cards |
| `rounded-[32px]` | Session type large cards |
| `rounded-2xl` | Glassmorphism caption overlay |
| `rounded-xl` | Icon containers, small tags |

---

## Search Bar Pattern

Pill-shaped input with inset search button:

```html
bg-white rounded-full shadow-[0px_15px_40px_-15px_rgba(0,0,0,0.1)] flex items-center w-full max-w-lg overflow-hidden border border-[#e2e2e2]
```
- Input: `flex-1 min-w-0 px-5 py-4 outline-none bg-transparent text-[#9ca3af]`
- Button: `bg-[#4b4e4d] text-white rounded-full m-1.5 hover:bg-[#3a3d3c] transition-colors`

---

## Navbar Pattern

- **Position:** `absolute top-0 left-0 right-0 z-50` (overlays the hero)
- **Padding:** `px-6 md:px-10 lg:px-16 py-7`
- **Nav links:** Centered with `absolute left-1/2 -translate-x-1/2`
- **Auth CTAs:** Flex right, outlined + filled pill buttons
- **Mobile:** Hamburger menu reveals absolute dropdown `bg-white shadow-lg` from `top-full`
- **Backdrop on mobile open:** `fixed inset-0 bg-black/40 backdrop-blur-sm`

---

## Scroll Behavior

- Global: `html { scroll-behavior: smooth; }`
- Section anchor offset: `scroll-margin-top: 6.5rem` applied to all named `#id` sections
- Reduced motion respected: `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }`
