# Landing Page Integration Guide

This guide explains how to integrate the standalone landing page with your main FinSIght frontend application.

## Standalone Usage (Current Setup)

The landing page is currently set up as a **standalone Next.js application**:

```powershell
cd landing
npm install
npm run dev  # Runs on http://localhost:3001
```

This is the recommended setup if you want to:
- Deploy landing page separately from main app
- Different hosting/CDN for marketing site
- Independent scaling and updates

## Integration Options

### Option 1: Keep as Standalone App ✅ Recommended

**Benefits:**
- Independent deployments
- Separate scaling
- Different tech stacks possible
- Marketing team can update independently

**Setup:**
1. Landing page runs on port 3001
2. Main app runs on port 3000
3. Use reverse proxy or subdomain routing:
   - `finsight.com` → Landing page
   - `app.finsight.com` → Main app

**Nginx Example:**
```nginx
# Landing page
server {
    server_name finsight.com;
    location / {
        proxy_pass http://localhost:3001;
    }
}

# Main app
server {
    server_name app.finsight.com;
    location / {
        proxy_pass http://localhost:3000;
    }
}
```

### Option 2: Merge into Main Frontend

If you want everything in one Next.js app:

**Step 1: Copy Files**
```powershell
# From landing directory, copy to main frontend
cp -r components/* ../frontend/components/
cp -r lib/* ../frontend/lib/
cp app/page.tsx ../frontend/app/(marketing)/page.tsx
```

**Step 2: Install Dependencies**
```powershell
cd ../frontend
npm install @radix-ui/react-slot next-themes
```

**Step 3: Update Imports**

If paths differ, update imports in copied files:
```tsx
// Change from:
import { Button } from "@/components/ui/button"

// To (if needed):
import { Button } from "@/components/ui/button"
```

**Step 4: Create Route Groups**

Organize your app with route groups:
```
frontend/app/
├── (marketing)/
│   └── page.tsx          # Landing page at /
├── (dashboard)/
│   ├── layout.tsx        # Dashboard layout
│   └── dashboard/
│       └── page.tsx      # Dashboard at /dashboard
└── layout.tsx            # Root layout
```

### Option 3: Use as Marketing Site with Subdomain

Deploy landing page separately on subdomain:

1. **Landing**: `www.finsight.com` or `finsight.com`
2. **Main App**: `app.finsight.com`

**Benefits:**
- Clear separation of concerns
- Better SEO (marketing content separate from app)
- Independent caching strategies

## Component Integration

### Required Dependencies

If merging into main app, ensure these are installed:

```json
{
  "dependencies": {
    "@radix-ui/react-slot": "^1.1.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.0",
    "next-themes": "^0.3.0",
    "lucide-react": "^0.460.0"
  }
}
```

### Component Files to Copy

If integrating specific components:

1. **UI Components:**
   - `components/ui/button.tsx`
   - `components/ui/card.tsx`

2. **Theme Provider:**
   - `components/theme-provider.tsx`

3. **Utilities:**
   - `lib/utils.ts`

4. **Styles:**
   - Merge `app/globals.css` with your existing styles

## Theme Integration

The landing page automatically uses your theme from:

- `frontend/app/globals.css` - OKLCH color system
- Theme provider for dark/light mode switching

No additional configuration needed.

## Customization

### Update Content

Edit `landing/page.tsx` and modify:

- Hero headline and description
- Feature cards
- Stats numbers
- CTA text
- Footer links

### Modify Styling

All styles use Tailwind classes with OKLCH colors:

```tsx
className="bg-primary text-primary-foreground"
className="shadow-lg hover:shadow-xl transition-all"
```

### Add Images

Replace placeholder sections:

```tsx
<div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
  <div className="text-muted-foreground text-sm">Platform Dashboard Preview</div>
</div>
```

With actual images:

```tsx
<img 
  src="/images/dashboard-preview.png" 
  alt="Dashboard Preview"
  className="w-full h-full object-cover rounded-lg"
/>
```

## Navigation Links

Update these links in the nav and footer:

```tsx
// In page.tsx
<a href="#features">Features</a>
<a href="#how-it-works">How It Works</a>
<a href="#pricing">Pricing</a>

// Change to actual routes:
<Link href="/features">Features</Link>
<Link href="/pricing">Pricing</Link>
```

## Call-to-Action Buttons

Connect buttons to your authentication flow:

```tsx
// Current placeholder:
<Button size="lg">Start Free Trial</Button>

// Update to:
<Link href="/signup">
  <Button size="lg">Start Free Trial</Button>
</Link>
```

## SEO Optimization

Update metadata in `landing/layout.tsx`:

```tsx
export const metadata: Metadata = {
  title: "Your Custom Title",
  description: "Your custom description",
  keywords: ["your", "keywords"],
  // Add more metadata as needed
};
```

## Analytics

Add analytics tracking:

```tsx
// In page.tsx, add to button clicks:
<Button 
  onClick={() => {
    // Track event
    analytics.track('cta_clicked', { location: 'hero' });
  }}
>
  Start Free Trial
</Button>
```

## Testing

1. **Build test**: `npm run build` in frontend directory
2. **Dev test**: `npm run dev` and visit landing page
3. **Responsive test**: Check mobile, tablet, desktop
4. **Theme test**: Toggle dark/light mode
5. **Links test**: Verify all navigation works

## Deployment Checklist

- [ ] Replace placeholder content with real data
- [ ] Add actual images/screenshots
- [ ] Update navigation links
- [ ] Connect CTA buttons to signup/auth
- [ ] Add analytics tracking
- [ ] Test on all devices
- [ ] Verify SEO metadata
- [ ] Check loading performance
- [ ] Test dark/light themes
- [ ] Proofread all copy

## Performance Tips

1. **Image optimization**: Use Next.js Image component
2. **Lazy loading**: For below-fold content
3. **Font optimization**: Already using next/font
4. **Code splitting**: Separate heavy components
5. **Caching**: Configure proper headers

## Accessibility

The landing page includes:

- Semantic HTML structure
- Proper heading hierarchy
- Alt text placeholders (add to images)
- Keyboard navigation support
- ARIA labels where needed

## Browser Support

Tested and working on:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14.1+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Support

For issues or questions:

1. Check component dependencies are installed
2. Verify theme files are present
3. Ensure TypeScript configuration is correct
4. Review console for any errors

## Next Steps

After integration:

1. Add real content and images
2. Set up analytics
3. Configure SEO properly
4. Add email capture forms
5. Connect to authentication
6. Add pricing page
7. Create about/contact pages
8. Set up A/B testing
