//#region audio manager
const audioManager = {
    synth: null,
    playlist: [],
    currentTrackIndex: 0,
    isPlaying: false,

    async initSynth() {
        if (!this.synth) {
            this.synth = new WebAudioTinySynth({ quality: 0 });
            await this.synth.audioContext.resume();

            console.log("🚀 ~ initSynth ~ userConfig:", userConfig.musicVolume)
            this.synth.setMasterVol(userConfig.musicVolume / 100); // 0.0 to 1.0
            // this.synth.setMasterVol(0.9); // 0.0 to 1.0
            setTimeout(() => {
                for (let ch = 0; ch < 15; ch++) {
                    ch!==9 ?? this.synth.send([0xB0 + ch, 0x07, userConfig.musicVolume]); // e.g., 20–80
                }
            }, 50);
    

            this.synth.setLoop(1);
        }
    },

    async loadPlaylist(midiPaths) {
        this.playlist = midiPaths;
        this.currentTrackIndex = 0;
        await this.initSynth();
    },

    async playNext() {
        if (this.currentTrackIndex >= this.playlist.length) {
            this.isPlaying = false;
            return;
        }

        const midiPath = this.playlist[this.currentTrackIndex];
        const res = await fetch(midiPath);
        const data = await res.arrayBuffer();

        this.synth.loadMIDI(data);
        this.synth.playMIDI();
        this.isPlaying = true;

        this.synth.setMasterVol(userConfig.musicVolume / 100); // 0.0 to 1.0
        // this.synth.setMasterVol(0.9); // 0.0 to 1.0
        setTimeout(() => {
            for (let ch = 0; ch < 15; ch++) {
                ch!==9 ?? this.synth.send([0xB0 + ch, 0x07, userConfig.musicVolume]); // e.g., 20–80
            }
        }, 50);

        // Check periodically if the track is still playing
        const checkIfEnded = () => {
            if (!this.synth.playing) {
                this.currentTrackIndex++;
                this.playNext();
            } else {
                setTimeout(checkIfEnded, 1000);
            }
        };

        setTimeout(checkIfEnded, 1000);
    },

    startPlaylist(shuffle = false, force = false) {
        if (shuffle && Array.isArray(this.playlist)) {
            this.playlist = this.playlist
                .map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value);
        }
    
        if ((force || !this.isPlaying) && this.playlist.length > 0) {
            this.isPlaying = false; // reset so playNext will go
            this.playNext();
        }
    },

    stop() {
        if (this.synth) {
            this.synth.stopMIDI();
            this.isPlaying = false;
        }
    },

    fadeVolume(toVolume, duration = 1000) {
        if (!this.synth || !this.synth.audioContext) return;
    
        const currentVol = this.synth.masterVol || 0;
        const targetVol = Math.max(0, Math.min(1, toVolume)); // clamp between 0 and 1
        const steps = 30;
        const stepTime = duration / steps;
        let step = 0;
    
        const delta = (targetVol - currentVol) / steps;
    
        const fade = () => {
            step++;
            const newVol = currentVol + delta * step;
            this.synth.setMasterVol(newVol);
            if (step < steps) {
                setTimeout(fade, stepTime);
            }
        };
    
        fade();
    }
    
};
//#endregion

//#region sound effect functions
//play .ogg sound
function playSFX(path) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    fetch(path)
        .then(res => res.arrayBuffer())
        .then(buffer => audioCtx.decodeAudioData(buffer))
        .then(decoded => {
            const src = audioCtx.createBufferSource();
            src.buffer = decoded;
            src.connect(audioCtx.destination);
            src.start();
        }
    );
}
//#endregion