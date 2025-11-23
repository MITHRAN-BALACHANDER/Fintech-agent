#!/usr/bin/env node

/**
 * Migration Helper Script
 * Updates imports from old structure to new structure
 * 
 * Usage: node scripts/migrate-imports.js
 */

const fs = require('fs');
const path = require('path');

const replacements = [
  // API Client
  {
    from: `import apiClient from "@/lib/api-client"`,
    to: `import { apiService } from "@/src/services/api.service"`,
    note: "Update to new API service"
  },
  {
    from: `import { apiClient } from "@/lib/api-client"`,
    to: `import { apiService } from "@/src/services/api.service"`,
    note: "Update to new API service"
  },
  
  // Components
  {
    from: `import ChatInterface from "@/components/chat-interface"`,
    to: `import ChatInterface from "@/src/components/chat/ChatInterface"`,
    note: "Update to new component structure"
  },
  {
    from: `import WatchlistManager from "@/components/watchlist-manager"`,
    to: `import WatchlistManager from "@/src/components/watchlist/WatchlistManager"`,
    note: "Update to new component structure"
  },
  {
    from: `import PortfolioStats from "@/components/portfolio-stats"`,
    to: `import PortfolioStats from "@/src/components/portfolio/PortfolioStats"`,
    note: "Update to new component structure"
  },
  
  // API method renames
  {
    from: "apiClient.addWatchlist",
    to: "apiService.createWatchlist",
    note: "Method renamed for consistency"
  },
  {
    from: "apiClient.addRule",
    to: "apiService.createRule",
    note: "Method renamed for consistency"
  }
];

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  const changes = [];

  replacements.forEach(({ from, to, note }) => {
    if (content.includes(from)) {
      content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
      updated = true;
      changes.push(note);
    }
  });

  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
    changes.forEach(change => console.log(`   - ${change}`));
  }

  return updated;
}

function walkDirectory(dir, filePattern = /\.(tsx?|jsx?)$/) {
  const files = fs.readdirSync(dir);
  let updatedCount = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and .next
      if (!['node_modules', '.next', '.git'].includes(file)) {
        updatedCount += walkDirectory(filePath, filePattern);
      }
    } else if (filePattern.test(file)) {
      if (updateFile(filePath)) {
        updatedCount++;
      }
    }
  });

  return updatedCount;
}

// Main execution
const frontendDir = path.join(__dirname, '..');
console.log('🔄 Starting import migration...\n');
console.log(`Scanning directory: ${frontendDir}\n`);

const updatedCount = walkDirectory(frontendDir);

console.log(`\n✨ Migration complete!`);
console.log(`📝 Updated ${updatedCount} file(s)`);

if (updatedCount === 0) {
  console.log(`\n✅ No files needed updating. Either:`);
  console.log(`   1. All imports are already updated`);
  console.log(`   2. Old component files haven't been used yet`);
}

console.log(`\n📋 Next steps:`);
console.log(`   1. Review the changes`);
console.log(`   2. Test the application`);
console.log(`   3. Run: npm run build`);
console.log(`   4. If everything works, delete old component files`);
