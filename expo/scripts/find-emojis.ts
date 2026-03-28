import fs from 'fs';
import path from 'path';

const searchDir = process.argv[2] || '.';

function findEmojis(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
                findEmojis(fullPath);
            }
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const emojiRegex = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/gu;
            let match;
            while ((match = emojiRegex.exec(content)) !== null) {
                console.log(`Emoji found in ${fullPath} at index ${match.index}: ${match[0]}`);
            }
        }
    }
}

findEmojis(searchDir);
