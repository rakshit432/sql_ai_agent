# SQL AI Agent

An intelligent web application that translates natural language into secure, read-only SQL queries, executes them against a Turso database, and explains the results back to the user in plain English. Built with Next.js, Vercel AI SDK, and Google Gemini.

## 🚀 Features

- **Natural Language to SQL**: Ask questions in plain English and let the AI generate the corresponding SQL query.
- **Dynamic Schema Awareness**: The agent automatically fetches the current database schema, ensuring queries are always accurate.
- **Secure Execution**: AI is restricted to `SELECT` queries only, preventing any accidental or malicious data modification.
- **Two-Phase Architecture**: Uses a robust two-step pipeline: first executing the query to gather real data, then generating a natural language explanation of the results.
- **Modern UI**: Sleek, dark-themed chat interface with real-time streaming responses and copy-to-clipboard functionality for generated SQL.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **AI SDK**: [Vercel AI SDK](https://sdk.vercel.ai/docs)
- **LLM**: Google Gemini 2.5 Flash
- **Database**: [Turso](https://turso.tech/) (LibSQL)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript

## 🏗️ Architecture

1. **Tool Execution Phase**: The user's prompt is sent to Gemini alongside the database schema. The AI formulates a valid SQL query and invokes the `queryDatabase` tool.
2. **Safety Check**: The backend intercepts the query, verifies it's a safe `SELECT` statement, and executes it against the Turso database.
3. **Response Phase**: The resulting rows are fed back into a second Gemini prompt to generate a concise, human-readable summary of the data.

## 💻 Getting Started

### Prerequisites

- Node.js 18+
- A [Turso](https://turso.tech/) database account
- Google Gemini API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sql-ai-agent.git
   cd sql-ai-agent
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
   TURSO_DATABASE_URL=your_turso_db_url
   TURSO_AUTH_TOKEN=your_turso_auth_token
   ```

4. Run database migrations:
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📸 Overview

The application features a conversational UI where users can query their database organically. The agent handles the translation to SQL, database querying, and natural language synthesis seamlessly.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

This project is open-sourced under the MIT License.
