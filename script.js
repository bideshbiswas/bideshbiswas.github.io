/* =========================================
   1. THREE.JS STARS BACKGROUND
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('#bg-canvas');
    if (canvas && typeof THREE !== 'undefined') {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.position.setZ(30);

        const geometry = new THREE.BufferGeometry();
        const count = 5000;
        const positions = new Float32Array(count * 3);
        for(let i = 0; i < count * 3; i++) { positions[i] = (Math.random() - 0.5) * 100; }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({ size: 0.1, sizeAttenuation: true, color: 0x38bdf8, transparent: true, opacity: 0.8 });
        const starField = new THREE.Points(geometry, material);
        scene.add(starField);

        let sMouseX = 0, sMouseY = 0, sTargetX = 0, sTargetY = 0;
        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;

        document.addEventListener('mousemove', (event) => { sMouseX = (event.clientX - windowHalfX); sMouseY = (event.clientY - windowHalfY); });
        window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });

        const clock = new THREE.Clock();
        function animate3D() {
            const elapsedTime = clock.getElapsedTime();
            starField.rotation.y = elapsedTime * 0.05; 
            sTargetX = sMouseX * 0.001; sTargetY = sMouseY * 0.001;
            starField.rotation.y += 0.5 * (sTargetX - starField.rotation.y);
            starField.rotation.x += 0.5 * (sTargetY - starField.rotation.x);
            renderer.render(scene, camera);
            requestAnimationFrame(animate3D);
        }
        animate3D();
    }
});

/* =========================================
   2. ROCKET LOGIC & SMOKE
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    const rocket = document.getElementById('player-rocket');
    
    // --- CALIBRATION ---
    let offsetX = 0; let offsetY = 10;   
    let hoverCorrectionX = -5; let hoverCorrectionY = 5;   
    let smokeOffsetX = -15; let smokeOffsetY = 15;   

    let currentX = window.innerWidth / 2; let currentY = window.innerHeight / 2;
    let rTargetX = currentX; let rTargetY = currentY;
    let rotation = -45; let targetRotation = -45;
    const lerpSpeed = 0.2; const flySpeed = 15; const scrollSpeed = 30; 
    let smokeCounter = 0;
    const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
    let hoveredElement = null; 

    function createSmoke() {
        const smoke = document.createElement('div');
        smoke.classList.add('smoke');
        const visualX = currentX + offsetX; const visualY = currentY + offsetY;
        const rad = (rotation - 45) * (Math.PI / 180); 
        const tailDistance = 25; 
        const smokeBaseX = visualX - Math.cos(rad) * tailDistance;
        const smokeBaseY = visualY - Math.sin(rad) * tailDistance;
        const randomX = (Math.random() - 0.5) * 10; const randomY = (Math.random() - 0.5) * 10;
        smoke.style.left = (smokeBaseX + randomX + smokeOffsetX) + 'px';
        smoke.style.top = (smokeBaseY + randomY + smokeOffsetY) + 'px';
        document.body.appendChild(smoke);
        setTimeout(() => { smoke.remove(); }, 800);
    }

    function animate() {
        if(!rocket) return;
        const h = window.innerHeight; const w = window.innerWidth; const edge = 80;
        
        // Keyboard controls
        if (keys.ArrowUp) { targetRotation = -45; if (rTargetY < edge) { document.documentElement.scrollTop -= scrollSpeed; document.body.scrollTop -= scrollSpeed; rTargetY = edge; } else { rTargetY -= flySpeed; } } 
        else if (keys.ArrowDown) { targetRotation = 135; if (rTargetY > h - edge) { document.documentElement.scrollTop += scrollSpeed; document.body.scrollTop += scrollSpeed; rTargetY = h - edge; } else { rTargetY += flySpeed; } }
        if (keys.ArrowLeft) { targetRotation = -135; rTargetX = Math.max(edge, rTargetX - flySpeed); }
        if (keys.ArrowRight) { targetRotation = 45; rTargetX = Math.min(w - edge, rTargetX + flySpeed); }

        // Lerp
        currentX += (rTargetX - currentX) * lerpSpeed;
        currentY += (rTargetY - currentY) * lerpSpeed;
        
        // Rotation
        let rotDiff = targetRotation - rotation;
        if (rotDiff > 180) rotDiff -= 360; if (rotDiff < -180) rotDiff += 360;
        rotation += rotDiff * 0.15;

        // Smoke logic
        const dist = Math.hypot(rTargetX - currentX, rTargetY - currentY);
        if (dist > 2) {
            smokeCounter++;
            if (smokeCounter % 4 === 0) createSmoke();
        }

        // Apply Transform
        let finalX = currentX + offsetX; let finalY = currentY + offsetY; let scale = 1;
        if (hoveredElement) { scale = 1.3; finalX += hoverCorrectionX; finalY += hoverCorrectionY; }
        
        rocket.style.transform = `translate3d(${finalX}px, ${finalY}px, 0) translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`;

        // Collision / Hover Logic
        let elementBelow = document.elementFromPoint(currentX, currentY);
        let clickable = elementBelow ? elementBelow.closest('a, button, input, textarea, .skill-box') : null;

        if (clickable) {
            if (hoveredElement !== clickable) {
                hoveredElement = clickable;
                rocket.classList.add('hovering');
                clickable.classList.add('force-hover'); 
            }
        } else {
            if (hoveredElement) {
                hoveredElement.classList.remove('force-hover');
                hoveredElement = null;
                rocket.classList.remove('hovering');
            }
        }
        requestAnimationFrame(animate);
    }
    
    // Start Animation Loop
    animate();

    // Event Listeners
    document.addEventListener('mousemove', (e) => {
        if (!keys.ArrowUp && !keys.ArrowDown && !keys.ArrowLeft && !keys.ArrowRight) {
            rTargetX = e.clientX; rTargetY = e.clientY; targetRotation = -45;
        }
    });

    document.addEventListener('keydown', (e) => {
        if (keys.hasOwnProperty(e.key)) { e.preventDefault(); keys[e.key] = true; }
        // Rocket click
        if (['Enter', ' '].includes(e.key) && hoveredElement) {
            e.preventDefault();
            rocket.style.transform += " scale(0.8)";
            hoveredElement.classList.add('force-click');
            setTimeout(() => { rocket.style.transform = rocket.style.transform.replace(" scale(0.8)", ""); if(hoveredElement) hoveredElement.classList.remove('force-click'); }, 150);
            hoveredElement.click();
        }
    });

    document.addEventListener('keyup', (e) => { if (keys.hasOwnProperty(e.key)) keys[e.key] = false; });
    document.addEventListener('touchmove', (e) => { 
        rTargetX = e.touches[0].clientX; rTargetY = e.touches[0].clientY; targetRotation = -45; 
    }, { passive: true });
    document.addEventListener('touchstart', (e) => { 
        rTargetX = e.touches[0].clientX; rTargetY = e.touches[0].clientY; targetRotation = -45; 
    }, { passive: true });
    document.addEventListener('mousedown', () => { if(rocket) rocket.style.filter = "drop-shadow(0 0 5px #38bdf8)"; });
    document.addEventListener('mouseup', () => { if(rocket) rocket.style.filter = "drop-shadow(0 0 15px #38bdf8)"; });
});