import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MetronomeWorkerMessage } from "../../types/metronome.types";
import {Button} from "../ui/button";

type Props = {
  startBpm?: number;
  minBpm?: number;
  maxBpm?: number;
  volume?: number;
  frequency?: number;
  denominator?: number;
};

const Metronome: React.FC<Props> = ({
  maxBpm = 240,
  minBpm = 40,
  startBpm = 120,
  volume = 0.1,
  frequency = 440.0,
  denominator = 6,
}) => {
  const metronomeWorker: Worker = useMemo(
    () => new Worker(new URL("../../sw/metronome.ts", import.meta.url)),
    [],
  );

  const firstBeatFrequency = useMemo(() => frequency * 1.5, [frequency]);

  const [secondsPerBeat, setSecondsPerBeat] = useState(60.0 / startBpm);
  const [nextNoteTime, setNextNoteTime] = useState(0.1);

  const [bpm, setBpm] = useState(startBpm);
  const [playing, setPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

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
    } else {
      console.log("Should click");
      console.log({ audioContext });
      click();
    }

    setPlaying(!playing);
  };

  useEffect(() => {}, [audioContext, volumeNode]);

  const nextBeat = useMemo(
    () => (currentBeat % denominator) + 1,
    [currentBeat, denominator],
  );

  const click = useCallback(() => {
    if (!audioContext || !volumeNode) return;
    const osc = audioContext.createOscillator();
    osc.connect(volumeNode);
    osc.frequency.value = nextBeat === 1 ? firstBeatFrequency : frequency;

    console.log(nextBeat === 1 ? "Bip" : "Bop");
    osc.start(nextNoteTime);

    osc.stop(nextNoteTime + 0.075);
    setCurrentBeat(nextBeat);
  }, [audioContext, volumeNode, nextBeat, nextNoteTime, firstBeatFrequency]);

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
    <div>
      <Button onClick={handlePlayPause}>{!playing ? "Play" : "Stop"}</Button>
      <p>{currentBeat}</p>
      <p>
        {JSON.stringify({
          nextNoteTime,
          ctxCurrTime: audioContext?.currentTime,
          currentBeat,
        })}
      </p>
    </div>
  );
};

export default Metronome;
