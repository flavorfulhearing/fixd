import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import { OpenAI } from 'openai';
import { createGenerateCode } from './code-generator.js';
import { createPullRequest } from './pull-requester.js';
import { getRepositoryFiles } from './file-fetcher.js';

const app = express();

app.use(bodyParser.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
const generateCode = createGenerateCode(openai);

app.post('/webhook', async (req, res) => {
    try {
        const payload = req.body;
        
        if (payload.action === 'opened' && payload.issue) {
            const issueTitle = payload.issue.title;
            const issueBody = payload.issue.body;
            const repoName = payload.repository.name;
            const repoFullName = payload.repository.full_name;
            const owner = payload.repository.owner.login;
            
            const repoFiles = await getRepositoryFiles(owner, repoName);
            const generatedCode = await generateCode(issueTitle, issueBody, repoFiles);
            const pullRequest = await createPullRequest(owner, repoName, issueTitle, generatedCode);

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