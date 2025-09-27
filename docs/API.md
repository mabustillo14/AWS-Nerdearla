# API Reference

## Clase RockPaperScissorsGame

### Constructor
```javascript
new RockPaperScissorsGame()
```
Inicializa una nueva instancia del juego.

### Métodos Públicos

#### `init()`
```javascript
async init()
```
Inicializa el sistema completo del juego.
- **Retorna**: `Promise<void>`
- **Efectos**: Configura cámara, detección de gestos y event listeners

#### `setGameMode(mode)`
```javascript
setGameMode(mode: 'vs-computer' | 'vs-player')
```
Cambia el modo de juego.
- **Parámetros**:
  - `mode`: Modo de juego deseado
- **Efectos**: Actualiza UI y resetea puntuaciones

#### `playGame()`
```javascript
playGame()
```
Ejecuta una jugada según el modo actual.
- **Precondiciones**: Debe haber un gesto detectado
- **Efectos**: Procesa jugada y actualiza puntuaciones

### Métodos Privados

#### `setupCamera()`
```javascript
async setupCamera()
```
Configura acceso a la cámara web.
- **Retorna**: `Promise<void>`
- **Excepciones**: Error si no hay acceso a cámara

#### `setupHandDetection()`
```javascript
setupHandDetection()
```
Inicializa MediaPipe Hands para detección de gestos.

#### `onResults(results)`
```javascript
onResults(results: MediaPipeResults)
```
Callback para procesar resultados de MediaPipe.
- **Parámetros**:
  - `results`: Resultados de detección de MediaPipe

#### `detectGesture(landmarks)`
```javascript
detectGesture(landmarks: Landmark[]): string | null
```
Detecta el gesto basado en landmarks de la mano.
- **Parámetros**:
  - `landmarks`: Array de 21 puntos de la mano
- **Retorna**: 'Piedra', 'Papel', 'Tijera' o null

#### `determineWinner(player, computer)`
```javascript
determineWinner(player: string, computer: string): string
```
Determina el ganador entre jugador y computadora.
- **Parámetros**:
  - `player`: Elección del jugador
  - `computer`: Elección de la computadora
- **Retorna**: Mensaje del resultado

#### `determineWinnerPvP(player1, player2)`
```javascript
determineWinnerPvP(player1: string, player2: string): string
```
Determina el ganador en modo jugador vs jugador.
- **Parámetros**:
  - `player1`: Elección del jugador 1
  - `player2`: Elección del jugador 2
- **Retorna**: Mensaje del resultado

#### `getEmoji(choice)`
```javascript
getEmoji(choice: string): string
```
Convierte elección a emoji correspondiente.
- **Parámetros**:
  - `choice`: 'Piedra', 'Papel' o 'Tijera'
- **Retorna**: Emoji correspondiente

#### `translateGesture(gesture)`
```javascript
translateGesture(gesture: string): string
```
Traduce gestos del inglés al español.
- **Parámetros**:
  - `gesture`: Gesto en inglés
- **Retorna**: Gesto en español

#### `createSounds()`
```javascript
createSounds(): SoundSystem
```
Crea sistema de sonidos usando Web Audio API.
- **Retorna**: Objeto con funciones de sonido

#### `resetGame()`
```javascript
resetGame()
```
Reinicia el estado del juego.
- **Efectos**: Resetea puntuaciones y estado visual

## Tipos de Datos

### Landmark
```typescript
interface Landmark {
    x: number;  // Coordenada X normalizada (0-1)
    y: number;  // Coordenada Y normalizada (0-1)
    z: number;  // Profundidad relativa
}
```

### MediaPipeResults
```typescript
interface MediaPipeResults {
    multiHandLandmarks?: Landmark[][];
    multiHandedness?: HandednessResult[];
}
```

### SoundSystem
```typescript
interface SoundSystem {
    play: () => void;
    win: () => void;
    lose: () => void;
    tie: () => void;
}
```

## Eventos DOM

### Elementos Interactivos

#### Botones de Modo
```javascript
document.getElementById('vs-computer').addEventListener('click', handler);
document.getElementById('vs-player').addEventListener('click', handler);
```

#### Botón de Jugar
```javascript
document.getElementById('play-btn').addEventListener('click', handler);
```

### Elementos de Estado

#### Video y Canvas
- `#video`: Elemento de video de la cámara
- `#canvas`: Canvas para dibujar landmarks

#### Información del Juego
- `#detected-gesture`: Gesto detectado actual
- `#player-score`: Puntuación del jugador/jugador 1
- `#computer-score`: Puntuación de computadora/jugador 2
- `#player-choice`: Elección del jugador/jugador 1
- `#computer-choice`: Elección de computadora/jugador 2
- `#game-result`: Resultado de la jugada actual

## Constantes

### Índices de Landmarks
```javascript
const FINGER_TIPS = [4, 8, 12, 16, 20];    // Puntas de dedos
const FINGER_PIPS = [3, 6, 10, 14, 18];    // Articulaciones medias
```

### Configuración de MediaPipe
```javascript
const MEDIAPIPE_CONFIG = {
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
};
```

### Configuración de Cámara
```javascript
const CAMERA_CONFIG = {
    width: 640,
    height: 480
};
```