# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This project is in early setup — no package manager, build tool, or framework has been configured yet. The current scaffold focuses on environment management and Linear integration.

## Environment Variables

Managed via [Varlock](https://varlock.dev) using the `@env-spec` format defined in `.env.schema`. Type definitions are auto-generated into `env.d.ts` (do not edit directly).

- `LINEAR_API_KEY` — required, sensitive Linear API key (`lin_api_` prefix)

To regenerate `env.d.ts` after changing `.env.schema`, run the Varlock CLI.

## MCP Integration

`.mcp.json` configures a Linear MCP server (HTTP, `https://mcp.linear.app/mcp`) authenticated via `LINEAR_API_KEY`. This enables Claude Code to interact with Linear issues, projects, and teams directly.
