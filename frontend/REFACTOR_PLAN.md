# Frontend Refactor Implementation Plan

## ✅ Completed

### 1. Architecture & Structure
- ✅ Created `/src` directory for better organization
- ✅ Set up `/src/services` for API layer
- ✅ Set up `/src/hooks` for custom hooks
- ✅ Set up `/src/store` for global state
- ✅ Set up `/src/constants` for constants
- ✅ Set up `/src/components` for shared components

### 2. Services Layer
- ✅ **`api.service.ts`**: Enhanced API service with:
  - Request cancellation support
  - Proper error handling
  - TypeScript strict types
  - Request deduplication keys

### 3. Custom Hooks
- ✅ **`useAsync.ts`**: Generic async operations with:
  - `useAsync` - Async data fetching with loading/error states
  - `usePagination` - Client-side pagination
  - `useDebounce` - Input debouncing
  - `useLocalStorage` - Persistent local storage
  - `useInterval` - Interval hook with cleanup
  - `useMountEffect` - Mount-only effects

- ✅ **`useApi.ts`**: API-specific hooks:
  - `useUser` - Fetch user data
  - `useUserStats` - Fetch user statistics
  - `useWatchlists` - Fetch watchlists
  - `useRules` - Fetch trading rules
  - `usePlatformStats` - Platform statistics
  - Mutation hooks for CRUD operations

### 4. Global State
- ✅ **`auth.context.tsx`**: Authentication context with:
  - User state management
  - Login/logout functionality
  - localStorage persistence
  - isAuthenticated state

### 5. Reusable UI Components
- ✅ **`feedback.tsx`**: Common UI feedback components:
  - `LoadingSpinner` - Animated loading indicator
  - `LoadingCard` - Full card loading state
  - `ErrorCard` - Error display with retry
  - `EmptyState` - Empty state messaging
  - `ErrorAlert` - Inline error alerts

### 6. Refactored Components
- ✅ **`PortfolioStats.tsx`**: Fully refactored with:
  - Memo optimization
  - Real data from `useUserStats` hook
  - Separated sub-components (StatCard, TradeItem, RuleTriggerItem)
  - Loading/error/empty states
  - No static data

## 🔄 In Progress

### 7. Remaining Components to Refactor

#### **ChatInterface** (`src/components/chat/ChatInterface.tsx`)
- Remove static messages array
- Implement real-time streaming
- Add message persistence
- Optimize re-renders with memo
- Add loading states for AI responses
- Implement auto-scroll behavior

#### **WatchlistManager** (`src/components/watchlist/WatchlistManager.tsx`)
- Use `useWatchlists` hook
- Implement optimistic updates
- Add inline editing
- Improve form validation
- Add bulk operations
- Implement search/filter

#### **RulesManager** (`src/components/rules/RulesManager.tsx`)
- Use `useRules` hook
- Fix NaN input issue permanently
- Add rule templates
- Implement rule testing/preview
- Add conditional logic builder
- Improve UX for complex rules

### 8. Layout Components

#### **Dashboard Layout** (`app/dashboard/page.tsx`)
- Integrate AuthProvider
- Add navigation guards
- Implement tab persistence
- Add keyboard shortcuts
- Improve mobile responsiveness
- Add breadcrumbs

#### **Landing Page** (`app/page.tsx`)
- Use auth context for login/signup
- Add form validation with react-hook-form + zod
- Improve accessibility
- Add loading states
- Implement password strength meter
- Add social auth buttons (future)

### 9. Performance Optimizations

#### Code Splitting
```typescript
// Lazy load heavy components
const ChatInterface = lazy(() => import('@/src/components/chat/ChatInterface'));
const WatchlistManager = lazy(() => import('@/src/components/watchlist/WatchlistManager'));
const RulesManager = lazy(() => import('@/src/components/rules/RulesManager'));
const PortfolioStats = lazy(() => import('@/src/components/portfolio/PortfolioStats'));
```

#### Image Optimization
- Use Next.js Image component
- Implement blur placeholders
- Add WebP support
- Lazy load images

#### Bundle Analysis
- Run `npm run build` and analyze
- Split large dependencies
- Remove unused code
- Tree-shake properly

### 10. TypeScript Improvements

#### Strict Configuration (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

#### Type Guards
```typescript
// Create type guard utilities
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'status' in error
  );
}
```

### 11. Constants & Configuration

#### **`constants/api.constants.ts`**
```typescript
export const API_ENDPOINTS = {
  USERS: '/api/users',
  WATCHLISTS: (userId: string) => `/api/users/${userId}/watchlists`,
  RULES: (userId: string) => `/api/users/${userId}/rules`,
  QUERY: (userId: string) => `/api/users/${userId}/query`,
  STATS: (userId: string) => `/api/users/${userId}/stats`,
} as const;

export const POLLING_INTERVALS = {
  STATS: 30000, // 30 seconds
  RULES: 60000, // 1 minute
  WATCHLISTS: 60000, // 1 minute
} as const;
```

#### **`constants/ui.constants.ts`**
```typescript
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;
```

### 12. Error Boundary

#### **`components/ErrorBoundary.tsx`**
```typescript
class ErrorBoundary extends Component<Props, State> {
  // Catch React errors
  // Show fallback UI
  // Log to error tracking service
}
```

### 13. Testing Setup (Future)

#### Unit Tests
- Vitest + React Testing Library
- Test custom hooks
- Test utility functions
- Mock API calls

#### E2E Tests
- Playwright
- Critical user flows
- Dashboard navigation
- CRUD operations

### 14. Accessibility Improvements

- Add ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support
- Color contrast compliance
- Reduced motion support

### 15. Documentation

#### Component Documentation
- Props interfaces with JSDoc
- Usage examples
- Storybook (future)

#### API Documentation
- OpenAPI spec integration
- Auto-generated types
- Request/response examples

## 📋 File Migration Checklist

### Current Structure → New Structure

```
OLD                                    NEW
---                                    ---
/components/chat-interface.tsx    →  /src/components/chat/ChatInterface.tsx
/components/watchlist-manager.tsx →  /src/components/watchlist/WatchlistManager.tsx
/components/rules-manager.tsx     →  /src/components/rules/RulesManager.tsx
/components/portfolio-stats.tsx   →  /src/components/portfolio/PortfolioStats.tsx
/lib/api-client.ts                →  /src/services/api.service.ts
/lib/types.ts                     →  /lib/types.ts (keep)
/lib/utils.ts                     →  /lib/utils.ts (keep)
/hooks/use-mobile.ts              →  /src/hooks/useMobile.ts
```

## 🎯 Priority Order

1. **HIGH PRIORITY** (This Week)
   - ✅ Set up new architecture
   - ✅ Create enhanced API service
   - ✅ Create custom hooks
   - ✅ Create auth context
   - ✅ Refactor PortfolioStats
   - 🔄 Refactor ChatInterface
   - 🔄 Refactor WatchlistManager
   - 🔄 Refactor RulesManager

2. **MEDIUM PRIORITY** (Next Week)
   - Update Dashboard layout
   - Update Landing page
   - Add code splitting
   - Add error boundaries
   - Improve TypeScript strictness

3. **LOW PRIORITY** (Future)
   - Add tests
   - Add Storybook
   - Performance monitoring
   - Analytics integration

## 🚀 Next Steps

1. **Continue refactoring remaining components**
2. **Update imports in app files**
3. **Add lazy loading for routes**
4. **Set up error boundaries**
5. **Add form validation with zod**
6. **Implement toast notifications**
7. **Add loading skeletons**
8. **Improve mobile responsiveness**

## 📊 Metrics to Track

- Bundle size reduction
- First Contentful Paint (FCP)
- Time to Interactive (TTI)
- Cumulative Layout Shift (CLS)
- API response times
- Error rates

## 🔧 Tools & Libraries

- ✅ Next.js 16.0.0
- ✅ React 19.2.0
- ✅ TypeScript 5.x
- ✅ Tailwind CSS 4.x
- ✅ Radix UI (shadcn/ui)
- 🔄 React Hook Form + Zod (to add)
- 🔄 Sonner (toast notifications)
- 🔄 Next Themes (dark mode)
