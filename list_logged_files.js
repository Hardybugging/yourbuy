const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logPath = 'C:\\Users\\91636\\.gemini\\antigravity\\brain\\d641131d-f61e-4f79-9567-140115cefd31\\.system_generated\\logs\\overview.txt';

async function listFiles() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const filesWritten = new Set();
  const filesModified = new Set();

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      const toolCalls = obj.tool_calls || [];
      for (const tc of toolCalls) {
        if (!tc.args) continue;
        
        let targetFile = '';
        try {
          targetFile = JSON.parse(tc.args.TargetFile || tc.args.TargetContent || '""');
        } catch {
          targetFile = tc.args.TargetFile || '';
        }
        
        if (!targetFile) {
          // Fallback if TargetFile is a direct property or formatted differently
          targetFile = tc.args.TargetFile || '';
          if (targetFile.startsWith('"') && targetFile.endsWith('"')) {
            targetFile = targetFile.slice(1, -1).replace(/\\\\/g, '\\');
          }
        }

        if (targetFile) {
          if (tc.name === 'write_to_file') {
            filesWritten.add(targetFile);
          } else if (tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') {
            filesModified.add(targetFile);
          }
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  console.log("=== FILES WRITTEN ===");
  Array.from(filesWritten).sort().forEach(f => console.log(f));
  
  console.log("\n=== FILES MODIFIED ===");
  Array.from(filesModified).sort().forEach(f => console.log(f));
}

listFiles();
