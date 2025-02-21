import { GitHubIssue, File } from './types.js';
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

const FileChangeSchema = z.object({
    filepath: z.string().describe("The path to the file that needs to be changed"),
    content: z.string().describe("The full contents of the file that needs to be changed"),
});
const OutputSchema = z.object({
    changes: z.array(FileChangeSchema).describe("An array of file changes that need to be made to fix the issue"),
});
const systemTemplate = "You are an expert TypeScript Code Agent. Your task is to analyze and modify TypeScript code based on the GitHub issue presented to you.";
const humanTemplate = "Here is my codebase: {codeContext}\n\nHere is the GitHub issue: {issueTitle}\n {issueBody}";
const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["human", humanTemplate],
]);
const llm = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0,
});
const structured_llm = llm.withStructuredOutput(OutputSchema);

export async function generateCode(issue: GitHubIssue, files: File[]): Promise<File[]> {
    try {
        const codeContext = files
            .map(f => `### ${f.filepath}\n${f.content}`)
            .join("\n\n");
        const prompt = await promptTemplate.invoke({
            codeContext: codeContext,
            issueTitle: issue.title,
            issueBody: issue.body,
        });
        const result = await structured_llm.invoke(prompt);
        console.log(result);

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