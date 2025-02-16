import { Octokit } from 'octokit';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function getRepositoryFiles(owner, repo) {
    const files = [];
    const response = await octokit.repos.getContent({ owner, repo, path: "" });

    for (const file of response.data) {
        // TODO(samdealy): Figure out a better way to filter files. I.e. provide the minium number of relevant files to fetch.
        // Ideally don't use gpt here because it's expensive.
        if (file.type === "file") {  
            const fileContent = await octokit.repos.getContent({
                owner,
                repo,
                path: file.path
            });
            const content = Buffer.from(fileContent.data.content, "base64").toString("utf-8");
            files.push({ filename: file.name, content });
        }
    }

    return files;
}