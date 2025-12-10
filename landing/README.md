# FinSIght Landing Page

A modern, responsive landing page built as a **standalone Next.js application** for the FinSIght AI Trading Platform.

## 🚀 Quick Start

### Installation

```powershell
# Navigate to landing directory
cd landing

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3001](http://localhost:3001) to see the landing page.

### Build for Production

```powershell
# Create optimized production build
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
landing/
├── app/
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx            # Main landing page
│   └── globals.css         # OKLCH design system styles
├── components/
│   ├── ui/
│   │   ├── button.tsx      # Button component
│   │   └── card.tsx        # Card component
│   └── theme-provider.tsx  # Theme context provider
├── lib/
│   └── utils.ts           # Utility functions (cn)
├── package.json           # Dependencies
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS config
├── tsconfig.json          # TypeScript config
└── README.md             # This file
```

## ✨ Features

- **Fully Responsive**: Optimized for mobile, tablet, and desktop
- **Dark/Light Mode**: Theme toggle with system preference support
- **OKLCH Design System**: Perceptually uniform colors
- **Minimal & Clean**: Shadow-based elevation, no glassmorphism
- **Fast & Modern**: Built with Next.js 15 and React 18
- **Type-Safe**: Full TypeScript support
- **Accessible**: WCAG compliant with proper semantic HTML

## 🎨 Design System

This landing page follows strict design principles:

- ✅ OKLCH color space for perceptually uniform colors
- ✅ Shadow-based elevation (6 levels)
- ✅ Monospace typography (Geist Mono)
- ✅ Micro-interactions (<180ms animations)
- ✅ 12-column responsive grid
- ❌ No glassmorphism or blur effects
- ❌ No gradients
- ❌ No skeuomorphism

## 📄 Page Sections

1. **Navigation**: Fixed header with theme toggle and smooth scroll
2. **Hero Section**: Eye-catching headline with CTA buttons
3. **Features Grid**: 6 key features with icons and animations
4. **How It Works**: 3-step process explanation
5. **Stats Section**: Platform metrics and achievements
6. **CTA Section**: Final call-to-action with card
7. **Footer**: Site navigation and legal links

## 🎨 Customization

### Update Content

Edit `app/page.tsx` to modify:

- Hero headline and tagline
- Feature cards and descriptions
- Stats numbers
- CTA button text
- Footer links and information

### Change Colors

All colors use the OKLCH system in `app/globals.css`:

```css
/* Light mode */
:root {
  --primary: oklch(0.6716 0.1368 48.5130);  /* Orange accent */
  --background: oklch(1.0000 0 0);           /* White */
}

/* Dark mode */
.dark {
  --primary: oklch(0.7214 0.1337 49.9802);  /* Brighter orange */
  --background: oklch(0.1797 0.0043 308.1928); /* Near black */
}
```

### Add Images

Replace placeholder in `app/page.tsx`:

```tsx
{/* Current placeholder */}
<div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
  <div className="text-muted-foreground text-sm">Platform Dashboard Preview</div>
</div>

{/* Replace with actual image */}
<Image 
  src="/images/dashboard.png" 
  alt="Dashboard Preview"
  width={1200}
  height={675}
  className="rounded-lg"
/>
```

### Modify Styles

All components use Tailwind CSS with custom design tokens:

```tsx
// Use design system colors
className="bg-primary text-primary-foreground"
className="shadow-lg hover:shadow-xl transition-all"

// Custom shadows from design system
className="shadow-md"  // Medium elevation
className="shadow-2xl" // Maximum elevation
```

## 🔧 Technical Details

### Dependencies

**Core:**
- Next.js 15
- React 18
- TypeScript 5

**UI:**
- Tailwind CSS 3.4
- Lucide React (icons)
- Radix UI (primitives)
- next-themes (theme switching)

**Utilities:**
- class-variance-authority (CVA)
- clsx & tailwind-merge (className utilities)

### Port Configuration

The app runs on port **3001** by default (to avoid conflicts with main frontend on 3000).

To change:

```json
// In package.json
"dev": "next dev -p 3001"  // Change 3001 to your preferred port
```

## 🌐 Deployment

### Vercel (Recommended)

```powershell
# Install Vercel CLI
npm i -g vercel

# Deploy
cd landing
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### Static Export

For static hosting (Netlify, GitHub Pages):

```typescript
// In next.config.ts
const nextConfig = {
  output: 'export',
  trailingSlash: true,
};
```

Then run:
```powershell
npm run build
# Deploy the 'out' directory
```

## 🔗 Integration with Main App

To integrate this into your existing FinSIght frontend:

1. **Copy Components**: Move `components/`, `lib/`, and `app/` to your main app
2. **Merge Dependencies**: Add new dependencies to your main `package.json`
3. **Update Imports**: Adjust import paths if needed
4. **Route Setup**: Create route at `/landing` or replace home page

See `INTEGRATION.md` for detailed instructions.

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14.1+
- All modern mobile browsers

## 🧪 Testing

```powershell
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Build test
npm run build
```

## 📝 Environment Variables

No environment variables required for basic functionality.

Optional:
```env
# .env.local
NEXT_PUBLIC_API_URL=https://api.finsight.com
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

## 🤝 Contributing

1. Make changes to components or pages
2. Test locally with `npm run dev`
3. Build to verify: `npm run build`
4. Commit changes

## 📄 License

Same as parent FinSIght project.

## 🆘 Troubleshooting

**Port already in use:**
```powershell
# Change port in package.json or run:
npm run dev -- -p 3002
```

**Build errors:**
```powershell
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**Theme not working:**
- Check `ThemeProvider` is in layout
- Verify `next-themes` is installed
- Check localStorage isn't blocked

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [OKLCH Color Picker](https://oklch.com)
- [Lucide Icons](https://lucide.dev)
