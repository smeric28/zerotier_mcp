# AGENTS.md

This document provides guidelines for AI agents working in this repository.

## Build, Lint, and Test Commands

### Build

To build the project, run:

```bash
npm run build
```

This will compile the TypeScript files into JavaScript in the `build` directory.

### Running the Application

To run the compiled application:

```bash
npm start
```

To run the application in development mode with live reloading:

```bash
npm run dev
```

### Linting

There is currently no linting command set up in `package.json`. It is recommended to add a linter like ESLint to the project to ensure code quality.

### Testing

There is currently no test command set up in `package.json`. It is recommended to add a testing framework like Jest or Vitest to the project to ensure code correctness. There are also no test files. When adding new features, please add tests.

## Code Style Guidelines

### Imports

*   Use ES Module (`import ... from ...`) syntax.
*   Append `.js` to relative import paths to ensure compatibility with Node.js ESM.
    *   Example: `import { ZeroTierClient } from "./client.js";`
*   Group imports:
    1.  Node.js built-in modules (`path`, `fs`)
    2.  External npm packages (`axios`, `zod`)
    3.  Internal modules (`./client.js`, `./types.js`)

### Formatting

*   **Indentation**: Use 2 spaces for indentation.
*   **Semicolons**: Always use semicolons at the end of statements.
*   **Quotes**: Use double quotes (`"`) for strings. Be consistent.
*   **Line Length**: Keep lines under 120 characters for better readability.
*   **Spacing**: Use single spaces around operators (`=`, `+`, `-`, etc.).

### Types

*   This is a TypeScript project. Strive to use strong types and avoid `any` where possible.
*   Type definitions for ZeroTier-specific objects are located in `src/types.ts`.
*   Use `zod` for runtime validation of API responses and tool inputs. This is crucial for ensuring data integrity. When calling a tool handler, the first step should be to validate the arguments with `zod`.

### Naming Conventions

*   **Variables and Functions**: `camelCase` (e.g., `listNetworks`, `networkId`).
*   **Classes and Types**: `PascalCase` (e.g., `ZeroTierClient`, `ZeroTierNetwork`).
*   **Constants**: `UPPER_CASE` (e.g., `CONFIG_DIR`).
*   **Files**: `kebab-case` (e.g., `network-tools.ts`) or `camelCase` (e.g., `zeroTierClient.ts`). Be consistent. `index.ts` is the entry point for a directory.

### Error Handling

*   Use `try...catch` blocks for operations that can fail, such as API calls or file system operations.
*   When handling errors from the ZeroTier API, inspect the `error.response.data.message` property for a specific error message.
*   For tool execution, catch `z.ZodError` for invalid arguments and return an `McpError` with `ErrorCode.InvalidParams`.
*   For unknown tools, throw an `McpError` with `ErrorCode.MethodNotFound`.

### Asynchronous Code

*   Use `async/await` for all asynchronous operations.
*   Avoid using `.then()` and `.catch()` on Promises.

## Project Structure

*   `src/`: Contains all the source code.
*   `src/index.ts`: The main entry point for the application.
*   `src/client.ts`: Contains the `ZeroTierClient` class for interacting with the ZeroTier API.
*   `src/tools/`: Contains the tool definitions and handlers for the MCP server.
*   `src/types.ts`: Contains the TypeScript type definitions for the project.

## General Principles

*   **Modularity**: Keep files focused on a single responsibility. For example, `client.ts` is only responsible for API interactions.
*   **Readability**: Write clear and concise code. Add comments only when the code is not self-explanatory.
*   **Consistency**: Follow the existing code style and patterns.
