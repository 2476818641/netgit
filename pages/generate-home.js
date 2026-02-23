// pages/generate-home.js
import path from 'path';
import { generateHomeForPlatform } from '../shared/generate-home.js';
import { CF_PAGES_HOME_DOMAIN } from '../shared/config.js';

const outputPath = path.resolve(process.cwd(), 'build', 'index.html'); 
generateHomeForPlatform('Cloudflare Pages', outputPath, CF_PAGES_HOME_DOMAIN);
