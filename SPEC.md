# Is It Safe To Travel? - Project Specification

This document outlines the implementation details for the travel safety assessment application.

## Core Features

1. **Search & Browse**: Location search with autocomplete (countries, regions, cities)
2. **Interactive Map**: Mapbox integration with click-to-search functionality
3. **Safety Score Card**: Visual display of computed safety score (0-100)
4. **Detailed Reports**: Weather, Air Quality, Security, Health tabs
5. **Mobile-First Design**: Optimized for iOS/Android with touch-friendly UI
6. **Offline Support**: In-memory caching for frequently accessed data

## Technical Stack

- **Frontend**: Next.js 15 (Edge Runtime), React 19, TypeScript, Tailwind CSS
- **Maps**: Mapbox GL JS / React Leaflet
- **State**: Zustand
- **Testing**: Vitest + React Testing Library
- **APIs**: OpenWeatherMap (weather + air quality)
- **Deployment**: Vercel / Cloudflare Pages

## Mobile Optimization

### Device Detection
- **Hook**: `useDeviceDetection` in `src/hooks/useDeviceDetection.ts`
- Breakpoints: Mobile (< 768px), Tablet (768-1024px), Desktop (≥ 1024px)
- Passive resize listener for optimal performance

### 120Hz Animation System
All animations use GPU-composited properties only (transform, opacity):

```css
--ease-spring:    cubic-bezier(0.175, 0.885, 0.32, 1.275);
--ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1);
--ease-smooth:    cubic-bezier(0.23, 1, 0.32, 1);

--dur-instant:    80ms;
--dur-fast:       160ms;
--dur-normal:     280ms;
--dur-slow:       420ms;
--dur-cinematic:  700ms;
```

### Insights-First Layout
- **Mobile**: Tab-based navigation (Insights | Map View) with fixed bottom bar
- **Desktop**: Side-by-side layout with sidebar (60%) and map (40%)
- Smooth 700ms transition between views

### Logo Component
- **File**: `src/components/Logo.tsx`
- **Variants**: `full`, `icon`, `compact`
- **Responsive**: 40px (mobile) → 48px (tablet) → 56px (desktop)

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| LCP | < 2.5s | ✅ Optimized |
| FID | < 100ms | ✅ Optimized |
| CLS | < 0.1 | ✅ Optimized |
| Bundle Reduction | 30%+ | ✅ Dynamic imports |
| Lighthouse | 90+ | ✅ Target met |

## API Keys Required

```
OPENWEATHERMAP_API_KEY=your_key_here
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

## Safety Score Formula

```
FINAL_SAFETY_SCORE = (WEATHER_SCORE × 0.15) + (AQI_SCORE × 0.15) + (SECURITY_SCORE × 0.70)
```

## Color Scheme

- VERY SAFE (90-100): #10B981 (green)
- SAFE (75-89): #34D399 (light green)
- MODERATE (60-74): #F59E0B (yellow)
- CAUTION (40-59): #F97316 (orange)
- DANGEROUS (20-39): #EF4444 (red)
- CRITICAL (0-19): #991B1B (dark red)

## File Structure

```
is-it-safe/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with ErrorBoundary
│   │   ├── page.tsx           # Main dashboard page
│   │   └── globals.css        # 120Hz-optimized CSS
│   ├── components/
│   │   ├── Logo.tsx           # Responsive logo component
│   │   ├── ResponsiveLayout.tsx # Mobile-first layout
│   │   ├── SearchPanel.tsx    # Debounced location search
│   │   ├── MapPanel.tsx       # Lazy-loaded map
│   │   ├── SafetyCard.tsx     # Core safety assessment
│   │   ├── BriefGenerator.tsx  # Exportable brief
│   │   ├── NewsTicker.tsx     # Real-time news ticker
│   │   └── ErrorBoundary.tsx   # Global error boundary
│   ├── services/
│   │   ├── weatherService.ts   # OpenWeatherMap integration
│   │   ├── aqiService.ts      # Air quality data
│   │   ├── securityService.ts  # Security threat data
│   │   ├── locationService.ts  # Geocoding & search
│   │   ├── intelligenceService.ts
│   │   └── newsService.ts
│   ├── hooks/
│   │   ├── useDeviceDetection.ts # Device type detection
│   │   └── useSafetyData.ts   # Data fetching + retry
│   ├── store/
│   │   └── safetyStore.ts     # Zustand global state
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces
│   ├── utils/
│   │   ├── performance.ts     # Caching & Web Vitals
│   │   ├── scoreCalculator.ts # Safety score computation
│   │   └── fetchWithRetry.ts # Retry with backoff
│   └── data/
│       └── worldDatabase.ts   # Static census data
├── src/test/
│   ├── mocks.ts               # Shared test fixtures
│   ├── SafetyCard.test.tsx    # 14 test cases
│   ├── BriefGenerator.test.tsx # 10 test cases
│   └── SearchPanel.test.tsx   # 14 test cases
├── vitest.config.ts           # Vitest configuration
├── setupTests.ts              # Global test setup
├── MOBILE_OPTIMIZATION.md     # Mobile enhancement docs
├── public/
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Testing

Tests are run with [Vitest](https://vitest.dev) using `@testing-library/react`.

```bash
npm test          # Watch mode
npm run test:run # CI mode
npm run build     # Production build
npm start         # Production server
```

### Test Coverage

| Component | Tests | Coverage Area |
|-----------|-------|--------------|
| SafetyCard | 14 | Empty/loading/error/data rendering, war zone, view toggle |
| BriefGenerator | 10 | Copy/download, brief content, edge cases |
| SearchPanel | 14 | Debounce, results dropdown, keyboard nav, country selection |

## Error Handling

- **ErrorBoundary**: Wraps entire app, shows branded error UI with Retry/Home buttons
- **Retry Logic**: Exponential backoff with up to 2 retries (1s → 2s delay)
- **Error States**: Actionable messages in SafetyCard with "Reinitialize System" button

## Accessibility (WCAG 2.1 AA)

- SearchPanel: `role="combobox"`, `aria-expanded`, `aria-autocomplete`, `role="listbox"`, `aria-live`
- SafetyCard: `role="meter"` on risk bars, `role="alert"` on errors, `aria-pressed` on toggles
- All interactive elements have `aria-label` where needed
- Color contrast meets WCAG AA standards
- Reduced motion support: `@media (prefers-reduced-motion: reduce)`

## Browser Support

- iOS Safari 14+
- Chrome 90+
- Firefox 88+
- Samsung Internet 14+
- Edge 90+

## Future Roadmap

1. **PWA**: Manifest + Service Worker for installability & offline mode
2. **i18n**: Multi-language support with externalized strings
3. **E2E Tests**: Playwright/Cypress for full integration tests
4. **Advanced Caching**: Redis/Upstash for shared cache across users
5. **Real-time**: WebSocket for live safety updates