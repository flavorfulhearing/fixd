import { Octokit } from 'octokit';
import { File } from './types.js';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

async function getDefaultBranchCommitSha(
  owner: string,
  repoName: string
): Promise<string> {
  const defaultBranch = (
    await octokit.rest.repos.get({ owner, repo: repoName })
  ).data.default_branch;
  const defaultBranchRef = await octokit.rest.git.getRef({
    owner,
    repo: repoName,
    ref: `heads/${defaultBranch}`,
  });
  return defaultBranchRef.data.object.sha;
}

export const createPullRequest = async (
  owner: string,
  repoName: string,
  issueTitle: string,
  files: File[]
): Promise<void> => {
  try {
    const branchName = `issue-${Date.now()}`;
    const commitSha = await getDefaultBranchCommitSha(owner, repoName);
    await octokit.rest.git.createRef({
      owner,
      repo: repoName,
      ref: `refs/heads/${branchName}`,
      sha: commitSha,
    });
    for (const file of files) {
      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo: repoName,
        path: file.filepath,
        message: `Auto-generated changes for: ${issueTitle}`,
        content: file.content,
        branch: branchName,
        sha: file.sha,
      });
    }
    await octokit.rest.pulls.create({
      owner,
      repo: repoName,
      title: `Fix: ${issueTitle}`,
      head: branchName,
      base: 'main',
      body: `This PR automatically addresses the issue: ${issueTitle}.`,
    });

    console.log('Pull request created successfully!');
  } catch (error) {
    console.error('Error creating PR:', error);
  }
};
