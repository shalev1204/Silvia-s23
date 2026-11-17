"""Run scripts/audit/web_smoke.py on another port (when another checkout's smoke holds 8799). In-process only (--jobs 1).
Usage: python3 scratch/utils/smoke_on_port.py PORT --only a,b"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "scripts", "audit"))
import web_smoke as W  # noqa: E402
port = int(sys.argv.pop(1))
W.PORT, W.BASE = port, f"http://127.0.0.1:{port}"
W.start_server.__defaults__ = (port,) + tuple(W.start_server.__defaults__[1:])
sys.argv += ["--jobs", "1"]
sys.exit(W.main())
