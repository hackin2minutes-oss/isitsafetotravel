# Is It Safe To Travel? - Project Specification

This document outlines the implementation details for the travel safety assessment application.

## Core Features

1. **Search & Browse**: Location search with autocomplete (countries, regions, cities)
2. **Interactive Map**: Mapbox integration with click-to-search functionality
3. **Safety Score Card**: Visual display of computed safety score (0-100)
4. **Detailed Reports**: Weather, Air Quality, Security, Health tabs

## Technical Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Maps**: Mapbox GL JS
- **State**: Zustand
- **APIs**: OpenWeatherMap (weather + air quality)
- **Deployment**: Vercel

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
│   │   ├── page.tsx            # Main dashboard page
│   │   └── globals.css         # Global styles + Tailwind
│   ├── components/
│   │   ├── SearchPanel.tsx     # Debounced location search
│   │   ├── MapPanel.tsx        # Mapbox interactive map
│   │   ├── SafetyCard.tsx      # Core safety assessment display
│   │   ├── BriefGenerator.tsx  # Exportable safety brief
│   │   ├── NewsTicker.tsx      # Real-time news ticker
│   │   ├── ErrorBoundary.tsx   # Global error boundary
│   │   └── ui/                 # Reusable UI primitives
│   ├── services/
│   │   ├── weatherService.ts   # OpenWeatherMap integration
│   │   ├── aqiService.ts       # Air quality data
│   │   ├── securityService.ts  # Security threat data
│   │   ├── locationService.ts  # Geocoding & search
│   │   ├── intelligenceService.ts
│   │   └── newsService.ts
│   ├── hooks/
│   │   └── useSafetyData.ts    # Safety data fetching + retry logic
│   ├── store/
│   │   └── safetyStore.ts     # Zustand global state
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   ├── utils/
│   │   ├── scoreCalculator.ts  # Safety score computation
│   │   └── fetchWithRetry.ts  # Retry utility for API calls
│   └── data/
│       └── worldDatabase.ts   # Static census data
├── src/test/
│   └── mocks.ts               # Shared test fixtures
├── src/components/
│   ├── SafetyCard.test.tsx    # 14 test cases
│   ├── BriefGenerator.test.tsx # 10 test cases
│   └── SearchPanel.test.tsx   # 14 test cases
├── vitest.config.ts           # Vitest configuration
├── setupTests.ts              # Global test setup
├── public/
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.local
```

## Testing

Tests are run with [Vitest](https://vitest.dev) using `@testing-library/react`.

```bash
# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Run with coverage report
npm run test:coverage

# Run with interactive UI
npm run test:ui
```

### Required Test Dependencies

```bash
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Test Coverage

| Component | Tests | Coverage Area |
|-----------|-------|--------------|
| SafetyCard | 14 | Empty/loading/error/data rendering, war zone, view toggle |
| BriefGenerator | 10 | Copy/download, brief content, edge cases |
| SearchPanel | 14 | Debounce, results dropdown, keyboard nav, country selection |

## Error Handling

- **ErrorBoundary** (`src/components/ErrorBoundary.tsx`) wraps the entire app and catches React errors.
- **Retry logic** (`src/utils/fetchWithRetry.ts`) implements exponential backoff with configurable retries.
- **useSafetyData** (`src/hooks/useSafetyData.ts`) handles fetch failures gracefully with up to 2 retries.
- Error states in SafetyCard show actionable messages with a "Reinitialize System" button.

## Accessibility

- SearchPanel: `role="combobox"`, `aria-expanded`, `aria-autocomplete`, `aria-controls`, `role="listbox"`, `aria-live` regions
- SafetyCard: `role="meter"` on risk bars, `role="alert"` on error state, `aria-pressed` on view toggle, `aria-hidden` on decorative icons
- All interactive elements have `aria-label` where visual context is insufficient
- Color contrast meets WCAG AA standards via Tailwind's slate palette

## Future Improvements

1. **i18n**: Externalize all user-facing strings for multi-language support
2. **Service Worker**: Cache safety data for offline access in low-connectivity scenarios
3. **PWA**: Add manifest and service worker for installability
4. **Performance**: Virtualize long lists, lazy-load map tiles, code-split heavy components
5. **E2E Tests**: Add Playwright/Cypress for full integration tests
6. **API Monitoring**: Add rate-limit handling and request deduplication
7. **Data Freshness**: Document data source staleness and add refresh indicators