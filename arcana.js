// Datos de cartas como base de datos
const cards = [
    { name: "El Sol 🌞", message: "Hoy brilla tu luz interior. Comparte tu alegría y calidez. El éxito y la claridad están de tu lado." },
    { name: "La Luna 🌕", message: "Confía en tu intuición. Las respuestas están en tu interior. Presta atención a tus sueños." },
    { name: "La Estrella ⭐", message: "Un día lleno de esperanza. Tus deseos se alinean con el universo. Mantén la fe." },
    { name: "El Mago 🧙‍♂️", message: "Tienes todos los recursos para manifestar tus deseos. Tu creatividad está al máximo." },
    { name: "La Emperatriz 👑", message: "Día para nutrir proyectos. La abundancia fluye cuando conectas con la creatividad." },
    { name: "El Emperador 👑", message: "Establece estructuras sólidas. Tu liderazgo y disciplina te llevarán al éxito." },
    { name: "Los Enamorados 💑", message: "Sigue a tu corazón en las decisiones importantes. Encuentra armonía entre mente y emoción." },
    { name: "La Rueda 🌀", message: "El cambio es favorable. Acepta los giros del destino con gratitud. Un nuevo ciclo comienza." },
    { name: "La Justicia 👩‍⚖️", message: "La verdad prevalecerá. Toma decisiones equilibradas. Lo que siembras, cosecharás." },
    { name: "La Fuerza 💪", message: "Tu coraje interior es poderoso. Enfrenta el día con compasión y determinación." }
];

// Variables globales para Three.js
let scene, camera, renderer, cardMesh;
let isFlipped = false; // estado para manejar la carta
let isAnimating = false; // estado para animacion
let selectedCard; // carta actual

const container = document.getElementById('container');
const gridContainer = document.getElementById('card-grid');

// Innit the three.js
function init() {
    // Carta al azar
    selectedCard = cards[Math.floor(Math.random() * cards.length)];
    
    // Crear la scena 
    scene = new THREE.Scene();
    
    // Camara en perspectiva
    camera = new THREE.PerspectiveCamera(
        75, // fov
        container.clientWidth / container.clientHeight, // Aspecto
        0.1, // Plano cercano
        1000 // Plano lejano
    );
    camera.position.z = 5; // Alejar la camara
    
    // Renderer par el canvas
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0); // Fondo transparente
    container.appendChild(renderer.domElement); // Añadir canvas al div
    
    // Geometria de carda
    const geometry = new THREE.BoxGeometry(2.5, 3.5, 0.1);
    
    // Texturas
    // Creamos texturas dinámicas usando Canvas 2D
    const backTexture = createCardTexture('rgba(75, 0, 130, 1)', '✨'); // Reverso
    const frontTexture = createCardTexture('rgba(255, 215, 0, 1)', selectedCard.name); // Frente
    
    // Materiales (Uno para cada cara del cubo/carta)
    // right, letft, up, down, front, back
    const materials = [
        new THREE.MeshBasicMaterial({ color: 0x2a0042 }), // Lados oscuros
        new THREE.MeshBasicMaterial({ color: 0x2a0042 }),
        new THREE.MeshBasicMaterial({ color: 0x2a0042 }),
        new THREE.MeshBasicMaterial({ color: 0x2a0042 }),
        new THREE.MeshBasicMaterial({ map: frontTexture }), // Cara frontal (Con nombre)
        new THREE.MeshBasicMaterial({ map: backTexture })   // Cara trasera (Con estrella)
    ];
    
    // Crear el mesh uniendo geometría y materiales
    cardMesh = new THREE.Mesh(geometry, materials);
    // Empezar con la carta boca abajo
    cardMesh.rotation.y = Math.PI; 
    scene.add(cardMesh);
    
    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffd700, 1, 100);
    pointLight.position.set(0, 0, 10);
    scene.add(pointLight);
    
    // Eventos de click
    container.addEventListener('click', onCardClick);
    window.addEventListener('resize', onWindowResize);
    
    // Grilla para elejir carta
    createGridButtons();
    
    // Iniciar bucle de animacion
    animate();
}

// Crear textura para carta
function createCardTexture(bgColor, text) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 712;
    const ctx = canvas.getContext('2d');
    
    // Fondo
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Borde decorativo
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 15;
    ctx.strokeRect(25, 25, canvas.width - 50, canvas.height - 50);
    
    // Texto
    ctx.fillStyle = text.includes('✨') ? '#ffffff' : '#4b0082';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (text.includes('✨')) {
        // Diseño reverso
        ctx.font = 'bold 180px Arial';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    } else {
        // Diseño frente (Nombre de carta)
        ctx.font = 'bold 60px Georgia';
        // Ajuste simple para textos largos
        const words = text.split(' ');
        let y = canvas.height / 2 - (words.length - 1) * 30;
        words.forEach(word => {
            ctx.fillText(word, canvas.width / 2, y);
            y += 70;
        });
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Manejo de click
function onCardClick() {
    // Si ya esta animando o ya esta volteada, no hacemos nada
    if (isAnimating || isFlipped) return;
    
    flipCardReveal();
}

function flipCardReveal() {
    isAnimating = true;
    isFlipped = true;
    
    // Ocultar instruccion "Haz click"
    document.getElementById('instruction').style.display = 'none';
    
    // Animacion manual de rotacion
    const startRot = cardMesh.rotation.y; // Esta volteada, osea en pi
    const endRot = 0; // Vamos a 0, que quede de frente
    
    const duration = 1000; // ms
    const startTime = Date.now();
    
    function animateLoop() {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        
        // Función de suavizado (Ease Out Back para rebote sutil)
        const ease = 1 - Math.pow(1 - progress, 3); 
        
        cardMesh.rotation.y = startRot + (endRot - startRot) * ease;
        
        if (progress < 1) {
            requestAnimationFrame(animateLoop);
        } else {
            // Fin de animación
            cardMesh.rotation.y = 0; // Asegurar posición exacta
            isAnimating = false;
            showText(); // Mostrar texto abajo
        }
    }
    animateLoop();
}

function showText() {
    const nameEl = document.getElementById('cardName');
    const msgEl = document.getElementById('cardMessage');
    const msgBox = document.getElementById('message');

    nameEl.textContent = selectedCard.name;
    msgEl.textContent = selectedCard.message;
    
    msgBox.classList.add('visible');
}

function hideText() {
    document.getElementById('message').classList.remove('visible');
}


// Crear botones en la grilla
function createGridButtons() {
    cards.forEach((cardData, index) => {
        const btn = document.createElement('div');
        btn.className = 'grid-item';
        btn.innerText = cardData.name;
        btn.onclick = () => selectCardFromGrid(index);
        gridContainer.appendChild(btn);
    });
}

// Manejo del menu
document.getElementById('menu-btn').onclick = () => {
    gridContainer.classList.add('active');
};

document.getElementById('close-grid').onclick = () => {
    gridContainer.classList.remove('active');
};

// Manejo de cambio de carta
function selectCardFromGrid(index) {
    // Cerrar menu
    gridContainer.classList.remove('active');
    
    // actualizar la carta select
    selectedCard = cards[index];
    
    // ocultar texto
    hideText();

    // cambiar textura
    const newTexture = createCardTexture('rgba(255, 215, 0, 1)', selectedCard.name);
    // Material index 4 es el frente
    cardMesh.material[4].map = newTexture; 
    cardMesh.material[4].needsUpdate = true;

    // giro para dar la sensacion de cambio
    isAnimating = true;
    const startRot = cardMesh.rotation.y;
    // 2 pi para 360
    const endRot = startRot + (Math.PI * 2); 
    
    const duration = 1200;
    const startTime = Date.now();

    function spinAnimation() {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        // Ease in-out
        const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
        
        cardMesh.rotation.y = startRot + (endRot - startRot) * ease;

        if (progress < 1) {
            requestAnimationFrame(spinAnimation);
        } else {
            isAnimating = false;
            // Normalizar rotacion
            cardMesh.rotation.y = cardMesh.rotation.y % (Math.PI * 2);
            
            // Si la carta estaba visible, mostramos el nuevo texto
            if (isFlipped) {
                showText();
                // Asegurar que termine mirando al frente (rotación 0 o 2PI)
                cardMesh.rotation.y = 0; 
            } else {
                // Si estaba oculta, aseguramos que termine en PI (reverso)
                cardMesh.rotation.y = Math.PI;
            }
        }
    }
    spinAnimation();
}


// Loop de animacion
function animate() {
    requestAnimationFrame(animate);
    
    // Animacion flotante en idle cuando no se está interactuando
    if (!isAnimating) {
        cardMesh.position.y = Math.sin(Date.now() * 0.001) * 0.1;
    }
    
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Llamar al init
init();