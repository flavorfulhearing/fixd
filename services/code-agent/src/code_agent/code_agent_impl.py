import logging
import sys
from typing import Optional
from pydantic import BaseModel, Field
from langchain.output_parsers import PydanticOutputParser
from codegen import CodeAgent, Codebase
from codegen.extensions.langchain.tools import (
    GithubCreatePRTool,
    GithubViewPRTool,
    GithubCreatePRCommentTool,
    GithubCreatePRReviewCommentTool
)

# Define the response schema
class AgentResponse(BaseModel):
    result: str = Field(description="Description of the result of the action")
    github_pr_url: Optional[str] = Field(description="URL to the recently created PR, or None if no PR was created")

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)

logger = logging.getLogger(__name__)

def submit_pr(full_repo_name: str, issue_title: str, issue_body: str) -> str:
    """
    Submit a PR to fix the given issue.
    Returns a URL to the PR.
    """
    logger.info(f"Submitting PR for {full_repo_name} with title {issue_title} and body {issue_body}")

    codebase = Codebase.from_repo(full_repo_name)
    # Create a code agent with read/write codebase access
    agent = CodeAgent(
        codebase=codebase,
        tools = [
            GithubCreatePRTool(codebase),
            GithubCreatePRCommentTool(codebase),
        ]
    )

    # Create parser
    parser = PydanticOutputParser(pydantic_object=AgentResponse)

    prompt = f'''
    You are an expert software engineer. Your task is to analyze the codebase, analyze the GitHub issue, and submit a PR that fixes the issue. 
    The issue title is: {issue_title}
    The issue body is: {issue_body}
    
    Submit a non-draft PR that fixes this issue.
    response format instructions: {parser.get_format_instructions()}. Do not include any other text in your response. Only include the JSON response.
    '''

    raw_result = agent.run(prompt)
    agent_response = parser.parse(raw_result)
    logger.info(f"Agent responded with result: {agent_response.result}")
    return agent_response.github_pr_url
