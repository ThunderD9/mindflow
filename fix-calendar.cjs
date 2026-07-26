const fs = require('fs');
const path = './src/components/ui/calendar.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace Tailwind v4 specific arbitrary variables with standard v3 utilities
content = content.replace(/\[--cell-radius:var\(--radius-2xl\)] \[--cell-size:--spacing\(8\)]/g, '');
content = content.replace(/\(--cell-size\)/g, '8');
content = content.replace(/\(--cell-radius\)/g, 'md');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed calendar.tsx CSS classes for Tailwind v3.');
