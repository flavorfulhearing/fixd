import { Octokit } from 'octokit';
import { createAppAuth } from "@octokit/auth-app";

const auth = createAppAuth({
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
  installationId: process.env.GITHUB_APP_INSTALLATION_ID,
});

const octokit = new Octokit({ auth });

async function getDefaultBranchCommitSha(owner, repoName) {
    const defaultBranch = (await octokit.rest.repos.get({ owner, repo: repoName })).data.default_branch;
    const defaultBranchRef = await octokit.rest.git.getRef({
        owner,
        repo: repoName,
        ref: `heads/${defaultBranch}`
    });
    return defaultBranchRef.data.object.sha;
}

export const createPullRequest = as