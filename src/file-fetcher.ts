import { Octokit } from "@octokit/rest";
import { File } from './types.js';

// Module-level constants at the top of the file
const EXCLUDE_PATHS = [
    '.env',
    'node_modules/',
    'package-lock.json',
    'dist/',
    'build/',
    '.git/',
    'coverage/',
    'tsconfig.json',
    '.gitignore',
    '.github/',
    '.vscode/',
    '.idea/',
    '.DS_Store',
    '.env.local',
];

// Initialize Octokit once at module level
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function getRepositoryFiles(
    owner: string, 
    repo: string,
): Promise<File[]> {
    const files = await getRepositoryFilesImpl(owner, repo, "");
    console.log('All files fetched:', files.map(f => f.filepath));
    return files;
}

async function getRepositoryFilesImpl(
    owner: string, 
    repo: string,
    path: string,
): Promise<File[]> {
    const response = await octokit.rest.repos.getContent({ 
        owner, 
        repo, 
        path 
    });

    const files: File[] = [];
    for (const item of Array.isArray(response.data) ? response.data : []) {
        if (EXCLUDE_PATHS.some(path => item.path.startsWith(path))) {
            continue;
        }

        if (item.type === "file") {  
            try {
                const fileContent = await octokit.rest.repos.getContent({
                    owner,
                    repo,
                    path: item.path
                });

                // Debug log
                console.log(`Processing file: ${item.path}`);
                
                if ('content' in fileContent.data && fileContent.data.content) {
                    try {
                        const content = Buffer.from(fileContent.data.content, "base64").toString("utf-8");
                        files.push({ 
                            filepath: item.path, 
                            content, 
                            sha: fileContent.data.sha 
                        });
                    } catch (decodeError) {
                        console.error(`Error decoding ${item.path}:`, decodeError);
                        // Skip this file but continue with others
                        continue;
                    }
                }
            } catch (fileError) {
                console.error(`Error fetching ${item.path}:`, fileError);
                continue;
            }
        } else if (item.type === "dir") {
            const dirFiles = await getRepositoryFilesImpl(owner, repo, item.path);
            files.push(...dirFiles);
        }
    }

    return files;
} 