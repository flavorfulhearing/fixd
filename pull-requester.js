import { Octokit } from 'octokit';

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

export const createPullRequest = async (repo, title, code) => {
    try {
        const [owner, repoName] = repo.split('/');
        const branchName = `issue-${Date.now()}`;

        // Create a new branch
        await octokit.rest.git.createRef({
            owner,
            repo: repoName,
            ref: `refs/heads/${branchName}`,
            sha: (await octokit.rest.repos.get({ owner, repo: repoName })).data.default_branch
        });

        // Create a file and commit it
        await octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo: repoName,
            path: `solution-${Date.now()}.js`,
            message: `Auto-generated solution for: ${title}`,
            content: Buffer.from(code).toString('base64'),
            branch: branchName
        });

        // Create a pull request
        await octokit.rest.pulls.create({
            owner,
            repo: repoName,
            title: `Fix: ${title}`,
            head: branchName,
            base: "main",
            body: `This PR automatically addresses the issue: ${title}.`,
        });

        console.log("Pull request created successfully!");
    } catch (error) {
        console.error('Error creating PR:', error);
        throw error;
    }
};