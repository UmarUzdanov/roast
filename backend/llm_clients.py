"""Async wrappers around local CLI tooling for Claude, GPT/Codex, and Gemini."""

from __future__ import annotations

import asyncio
from typing import Optional, Sequence

CLI_TIMEOUT = 60


async def _run_cli_command(
    cmd: Sequence[str],
    timeout: Optional[int] = CLI_TIMEOUT,
) -> str:
    """Execute a CLI command and return decoded stdout."""
    process = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=timeout)
    if process.returncode != 0:
        message = stderr.decode().strip() or f"CLI exited with code {process.returncode}"
        raise RuntimeError(message)
    return stdout.decode().strip()


async def call_claude(prompt: str, system_prompt: str) -> str:
    """Call the local Claude CLI with system prompt separation."""
    cmd = [
        "claude",
        "-p",
        "--system-prompt",
        system_prompt,
        prompt,
    ]
    return await _run_cli_command(cmd)


async def call_codex(prompt: str, system_prompt: str) -> str:
    """Invoke the Codex CLI by providing a combined prompt."""
    full_prompt = f"{system_prompt}\n\n{prompt}"
    cmd = [
        "codex",
        "exec",
        "--skip-git-repo-check",
        full_prompt,
    ]
    return await _run_cli_command(cmd)


async def call_gemini(prompt: str, system_prompt: str) -> str:
    """Call the Gemini CLI."""
    full_prompt = f"{system_prompt}\n\n{prompt}"
    cmd = [
        "gemini",
        "-p",
        full_prompt,
    ]
    return await _run_cli_command(cmd)
