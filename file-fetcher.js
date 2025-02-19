import { Octokit } from 'octokit';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function getRepositoryFiles(owner, repo) {
    const files = [];
    const response = await octokit.rest.repos.getContent({ owner, repo, path: "" });

    for (const file of response.data) {
        // TODO(samdealy): Figure out a better way to filter files. I.e. provide the minium number of relevant files to fetch.
        // Potentially use embeddings to find the most relevant files.
        if (file.type === "file") {  
            const fileContent = await octokit.rest.repos.getContent({
                owner,
                repo,
                path: file.path
            });
            const content = Buffer.from(fileContent.data.content, "base64").toString("utf-8");
            files.push({ filePath: file.path, content, sha: fileContent.data.sha });
        }
    }

    return files;
}