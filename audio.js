const audioManager = {
    synth: null,
    playlist: [],
    currentTrackIndex: 0,
    isPlaying: false,

    async initSynth() {
        if (!this.synth) {
            this.synth = new WebAudioTinySynth({ quality: 0 });
            await this.synth.audioContext.resume();
            this.synth.setMasterVol(0.5 * (userConfig.musicVolume / 100));
            this.synth.setLoop(0); // No loop for individual tracks
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