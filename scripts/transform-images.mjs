import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

function transformImageUrls(html) {
  // Replace WordPress CDN image URLs with local paths
  // Pattern: https://i0.wp.com/marketvines.com/wp-content/uploads/YYYY/MM/image.ext?...
  return html.replace(/https:\/\/i0\.wp\.com\/marketvines\.com\/wp-content\/uploads\/(\d{4})\/(\d{2})\/([^?"'\\s]+)/g, '/images/wp-content/$1/$2/$3');
}

// Process home page
const homeFile = path.join(rootDir, 'content/pages/home.json');
const home = JSON.parse(fs.readFileSync(homeFile, 'utf8'));
home.bodyHtml = transformImageUrls(home.bodyHtml);
fs.writeFileSync(path.join(rootDir, 'content/pages-react/home.json'), JSON.stringify(home, null, 2));
console.log('✓ Updated home.json - images transformed');

// Process other pages
['about-us', 'contact-us'].forEach(slug => {
  const file = path.join(rootDir, 'content/pages', slug + '.json');
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    data.bodyHtml = transformImageUrls(data.bodyHtml);
    fs.writeFileSync(path.join(rootDir, 'content/pages-react', slug + '.json'), JSON.stringify(data, null, 2));
    console.log('✓ Updated ' + slug + '.json - images transformed');
  }
});
