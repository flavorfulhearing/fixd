import { Octokit } from 'octokit';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// List of file extensions to ignore
const ignoreFileExtensions = ['log', 'local', 'swp', 'swo', 'db'];

export async function getRepositoryFiles(owner, repo) {
    const files = [];
    const response = await octokit.rest.repos.getContent({ owner, repo, path: "" });

    for (const file of response.data) {
        const fileExtension = file.name.split('.').pop();

        // Check if file extension is in the ignore list
        if (!ignoreFileExtensions.includes(fileExtension)) {
            files.push(file);
        }
    }

    return files;
}