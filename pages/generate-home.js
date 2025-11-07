// pages/generate-home.js
import fs from 'fs';
import path from 'path';
// 路径是 '../shared/...' 因为 pages 和 shared 是兄弟目录
import { generateStaticHomePage, CF_PAGES_HOME_DOMAIN, NETLIFY_HOME_DOMAIN } from '../shared/config.js'; 

const htmlContent = generateStaticHomePage('Cloudflare Pages', CF_PAGES_HOME_DOMAIN, NETLIFY_HOME_DOMAIN);
const outputPath = path.resolve(process.cwd(), 'build', 'index.html'); 

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, htmlContent);

console.log(`Generated Cloudflare Pages home page at ${outputPath}`);
