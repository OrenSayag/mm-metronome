/* eslint-disable no-restricted-globals */

import { MetronomeWorkerMessage } from "../types/metronome.types";

// the timer ID of the interval
self.timerID = null;

// the interval time in milliseconds
self.interval = 100;

// event handler for Worker.postMessage
self.onmessage = ({ data }) => {
  switch (data.message) {
    case MetronomeWorkerMessage.START:
      self.start();
      break;
    case MetronomeWorkerMessage.STOP:
      self.stop();
      break;
    case MetronomeWorkerMessage.INTERVAL:
      self.changeInterval(data.interval);
      break;
    case MetronomeWorkerMessage.CLOSE:
      self.stop();
      self.close();
      break;
  }
};

// starts the timer
self.start = () => {
  self.timerID = setInterval(self.tick, self.interval);
};

// stops the interval
self.stop = () => {
  clearInterval(self.timerID);
  self.timerID = null;
};

// stops the timer, changes the interval and starts timer again
self.changeInterval = (interval) => {
  self.interval = interval;
  if (self.timerID) {
    self.stop();
    self.start();
  }
};

// posts the tick message
self.tick = () => {
  postMessage("tick");
};
