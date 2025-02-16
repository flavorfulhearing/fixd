require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { generateCode } = require('./code-generator');
const app = express();
app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
    try {
        const payload = req.body;
        
        if (payload.action === 'opened' && payload.issue) {
            const issueTitle = payload.issue.title;
            const issueBody = payload.issue.body;
            const repo = payload.repository.full_name;
            
            console.log(`New issue detected: ${issueTitle}`);

            const generatedCode = await generateCode(issueTitle, issueBody);

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