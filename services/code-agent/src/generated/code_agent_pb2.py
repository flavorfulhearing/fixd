# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# NO CHECKED-IN PROTOBUF GENCODE
# source: code_agent.proto
# Protobuf Python Version: 5.29.0
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import runtime_version as _runtime_version
from google.protobuf import symbol_database as _symbol_database
from google.protobuf.internal import builder as _builder
_runtime_version.ValidateProtobufRuntimeVersion(
    _runtime_version.Domain.PUBLIC,
    5,
    29,
    0,
    '',
    'code_agent.proto'
)
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\x10\x63ode_agent.proto\x12\x0b\x63ode_editor\"L\n\x0fIssueFixRequest\x12\x16\n\x0e\x66ull_repo_name\x18\x01 \x01(\t\x12!\n\x05issue\x18\x02 \x01(\x0b\x32\x12.code_editor.Issue\"$\n\x05Issue\x12\r\n\x05title\x18\x01 \x01(\t\x12\x0c\n\x04\x62ody\x18\x02 \x01(\t\",\n\x10IssueFixResponse\x12\x18\n\x10pull_request_url\x18\x01 \x01(\t2V\n\tCodeAgent\x12I\n\x08\x46ixIssue\x12\x1c.code_editor.IssueFixRequest\x1a\x1d.code_editor.IssueFixResponse\"\x00\x62\x06proto3')

_globals = globals()
_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, _globals)
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'code_agent_pb2', _globals)
if not _descriptor._USE_C_DESCRIPTORS:
  DESCRIPTOR._loaded_options = None
  _globals['_ISSUEFIXREQUEST']._serialized_start=33
  _globals['_ISSUEFIXREQUEST']._serialized_end=109
  _globals['_ISSUE']._serialized_start=111
  _globals['_ISSUE']._serialized_end=147
  _globals['_ISSUEFIXRESPONSE']._serialized_start=149
  _globals['_ISSUEFIXRESPONSE']._serialized_end=193
  _globals['_CODEAGENT']._serialized_start=195
  _globals['_CODEAGENT']._serialized_end=281
# @@protoc_insertion_point(module_scope)
