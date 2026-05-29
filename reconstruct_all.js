const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logPath = 'C:\\Users\\91636\\.gemini\\antigravity\\brain\\d641131d-f61e-4f79-9567-140115cefd31\\.system_generated\\logs\\overview.txt';

async function reconstruct() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const filesMap = new Map(); // filepath -> content string

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      const toolCalls = obj.tool_calls || [];
      for (const tc of toolCalls) {
        if (!tc.args) continue;

        let targetFile = '';
        try {
          targetFile = JSON.parse(tc.args.TargetFile || '""');
        } catch {
          targetFile = tc.args.TargetFile || '';
        }
        
        if (!targetFile) {
          targetFile = tc.args.TargetFile || '';
          if (targetFile.startsWith('"') && targetFile.endsWith('"')) {
            targetFile = targetFile.slice(1, -1).replace(/\\\\/g, '\\');
          }
        }

        // We only want to reconstruct files that belong to our workspace
        // to avoid writing over system paths, artifacts, etc.
        const isWorkspaceFile = targetFile && (
          targetFile.toLowerCase().includes('yourbuy-backend') || 
          targetFile.toLowerCase().includes('yourbuy-frontend') ||
          targetFile.toLowerCase().endsWith('docker-compose.yml') ||
          targetFile.toLowerCase().endsWith('.gitignore')
        );

        if (!isWorkspaceFile) continue;

        const normalizedPath = path.normalize(targetFile);

        if (tc.name === 'write_to_file') {
          let codeContent = '';
          try {
            codeContent = JSON.parse(tc.args.CodeContent || '""');
          } catch {
            codeContent = tc.args.CodeContent || '';
          }
          if (!codeContent) {
            codeContent = tc.args.CodeContent || '';
            if (codeContent.startsWith('"') && codeContent.endsWith('"')) {
              codeContent = codeContent.slice(1, -1).replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\\\/g, '\\');
            }
          }
          filesMap.set(normalizedPath, codeContent);
        } else if (tc.name === 'replace_file_content') {
          let targetContent = '';
          let replacementContent = '';
          try {
            targetContent = JSON.parse(tc.args.TargetContent || '""');
          } catch {
            targetContent = tc.args.TargetContent || '';
          }
          try {
            replacementContent = JSON.parse(tc.args.ReplacementContent || '""');
          } catch {
            replacementContent = tc.args.ReplacementContent || '';
          }

          if (filesMap.has(normalizedPath)) {
            let currentContent = filesMap.get(normalizedPath);
            if (currentContent.includes(targetContent)) {
              currentContent = currentContent.replace(targetContent, replacementContent);
              filesMap.set(normalizedPath, currentContent);
            } else {
              console.warn(`WARNING: TargetContent not found in ${normalizedPath} for replace_file_content!`);
            }
          } else {
            console.warn(`WARNING: ${normalizedPath} not found for replace_file_content!`);
          }
        } else if (tc.name === 'multi_replace_file_content') {
          let chunks = [];
          try {
            chunks = JSON.parse(tc.args.ReplacementChunks || '[]');
          } catch {
            chunks = tc.args.ReplacementChunks || [];
          }

          if (filesMap.has(normalizedPath)) {
            let currentContent = filesMap.get(normalizedPath);
            for (const chunk of chunks) {
              const target = chunk.TargetContent;
              const replacement = chunk.ReplacementContent;
              if (currentContent.includes(target)) {
                currentContent = currentContent.replace(target, replacement);
              } else {
                console.warn(`WARNING: TargetContent not found in ${normalizedPath} for chunk in multi_replace_file_content!`);
              }
            }
            filesMap.set(normalizedPath, currentContent);
          } else {
            console.warn(`WARNING: ${normalizedPath} not found for multi_replace_file_content!`);
          }
        }
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  }

  console.log(`Reconstructed ${filesMap.size} files. Writing them to disk...`);

  let count = 0;
  for (const [filePath, content] of filesMap.entries()) {
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Restored: ${filePath}`);
      count++;
    } catch (err) {
      console.error(`FAILED to write: ${filePath}. Error: ${err.message}`);
    }
  }

  console.log(`\nSuccessfully restored ${count} files!`);
}

reconstruct();
