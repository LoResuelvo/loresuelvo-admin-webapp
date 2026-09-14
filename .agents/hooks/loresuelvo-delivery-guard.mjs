#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findRepoRoot } from "../../tools/delivery-mcp/lib/repo-root.mjs";
import { captureGitSnapshot } from "../../tools/delivery-mcp/lib/git-snapshot.mjs";
import { verifyPreparedEvidence } from "../../tools/delivery-mcp/lib/delivery-ledger.mjs";
import { isGitCommitCommand } from "../../.codex/delivery-guard.mjs";

export { isGitCommitCommand };

/**
 * Parses Antigravity PreToolUse hook payload from stdin.
 * Format: { toolCall: { name: "run_command", args: { CommandLine: "...", Cwd: "..." } }, ... }
 */
export function parseAntigravityHookInput(rawInput) {
  if (!rawInput || !rawInput.trim()) {
    return { toolName: null, rawCommand: "", cwd: "" };
  }
  try {
    const parsed = JSON.parse(rawInput);
    return {
      toolName: typeof parsed.toolCall?.name === "string" ? parsed.toolCall.name : null,
      rawCommand:
        typeof parsed.toolCall?.args?.CommandLine === "string"
          ? parsed.toolCall.args.CommandLine
          : "",
      cwd:
        typeof parsed.toolCall?.args?.Cwd === "string"
          ? parsed.toolCall.args.Cwd
          : "",
    };
  } catch {
    return { toolName: null, rawCommand: "", cwd: "" };
  }
}

/**
 * Anticipatory delivery guard for Antigravity / agy environments.
 * Strictly read-only: never executes tests or gates.
 * Intercepts git commit commands within loresuelvo-webapp and verifies
 * that a valid prepared delivery receipt exists for the current staged snapshot.
 */
export async function runAntigravityGuard({
  repoRoot = findRepoRoot(),
  toolName = null,
  rawCommand = "",
  cwd = "",
} = {}) {
  // 1. Intercept only run_command
  if (toolName && toolName !== "run_command") {
    return { shouldIntercept: false, passed: true, decision: "allow", status: "ignored" };
  }

  // 2. Intercept only git commit commands
  if (!rawCommand || !isGitCommitCommand(rawCommand)) {
    return { shouldIntercept: false, passed: true, decision: "allow", status: "ignored" };
  }

  // 3. Do not intervene outside loresuelvo-webapp
  const effectiveCwd = cwd ? path.resolve(cwd) : repoRoot;
  const isInsideRepo =
    effectiveCwd === repoRoot || effectiveCwd.startsWith(repoRoot + path.sep);
  if (!isInsideRepo) {
    return {
      shouldIntercept: false,
      passed: true,
      decision: "allow",
      status: "outside_repo",
    };
  }

  // 4. Staged snapshot check
  const snapshot = await captureGitSnapshot({ cwd: repoRoot });
  if (snapshot.stagedFiles.length === 0) {
    return {
      shouldIntercept: true,
      passed: false,
      decision: "deny",
      status: "no_changes",
      reason:
        "No staged changes to commit. Stage files and invoke MCP delivery_prepare first.",
    };
  }

  // 5. Verify receipt using the exact same validator as Git hooks
  const verification = await verifyPreparedEvidence({ repoRoot, snapshot });
  if (verification.valid) {
    return {
      shouldIntercept: true,
      passed: true,
      decision: "allow",
      status: "passed",
      gateId: verification.prepared?.gateId || "NONE",
      cached: true,
    };
  }

  const reason =
    verification.reason === "MISSING_PREPARED_EVIDENCE"
      ? "Invoke MCP delivery_prepare for the current staged snapshot"
      : `Invalid delivery evidence (${verification.reason}). Invoke MCP delivery_prepare for the current staged snapshot`;

  return {
    shouldIntercept: true,
    passed: false,
    decision: "deny",
    status: verification.reason,
    reason,
  };
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function main() {
  const rawStdin = await readStdin();
  const hookInput = parseAntigravityHookInput(rawStdin);
  const root = findRepoRoot();

  const outcome = await runAntigravityGuard({
    repoRoot: root,
    toolName: hookInput.toolName,
    rawCommand: hookInput.rawCommand,
    cwd: hookInput.cwd,
  });

  const response = {
    decision: outcome.decision,
    ...(outcome.reason ? { reason: outcome.reason } : {}),
  };

  process.stdout.write(`${JSON.stringify(response)}\n`);
  process.exit(0);
}

const currentFile = fileURLToPath(import.meta.url);
const isMain = process.argv[1] && path.resolve(process.argv[1]) === currentFile;
if (isMain) {
  main().catch((err) => {
    // Fail-closed on internal error when intercepting git commit
    const message = String(err?.message || "unknown").split("\n")[0];
    process.stdout.write(
      `${JSON.stringify({
        decision: "deny",
        reason: `[loresuelvo-delivery-guard] Internal error: ${message}. Commit blocked (fail-closed).`,
      })}\n`
    );
    process.exit(0);
  });
}
