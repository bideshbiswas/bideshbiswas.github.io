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
// --- CALIBRATION (Updated for precision) ---
    let offsetX = 0; let offsetY = 25;   
    let hoverCorrectionX = 0; let hoverCorrectionY = 7;   
    let smokeOffsetX = -5; let smokeOffsetY = 5;   

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

const form = document.getElementById('contact-form');
const result = document.getElementById('result');

if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // Stops the page from redirecting
        const formData = new FormData(form);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);
        
        result.style.display = "block";
        result.innerHTML = "Sending...";

        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: json
        })
        .then(async (response) => {
            if (response.status == 200) {
                // Your custom success message!
                result.innerHTML = "Message sent successfully! I will be in touch soon.";
                result.style.color = "#38bdf8"; 
            } else {
                result.innerHTML = "Oops! Something went wrong.";
                result.style.color = "red";
            }
        })
        .catch(error => {
            console.log(error);
            result.innerHTML = "Something went wrong!";
        })
        .then(function() {
            form.reset(); // Clears the form fields
            setTimeout(() => {
                result.style.display = "none"; // Hides the message after 5 seconds
            }, 5000);
        });
    });
}

function copyEmail() {
    // 1. Define your email address here
    const myEmail = "bideshbiswas@ymail.com"; 
    
    // 2. Copy to clipboard
    navigator.clipboard.writeText(myEmail).then(() => {
        const btn = document.getElementById('copy-email-btn');
        const textSpan = document.getElementById('copy-text');
        
        // 3. Change text and color to indicate success
        textSpan.innerText = "Copied!";
        btn.classList.add('copied');
        
        // 4. Revert back to normal after 2.5 seconds
        setTimeout(() => {
            textSpan.innerText = "bideshbiswas@ymail.com";
            btn.classList.remove('copied');
        }, 2500);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}


const backToTopBtn = document.getElementById("back-to-top");

        // Show or hide the button when scrolling
        window.addEventListener("scroll", () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add("show");
            } else {
                backToTopBtn.classList.remove("show");
            }
        });

        // Smooth scroll to top on click
        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });


        const textElement = document.getElementById('typing-text');
    // Here are the phrases it will type out. You can customize these!
    const phrases = [
        "> Initializing CUDA nodes...", 
        "> Allocating GPU memory...", 
        "> Hello, I am"
    ];
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeEffect() {
        const currentPhrase = phrases[phraseIndex];
        
        // Handle typing or deleting characters
        if (isDeleting) {
            textElement.innerText = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
        } else {
            textElement.innerText = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
        }

        // Adjust speed (deleting is faster than typing)
        let typingSpeed = isDeleting ? 30 : 60;

        // Logic for pausing and switching directions
        if (!isDeleting && charIndex === currentPhrase.length) {
            // If it's the last phrase ("Hello, I'm"), stop the loop so it stays on screen
            if (phraseIndex === phrases.length - 1) {
                // Optional: remove the blinking cursor after it finishes
                document.querySelector('.typing-cursor').style.animation = "none";
                return; 
            }
            isDeleting = true;
            typingSpeed = 1000; // Pause for 1 second before deleting
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex++;
            typingSpeed = 400; // Pause briefly before typing the next word
        }

        setTimeout(typeEffect, typingSpeed);
    }

    // Start the typing effect half a second after the page loads
    setTimeout(typeEffect, 500);



    // 1. Select all the skill progress lines on the page
    const progressLines = document.querySelectorAll('.progress-line');

    // 2. Set up the observer to watch them
    const skillObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // 3. When a skill bar enters the screen...
            if (entry.isIntersecting) {
                // Add the animation class
                entry.target.classList.add('animate');
                // Stop watching it so it doesn't reset when scrolling back up
                observer.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.5 // Triggers when the bar is at least 50% visible on screen
    });

    // 4. Attach the observer to each skill bar
    progressLines.forEach(line => {
        skillObserver.observe(line);
    });



const scriptBg = document.getElementById('script-bg');
    
    // Custom terminal logs related to your actual tech stack!
    const consoleLogs = [
        "nvcc -O3 -arch=sm_70 solver.cu -o solver",
        "[OK] GPU Device 0: NVIDIA TITAN V memory allocated.",
        "Initializing cuDSS sparse solver...",
        "Partitioning 3D unstructured mesh (METIS)...",
        "Loading ADVENTURE_FullWave modules...",
        "MPI_Comm_rank: Establishing multi-node cluster...",
        "> Thread sync complete. Error tolerance: 1e-6",
        "[Log] Solving large-scale Poisson equation...",
        "Executing computeSubdomain<<<1024, 256>>>()",
        "Data transfer: Host to Device... Success.",
        "[System] GPU utilization at 98% | Temp: 68C"
    ];

    function streamCode() {
        if (!scriptBg) return;
        
        // Create a new line of code
        const line = document.createElement('div');
        line.innerText = "> " + consoleLogs[Math.floor(Math.random() * consoleLogs.length)];
        scriptBg.appendChild(line);
        
        // Keep the background from filling up infinitely (removes top lines)
        if (scriptBg.children.length > 25) {
            scriptBg.removeChild(scriptBg.firstChild);
        }
        
        // Call the next line at a random interval (between 100ms and 600ms)
        setTimeout(streamCode, Math.random() * 500 + 100);
    }

    // Start the animation
    setTimeout(streamCode, 1000);