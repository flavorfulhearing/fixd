export const createGenerateCode = (openai) => {
    return async (issueTitle, issueBody, repoFiles) => {
        try {
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
                .filter(f => f.filePath && !excludePaths.some(path => f.filePath.startsWith(path)))
                .map(f => `### ${f.filePath}\n${f.content}`)
                .join("\n\n");

            const prompt = `
                Generate code changes for the given issue. 
                The code repository are provided below and you should inspect them before making a code change.

                Important Rules:
                1. Only provide code changes that directly address the issue.
                2. Keep changes minimal and focused on the specific issue.

                Code Repository:
                ${context}
        
                Issue Title: ${issueTitle}
                Issue Description: ${issueBody}
        
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

            console.log("prompt:", prompt);

            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { 
                        role: "system", 
                        content: "You are an AI software engineer tasked with creating simple code changes for a GitHub issue for the given repository."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.2,
                max_tokens: 16384,
            });
        
            return parseGPTResponse(response.choices[0].message.content.trim(), repoFiles);
        } catch (error) {
            console.error('Error generating code:', error);
            throw error;
        }
    };
};

function parseGPTResponse(response, repoFiles) {
    const files = [];
    const sections = response.split('---').filter(Boolean);
    
    for (const section of sections) {
        const fileMatch = section.match(/\[file:(.+?)\]/);
        if (fileMatch) {
            const matchedFilePath = fileMatch[1].replace(/^\.\//, '');;
            const codeMatch = section.match(/```[\w]*\n([\s\S]*?)```/);
            if (codeMatch) {
                // Find matching repo file to get its SHA
                const repoFile = repoFiles.find(file => file.filePath === matchedFilePath);
                files.push({
                    filePath: matchedFilePath,
                    content: codeMatch[1].trim(),
                    sha: repoFile?.sha  // Will be undefined if file is new
                });
            }
        }
    }
    return files;
}