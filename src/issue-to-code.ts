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
You are an expert TypeScript Code Agent. Your task is to analyze and modify TypeScript code based on the GitHub issue.

Repository Context:
{codeContext}

GitHub Issue:
Title: {issueTitle}
Description: {issueBody}

Instructions:
1. Analyze the issue and existing TypeScript code
2. Plan necessary changes

{formatInstructions}
`);

// 3. Create the OpenAI model instance
const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0,
    verbose: true,
});

// 4. Create the chain
const chain = codeAgentPrompt.pipe(model).pipe(parser);

// 5. Main function to generate code changes
export async function generateCode(issue: GitHubIssue, files: File[]): Promise<File[]> {
    try {
        const codeContext = files
            .map(f => `### ${f.filepath}\n${f.content}`)
            .join("\n\n");
        const result = await chain.invoke({
            codeContext, 
            issueTitle: issue.title,
            issueBody: issue.body,
            formatInstructions: parser.getFormatInstructions(),
        });

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

function validateChanges(result: File[]) {
    if (result.length === 0) {
        throw new Error("Invalid code generation result: expected array of files");
    }

    for (const file of result) {
        if (!file.filepath || !file.content) {
            throw new Error(`Invalid file object: missing required fields in ${JSON.stringify(file)}`);
        }
    }

    return result;
}