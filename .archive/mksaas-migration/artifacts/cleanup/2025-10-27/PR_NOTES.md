# Cleanup PR Notes - 2025-10-27

Scope:
- Move unused Tailark preview pages (81 files) and toolbar to `.attic/2025-10-27/`
- Keep runtime-safe: no external references detected to `components/tailark/preview`
- Ancillary fixes: icon registry fallbacks; removed non-existent `showAuthButtons`; moved `next.config.backup.ts` to attic

Verification:
- Quick reference scan: no imports of `components/tailark/preview` in `src`/`app`
- Type check snapshot: 47 TS errors remain (unrelated to these moved files); tracked in task #20

Rollback:
- To restore any file: `git mv .attic/2025-10-27/<path> <path>` and commit
- To revert entire batch: `git revert 120c51d`

Follow-ups:
- Proceed with #20 TS fixes; then #21 full green; finally raise PR for review (#22)
