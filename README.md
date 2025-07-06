[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/AWcBoYwh)
# Music Player Controls Challenge

## Overview

Your task is to create an interactive music player component with smooth animations using React and Motion for React. The design specifications are provided in the Figma file, and all design tokens are already implemented in the project.

## Resources

- **Design**: [Figma Design File](https://www.figma.com/design/2VCdszrh6dTWmqcSw5IjAw/Music-Player-Controls?node-id=17488-16700&t=bzymPFHYcbymyvvl-1)
- **Final Result Reference**: View "Practice 3: Music Player Controls" at the bottom of [this page](https://wph-motion-for-react.vercel.app/intermediate-concepts/variants)

## Pre-configured Setup

- **Design System**: All colors, spacing, and design tokens are implemented in `globals.css`
- **Typography**: Extended typography classes are available in `tailwind.config.ts` (e.g., `display-2xl-bold` as an alternative to `display-2xl font-bold`)
- **Spacing**: Custom spacing unit is set to 1px (1:1 ratio) instead of Tailwind's default 4px (1:4 ratio). This means:
  - `p-1` = 1px (not 4px)
  - `p-4` = 4px (not 16px)
  - `p-16` = 16px (not 64px)

## Animation Requirements

### Player States

The music player should have three distinct states:

1. **Playing**
2. **Paused**
3. **Loading** (transitional state between playing/paused)

### Container Animations

#### Background & Shadow Transitions

Animate the container's background color and box shadow based on the current state:

- **Duration**: 300ms
- **Easing**: Default ease
- Apply different shadows for playing (purple glow) vs paused states

### Album Artwork Animations

#### Rotation Animation (Playing State)

- **Transform**: Continuous 360 degree rotation
- **Duration**: 20 seconds per full rotation
- **Easing**: Linear
- **Behavior**: Infinite loop, only when playing

#### Scale Transitions

Animate scale changes between states:

- **Playing**: scale(1)
- **Paused**: scale(0.95)
- **Loading**: scale(0.9)
- **Duration**: 300ms
- **Easing**: Spring animation recommended

### Equalizer Bars Animation

#### Individual Bar Animation (Playing State)

Each bar should animate independently:

- **Property**: Height (from 20% to 100%)
- **Duration**: 500ms per cycle
- **Direction**: Alternate (back and forth)
- **Repeat**: Infinite
- **Easing**: ease-in-out

#### Stagger Effect

Create a wave effect by staggering animations:

- **Delay**: 100ms
- **Example**: Bar 1 (0ms), Bar 2 (100ms), Bar 3 (200ms), etc.

#### State Transitions

- **Paused**: All bars at 20% height
- **Loading**: All bars at 50% height with 0.5 opacity
- **Transition Duration**: 300ms

### Progress Bar Animation

#### Fill Animation

- Smooth width transitions as the song progresses
- **Duration**: 300ms for state changes
- Color changes based on playing/paused state

### Control Button Interactions

#### Play/Pause Button

- **Hover**: Scale to 1.05
- **Active (tap)**: Scale to 0.95
- **Transition**: Spring animation
- **Loading State**: Disabled with gray background

#### Skip & Control Buttons

- **Hover**: Color transition to white
- **Active State**: Visual feedback on press

### State Change Sequence

When toggling between playing and paused:

1. Button enters loading state
2. Wait 500ms (simulate async operation)
3. Transition to new state
4. Update all animated elements accordingly

### Volume Slider

#### Hover Effects

- Fill color transitions from neutral to purple on hover
- **Duration**: 200ms

## Implementation Tips

### Using Motion Variants

Consider using Motion for React's variant system to manage the three states (playing, paused, loading) efficiently:

```jsx
const variants = {
  playing: {
    /* playing animations */
  },
  paused: {
    /* paused animations */
  },
  loading: {
    /* loading animations */
  },
};
```

### Animation Orchestration

- Use `AnimatePresence` for smooth transitions
- Apply individual `delay` values for equalizer bars to create stagger effect
- Apply `transition` props for consistent timing

### Performance Considerations

- Use `transform` and `opacity` for animations (GPU-accelerated)
- Avoid animating `width`/`height` where possible (use `scale` instead)
- Consider `will-change` for frequently animated elements

## Evaluation Criteria

Your implementation will be evaluated on:

1. **Functionality**: All three states work correctly
2. **Animation Quality**: Smooth, performant animations that match specifications
3. **Code Quality**: Clean, maintainable React code
4. **Attention to Detail**: Precise implementation of timing, easing, and stagger effects

## Getting Started

1. Install dependencies: `npm install`
2. Install required libraries:
   ```bash
   npm install motion/react lucide-react
   ```
3. Run development server: `npm run dev`
4. Write your code in `src/app/page.tsx`
5. Implement the music player component following the design and animation specifications
6. Test all states and transitions thoroughly

Good luck with your implementation!


Vercel Deployment Address:
https://musicplayer11-i579dd39j-senas-projects-56c0899a.vercel.app/