```markdown
# Farcaster Link Tree Frame Specification

## 1. OVERVIEW

### Core Functionality
- Dynamic link tree displaying pinned social links (Farcaster, GitHub) + 3 recent shared URLs
- Interactive navigation system supporting multiple interaction modes
- Real-time content updates through local storage management
- Embedded sharing capabilities via native frame controls

### UX Flow
1. Initial view: Vertical stack of primary links with visual hierarchy
2. Secondary view: Scrollable panel for recent links (max 5 items)
3. Tertiary view: Expanded link details with preview capability
4. Context-aware transitions between views using directional animations

## 2. TECHNICAL REQUIREMENTS

### Responsive Design
- Mobile-first fluid grid (1-4 columns based on viewport)
- Dynamic font scaling (16px-24px range)
- Flexible image containers with intrinsic ratios
- CSS Grid-based layout with fallback to flexbox

### API Constraints
- Farcaster Frame SDK v2.1+ for wallet interactions
- Wagmi 2.0+ for Ethereum provider integration
- React Query 5.0+ for client-side caching
- Native Web APIs for storage/geolocation

## 3. FRAMES v2 IMPLEMENTATION

### Interactive Elements
- Canvas-based touch gestures (swipe navigation)
- Position-aware hover states (desktop fallback)
- Dynamic focus rings for keyboard navigation
- Contextual loading indicators per interaction

### Input Handling
- Multi-touch support for quick actions
- Long-press context menus
- Accelerometer-based orientation detection
- Voice-over compatible semantic markup

### Data Persistence
- LocalStorage for user preferences
- SessionStorage for temporary state
- IndexedDB for cached link metadata
- Frame-to-Frame communication via postMessage

## 4. MOBILE CONSIDERATIONS

### Responsive Techniques
- Viewport-relative units (vw/vh)
- Conditional asset loading (srcset)
- Touch-target optimization (min 48px²)
- Reduced motion preferences support

### Touch Patterns
- Swipe-left to access recent links
- Swipe-right to return to main view
- Pull-down to refresh content
- Edge-swipe for developer menu

## 5. CONSTRAINTS COMPLIANCE

### Storage Strategy
- Device-specific LocalStorage partitioning
- Ephemeral session storage for temp data
- No cross-device sync requirements
- Privacy-first data retention policies

### Architecture Limits
- Pure client-side rendering (No SSR)
- Static asset hosting only
- No external API dependencies
- Vanilla CSS + CSS-in-JS hybrid

### Complexity Boundaries
- Single-level component hierarchy
- Minimal state management (Context API)
- No authentication requirements
- Progressive enhancement baseline
```

This specification focuses on leveraging Farcaster Frame v2 capabilities while maintaining mobile-first principles and respecting the provided technical constraints. The design emphasizes native web platform features over external dependencies, with particular attention to touch interaction patterns and responsive layout requirements.