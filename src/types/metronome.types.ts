export enum MetronomeWorkerMessage {
  START = "start",
  STOP = "stop",
  INTERVAL = "interval",
  CLOSE = "close",
}

export type TMuteConfig = { muteAmount: number; per: number; isMute: boolean };
