import { DeclinationProvider } from './declination';
import { fuseSamples, SensorSample } from './sensor-fusion';

export type TrueNorthContext = {
  location: { lat: number; lon: number };
  observedAt: Date;
  samples: SensorSample[];
};

export async function measureFacingTrueNorthDegrees(
  ctx: TrueNorthContext,
  declProvider: DeclinationProvider,
): Promise<{ facingDeg: number; declinationDeg: number; quality: number }> {
  const decl = await declProvider.getDeclinationDeg(ctx.location.lat, ctx.location.lon, ctx.observedAt);
  const state = fuseSamples(ctx.samples, decl);
  return { facingDeg: state.yawDeg, declinationDeg: decl, quality: state.quality };
}


