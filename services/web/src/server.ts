import 'dotenv/config';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { credentials } from '@grpc/grpc-js';
import { CodeAgentClient, IssueFixRequest, IssueFixResponse, Issue } from './generated/code_agent.js';

interface WebhookPayload {
  action: string;
  issue?: {
    title: string;
    body: string;
    labels: Array<{ name: string }>;
  };
  repository: {
    name: string;
    owner: {
      login: string;
    };
  };
}

const app = express();

app.use(bodyParser.json());

app.post('/webhook', async (req: Request, res: Response) => {
  try {
    console.log('Received webhook');
    const payload = req.body as WebhookPayload;

    if (shouldProcessPayload(payload)) {
      console.log("Should process payload");
      const issueTitle = payload.issue!.title;
      const issueBody = payload.issue!.body;
      const repoName = payload.repository.name;
      const owner = payload.repository.owner.login;
      const fullRepoName = `${owner}/${repoName}`;

      const issue: Issue = {
        title: issueTitle,
        body: issueBody,
      }
      const issueFixRequest: IssueFixRequest = {
        fullRepoName,
        issue,
      }
      const result = await callIssueFix(issueFixRequest);
      res.status(200).json({
        message: 'Pull request created!',
      });
    } else {
      res.status(200).json({ message: 'No action taken.' });
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

function callIssueFix(request: IssueFixRequest): Promise<IssueFixResponse> {
  const codeAgentClient = new CodeAgentClient('localhost:50051', credentials.createInsecure());
  return new Promise((resolve, reject) => {
    codeAgentClient.fixIssue(request, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

function shouldProcessPayload(payload: WebhookPayload): boolean {
  if (!isActionToProcess(payload.action)) {
    return false;
  }
  if (!payload.issue) {
    return false;
  }

  return payload.issue.labels.some((label) => label.name === 'auto-fix');
}

function isActionToProcess(action: string): boolean {
  return action === 'opened' || action === 'edited';
}

app.listen(3000, () => console.log('Listening on port 3000'));
