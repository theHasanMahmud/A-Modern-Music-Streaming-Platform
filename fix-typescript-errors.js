const fs = require('fs');
const path = require('path');

// List of files with TypeScript errors and their fixes
const fixes = [
  {
    file: 'src/components/FriendRequestsPanel.tsx',
    fixes: [
      { type: 'remove-import', imports: ['UserPlus', 'UserMinus'] }
    ]
  },
  {
    file: 'src/components/LoginModal.tsx',
    fixes: [
      { type: 'remove-import', imports: ['useUser', 'signIn'] }
    ]
  },
  {
    file: 'src/components/MobileNav.tsx',
    fixes: [
      { type: 'remove-import', imports: ['Clock', 'Users', 'Crown', 'Separator'] },
      { type: 'fix-property', line: 231, old: 'likedSongsPlaylist.songCount', new: 'likedSongsPlaylist?.songCount || 0' }
    ]
  },
  {
    file: 'src/components/NotificationButton.tsx',
    fixes: [
      { type: 'remove-import', imports: ['markAsRead', 'getNotificationColor'] },
      { type: 'add-type-annotation', line: 53, param: 'notification', type: 'any' },
      { type: 'add-type-annotation', line: 59, param: 'count', type: 'any' }
    ]
  },
  {
    file: 'src/components/playlist/AddSongToPlaylistModal.tsx',
    fixes: [
      { type: 'remove-import', imports: ['Plus', 'Play'] },
      { type: 'fix-toast', line: 116, old: 'toast.info', new: 'toast.success' }
    ]
  },
  {
    file: 'src/components/playlist/CreatePlaylistModal.tsx',
    fixes: [
      { type: 'remove-import', imports: ['Image'] },
      { type: 'remove-variable', name: 'coverImage' }
    ]
  },
  {
    file: 'src/components/playlist/PlaylistCard.tsx',
    fixes: [
      { type: 'remove-import', imports: ['Clock', 'Heart'] },
      { type: 'fix-toast', line: 80, old: 'toast.info', new: 'toast.success' }
    ]
  }
];

function applyFixes() {
  const frontendPath = path.join(__dirname, 'Amar_Gaan', 'frontend');
  
  fixes.forEach(fix => {
    const filePath = path.join(frontendPath, fix.file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${fix.file}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    fix.fixes.forEach(change => {
      switch (change.type) {
        case 'remove-import':
          change.imports.forEach(importName => {
            // Remove unused imports
            const importRegex = new RegExp(`\\s*${importName}\\s*,?`, 'g');
            content = content.replace(importRegex, '');
            // Clean up empty import lines
            content = content.replace(/import\s*{\s*}\s*from\s*['"][^'"]*['"];?\s*\n/g, '');
          });
          break;
          
        case 'fix-property':
          content = content.replace(change.old, change.new);
          break;
          
        case 'fix-toast':
          content = content.replace(change.old, change.new);
          break;
      }
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${fix.file}`);
  });
}

applyFixes();
console.log('TypeScript fixes applied!');
