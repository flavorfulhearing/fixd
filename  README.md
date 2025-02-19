# Project Title

This project is an advanced code generation and GitHub pull request creation system.
It leverages OpenAI's GPT-3 model to automatically generate code and create pull requests on GitHub.

## Dependencies
* body-parser: ^1.20.3
* dotenv: ^16.4.7
* express: ^4.21.2
* octokit: ^4.1.2
* openai: ^4.85.1
* smee-client: ^2.0.4

## Setup
1. Install all dependencies by typing `npm install` in the terminal.
2. Set up your .env file with the necessary API keys for GitHub and OpenAI.
3. Run the server by typing `npm start` in the terminal.

## Usage
1. Use the provided `smee-client.js` to start listening to webhook events.
2. POST to the `/generate` endpoint with the title of your code and the details.
3. The system will generate code using OpenAI and create a pull request on the specified GitHub repository.

## License
This project is licensed under the MIT License.