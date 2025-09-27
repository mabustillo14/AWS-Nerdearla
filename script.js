class RockPaperScissorsGame {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.detectedGesture = document.getElementById('detected-gesture');
        this.playerScore = document.getElementById('player-score');
        this.computerScore = document.getElementById('computer-score');
        this.playerChoice = document.getElementById('player-choice');
        this.computerChoice = document.getElementById('computer-choice');
        this.gameResult = document.getElementById('game-result');
        this.playBtn = document.getElementById('play-btn');
        
        this.scores = { player: 0, computer: 0 };
        this.currentGesture = null;
        this.hands = null;
        this.camera = null;
        this.sounds = this.createSounds();
        
        this.init();
    }
    
    async init() {
        await this.setupCamera();
        this.setupHandDetection();
        this.setupEventListeners();
    }
    
    async setupCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 } 
            });
            this.video.srcObject = stream;
            
            this.video.addEventListener('loadedmetadata', () => {
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
            });
        } catch (error) {
            console.error('Camera access denied:', error);
            this.gameResult.textContent = '¡Se requiere acceso a la cámara para jugar!';
        }
    }
    
    setupHandDetection() {
        this.hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });
        
        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        
        this.hands.onResults(this.onResults.bind(this));
        
        this.camera = new Camera(this.video, {
            onFrame: async () => {
                await this.hands.send({ image: this.video });
            },
            width: 640,
            height: 480
        });
        
        this.camera.start();
    }
    
    onResults(results) {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            this.drawLandmarks(landmarks);
            this.currentGesture = this.detectGesture(landmarks);
            this.detectedGesture.textContent = this.translateGesture(this.currentGesture) || 'Desconocido';
            this.playBtn.disabled = !this.currentGesture;
            this.playBtn.textContent = this.currentGesture ? '¡Jugar!' : 'Muestra tu mano';
        } else {
            this.currentGesture = null;
            this.detectedGesture.textContent = 'Ninguna';
            this.playBtn.disabled = true;
            this.playBtn.textContent = 'Muestra tu mano';
        }
        
        this.ctx.restore();
    }
    
    drawLandmarks(landmarks) {
        this.ctx.fillStyle = '#FF0000';
        this.ctx.strokeStyle = '#00FF00';
        this.ctx.lineWidth = 2;
        
        for (const landmark of landmarks) {
            const x = landmark.x * this.canvas.width;
            const y = landmark.y * this.canvas.height;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }
    
    detectGesture(landmarks) {
        const fingerTips = [4, 8, 12, 16, 20];
        const fingerPips = [3, 6, 10, 14, 18];
        
        let extendedFingers = 0;
        
        // Thumb (different logic due to orientation)
        if (landmarks[fingerTips[0]].x > landmarks[fingerPips[0]].x) {
            extendedFingers++;
        }
        
        // Other fingers
        for (let i = 1; i < 5; i++) {
            if (landmarks[fingerTips[i]].y < landmarks[fingerPips[i]].y) {
                extendedFingers++;
            }
        }
        
        // Gesture detection
        if (extendedFingers === 0) return 'Piedra';
        if (extendedFingers === 2 && 
            landmarks[8].y < landmarks[6].y && 
            landmarks[12].y < landmarks[10].y) return 'Tijera';
        if (extendedFingers === 5) return 'Papel';
        
        return null;
    }
    
    setupEventListeners() {
        this.playBtn.addEventListener('click', () => this.playGame());
    }
    
    playGame() {
        if (!this.currentGesture) return;
        
        const choices = ['Piedra', 'Papel', 'Tijera'];
        const computerChoice = choices[Math.floor(Math.random() * 3)];
        
        this.sounds.play.play();
        
        this.playerChoice.textContent = this.getEmoji(this.currentGesture);
        this.computerChoice.textContent = this.getEmoji(computerChoice);
        
        const result = this.determineWinner(this.currentGesture, computerChoice);
        this.gameResult.textContent = result;
        
        if (result.includes('Ganaste')) {
            this.scores.player++;
            this.playerScore.textContent = this.scores.player;
            this.sounds.win.play();
        } else if (result.includes('La computadora gana')) {
            this.scores.computer++;
            this.computerScore.textContent = this.scores.computer;
            this.sounds.lose.play();
        } else {
            this.sounds.tie.play();
        }
    }
    
    determineWinner(player, computer) {
        if (player === computer) return "¡Es un empate!";
        
        const winConditions = {
            'Piedra': 'Tijera',
            'Papel': 'Piedra',
            'Tijera': 'Papel'
        };
        
        return winConditions[player] === computer ? 
            `¡Ganaste! ${player} vence a ${computer}` : 
            `¡La computadora gana! ${computer} vence a ${player}`;
    }
    
    getEmoji(choice) {
        const emojis = {
            'Piedra': '🪨',
            'Papel': '📄',
            'Tijera': '✂️'
        };
        return emojis[choice] || '?';
    }
    
    translateGesture(gesture) {
        const translations = {
            'Rock': 'Piedra',
            'Paper': 'Papel',
            'Scissors': 'Tijera'
        };
        return translations[gesture] || gesture;
    }
    
    createSounds() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        const createTone = (frequency, duration, type = 'sine') => {
            return () => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
                oscillator.type = type;
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            };
        };
        
        return {
            play: createTone(440, 0.2),
            win: createTone(523, 0.5),
            lose: createTone(220, 0.5),
            tie: createTone(330, 0.3)
        };
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new RockPaperScissorsGame();
});