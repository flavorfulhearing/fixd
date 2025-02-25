import logging
import sys
from codegen import CodeAgent, Codebase

# Grab a repo from Github

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)

logger = logging.getLogger(__name__)
def submit_pr(full_repo_name: str, issue_title: str, issue_body: str):
    logger.info(f"Submitting PR for {full_repo_name} with title {issue_title} and body {issue_body}")

    codebase = Codebase.from_repo('fastapi/fastapi')
    # Create a code agent with read/write codebase access
    agent = CodeAgent(codebase)

    # Run the agent with a prompt
    agent.run("Tell me about this repo")