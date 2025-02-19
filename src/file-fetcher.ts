import { Octokit } from 'octokit';
import { File } from './types.js';

export async function getRepositoryFiles(
    owner: string, 
    repo: string
): Promise<File[]> {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const response = await octokit.rest.repos.getContent({ 
        owner, 
        repo, 
        path: "" 
    });

    // Add type assertion to ensure response.data is treated as an array
    const files: File[] = [];
    for (const file of Array.isArray(response.data) ? response.data : []) {
        // TODO(samdealy): Figure out a better way to filter files. I.e. provide the minium number of relevant files to fetch.
        // Potentially use embeddings to find the most relevant files.
        if (file.type === "file") {  
            const fileContent = await octokit.rest.repos.getContent({
                owner,
                repo,
                path: file.path
            });

            if ('content' in fileContent.data) {
                const content = Buffer.from(fileContent.data.content, "base64").toString("utf-8");
                files.push({ 
                    filepath: file.path, 
                    content, 
                    sha: fileContent.data.sha 
                });
            }
        }
    }

    return files;
} 