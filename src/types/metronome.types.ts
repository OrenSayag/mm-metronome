export enum MetronomeWorkerMessage {
  START = "start",
  STOP = "stop",
  INTERVAL = "interval",
  CLOSE = "close",
}

export type TMuteConfig = { muteAmount: number; per: number; isMute: boolean };

export type TAutoTempoIncreaseConfig = {
  direction: "increase" | "decrease" | "random";
  random?: boolean;
  step: number;
  perMeasures: number | "random";
  active: boolean;
};
