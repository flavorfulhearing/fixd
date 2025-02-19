export interface File {
    filepath: string;
    content: string;
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
