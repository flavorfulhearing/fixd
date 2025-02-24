# Generated by the gRPC Python protocol compiler plugin. DO NOT EDIT!
"""Client and server classes corresponding to protobuf-defined services."""
import grpc
import warnings

import code_agent_pb2 as code__agent__pb2

GRPC_GENERATED_VERSION = '1.70.0'
GRPC_VERSION = grpc.__version__
_version_not_supported = False

try:
    from grpc._utilities import first_version_is_lower
    _version_not_supported = first_version_is_lower(GRPC_VERSION, GRPC_GENERATED_VERSION)
except ImportError:
    _version_not_supported = True

if _version_not_supported:
    raise RuntimeError(
        f'The grpc package installed is at version {GRPC_VERSION},'
        + f' but the generated code in code_agent_pb2_grpc.py depends on'
        + f' grpcio>={GRPC_GENERATED_VERSION}.'
        + f' Please upgrade your grpc module to grpcio>={GRPC_GENERATED_VERSION}'
        + f' or downgrade your generated code using grpcio-tools<={GRPC_VERSION}.'
    )


class CodeAgentStub(object):
    """Missing associated documentation comment in .proto file."""

    def __init__(self, channel):
        """Constructor.

        Args:
            channel: A grpc.Channel.
        """
        self.FixIssue = channel.unary_unary(
                '/code_editor.CodeAgent/FixIssue',
                request_serializer=code__agent__pb2.IssueFixRequest.SerializeToString,
                response_deserializer=code__agent__pb2.IssueFixResponse.FromString,
                _registered_method=True)


class CodeAgentServicer(object):
    """Missing associated documentation comment in .proto file."""

    def FixIssue(self, request, context):
        """Generate code changes and Submit pull request to fix given issue
        """
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')


def add_CodeAgentServicer_to_server(servicer, server):
    rpc_method_handlers = {
            'FixIssue': grpc.unary_unary_rpc_method_handler(
                    servicer.FixIssue,
                    request_deserializer=code__agent__pb2.IssueFixRequest.FromString,
                    response_serializer=code__agent__pb2.IssueFixResponse.SerializeToString,
            ),
    }
    generic_handler = grpc.method_handlers_generic_handler(
            'code_editor.CodeAgent', rpc_method_handlers)
    server.add_generic_rpc_handlers((generic_handler,))
    server.add_registered_method_handlers('code_editor.CodeAgent', rpc_method_handlers)


 # This class is part of an EXPERIMENTAL API.
class CodeAgent(object):
    """Missing associated documentation comment in .proto file."""

    @staticmethod
    def FixIssue(request,
            target,
            options=(),
            channel_credentials=None,
            call_credentials=None,
            insecure=False,
            compression=None,
            wait_for_ready=None,
            timeout=None,
            metadata=None):
        return grpc.experimental.unary_unary(
            request,
            target,
            '/code_editor.CodeAgent/FixIssue',
            code__agent__pb2.IssueFixRequest.SerializeToString,
            code__agent__pb2.IssueFixResponse.FromString,
            options,
            channel_credentials,
            insecure,
            call_credentials,
            compression,
            wait_for_ready,
            timeout,
            metadata,
            _registered_method=True)
