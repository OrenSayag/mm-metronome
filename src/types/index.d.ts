export {};

declare global {
    interface Window {
        timerID: Timer | null;
        interval: number;
        start: ()=>void;
        stop: ()=>void;
        tick: ()=>void;
        changeInterval: (interval: number)=>void;
    }
}
