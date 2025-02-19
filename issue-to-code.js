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