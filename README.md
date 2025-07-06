(cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF'
diff --git a/SETUP_INSTRUCTIONS.md b/SETUP_INSTRUCTIONS.md
EOF
)
