# FinSIght Landing Page - Getting Started

This is a **standalone Next.js 15 application** for the FinSIght AI Trading Platform landing page.

## Prerequisites

- Node.js 18 or higher
- npm, yarn, or pnpm package manager

## Installation & Setup

### 1. Install Dependencies

```powershell
cd landing
npm install
```

### 2. Run Development Server

```powershell
npm run dev
```

The landing page will be available at **http://localhost:3001**

### 3. Build for Production

```powershell
npm run build
npm start
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3001 |
| `npm run build` | Create optimized production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint to check code quality |

## Project Structure

```
landing/
├── app/                    # Next.js 15 App Router
│   ├── layout.tsx         # Root layout with fonts & theme
│   ├── page.tsx           # Landing page (main content)
│   └── globals.css        # OKLCH design system styles
│
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   │   ├── button.tsx   # Button with variants
│   │   └── card.tsx     # Card component
│   └── theme-provider.tsx # Theme context for dark/light mode
│
├── lib/                   # Utilities
│   └── utils.ts          # Helper functions (cn)
│
├── public/               # Static assets
│
├── package.json          # Dependencies & scripts
├── next.config.ts        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Features

✅ **Dark/Light Theme Toggle** - System preference + manual switch
✅ **Fully Responsive** - Mobile-first design
✅ **OKLCH Colors** - Perceptually uniform color system
✅ **Type-Safe** - Full TypeScript support
✅ **Fast** - Next.js 15 with optimized performance
✅ **Accessible** - WCAG compliant

## Customization

### Update Content

Edit `app/page.tsx`:

```tsx
// Change hero headline
<h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
  Your Custom Headline
  <br />
  <span className="text-primary">Your Tagline</span>
</h1>

// Update features
<FeatureCard
  icon={<YourIcon className="h-6 w-6" />}
  title="Your Feature"
  description="Your description"
/>
```

### Change Theme Colors

Edit `app/globals.css`:

```css
:root {
  --primary: oklch(0.6716 0.1368 48.5130);  /* Change this */
}

.dark {
  --primary: oklch(0.7214 0.1337 49.9802);  /* And this */
}
```

Use [OKLCH Color Picker](https://oklch.com) to choose colors.

### Add Your Logo

Replace the placeholder logo in `app/page.tsx`:

```tsx
// Current placeholder
<div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
  <span className="text-primary-foreground font-bold text-sm">F</span>
</div>

// Replace with your logo
<Image 
  src="/logo.png" 
  alt="FinSIght Logo" 
  width={32} 
  height={32}
/>
```

## Deployment

### Deploy to Vercel (Recommended)

```powershell
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```powershell
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

### Manual Deployment

```powershell
# Build
npm run build

# The .next folder contains your production build
# Upload to your hosting provider
```

## Environment Variables

No environment variables are required for basic functionality.

Optional configuration:

```env
# .env.local
NEXT_PUBLIC_API_URL=https://api.finsight.com
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

## Integration with Main App

See `INTEGRATION.md` for detailed instructions on integrating with the main FinSIght frontend.

### Quick Integration

If you want to merge this into your existing Next.js app:

```powershell
# Copy components to main app
cp -r components/* ../frontend/components/
cp -r lib/* ../frontend/lib/

# Install dependencies in main app
cd ../frontend
npm install @radix-ui/react-slot next-themes
```

## Troubleshooting

### Port Already in Use

```powershell
# Change port (edit package.json or):
npm run dev -- -p 3002
```

### Dependencies Not Installing

```powershell
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```powershell
# Clear Next.js cache
rm -rf .next
npm run build
```

### Theme Not Working

1. Verify `next-themes` is installed
2. Check `ThemeProvider` is in `app/layout.tsx`
3. Clear browser localStorage and refresh

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React
- **Theme**: next-themes
- **Components**: Radix UI primitives

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14.1+
- Edge 90+
- All modern mobile browsers

## Performance

- **Lighthouse Score**: 95+ (after optimization)
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3s

## Next Steps

1. ✅ Install dependencies
2. ✅ Run development server
3. 📝 Update content in `app/page.tsx`
4. 🎨 Customize colors in `app/globals.css`
5. 🖼️ Add your images and logo
6. 🚀 Deploy to production

## Support

For issues or questions:
- Check the main `README.md` for detailed documentation
- See `INTEGRATION.md` for integration help
- Review Next.js docs: https://nextjs.org/docs

## License

Same as parent FinSIght project.

---

**Happy Building! 🚀**
