from concurrent import futures
import grpc
import logging
import sys
from . import code_agent_pb2
from . import code_agent_pb2_grpc
from services.code-agent.src.code_agent.code_is_so_cool import code_agent_impl

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

class CodeAgentService(code_agent_pb2_grpc.CodeAgentServicer):

    def __init__(self):
        logger.info("CodeAgentService initialized")

    def FixIssue(self, request, context):
        """Generate code changes and submit PR to fix given issue."""
        logger.info(f"Received request to fix issue: {request}")
        try:
            full_repo_name = request.full_repo_name
            issue_title = request.issue.title
            issue_body = request.issue.body
            logger.info(f"Received request to fix issue")
            logger.info(f"Repository: {full_repo_name}")
            logger.info(f"Issue title: {issue_title}")
            logger.info(f"Issue body: {issue_body}")

            github_pr_url = code_agent_impl.submit_pr(full_repo_name, issue_title, issue_body)
            response = code_agent_pb2.IssueFixResponse(pull_request_url=github_pr_url)
            logger.info(f"Returning response with PR URL: {response.pull_request_url}")
            return response

        except Exception as e:
            logger.error(f"Error: {str(e)}", exc_info=True)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f'Error fixing issue: {str(e)}')
            return code_agent_pb2.IssueFixResponse()

def serve():
    """Start the gRPC server."""
    logger.info("Starting gRPC server...")
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    code_agent_pb2_grpc.add_CodeAgentServicer_to_server(
        CodeAgentService(), server
    )
    port = 50051
    server.add_insecure_port(f'[::]:{port}')
    server.start()
    logger.info("Server started on port 50051")
    server.wait_for_termination()

if __name__ == '__main__':
    print("Starting code agent service")
    serve()
