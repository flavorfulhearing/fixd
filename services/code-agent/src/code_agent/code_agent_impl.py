import logging
import sys
from codegen import CodeAgent, Codebase
from codegen.extensions.langchain.tools import (
    GithubCreatePRTool,
    GithubViewPRTool,
    GithubCreatePRCommentTool,
    GithubCreatePRReviewCommentTool
)

# Grab a repo from Github

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)

logger = logging.getLogger(__name__)
def submit_pr(full_repo_name: str, issue_title: str, issue_body: str):
    logger.info(f"Submitting PR for {full_repo_name} with title {issue_title} and body {issue_body}")

    codebase = Codebase.from_repo(full_repo_name)
    # Create a code agent with read/write codebase access
    agent = CodeAgent(
        codebase=codebase,
        model_provider="openai",
        model_name="gpt-4o",
        tools = [
            GithubCreatePRTool(codebase),
            GithubCreatePRCommentTool(codebase),
        ]
    )

    prompt = f'''
    You are an expert software engineer. Your task is to analyze the codebase, analyze the GitHub issue, and submit a PR that fixes the issue.
    The issue title is: {issue_title}
    The issue body is: {issue_body}
    Please submit a PR that fixes this issue.
    '''
    agent.run(prompt)