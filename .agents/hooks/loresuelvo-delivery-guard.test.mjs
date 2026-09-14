import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  isGitCommitCommand,
  parseAntigravityHookInput,
  runAntigravityGuard,
} from "./loresuelvo-delivery-guard.mjs";
import { prepareDelivery } from "../../tools/delivery-mcp/lib/prepare-delivery.mjs";

async function createTempGitRepo(t) {
  const repoRoot = await fs.mkdtemp(path.join(os.tmpdir(), "antigravity-guard-test-"));
  t.after(() => fs.rm(repoRoot, { recursive: true, force: true }));

  execFileSync("git", ["init", "-b", "main"], { cwd: repoRoot });
  execFileSync("git", ["config", "user.name", "Tester"], { cwd: repoRoot });
  execFileSync("git", ["config", "user.email", "tester@example.com"], { cwd: repoRoot });
  execFileSync("git", ["config", "commit.gpgsign", "false"], { cwd: repoRoot });

  // Copy policy and schemas
  await fs.mkdir(path.join(repoRoot, ".delivery", "schemas"), { recursive: true });
  await fs.copyFile(".delivery/policy.v1.json", path.join(repoRoot, ".delivery", "policy.v1.json"));
  await fs.copyFile(
    ".delivery/schemas/policy.schema.json",
    path.join(repoRoot, ".delivery", "schemas", "policy.schema.json")
  );
  await fs.copyFile(
    ".delivery/schemas/inspection-result.schema.json",
    path.join(repoRoot, ".delivery", "schemas", "inspection-result.schema.json")
  );
  await fs.copyFile(
    ".delivery/schemas/execution-result.schema.json",
    path.join(repoRoot, ".delivery", "schemas", "execution-result.schema.json")
  );
  await fs.copyFile(
    ".delivery/schemas/delivery-context.schema.json",
    path.join(repoRoot, ".delivery", "schemas", "delivery-context.schema.json")
  );
  await fs.copyFile(".gitignore", path.join(repoRoot, ".gitignore"));

  // Initial commit
  await fs.writeFile(path.join(repoRoot, "README.md"), "# Initial\n", "utf8");
  execFileSync("git", ["add", "."], { cwd: repoRoot });
  execFileSync("git", ["commit", "-m", "chore: initial commit"], { cwd: repoRoot });

  return repoRoot;
}

test("parseAntigravityHookInput: extrae toolName, CommandLine y Cwd", () => {
  const empty = parseAntigravityHookInput("");
  assert.strictEqual(empty.toolName, null);
  assert.strictEqual(empty.rawCommand, "");

  const payload = JSON.stringify({
    toolCall: {
      name: "run_command",
      args: {
        CommandLine: "git commit -m 'feat: test'",
        Cwd: "/path/to/project",
      },
    },
    stepIdx: 5,
  });

  const parsed = parseAntigravityHookInput(payload);
  assert.strictEqual(parsed.toolName, "run_command");
  assert.strictEqual(parsed.rawCommand, "git commit -m 'feat: test'");
  assert.strictEqual(parsed.cwd, "/path/to/project");
});

test("runAntigravityGuard: ignora herramientas distintas de run_command", async () => {
  const res = await runAntigravityGuard({
    toolName: "view_file",
    rawCommand: "git commit -m 'test'",
  });
  assert.strictEqual(res.shouldIntercept, false);
  assert.strictEqual(res.passed, true);
  assert.strictEqual(res.decision, "allow");
});

test("runAntigravityGuard: ignora comandos que no sean git commit", async () => {
  const res1 = await runAntigravityGuard({
    toolName: "run_command",
    rawCommand: "npm run test",
  });
  assert.strictEqual(res1.shouldIntercept, false);
  assert.strictEqual(res1.decision, "allow");

  const res2 = await runAntigravityGuard({
    toolName: "run_command",
    rawCommand: "git status",
  });
  assert.strictEqual(res2.shouldIntercept, false);
  assert.strictEqual(res2.decision, "allow");
});

test("runAntigravityGuard: no interviene fuera del repositorio objetivo", async (t) => {
  const repoRoot = await createTempGitRepo(t);
  const outsideDir = await fs.mkdtemp(path.join(os.tmpdir(), "outside-repo-"));
  t.after(() => fs.rm(outsideDir, { recursive: true, force: true }));

  const res = await runAntigravityGuard({
    repoRoot,
    toolName: "run_command",
    rawCommand: "git commit -m 'test'",
    cwd: outsideDir,
  });

  assert.strictEqual(res.shouldIntercept, false);
  assert.strictEqual(res.decision, "allow");
  assert.strictEqual(res.status, "outside_repo");
});

test("runAntigravityGuard: intercepta git commit y deniega si no hay cambios staged", async (t) => {
  const repoRoot = await createTempGitRepo(t);

  const outcome = await runAntigravityGuard({
    repoRoot,
    toolName: "run_command",
    rawCommand: "git commit -m 'docs: update'",
    cwd: repoRoot,
  });

  assert.strictEqual(outcome.shouldIntercept, true);
  assert.strictEqual(outcome.passed, false);
  assert.strictEqual(outcome.decision, "deny");
  assert.strictEqual(outcome.status, "no_changes");
  assert.ok(outcome.reason.includes("No staged changes"));
});

test("runAntigravityGuard: deniega git commit si falta delivery_prepare", async (t) => {
  const repoRoot = await createTempGitRepo(t);

  await fs.writeFile(path.join(repoRoot, "newfile.txt"), "hello", "utf8");
  execFileSync("git", ["add", "newfile.txt"], { cwd: repoRoot });

  const outcome = await runAntigravityGuard({
    repoRoot,
    toolName: "run_command",
    rawCommand: "git commit -m 'docs: add newfile'",
    cwd: repoRoot,
  });

  assert.strictEqual(outcome.shouldIntercept, true);
  assert.strictEqual(outcome.passed, false);
  assert.strictEqual(outcome.decision, "deny");
  assert.strictEqual(outcome.status, "MISSING_PREPARED_EVIDENCE");
  assert.ok(outcome.reason.includes("delivery_prepare"));
});

test("runAntigravityGuard: permite commit con receipt válido y deniega tras modificar el staged diff", async (t) => {
  const repoRoot = await createTempGitRepo(t);

  await fs.writeFile(path.join(repoRoot, "README.md"), "# Updated Docs\n", "utf8");
  execFileSync("git", ["add", "README.md"], { cwd: repoRoot });

  // 1. Preparar previamente
  const firstPrep = await prepareDelivery({ repoRoot, intent: "prepare_commit" });
  assert.strictEqual(firstPrep.status, "passed");

  // 2. Guard intercepta git commit y reutiliza receipt sin re-ejecutar tests
  const startTime = Date.now();
  const guardOutcome = await runAntigravityGuard({
    repoRoot,
    toolName: "run_command",
    rawCommand: "git commit -m 'docs: update docs'",
    cwd: repoRoot,
  });
  const elapsed = Date.now() - startTime;

  assert.strictEqual(guardOutcome.shouldIntercept, true);
  assert.strictEqual(guardOutcome.passed, true);
  assert.strictEqual(guardOutcome.decision, "allow");
  assert.strictEqual(guardOutcome.status, "passed");
  assert.strictEqual(guardOutcome.cached, true);
  assert.ok(elapsed < 200, `Guard must be read-only and fast (<200ms), took ${elapsed}ms`);

  // 3. Modificar staged diff posterior invalida el receipt
  await fs.writeFile(path.join(repoRoot, "extra.txt"), "extra content", "utf8");
  execFileSync("git", ["add", "extra.txt"], { cwd: repoRoot });

  const guardAfterChange = await runAntigravityGuard({
    repoRoot,
    toolName: "run_command",
    rawCommand: "git commit -m 'docs: update docs with extra'",
    cwd: repoRoot,
  });

  assert.strictEqual(guardAfterChange.shouldIntercept, true);
  assert.strictEqual(guardAfterChange.passed, false);
  assert.strictEqual(guardAfterChange.decision, "deny");
  assert.strictEqual(guardAfterChange.status, "PREPARED_EVIDENCE_SNAPSHOT_MISMATCH");
  assert.ok(guardAfterChange.reason.includes("delivery_prepare"));
});

test("CLI process: entrada por stdin devuelve contrato JSON esperado por Antigravity", async (t) => {
  const repoRoot = await createTempGitRepo(t);
  const scriptPath = path.resolve(".agents/hooks/loresuelvo-delivery-guard.mjs");

  // 1. Comando no commit -> { decision: "allow" }
  const outIgnore = execFileSync("node", [scriptPath], {
    cwd: repoRoot,
    encoding: "utf8",
    input: JSON.stringify({
      toolCall: {
        name: "run_command",
        args: { CommandLine: "git status", Cwd: repoRoot },
      },
    }),
  });
  const resIgnore = JSON.parse(outIgnore);
  assert.strictEqual(resIgnore.decision, "allow");

  // 2. Commit sin staged -> { decision: "deny", reason: "..." }
  const outNoChanges = execFileSync("node", [scriptPath], {
    cwd: repoRoot,
    encoding: "utf8",
    input: JSON.stringify({
      toolCall: {
        name: "run_command",
        args: { CommandLine: "git commit -m 'test'", Cwd: repoRoot },
      },
    }),
  });
  const resNoChanges = JSON.parse(outNoChanges);
  assert.strictEqual(resNoChanges.decision, "deny");
  assert.ok(resNoChanges.reason.includes("No staged changes"));

  // 3. Commit con staged sin receipt -> { decision: "deny", reason: "..." }
  await fs.writeFile(path.join(repoRoot, "file.txt"), "content", "utf8");
  execFileSync("git", ["add", "file.txt"], { cwd: repoRoot });

  const outNoReceipt = execFileSync("node", [scriptPath], {
    cwd: repoRoot,
    encoding: "utf8",
    input: JSON.stringify({
      toolCall: {
        name: "run_command",
        args: { CommandLine: "git commit -m 'feat: add file'", Cwd: repoRoot },
      },
    }),
  });
  const resNoReceipt = JSON.parse(outNoReceipt);
  assert.strictEqual(resNoReceipt.decision, "deny");
  assert.ok(resNoReceipt.reason.includes("delivery_prepare"));
});
