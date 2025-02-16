const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateCode(issueTitle, issueBody) {
    const prompt = `Generate a simple solution for the following GitHub issue:\nTitle: ${issueTitle}\nDescription: ${issueBody}`;
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "system", content: prompt }],
        max_tokens: 200
    });

    return response.choices[0].message.content.trim();
}

module.exports = { generateCode };