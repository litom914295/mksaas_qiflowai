# qiflow-ai -> MKSaaS mapping (static)
- algorithms: qiflow-ai/lib/** -> src/lib/qiflow/**
- ui-components: qiflow-ai/components/** -> src/components/qiflow/**
- server/actions: qiflow-ai/(api|server|actions)/** -> src/actions/qiflow/** or app/api/**
- app routes (App Router + i18n): qiflow-ai/app/** -> src/app/[locale]/(dashboard|analysis)/**
- database: schema fragments -> src/db/schema-qiflow.ts and export via src/db/index.ts
