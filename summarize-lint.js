import { ESLint } from "eslint";

async function main() {
    const eslint = new ESLint();
    const results = await eslint.lintFiles(["."]);

    const ruleCounts = {};
    const fileCounts = [];

    results.forEach(result => {
        let fileErrorCount = result.errorCount;
        let fileWarningCount = result.warningCount;
        let messages = [];

        result.messages.forEach(msg => {
            ruleCounts[msg.ruleId] = (ruleCounts[msg.ruleId] || 0) + 1;
            messages.push(msg.ruleId);
        });

        if (fileErrorCount > 0 || fileWarningCount > 0) {
            fileCounts.push({
                // eslint-disable-next-line no-undef
                file: result.filePath.replace(process.cwd(), ''),
                errors: fileErrorCount,
                warnings: fileWarningCount,
                messages: messages
            });
        }
    });

    fileCounts.sort((a, b) => (b.errors + b.warnings) - (a.errors + a.warnings));

    console.log("=== RULE COUNTS ===");
    Object.entries(ruleCounts).sort((a, b) => b[1] - a[1]).forEach(([rule, count]) => {
        console.log(`${rule}: ${count}`);
    });

    console.log("\n=== TOP 20 FILES WITH THE MOST ERRORS ===");
    fileCounts.slice(0, 20).forEach(f => {
        console.log(`${f.file}: ${f.errors} errors, ${f.warnings} warnings`);
        const rules = [...new Set(f.messages)];
        console.log(`  Rules: ${rules.join(', ')}`);
    });
}

main().catch(error => {
    // eslint-disable-next-line no-undef
    process.exitCode = 1;
    console.error(error);
});
