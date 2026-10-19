# Security

## Secrets

- No API keys, tokens or passwords live in this repository. Scripts read the Gemini key from `GEMINI_API_KEY` or `~/.gemini_api_key` (see `scripts/README.md`).
- Every push and pull request runs [gitleaks](https://github.com/gitleaks/gitleaks) over the full history (`.github/workflows/secret-scan.yml`).
- Optional local guard: `pip install pre-commit && pre-commit install` (see `.pre-commit-config.yaml`).

If a key is ever committed by mistake, **revoke it first** at its provider (for Gemini: Google AI Studio → API keys), then remove it from the code. Deleting the file is not enough: the key stays in git history and in any fork or clone.

## The web game

`web/` is a static site on Cloudflare Pages. Its sign-in gate and player progress run entirely in the browser (`localStorage`); they are part of the game, not access control, and must never protect real personal data. Security headers live in `web/_headers`.

## Reporting

Please report a security problem privately through GitHub's **Report a vulnerability** button (Security tab) instead of opening a public issue.
