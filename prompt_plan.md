Here's the optimized prompt sequence for incremental implementation:

```markdown
# Prompt Sequence for Farcaster Link Tree Frame

## 1. Core Frame Structure Setup
```text
Create a Next.js page component at `/app/frame/page.tsx` with:
- Mobile-first CSS Grid layout using viewport units
- Farcaster Frame SDK v2.1 initialization
- Basic state management using Context API
- TypeScript interfaces for LinkData (url, title, timestamp)
- Responsive container with safe area padding
- Integration with existing UI template's header/footer
```

## 2. Data Management Foundation
```text
Implement data handling in `/lib/data.ts`:
- React Query hooks for loading/saving links
- localStorage integration for pinned links
- IndexedDB setup for recent links cache
- SessionStorage for view state tracking
- Type-safe data validation with Zod
- Custom hooks useLinks() and useLinkActions()
```

## 3. Dynamic Link Rendering
```text
Create components/LinkList.tsx with:
- Conditional rendering of pinned vs recent links
- CSS Grid/Flexbox hybrid layout
- Touch-friendly swipe detection
- View transition logic (main <-> recent)
- Accessibility-compliant semantic markup
- Integration with data hooks from step 2
```

## 4. View Transition System
```text
Add view transitions in `/components/ViewManager.tsx`:
- CSS transform animations for slide effects
- Directional transition detection
- Keyboard navigation handlers
- Reduced motion media query support
- Gesture progress indicators
- Connection to sessionStorage state
```

## 5. Input Handling Layer
```text
Implement input handling in `/lib/input.ts`:
- Unified touch/mouse event system
- Long-press context menu detection
- Accelerometer tilt detection
- Focus management utilities
- Swipe velocity calculation
- Event delegation for performance
```

## 6. Data Persistence Wiring
```text
Connect storage systems in `/providers/StorageProvider.tsx`:
- localStorage <> React Query sync
- IndexedDB cleanup scheduler
- Session state rehydration
- Privacy-focused data expiration
- Storage event listeners
- Error boundary integration
```

## 7. Farcaster Integration
```text
Implement Farcaster SDK in `/lib/farcaster.ts`:
- Wallet connection provider
- Frame metadata generation
- Signed message validation
- Cast interaction handlers
- Wagmi Ethereum config
- Error recovery system
```

## 8. Mobile Optimization Layer
```text
Add mobile enhancements in `/components/MobileAdapter.tsx`:
- Viewport-aware CSS variables
- Touch target size enforcement
- Conditional asset loading
- Orientation change handler
- Edge swipe detection
- Performance monitoring
```

## 9. Final Integration Wiring
```text
Connect all systems in `/app/frame/page.tsx`:
- Compose data+input+storage providers
- Wire Farcaster wallet to UI
- Connect view transitions to state
- Enable cross-component communication
- Set up analytics boundaries
- Final accessibility audit
```
```

Each prompt builds on previous implementations while maintaining isolated testability. The sequence follows: Core Structure → Data Foundation → Rendering → Interactions → Integrations → Optimizations → Final Assembly.

Key technical considerations addressed:
- Type safety through gradual interface development
- Progressive enhancement of interaction modes
- Layered storage access patterns
- Mobile-first CSS with viewport units
- Frame v2 capabilities via SDK integration
- Wallet connectivity through Wagmi
- Performance via React Query caching

The implementation avoids big jumps by:
1. Starting with static layout then adding dynamics
2. Implementing data flow before interactions
3. Handling desktop fallbacks after mobile core
4. Adding complex gestures after basic navigation
5. Final integration as explicit last step

Each prompt produces working code that can be immediately tested in the frame simulator while maintaining forward compatibility with next steps.