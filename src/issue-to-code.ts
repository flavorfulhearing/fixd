import { GitHubIssue, File } from './types.js';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

const FileSchema = z
  .object({
    filepath: z
      .string()
      .describe('The path to the file that needs to be changed'),
    base64Content: z
      .string()
      .describe(
        'The full contents of a codebase file. This file is enocded in base64 as a utf-8 string.'
      ),
  })
  .describe('A file in the codebase');
const CodebaseSchema = z
  .object({
    files: z
      .array(FileSchema)
      .describe(
        'An array of file changes that need to be made to fix the issue'
      ),
  })
  .describe('An array of files that need to be changed to fix the issue');

const systemTemplate =
  'You are an expert TypeScript Code Agent. Your task is to analyze and modify TypeScript code based on the GitHub issue presented to you.';
const humanTemplate =
  'Here is my {codebase}. Here is the GitHub issue title: {issueTitle}. Here is the GitHub issue body: {issueBody}. Please return only the files that need to be changed, deleted, or created to fix the issue.';
const promptTemplate = ChatPromptTemplate.fromMessages([
  ['system', systemTemplate],
  ['human', humanTemplate],
]);
const llm = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
  temperature: 0,
  verbose: true,
});

const structured_llm = llm.withStructuredOutput(CodebaseSchema);

export async function generateCode(
  issue: GitHubIssue,
  files: File[]
): Promise<File[]> {
  try {
    const prompt = await promptTemplate.invoke({
      codebaseDescription: CodebaseSchema.description,
      codebase: files,
      issueTitle: issue.title,
      issueBody: issue.body,
    });
    console.log('Calling LLM');
    const result = await structured_llm.invoke(prompt);
    console.log(result);

    const changedFiles: File[] = result.files.map((changedFile) => ({
      filepath: changedFile.filepath,
      base64Content: changedFile.base64Content,
      sha: files.find((f) => f.filepath === changedFile.filepath)?.sha,
    }));
    console.log('Changed files:', changedFiles);

    return changedFiles;
  } catch (error) {
    console.error('Code generation error:', error);
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
    throw new Error('Invalid code generation result: expected array of files');
  }

  for (const file of result) {
    if (!file.filepath || !file.content) {
      throw new Error(
        `Invalid file object: missing required fields in ${JSON.stringify(file)}`
      );
    }
  }

  return result;
}
