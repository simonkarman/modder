import { ProjectionModel } from '@krmx/state';

export const gameModel = new ProjectionModel(
  { state: 0 },
  state => state,
);
