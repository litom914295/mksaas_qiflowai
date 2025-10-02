import { MasterOrchestrator } from '@/lib/ai/master-orchestrator';
import { RateLimiter } from '@/lib/ai/providers/rate-limit';

const orchestrator = new MasterOrchestrator();
const rateLimiter = new RateLimiter();

export { orchestrator, rateLimiter };
