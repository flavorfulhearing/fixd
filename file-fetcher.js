import { Octokit } from 'octokit';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function getRepositoryFiles(owner, repo) {
    const files = [];
    const response = await octokit.rest.repos.getContent({ owner, repo, path: "" });

    for (const file of response.data) {
        // Potentially use embeddings to find the most relevant file
    }
}