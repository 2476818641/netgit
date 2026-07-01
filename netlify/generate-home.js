// netlify/generate-home.js
import path from 'path';
import { generateHomeForPlatform } from '../shared/generate-home.js';
import { NETLIFY_HOME_DOMAIN } from '../shared/config.js';

const outputPath = path.resolve(process.cwd(), 'build', 'index.html'); 
generateHomeForPlatform('Netlify', outputPath, NETLIFY_HOME_DOMAIN);
