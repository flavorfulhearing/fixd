import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import { OpenAI } from 'openai';
import { createGenerateCode } from './code-generator.js';
import { createPullRequest } from './pull-requester.js';
const app = express();
app.use(bodyParser.json());

// Initialize OpenAI once
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
// Create the generateCode function with openai instance
const generateCode = createGenerateCode(openai);

app.post('/webhook', async (req, res) => {
    try {
        const payload = req.body;
        
        if (payload.action === 'opened' && payload.issue) {
            const issueTitle = payload.issue.title;
            const issueBody = payload.issue.body;
            const repo = payload.repository.full_name;
            
            console.log(`New issue detected: ${issueTitle}`);

            const generatedCode = await generateCode(issueTitle, issueBody);
            const pullRequest = await createPullRequest(repo, issueTitle, generatedCode);

            res.status(200).json({ 
                message: "Pull request created!",
                code: generatedCode 
            });
        } else {
            res.status(200).json({ message: "No action taken." });
        }
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

app.listen(3000, () => console.log('Listening on port 3000'));