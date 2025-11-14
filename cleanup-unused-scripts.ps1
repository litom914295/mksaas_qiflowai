# 批量删除未使用的 scripts 文件
# Phase 2 - 清理未使用代码

# 需要保留的脚本（在 package.json 中引用的）
$keep_scripts = @(
    "fast-dev.js",
    "dev-optimize.js",
    "analyze-bundle.js",
    "list-contacts.ts",
    "list-users.ts",
    "add-test-credits.ts",
    "add-demo-credits.ts",
    "verify-credits-consistency.ts",
    "validate-i18n.ts",
    "merge-and-normalize-i18n.ts",
    "sync-base-from-locales.ts",
    "merge-en-from-qiflow.ts",
    "sync-extra-keys-to-en.ts",
    "replace-todo-placeholders.ts",
    "translate-todos-from-zh.ts",
    "translate-remaining-todos.ts",
    "seed-admin.ts",
    "backup-database.ts",
    "verify-brand.ps1",
    "test-embedding-config.ts",
    "monitor-ai-costs.ts",
    "check-knowledge-base.ts",
    "ingest-knowledge-base.ts",
    "toggle-registration.ts"
)

# 获取所有未使用的 scripts 文件
$unused = @(
    "add-all-form-translations.js",
    "add-complete-i18n.js",
    "add-credits-by-id.ts",
    "add-form-namespace.js",
    "add-hero-translations.js",
    "add-professional-terms-translations.js",
    "add-qiflow-translations.js",
    "apply-all-translations.ts",
    "apply-knowledge-base-migration.ts",
    "apply-translations-zh-CN.ts",
    "browser-console-tests.js",
    "check-and-apply-migrations.ts",
    "check-task-status.js",
    "comprehensive-system-test.ts",
    "create-admin-complete.ts",
    "create-admin-simple.ts",
    "create-admin-via-api.ts",
    "create-auth-tables.js",
    "create-test-user.mjs",
    "create-test-user.ts",
    "create-via-better-auth-api.ts",
    "debug-login.ts",
    "diagnose-database.ts",
    "diagnose.js",
    "e2e-test-integration.ts",
    "exec-init-sql.ts",
    "export-sample-pdf.ts",
    "extract-placeholders.ts",
    "fill-i18n-keys.ts",
    "final-system-test.ts",
    "fix-admin-password.ts",
    "fix-auth-complete.ts",
    "fix-existing-payments.ts",
    "fix-high-priority-pages.js",
    "fix-home-pricing-translations.js",
    "fix-home-trust-translations.js",
    "fix-i18n-issues.ts",
    "fix-ms-my-translations.js",
    "fix-provider-ids.ts",
    "fix-remaining-form-keys.js",
    "fix-supabase-connection.ts",
    "fix-user-credits.ts",
    "generate-embedding.ts",
    "generate-local-certs.sh",
    "generate-logo-sample.js",
    "generate-pages.ts",
    "i18n-audit-fix.js",
    "import-knowledge-base.ts",
    "init-better-auth.ts",
    "init-database.ts",
    "init-supabase-db.ts",
    "install-git-hooks.ps1",
    "lint-errors-fix.js",
    "list-i18n-coverage.ts",
    "list-namespaces.ts",
    "list-unlinked-files.ts",
    "migrate-brand-to-qiflowai.ps1",
    "migrate-to-better-auth.ts",
    "normalize-i18n-files.ts",
    "optimize-database-indexes.sql",
    "parse-and-translate.ts",
    "populate-i18n-urls.ts",
    "process-and-split-locale.ts",
    "pull-qiflow-translations.ts",
    "push-sample-translations.ts",
    "remove-unused-keys.ts",
    "reset-admin-password.ts",
    "run-all-tests.sh",
    "run-ci-tests.sh",
    "run-e2e-tests.sh",
    "run-phase8-migration.ts",
    "run-tests.sh",
    "seed-rbac.ts",
    "setup-git-hooks.js",
    "sort-i18n-keys.ts",
    "sync-base-to-locales.ts",
    "sync-from-base.ts",
    "sync-i18n-namespaces.ts",
    "sync-i18n-structure.ts",
    "sync-namespaces.ts",
    "test-admin-login.mjs",
    "test-admin-login.ts",
    "test-ai-stream.ts",
    "test-auth-api.ts",
    "test-credits.ts",
    "test-db-connection.mjs",
    "test-db.mjs",
    "test-embedding-vectors.ts",
    "test-env-loading.mjs",
    "test-i18n-keys.ts",
    "test-supabase.ts",
    "test-user-creation.mjs",
    "translate-locales.ts",
    "update-all-translations.ts",
    "update-home-links.ts",
    "verify-better-auth.ts",
    "verify-i18n-coverage.ts",
    "verify-qiflow-translations.ts"
)

Write-Host "准备删除 $($unused.Count) 个未使用的 scripts 文件..." -ForegroundColor Yellow
Write-Host ""

$deleted_count = 0
$not_found_count = 0

foreach ($file in $unused) {
    $path = "scripts\$file"
    if (Test-Path $path) {
        try {
            Remove-Item $path -Force
            Write-Host "[OK] 删除: $file" -ForegroundColor Green
            $deleted_count++
        } catch {
            Write-Host "[ERROR] 无法删除: $file - $_" -ForegroundColor Red
        }
    } else {
        $not_found_count++
    }
}

Write-Host ""
Write-Host "=========== 清理完成 ===========" -ForegroundColor Cyan
Write-Host "删除文件数: $deleted_count" -ForegroundColor Green
Write-Host "未找到文件数: $not_found_count" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Cyan
