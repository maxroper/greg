# Working in this repo

## Deploys: always push directly to `main`

This repo is wired to **Cloudflare Workers Builds**. Every push to `main`
auto-deploys to production at `greg.4rq8k9tm7t.workers.dev` (and the custom
domain). Pushes to other branches do **not** deploy — they only produce
preview URLs in the Cloudflare dashboard, which Greg never sees.

So when changes are ready to ship: commit and push straight to `main`. Don't
open a PR, don't merge through a feature branch — push to main is the
deploy. From a worktree branch that's a fast `git push origin HEAD:main`.

The user has explicitly authorized this workflow for routine site changes.
Still confirm before pushing anything risky (destructive changes, secrets,
large refactors, anything you'd want a second look at).
