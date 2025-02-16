export const createGenerateCode = (openai) => {
    return async (title, body) => {
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { 
                        role: "user", 
                        content: `Generate code for: ${title}\n\nDetails: ${body}` 
                    }
                ]
            });
            
            return completion.choices[0].message.content;
        } catch (error) {
            console.error('Error generating code:', error);
            throw error;
        }
    };
};