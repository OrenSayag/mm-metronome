import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  MetronomeWorkerMessage,
  TAutoTempoIncreaseConfig,
  TMuteConfig,
} from "../../types/metronome.types";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { cn } from "../../lib/utils";
import TimeSignature, { TTimeSignature } from "../metronome/time-signature";
import MuteConfig from "../../components/metronome/mute-config";
import AutoTempoChange from "../../components/metronome/auto-tempo-change";

type Props = {
  startBpm?: number;
  minBpm?: number;
  maxBpm?: number;
  volume?: number;
  frequency?: number;
  className?: string;
};

const Metronome: React.FC<Props> = ({
  maxBpm = 240,
  minBpm = 40,
  startBpm = 120,
  volume = 0.1,
  frequency = 440.0,
  className,
}) => {
  const metronomeWorker: Worker = useMemo(
    () => new Worker(new URL("../../sw/metronome.ts", import.meta.url)),
    [],
  );

  const firstBeatFrequency = useMemo(() => frequency * 1.5, [frequency]);

  const [bpm, setBpm] = useState(startBpm);

  const [nextNoteTime, setNextNoteTime] = useState(0.1);

  const [mute, setMute] = useState<TMuteConfig | undefined>();

  const [autoTempoChange, setAutoTempoIncrease] =
    useState<TAutoTempoIncreaseConfig>({
      active: false,
      perMeasures: 1,
      step: 5,
      direction: "increase",
    });

  const [playing, setPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const [timeSignature, setTimeSignature] = useState({
    numerator: 4,
    denominator: 4,
  } as TTimeSignature);

  const secondsPerBeat = useMemo(
    () => (60.0 / bpm) * (4 / timeSignature.denominator),
    [bpm, timeSignature.denominator],
  );

  const volumeNode = useMemo(() => {
    if (!audioContext) return;
    const node = audioContext.createGain();
    node.gain.value = volume;
    node.connect(audioContext.destination);
    return node;
  }, [audioContext, volume]);

  const initAudio = () => {
    const ctx = new AudioContext();
    setAudioContext(ctx);
    const source = ctx.createBufferSource();
    source.buffer = ctx.createBuffer(1, 1, 22050);
    source.start(0);
    return ctx;
  };

  const handlePlayPause = () => {
    let ctx;
    // if the audio context hasn't been created, we need to set it up
    // we must create the audio context after a user gesture (browser autoplay policy)
    if (audioContext == null) {
      ctx = initAudio();
    }

    // start or stop the interval loop in the worker
    metronomeWorker.postMessage({
      message: !playing
        ? MetronomeWorkerMessage.START
        : MetronomeWorkerMessage.STOP,
    });

    // update the state so the play/pause icon re-renders
    if (playing) {
      setCurrentBeat(0);
      setNextNoteTime(0.1);
      setAudioContext(null);
      setBeatCount(0);
    } else {
      console.log("Should click");
      console.log({ audioContext });
      click();
    }

    setPlaying(!playing);
  };

  const nextBeat = useMemo(
    () =>
      currentBeat <
      (timeSignature.numerator > timeSignature.denominator
        ? Math.max(timeSignature.numerator, timeSignature.denominator)
        : timeSignature.numerator)
        ? (currentBeat %
            Math.max(timeSignature.numerator, timeSignature.denominator)) +
          1
        : 1,
    [currentBeat, timeSignature],
  );

  const [beatCount, setBeatCount] = useState(0);

  const currentMeasure = useMemo(
    () => Math.floor(beatCount / timeSignature.numerator),
    [beatCount, timeSignature],
  );

  const latestMeasure = useMemo(
    () => Math.floor((beatCount - 1) / timeSignature.numerator),
    [beatCount, timeSignature],
  );

  useEffect(() => {
    const { step, perMeasures, direction, active, random } = autoTempoChange;
    const finalStep = random ? Math.floor(Math.random() * 50) + 1 : step;
    if (!active || latestMeasure < 1) return;
    const _perMeasures =
      perMeasures === "random"
        ? Math.floor(Math.random() * 4) + 1
        : perMeasures;
    if (latestMeasure % _perMeasures === 0) {
      if (direction === "random") {
        setBpm((prevState) =>
          Math.random() > 0.5 ? prevState + finalStep : prevState - finalStep,
        );
      } else if (direction === "increase") {
        setBpm((prevState) => prevState + finalStep);
      } else {
        setBpm((prevState) => prevState - finalStep);
      }
    }
  }, [autoTempoChange, latestMeasure]);

  const shouldMute = useMemo(() => {
    if (!mute?.isMute) return false;
    if (
      currentMeasure + 1 > mute!.per &&
      currentMeasure + 1 <= mute!.per + mute!.muteAmount
    )
      return true;
    if (mute!.per + mute!.muteAmount <= currentMeasure + 1) {
      setBeatCount(0);
      return false;
    }
  }, [mute, currentMeasure]);

  useEffect(() => {
    if (mute?.isMute) {
      setBeatCount(currentBeat);
    }
  }, [mute]);

  const click = useCallback(() => {
    if (!audioContext || !volumeNode) return;
    const osc = audioContext.createOscillator();
    osc.connect(volumeNode);
    osc.frequency.value = nextBeat === 1 ? firstBeatFrequency : frequency;

    console.log(nextBeat === 1 ? "Bip" : "Bop");

    if (!shouldMute) {
      osc.start(nextNoteTime);
      osc.stop(nextNoteTime + 0.075);
    }

    setCurrentBeat(nextBeat);
    setBeatCount((prevState) => prevState + 1);
  }, [
    audioContext,
    volumeNode,
    nextBeat,
    nextNoteTime,
    firstBeatFrequency,
    beatCount,
    shouldMute,
  ]);

  const tick = useCallback(() => {
    if (!audioContext || !volumeNode) return;
    if (nextNoteTime < audioContext.currentTime + 0.1) {
      click();
      setNextNoteTime((prevState) => prevState + secondsPerBeat);
    }
  }, [audioContext, volumeNode, nextNoteTime, currentBeat]);

  useEffect(() => {
    if (window.Worker) {
      metronomeWorker.onmessage = ({ data }) => {
        data === "tick" && tick();
      };
    }
  }, [tick]);

  useEffect(() => {
    console.log({ playing });
  }, [playing]);

  return (
    <div
      className={cn(
        "flex items-center justify-center min-h-24 flex flex-col gap-3 p-6 w-fit",
        className,
      )}
    >
      <Button onClick={handlePlayPause}>{!playing ? "Play" : "Stop"}</Button>
      <p>{currentBeat}</p>
      <p>{bpm} BPM</p>
      <Slider
        className={"w-48"}
        max={maxBpm}
        step={1}
        defaultValue={[startBpm]}
        value={[bpm]}
        onValueChange={([value]: number[]) => setBpm(value)}
      />
      <TimeSignature
        signature={timeSignature}
        onValueChange={(v: TTimeSignature) => {
          console.log({ v });
          setTimeSignature(v);
        }}
      />
      <MuteConfig
        onValueChange={(config: TMuteConfig | undefined) => setMute(config)}
        config={mute}
      />
      <AutoTempoChange
        config={autoTempoChange}
        onValueChange={(v: TAutoTempoIncreaseConfig) => setAutoTempoIncrease(v)}
      />
      {/*{JSON.stringify({*/}
      {/*  beatCount,*/}
      {/*  currentMeasure,*/}
      {/*  perAndMute: mute!.per + mute!.muteAmount,*/}
      {/*})}*/}
    </div>
  );
};

export default Metronome;
