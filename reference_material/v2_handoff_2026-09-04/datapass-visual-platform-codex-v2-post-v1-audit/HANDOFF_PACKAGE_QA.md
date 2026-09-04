# Handoff package QA

This document records QA for the handoff archive itself, not the implementation repository.

Checks to perform before delivery:

- required Markdown/TXT/JSON files present;
- JSON templates parse;
- no source training payloads accidentally copied into the archive;
- no `__pycache__` / `.pyc`;
- SHA256SUMS generated after final content;
- ZIP integrity test passes.

Final packaging checks completed:

- JSON templates parsed successfully.
- File manifest generated.
- SHA-256 manifest generated.
- No `.pyc` or `__pycache__` files are present.
- Archive contains only planning/audit/templates/manifests; no full private training payloads.
