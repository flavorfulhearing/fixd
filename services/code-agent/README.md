# Code Agent Service

A gRPC service for automated code fixes.

## Development

1. Create virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -e ".[dev]"
```

3. Generate gRPC code:
```bash
python -m grpc_tools.protoc -I../../proto --python_out=src/code_agent/generated --grpc_python_out=src/code_agent/generated ../../proto/code_agent.proto
```
