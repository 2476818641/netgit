import path from 'path';
import { generateHomeForPlatform } from '../shared/generate-home.js';
import { VERCEL_HOME_DOMAIN } from '../shared/config.js';

const outputPath = path.resolve(process.cwd(), 'build', 'index.html');
generateHomeForPlatform('Vercel', outputPath, VERCEL_HOME_DOMAIN);
