// pages/generate-home.js
import fs from 'fs';
import path from 'path';
import { generateStaticHomePage, CF_PAGES_HOME_DOMAIN, NETLIFY_HOME_DOMAIN } from '../shared/config.js';

// process.cwd() 获取当前工作目录，这里假设在 pages 目录下运行
const htmlContent = generateStaticHomePage('Cloudflare Pages', CF_PAGES_HOME_DOMAIN, NETLIFY_HOME_DOMAIN);
const outputPath = path.resolve(process.cwd(), 'build', 'index.html'); 

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, htmlContent);

console.log(`Generated Cloudflare Pages home page at ${outputPath}`);
