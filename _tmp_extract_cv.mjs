import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfPath =
  'c:/Users/OEM/.cursor/projects/c-Users-OEM-Personal-portfolio/attachments/daa93898-ffeb-47aa-b2ba-cb59dba9df5c/Jumari_Blignaut_CV_2026.pdf';
const pkgRoot = process.env.TEMP + '/package';
const { PDFParse } = require(pkgRoot + '/dist/pdf-parse/cjs/index.cjs');
const data = fs.readFileSync(pdfPath);
const parser = new PDFParse({ data });
const text = await parser.getText();
console.log(typeof text === 'string' ? text : text.text ?? JSON.stringify(text, null, 2));
