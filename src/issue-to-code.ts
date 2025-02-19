import { GitHubIssue, File } from './types.js';
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

const FileChangeSchema = z.object({
    filepath: z.string().describe("The path to the file that needs to be changed"),
    content: z.string().describe("The full contents of the file that needs to be changed"),
});

const OutputSchema = z.object({
    changes: z.array(FileChangeSchema).describe("An array of file changes that need to be made to fix the issue"),
});
const parser = StructuredOutputParser.fromZodSchema(OutputSchema);

const codeAgentPrompt = ChatPromptTemplate.fromTemplate(`
You are an expert TypeScript Code Agent. Your task is to analyze and modify TypeScript code based on GitHub issues.

Repository Context:
{codeContext}

GitHub Issue:
Title: {issueTitle}
Description: {issueBody}

Instructions:
1. Analyze the issue and existing TypeScript code
2. Plan necessary changes
3. Consider:
   - Type safety and interfaces
   - Import/export statements (use .js extension for ESM)
   - Existing code patterns
`);

// 3. Create the OpenAI model instance
const model = new ChatOpenAI({
    modelName: "gpt-4",
    temperature: 0
});

// 4. Create the chain
const chain = codeAgentPrompt.pipe(model).pipe(parser);

// 5. Main function to generate code changes
export async function generateCode(issue: GitHubIssue, files: File[]) {
    try {
        const excludePaths = [
            '.env',
            'node_modules/',
            'package-lock.json',
            'dist/',
            'build/',
            '.git/',
            'coverage/'
        ];
        const codeRepository = files
            .filter(f => f.filepath && !excludePaths.some(path => f.filepath.startsWith(path)))
            .map(f => `### ${f.filepath}\n${f.content}`)
            .join("\n\n");

        // Invoke the chain
        const result = await chain.invoke({
            codeRepository,
            issueTitle: issue.title,
            issueBody: issue.body,
            formatInstructions: parser.getFormatInstructions(),
        });

        // Convert to unified File type
        const changedFiles: File[] = result.changes.map((changedFile: { filepath: string; content: string; }) => ({
            filepath: changedFile.filepath,
            content: changedFile.content,
            sha: files.find(f => f.filepath === changedFile.filepath)?.sha
        }));
        console.log("Changed files:",changedFiles);

        return changedFiles;
    } catch (error) {
        console.error("Code generation error:", error);
        throw error;
    }
}

export function createGenerateCode() {
    return async (issue: GitHubIssue, files: File[]) => {
        const result = await generateCode(issue, files);
        return validateChanges(result);
    };
} 

function validateChanges(result: any) {
    if (!result.filePath || !result.content) {
        throw new Error("Invalid code generation result: missing required fields");
    }

    return result;
}