import { Octokit } from 'octokit';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// Initialize cache for storing GitHub repo fetch results
let repoCache = {};

export async function getRepositoryFiles(owner, repo) {
    const files = [];

    // Check if the repo content is present in cache
    if(repoCache[`${owner}/${repo}`]) {
        return repoCache[`${owner}/${repo}`];
    }

    const response = await octokit.rest.repos.getContent({ owner, repo, path: "" });
    console.log("getContent response:", response);

    for (const file of response.data) {
        // TODO(samdealy): Figure out a better way to filter files. I.e. provide the minimum number of relevant files to fetch.
        // Potential enhancement: Implement caching here to prevent re-requesting the same files
        // Now we are storing the fetched files in cache
        repoCache[`${owner}/${repo}`] = files;
    }

    return files;
}