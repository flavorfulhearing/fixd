import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import { OpenAI } from 'openai';
import { createGenerateCode } from './issue-to-code.js';
import { createPullRequest } from './pull-request-submitter.js';
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
        
        if (shouldProcessPayload(payload)) {
            const issueTitle = payload.issue.title;
            const issueBody = payload.issue.body;
            const repoName = payload.repository.name;
            const owner = payload.repository.owner.login;
            
            const repoFiles = await getRepositoryFiles(owner, repoName);
            const generatedFiles = await generateCode(issueTitle, issueBody, repoFiles);
            await createPullRequest(owner, repoName, issueTitle, generatedFiles);

            res.status(200).json({ 
                message: "Pull request created!",
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

function shouldProcessPayload(payload) {
    if (payload.action !== 'opened') {
        return false;
    }
    if (!payload.issue) {
        return false;
    }

    return payload.issue.labels.some(label => label.name === 'auto-fix');
}

app.listen(3000, () => console.log('Listening on port 3000'));