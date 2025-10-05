## Flying Star 使用示例（MVP）

```ts
import { generateFlyingStar, getConfig } from './index';

const out = generateFlyingStar({
  observedAt: new Date('2024-06-01T12:00:00Z'),
  facing: { degrees: 135 },
  config: getConfig({ applyTiGua: true })
});

console.log(out.period, out.meta);
```

边界样例：
```ts
// 九运切换年附近（±15天）会标记 ambiguous
generateFlyingStar({ observedAt: new Date('1884-01-05T00:00:00Z'), facing: { degrees: 10 } });
```


