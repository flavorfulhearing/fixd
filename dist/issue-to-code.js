export const createGenerateCode = (openai) => {
    async function generateCode(issue, repoFiles) {
        const { title: issueTitle, body: issueBody } = issue;
        const excludePaths = [
            '.env',
            'node_modules/',
            'package-lock.json',
            'dist/',
            'build/',
            '.git/',
            'coverage/'
        ];
        const context = repoFiles
            .filter(f => f.filepath && !excludePaths.some(path => f.filepath.startsWith(path)))
            .map(f => `### ${f.filepath}\n${f.content}`)
            .join("\n\n");
        const prompt = `
            You are an AI software engineer tasked with creating code changes for a GitHub issue for the given repository. 
            
            Repository Context:
            ${context}
    
            GitHub Issue:
            Title: ${issueTitle}
            Description: ${issueBody}
    
            Please provide your code changes in the following format:
            [file:path/to/file1.js]
            \`\`\`javascript
            Your code here
            \`\`\`
            ---
            [file:path/to/file2.js]
            \`\`\`javascript
            Your code here
            \`\`\`
            ---
        `;
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are an AI software engineer tasked with creating a pull request that fixes a simple GitHub issue."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0,
            max_tokens: 1000
        });
        return parseGPTResponse(response.choices[0].message.content, repoFiles);
    }
    return generateCode;
};
function parseGPTResponse(response, repoFiles) {
    if (!response) {
        throw new Error("No response from GPT");
    }
    const sections = response.split('---').filter(Boolean);
    const changes = [];
    for (const section of sections) {
        const fileMatch = section.match(/\[file:(.+?)\]/);
        if (fileMatch) {
            const codeMatch = section.match(/```[\w]*\n([\s\S]*?)```/);
            if (codeMatch) {
                const repoFile = repoFiles.find(f => f.filepath === fileMatch[1]);
                changes.push({
                    filePath: fileMatch[1],
                    content: codeMatch[1].trim(),
                    sha: repoFile?.sha // Will be undefined if file is new
                });
            }
        }
    }
    return changes;
}
