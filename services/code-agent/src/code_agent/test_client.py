import grpc

from code_agent import code_agent_pb2
from code_agent import code_agent_pb2_grpc


def test_fix_issue():
    # Create a channel
    channel = grpc.insecure_channel("localhost:50051")

    # Create a stub (client)
    stub = code_agent_pb2_grpc.CodeAgentStub(channel)

    # Create a request
    issue = code_agent_pb2.Issue(
        title="Rename issue-to-code.ts to red-to-blue.ts",
        body="Update all imports as well.",
    )

    request = code_agent_pb2.IssueFixRequest(
        full_repo_name="flavorfulhearing/fixd", issue=issue
    )

    try:
        # Make the call
        response = stub.FixIssue(request)
        print(f"Success! Pull request URL: {response.pull_request_url}")
    except grpc.RpcError as e:
        print(f"RPC failed: {e.code()}, {e.details()}")
        print(f"Error: {e.with_traceback()}")


if __name__ == "__main__":
    test_fix_issue()
