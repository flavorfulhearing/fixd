FROM python:3.9-slim

WORKDIR /app

# Install Poetry
RUN pip install poetry

# Copy only requirements to cache them in docker layer
COPY pyproject.toml poetry.lock* ./

# Configure poetry to not use a virtual environment in Docker
RUN poetry config virtualenvs.create false

# Install dependencies only (without the project itself)
RUN poetry install --no-interaction --no-ansi --without dev --no-root

# Copy the source code
COPY . .

# Now install the project
RUN poetry install --no-interaction --no-ansi --without dev

EXPOSE 50051

# Use a more explicit path to ensure the module is found
CMD ["python", "-m", "src.code_agent"]