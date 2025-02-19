import { Octokit } from 'octokit';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function getRepositoryFiles(owner, repo) {
    // TODO: Implement caching for retrieved repository files to improve performance
    const files = [];
    const response = await octokit.rest.repos.getContent({ owner, repo, path: "" });

    for (const file of response.data) {
        // TODO(samdealy): Figure out a better way to filter files. I.e. provide the minium number of relevant files to fetch.
        // Potentially use embeddings to find the most relevant files
        files.push(file);
    }

    return files;
}