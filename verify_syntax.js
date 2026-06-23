const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/i);
if (scriptMatch) {
  try {
    const script = scriptMatch[1];
    // Simple syntax check
    new Function(script);
    console.log("Syntax check passed");
  } catch (e) {
    console.error("Syntax error detected:", e.message);
    process.exit(1);
  }
} else {
  console.log("No script tag found");
}
