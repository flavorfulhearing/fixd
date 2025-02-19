import { Octokit } from 'octokit';
import { createAppAuth } from "@octokit/auth-app";

const auth = createAppAuth({
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
  installationId: process.env.GITHUB_APP_INSTALLATION_ID,
});

const octokit = new Octokit({ auth });

export async function getRepositoryFiles(owner, repo) {
    const files = [];
    const response = await octokit.rest.repos.getContent({ owner, repo, path: "" });

    for (const file of response.data) {
        // TODO(samdealy): Figure out a better way to filter files. I.e. provide the minium number of relevant files to fetch.
        // Potentially use embeddings to find the most relevant fil