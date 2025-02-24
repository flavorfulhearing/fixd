export interface File {
    filepath: string;
    // The file content that's encoded as base64.
    base64Content: string;
    sha?: string;
}

export interface GitHubIssue {
    title: string;
    body: string;
}

export interface CodeChange {
    filePath: string;
    content: string;
    sha?: string;
}

export interface OpenAIConfig {
    apiKey: string;
    model: string;
} 
