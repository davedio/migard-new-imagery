# Midgard Design Handoffs

This folder stores Claude Design exports before they are incorporated into the
production Next.js app. Each export should remain reviewable on GitHub so the
raw design package stays available even if later implementation branches change.

## Shared Files

Exact duplicate images and style tokens live once in `shared-assets/` and
`shared-styles/`. The original package paths are preserved with symlinks so the
Claude Design previews can still resolve their expected relative URLs.
