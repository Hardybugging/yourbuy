const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

const pdfs = [
  'Yourbuy Database And Api Md.pdf',
  'Yourbuy Master Architecture Md.pdf',
  'Yourbuy Product And Ux Md.pdf'
];

async function parseAll() {
  for (const file of pdfs) {
    const pdfPath = path.join(__dirname, file);
    if (!fs.existsSync(pdfPath)) {
      console.error(`File not found: ${file}`);
      continue;
    }
    console.log(`Parsing ${file}...`);
    try {
      const dataBuffer = fs.readFileSync(pdfPath);
      const parser = new PDFParse({ data: dataBuffer });
      const result = await parser.getText();
      
      const textPath = path.join(__dirname, file.replace('.pdf', '.txt'));
      fs.writeFileSync(textPath, result.text, 'utf8');
      console.log(`Successfully wrote text to ${path.basename(textPath)}`);
      await parser.destroy();
    } catch (err) {
      console.error(`Error parsing ${file}:`, err);
    }
  }
}

parseAll();
