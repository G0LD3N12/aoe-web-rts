# Age of Empires Web RTS — Stack & Scaffold

Un motor RTS web isométrico 2.5D inspirado en los gráficos y mecánicas clásicas de **Age of Empires** (AoE II).

## 🚀 Tech Stack

- **Motor de Render:** [PixiJS v8](https://pixijs.com/) — Renderizado WebGL/WebGPU 2D de alto rendimiento con batching de sprites isométricos, profundidad Y-sorting y 60 FPS estables.
- **Entorno & Build:** [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/) — Hot Module Replacement (HMR) ultrarrápido y tipado estricto.
- **Audio:** Web Audio API sintético en tiempo real (`SoundFX.ts`) — Efectos de sonido clásicos de RTS (selección, órdenes de marcha, tala de madera, construcción) sin dependencias pesadas.
- **Interfaz (HUD):** HTML5 + CSS temático de Age of Empires con barra superior de recursos, minimapa interactivo y panel inferior de comandos.

---

## 🏗️ Arquitectura del Scaffold

```text
src/
├── main.ts                    # Bootstrap, loop de juego y orquestación
├── style.css                  # Estilos visuales del HUD estilo Age of Empires
├── engine/
│   ├── Isometric.ts           # Proyección isométrica 2:1 (screenToGrid / gridToScreen)
│   ├── Camera.ts              # Cámara RTS: paneo por bordes, WASD/flechas, arrastre y zoom
│   ├── WorldMap.ts            # Cuadrícula de terreno (Hierba, Tierra, Agua) y navegabilidad
│   ├── Pathfinding.ts         # Algoritmo A* en 8 direcciones con waypoints
│   ├── SoundFX.ts             # Sintetizador de efectos de sonido RTS con Web Audio API
│   ├── TextureGenerator.ts    # Generador procedural de texturas 2.5D estilo AoE (Edificios, Unidades, Árboles, Minas)
│   ├── entities/
│   │   ├── Entity.ts          # Clase base para entidades con anillos de selección y barras de vida
│   │   ├── Unit.ts            # Aldeanos, Espadachines y Exploradores con recolección y movimiento
│   │   ├── Building.ts        # Centro Urbano, Cuartel y Casas con cola de producción
│   │   └── ResourceNode.ts    # Bosques (Madera), Canteras de Oro y Piedra
│   └── systems/
│       ├── SelectionSystem.ts # Selección por clic y caja de arrastre (marquee), despacho de órdenes
│       └── GameManager.ts     # Economía del jugador (Comida, Madera, Oro, Piedra, Población)
└── ui/
    ├── HUD.ts                 # Panel de recursos, detalles de unidad y botones de acción
    └── Minimap.ts             # Radar de minimapa en tiempo real con visor de cámara
```

---

## 🎮 Controles del Juego

- **Click Izquierdo:** Seleccionar unidad o edificio / Arrastrar para selección múltiple con caja.
- **Click Derecho:** Orden de mover a una posición o recolectar recursos (árboles, oro, piedra).
- **W / A / S / D** o **Flechas:** Desplazar la cámara por el mapa.
- **Desplazamiento por Bordes:** Mueve el cursor a los bordes de la pantalla para desplazar la vista.
- **Rueda del Ratón:** Zoom In / Out centrado en el cursor.
- **Minimapa:** Clic en cualquier zona del minimapa para saltar instantáneamente la cámara.

---

## 📦 Comandos Disponibles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción (TypeScript + Vite)
npm run build

# Previsualizar la compilación
npm run preview
```
