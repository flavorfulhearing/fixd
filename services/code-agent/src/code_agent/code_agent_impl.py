import logging
import sys
from typing import Optional
from pydantic import BaseModel, Field
from langchain.output_parsers import PydanticOutputParser
from codegen import CodeAgent, Codebase
from codegen.extensions.langchain.tools import (
    GithubCreatePRTool,
    GithubCreatePRCommentTool,
)


# Define the response schema
class AgentResponse(BaseModel):
    result: str = Field(description="Description of the result of the action")
    github_pr_url: Optional[str] = Field(
        description="URL to the recently created PR, or None if no PR was created"
    )


# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    stream=sys.stdout,
)

logger = logging.getLogger(__name__)


def submit_pr(full_repo_name: str, issue_title: str, issue_body: str) -> str:
    """
    Submit a PR to fix the given issue.
    Returns a URL to the PR.
    """
    logger.info(
        f"Submitting PR for {full_repo_name} with title {issue_title} and body {issue_body}"
    )

    codebase = Codebase.from_repo(full_repo_name)
    # Create a code agent with read/write codebase access
    agent = CodeAgent(
        codebase=codebase,
        tools=[
            GithubCreatePRTool(codebase),
            GithubCreatePRCommentTool(codebase),
        ],
    )

    parser = PydanticOutputParser(pydantic_object=AgentResponse)
    prompt = f"""
    You are an expert software engineer. Your task is to analyze the codebase, analyze the GitHub issue, and submit a PR that fixes the issue. 
    The issue title is: {issue_title}
    The issue body is: {issue_body}
    
    Submit a non-draft PR that fixes this issue.
    response format instructions: {parser.get_format_instructions()}. Do not include any other text in your response. Only include the JSON response.

    # Guidelines:
    ## Proactiveness
    You are allowed to be proactive, but only when the user asks you to do something. You should strive to strike a balance between:
            1. Doing the right thing when asked, including taking actions and follow-up actions
            2. Not surprising the user with actions you take without asking
            For example, if the user asks you how to approach something, you should do your best to answer their question first, and not immediately jump into taking actions.
            3. Do not add additional code explanation summary unless requested by the user. After working on a file, just stop, rather than providing an explanation of what you did.
    
    ## Code style
    When making changes to files, first understand the file's code conventions. Mimic code style, use existing libraries and utilities, and follow existing patterns.
        - NEVER assume that a given library is available, even if it is well known. Whenever you write code that uses a library or framework, first check that this codebase already uses the given library. For example, you might look at neighboring files, or check the package.json (or cargo.toml, and so on depending on the language).
        - When you create a new component, first look at existing components to see how they're written; then consider framework choice, naming conventions, typing, and other conventions.
        - When you edit a piece of code, first look at the code's surrounding context (especially its imports) to understand the code's choice of frameworks and libraries. Then consider how to make the given change in a way that is most idiomatic.
        - Always follow security best practices. Never introduce code that exposes or logs secrets and keys. Never commit secrets or keys to the repository.
        - Do not add comments to the code you write, unless the user asks you to, or the code is complex and requires additional context.

    ## Doing tasks
    The user will primarily request you perform software engineering tasks. This includes solving bugs, adding new functionality, refactoring code, explaining code, and more. For these tasks the following steps are recommended:
        1. Use the available search tools to understand the codebase and the user's query. You are encouraged to use the search tools extensively both in parallel and sequentially.
        2. Implement the solution using all tools available to you
        3. Verify the solution if possible with tests. NEVER assume specific test framework or test script. Check the README or search codebase to determine the testing approach.
        4. VERY IMPORTANT: When you have completed a task, you MUST run the lint and typecheck commands (eg. npm run lint, npm run typecheck, ruff, etc.) if they were provided to you to ensure your code is correct. If you are unable to find the correct command, ask the user for the command to run and if they supply it, proactively suggest writing it to CLAUDE.md so that you will know to run it next time.

    # Tool usage policy
        - When doing file search, prefer to use the Agent tool in order to reduce context usage.
        - If you intend to call multiple tools and there are no dependencies between the calls, make all of the independent calls in the same function_calls block.
    """

    raw_result = agent.run(prompt)
    agent_response = parser.parse(raw_result)
    logger.info(f"Agent responded with result: {agent_response.result}")
    return agent_response.github_pr_url
