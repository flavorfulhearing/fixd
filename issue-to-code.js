export const createGenerateCode = (openai) => {
    return async (issueTitle, issueBody, repoFiles) => {
        try {
            const context = repoFiles.map(f => `### ${f.filename}\n${f.content.slice(0, 500)}`).join("\n\n");

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
                temperature: 0.7,
                max_tokens: 1000
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
            const filePathMatch = fileMatch[1];
            const codeMatch = section.match(/```[\w]*\n([\s\S]*?)```/);
            if (codeMatch) {
                // Find matching repo file to get its SHA
                const repoFile = repoFiles.find(file => file.filePath === filePathMatch);
                files.push({
                    filePath: repoFile.filePath,
                    content: codeMatch[1].trim(),
                    sha: repoFile?.sha  // Will be undefined if file is new
                });
            }
        }
    }
    return files;
}