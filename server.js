const express = require('express');

const app = express();

app.use(express.json());
app.post('/webhook', async (req, res) => {
    const payload = req.body;
    
    if (payload.action === 'opened' && payload.issue) {
        const issueTitle = payload.issue.title;
        const issueBody = payload.issue.body;
        const repo = payload.repository.full_name;
        
        console.log(`New issue detected: ${issueTitle}`);

        res.status(200).send("Pull request created!");
    } else {
        res.status(200).send("No action taken.");
    }
});

app.listen(3000, () => console.log('Listening on port 3000'));