export const createGenerateCode = (openai) => {
    return async (issueTitle, issueBody, repoFiles) => {
        try {
            const context = repoFiles.map(f => `### ${f.filename}\n${f.content.slice(0, 500)}`).join("\n\n"); // Limit file size

            const prompt = `
                You are an AI assistant helping to fix issues in a GitHub repository.
                Here are some relevant files:
                ${context}
        
                The issue reported is:
                Title: ${issueTitle}
                Description: ${issueBody}
        
                Suggest a code fix based on the provided files.
            `;
            const response = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "system", content: prompt }],
                max_tokens: 500
            });
        
            return response.choices[0].message.content.trim();
        } catch (error) {
            console.error('Error generating code:', error);
            throw error;
        }
    };
};