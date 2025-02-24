from concurrent import futures
import grpc
from .generated import code_agent_pb2
from .generated import code_agent_pb2_grpc

class CodeAgentService(code_agent_pb2_grpc.CodeAgentServicer):
    def FixIssue(self, request, context):
        """Generate code changes and submit PR to fix given issue."""
        try:
            full_repo_name = request.full_repo_name
            issue_title = request.issue.title
            issue_body = request.issue.body

            # TODO: Implement your code generation logic here

            response = code_agent_pb2.IssueFixResponse()
            response.pull_request_url = f"https://github.com/{full_repo_name}/pull/1"
            return response

        except Exception as e:
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f'Error fixing issue: {str(e)}')
            return code_agent_pb2.IssueFixResponse()

def serve():
    """Start the gRPC server."""
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    code_agent_pb2_grpc.add_CodeAgentServicer_to_server(
        CodeAgentService(), server
    )
    server.add_insecure_port('[::]:50051')
    server.start()
    print("Server started on port 50051")
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
