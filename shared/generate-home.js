// shared/generate-home.js
import fs from 'fs';
import path from 'path';
import { generateStaticHomePage } from './config.js';

export function generateHomeForPlatform(platformName, buildOutputPath, domain) {
  const htmlContent = generateStaticHomePage(platformName, domain);
  
  fs.mkdirSync(path.dirname(buildOutputPath), { recursive: true });
  fs.writeFileSync(buildOutputPath, htmlContent);
  
  console.log(`Generated ${platformName} home page at ${buildOutputPath}`);
}
