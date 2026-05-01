# Start ZeroTier MCP Server
# Dynamically pull the token from BWS (Bitwarden Secrets Manager)

# Dot-source the internal Fireball script to load BWS authentication tokens
. C:\Scripts\Unlock-BWS.ps1

# Execute the Node Server via BWS Run to inject secrets
# Project ID: 72827b41-9cc6-4fc6-9db8-b23d014e6487 (Fireball - Internal)
bws run --project-id 72827b41-9cc6-4fc6-9db8-b23d014e6487 -- node C:\codebase\zerotier_mcp\build\index.js
