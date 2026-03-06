const fs = require('fs');
const data = JSON.parse(fs.readFileSync('lint-results.json', 'utf8'));
const counts = {};
data.forEach(f => {
    f.messages.forEach(m => {
        counts[m.ruleId] = (counts[m.ruleId] || 0) + 1;
    });
});
console.log(JSON.stringify(counts, null, 2));

const filesToFix = data.filter(f => f.messages.length > 0);
filesToFix.forEach(f => {
    console.log(f.filePath);
    f.messages.forEach(m => {
        console.log(`  Line ${m.line}: ${m.message} (${m.ruleId})`);
    });
});
