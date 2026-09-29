const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('c:/Users/yashm/Downloads/PCCOE_Resource_Allocator/PCCOE_Resource_Allocator/mediroute/src/app');

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');

    // Colors
    content = content.replace(/color:\s*'white'/g, "color: 'var(--text-primary)'");
    content = content.replace(/color:\s*'(rgba\(255,\s*255,\s*255,\s*0\.[0-9]+\))'/g, "color: 'var(--text-muted)'");
    
    // Backgrounds
    content = content.replace(/background:\s*'rgba\(255,\s*255,\s*255,\s*0\.08\)'/g, "background: 'rgba(0,0,0,0.05)'");
    content = content.replace(/background:\s*'rgba\(255,\s*255,\s*255,\s*0\.04\)'/g, "background: 'var(--bg-card)'");
    content = content.replace(/background:\s*'rgba\(255,\s*255,\s*255,\s*0\.1\)'/g, "background: 'rgba(0,0,0,0.05)'");
    content = content.replace(/background:\s*'rgba\(255,\s*255,\s*255,\s*0\.15\)'/g, "background: 'rgba(0,0,0,0.08)'");

    // Borders
    content = content.replace(/borderTop:\s*'1px solid rgba\(255,\s*255,\s*255,\s*0\.08\)'/g, "borderTop: '1px solid rgba(0,0,0,0.05)'");
    content = content.replace(/border:\s*'1px solid rgba\(255,\s*255,\s*255,\s*0\.15\)'/g, "border: '1px solid rgba(0,0,0,0.1)'");
    content = content.replace(/border:\s*'1px solid rgba\(255,\s*255,\s*255,\s*0\.08\)'/g, "border: '1px solid rgba(0,0,0,0.05)'");

    // Quick fix for hardcoded specific text colors that are unreadable in light mode
    content = content.replace(/color:\s*'#93c5fd'/g, "color: 'var(--navy-600)'");
    content = content.replace(/color:\s*'#60a5fa'/g, "color: 'var(--navy-500)'");

    fs.writeFileSync(file, content);
}
console.log('Fixed colors across all TSX files in src/app');
