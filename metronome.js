const MInstrument = function (toneIndex, tempo) {
    this.instrument = new Instrument();
    this.toneIndex = toneIndex;
    this.tone = Metronome.fullScale[toneIndex];
    this.tempo = tempo;

    if(this.toneIndex === 0) {
        this.instrument.on('noteon', function () {
            Metronome.visualization.active = true;
        });
    }

    this.play = function () {
        let tones = this.tone.value.repeat(9999);
        this.instrument.play({tempo: this.tempo}, tones);
    };

    this.stop = function () {
        this.instrument.silence();
    };
};

const MConcentricCircles = function (toneCount, tempoMin, tempoStep) {
    this.frameCounter = 0;
    this.colors = [];
    this.radii = [];
    this.offsets = [];
    this.beatLengths = [];
    this.graphics = new PIXI.Graphics();
    this.startTime = Date.now();
    this.active = false;
    Metronome.pixiApp.stage.addChild(this.graphics);

    let offsetX = Metronome.stageSize / 2;
    let offsetY = Metronome.stageSize / 2;
    let maxRadius = (Metronome.stageSize - 20) / 2;
    for (let i = 0; i < toneCount; i++) {
        let h = i * (360.0 / toneCount);
        let hex = Metronome.hslToHex(h, 100, 50);
        this.colors.push(hex);
        let offset = i * 15;
        this.offsets.push(offset);
        let radius = maxRadius - offset;
        this.radii.push(radius);
        let beatsPerMinute = tempoMin + (i * tempoStep);
        let beatsPerSecond = beatsPerMinute / 60;
        let beatLengthS = 1 / beatsPerSecond;
        let beatLengthMS = beatLengthS * 1000;
        this.beatLengths.push(beatLengthMS);
    }

    this.renderFrame = function () {
        this.graphics.clear();
        let offsetMS = -300;
        if (this.startTime === null) {
            this.startTime = Date.now() + offsetMS;
        } else {
            this.frameCounter = Date.now() - this.startTime + offsetMS;
        }

        for (let i = 0; i < toneCount; i++) {
            let frame = this.frameCounter % this.beatLengths[i];
            let alpha = 1.0 - (frame / 500);
            if (i === 0) {
                // console.log(`Frame: ${frame} Alpha: ${alpha}`);
            }
            this.graphics.lineStyle(3, this.colors[i], alpha);
            this.graphics.drawCircle(offsetX, offsetY, this.radii[i]);
        }
    };
}

window.Metronome = {
    stageSize: 400,
    init: function () {
        console.log("Initialized!");
        Metronome.pixiApp = new PIXI.Application({ antialias: true, width: Metronome.stageSize, height: Metronome.stageSize, backgroundColor: 0x000000, resolution: window.devicePixelRatio || 1 });
        document.getElementById("stage").appendChild(Metronome.pixiApp.view);
    },
    start: function () {
        let minToneIndex = 0;
        let toneCount = 20;
        let tempo = 40;
        let tempoStep = 1;

        Metronome.visualization = new MConcentricCircles(toneCount, tempo, tempoStep);

        for (let i = minToneIndex; i < (minToneIndex + toneCount); i++) {
            let mInstrument = new MInstrument(i, tempo);
            mInstrument.play();
            Metronome.instruments.push(mInstrument);
            tempo += tempoStep;
        }
        Metronome.pixiApp.ticker.add(Metronome.visualizationTicker);
    },
    stop: function(){
        for (let i = 0; i < Metronome.instruments.length; i++) {
            Metronome.instruments[i].stop();
        }
        Metronome.instruments = [];
        Metronome.pixiApp.ticker.stop();
        Metronome.pixiApp.ticker.remove(Metronome.visualizationTicker);
    },
    pixiApp: null,
    visualization: null,
    visualizationTicker: function (delta) {
        Metronome.visualization.renderFrame();
    },
    instruments: [],
    startInstrument: function (toneIndex, tempo) {
        let instrument = new Instrument();
        let tone = Metronome.fullScale[toneIndex];
        let tones = tone.tone.repeat(9999);
        Metronome.instruments.push({
            instrument: instrument,
            tempo: tempo,
            downBeat: true,
            visual: Metronome.visualizations.concentricCircles(toneIndex)
        });
        instrument.play({tempo: tempo}, tones);
    },
    fullScale: [
        {
            name: "C1",
            value: "C,"
        },
        {
            name: "D1",
            value: "D,"
        },
        {
            name: "E1",
            value: "E,"
        },
        {
            name: "F1",
            value: "F,"
        },
        {
            name: "G1",
            value: "G,"
        },
        {
            name: "A1",
            value: "A,"
        },
        {
            name: "B1",
            value: "B,"
        },
        {
            name: "C2",
            value: "C"
        },
        {
            name: "D2",
            value: "D"
        },
        {
            name: "E2",
            value: "E"
        },
        {
            name: "F2",
            value: "F"
        },
        {
            name: "G2",
            value: "G"
        },
        {
            name: "A2",
            value: "A"
        },
        {
            name: "B2",
            value: "B"
        },
        {
            name: "C3",
            value: "c"
        },
        {
            name: "D3",
            value: "d"
        },
        {
            name: "E3",
            value: "e"
        },
        {
            name: "F3",
            value: "f"
        },
        {
            name: "G3",
            value: "g"
        },
        {
            name: "A3",
            value: "a"
        },
        {
            name: "B3",
            value: "b"
        },
        {
            name: "C4",
            value: "c'"
        },
        {
            name: "D4",
            value: "d'"
        },
        {
            name: "E4",
            value: "e'"
        },
        {
            name: "F4",
            value: "f'"
        },
        {
            name: "G4",
            value: "g'"
        },
        {
            name: "A4",
            value: "a'"
        },
        {
            name: "B4",
            value: "b'"
        }
    ],
    hslToHex: function (h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
        };
        return `0x${f(0)}${f(8)}${f(4)}`;
    },
    hslToDecimal: function (h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color);
        };
        return f(0) + f(8) + f(4);
    },
    visualizations: {
        concentricCircles: function (toneIndex) {
            if (toneIndex === 0) {
                let circle = new PIXI.Graphics();
                circle.lineStyle(2, 0xFF0000);
                circle.drawCircle(100, 100, 25);
                Metronome.pixiApp.stage.addChild(circle);
                return {

                }
            }
            return null;
        }
    }
};