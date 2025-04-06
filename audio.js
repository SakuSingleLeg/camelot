const audioManager = {
    synth: null,
  
    async playMIDI(midiPath) {
        if (this.synth) return; // already initialized
    
        this.synth = new WebAudioTinySynth({ quality: 1 });
        await this.synth.audioContext.resume();
    
        const res = await fetch(midiPath);
        const data = await res.arrayBuffer();
        
        this.synth.setMasterVol(0.5*(userConfig.musicVolume/100))
        this.synth.loadMIDI(data);
        this.synth.playMIDI();
    },
  
    stop() {
        if (this.synth) {
            this.synth.stopMIDI();
        }
    }
};