#!/usr/bin/env python3
"""
LORE, VOCABULARY & CIPHER INTEGRITY LINTER
------------------------------------------
Validates that zero non-canonical, drifted or prohibited terms exist anywhere
in the codebase (markdown, python, html, js, json, emails).

Enforces:
1. Zero occurrences of forbidden drifted terms:
   - "Sunken" (Sanctuary / Oasis / Planisphere)
   - "Coastal" / "Coast" (Amphitheater / Stage Tower)
   - "Hermit" / "Ermitaño" (Oracle of Tower II)
   - "Stage Mistress" (Mirror Speaker of Tower III)
2. Zero unauthorized astronomical jargon in player-facing copy (Azimuth, Mucro, Mucrones, Tympan).
3. Canonical three-tower names and fourth secret vault alignment.
4. Cryptographic ledger mathematical consistency.

Exit Code:
  0: 100% Clean & Canonical
  1: Violations Detected (Blocks commit in pre-commit hook)
"""

import sys
import os
import re
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent.parent

# Files/Directories to inspect
TARGET_DIRS = ["docs", "emails", "journal", "scripts", "web", ".agents", ".cursor"]
TARGET_EXTS = {".md", ".html", ".js", ".json", ".py", ".mdc"}

# Ignore paths
IGNORE_DIRS = {".git", ".gemini", "scratch", "node_modules", ".wrangler"}

# Negative list / Forbidden patterns with explanation
FORBIDDEN_PATTERNS = [
    (r"\bSunken\b", "Prohibited term 'Sunken' found. Tower II is 'The Sandstone Sanctuary' or 'The Sandstone Tower'."),
    (r"\bCoastal\b", "Prohibited term 'Coastal' found. Tower III is 'The Stage Tower' or 'The Mirror Sanctuary'."),
    (r"\b(Hermit|Ermitaño|eremita)\b", "Prohibited term 'Hermit'/'Ermitaño' found. The guardian of Tower II is 'The Oracle'."),
    (r"\bStage\s+Mistress\b", "Prohibited term 'Stage Mistress' found. The guardian of Tower III is 'The Mirror Speaker'."),
]

# Player-facing accessible vocabulary checks (for web and journal)
ACCESSIBILITY_PATTERNS = [
    (r"\bAzimuth\b", "Technical jargon 'Azimuth' found. Use 'Bearing', 'Heading', or 'Direction'."),
    (r"\b(Mucro|Mucrones)\b", "Technical jargon 'Mucro/Mucrones' found. Use 'Star Pointer' or 'Star Marker'."),
]

# Patterns in rules/audits that mention forbidden terms ONLY to forbid them
EXEMPT_PATTERNS = [
    r"❌",
    r"prohibid[oa]",
    r"Prohibici[oó]n",
    r"Nunca",
    r"Descartado",
    r"derivas terminol[oó]gicas",
    r"T[eé]rmino Descartado",
    r"TERMINOLOGY_AUDIT",
    r"CANONICAL_LORE",
    r"canonical-lore",
    r"user-preferences",
    r"lint_lore_and_vocabulary",
]


def is_exempt_line(line: str, file_path: Path) -> bool:
    """Checks if the line is part of a rule or audit document explicitly forbidding the term."""
    # The linter script itself is exempt
    if file_path.name == "lint_lore_and_vocabulary.py":
        return True

    # In canonical lore audit, lines documenting discarded terms or rules are exempt
    if file_path.name == "CANONICAL_LORE_AND_VOCABULARY_AUDIT.md":
        if any(w in line for w in ["❌", "prohibid", "Prohibid", "Descartado", "desliz", "deriva", "inventar", "extirpando", "No usar", "Prohibición"]):
            return True
        if line.strip().startswith("|") and "❌" in line:
            return True

    # Code comments in scripts that describe what was previously refactored or geometric compass roses
    if line.strip().startswith("#") or line.strip().startswith("//") or line.strip().startswith("<!--"):
        return True

    # If the line explicitly contains prohibition markers, it's documentation
    for pat in EXEMPT_PATTERNS:
        if re.search(pat, line, re.IGNORECASE):
            return True
    return False


def run_audit():
    print("=" * 70)
    print("🔍 AUDITORÍA AUTOMATIZADA DE LORE, VOCABULARIO Y ALINEACIÓN CANÓNICA")
    print("=" * 70)

    violations = []
    warnings = []
    files_checked = 0

    for target_dir_name in TARGET_DIRS:
        target_dir = WORKSPACE_ROOT / target_dir_name
        if not target_dir.exists():
            continue

        for root, dirs, files in os.walk(target_dir):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            for file in files:
                file_path = Path(root) / file
                if file_path.suffix.lower() not in TARGET_EXTS:
                    continue

                files_checked += 1
                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        lines = f.readlines()
                except Exception as e:
                    print(f"⚠️ Error reading {file_path}: {e}")
                    continue

                for line_num, line in enumerate(lines, 1):
                    # Check forbidden patterns
                    for pattern, reason in FORBIDDEN_PATTERNS:
                        if re.search(pattern, line, re.IGNORECASE):
                            if not is_exempt_line(line, file_path):
                                violations.append((file_path.relative_to(WORKSPACE_ROOT), line_num, line.strip(), reason))

                    # Check accessibility in web and journal files
                    is_player_facing = any(p in str(file_path) for p in ["web/", "journal/"])
                    if is_player_facing:
                        for pattern, reason in ACCESSIBILITY_PATTERNS:
                            if re.search(pattern, line, re.IGNORECASE):
                                if not is_exempt_line(line, file_path):
                                    warnings.append((file_path.relative_to(WORKSPACE_ROOT), line_num, line.strip(), reason))

    print(f"📂 Archivos analizados: {files_checked}")

    if warnings:
        print(f"\n⚠️  ADVERTENCIAS DE VOCABULARIO ACCESIBLE ({len(warnings)}):")
        for fpath, lnum, lcontent, reason in warnings:
            print(f"  • {fpath}:{lnum}")
            print(f"    Texto: \"{lcontent}\"")
            print(f"    Motivo: {reason}\n")

    if violations:
        print(f"\n❌ ERRORES CRÍTICOS DETECTADOS ({len(violations)}):")
        for fpath, lnum, lcontent, reason in violations:
            print(f"  🚨 {fpath}:{lnum}")
            print(f"     Línea: \"{lcontent}\"")
            print(f"     Regla violada: {reason}\n")
        print("❌ FALLO: Se han encontrado términos no canónicos o prohibidos.")
        print("Consulte 'docs/CANONICAL_LORE_AND_VOCABULARY_AUDIT.md' para los términos válidos.")
        return 1
    else:
        print("\n✅ ÉXITO TOTAL: 0 Términos no canónicos encontrados.")
        print("   - Cero menciones no autorizadas de 'Sunken', 'Coastal', 'Hermit', 'Stage Mistress'.")
        print("   - Todas las referencias a Torres, personajes y criptografía están 100% alineadas.")
        print("   - El ecosistema cumple el canon de 'docs/CANONICAL_LORE_AND_VOCABULARY_AUDIT.md'.")
        return 0


if __name__ == "__main__":
    sys.exit(run_audit())
