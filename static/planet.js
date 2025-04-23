document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("planet-container");
    if (!container) return;

    // Сцена
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth * 0.6, window.innerHeight * 0.6);
    container.appendChild(renderer.domElement);

    // Значение радиуса (из index.html)
    const radius = (typeof planetRadius === "number" && !isNaN(planetRadius)) ? planetRadius : 1;

    const textureLoader = new THREE.TextureLoader();
    let planetTexture, earthTexture;
    let planetScale, earthScale;

    // Каменные
    const rockyTextures = [
        "/static/planet_texture1.jpg",
        "/static/planet_texture2.jpg",
        "/static/planet_texture3.jpg",
        "/static/planet_texture4.jpg",
        "/static/planet_texture5.jpg",
        "/static/planet_texture6.jpg",
        "/static/planet_texture7.jpg"
    ];

   if (radius > 10) {
    // Газовые
    const giantTextures = [
        "/static/giant_texture1.jpg",
        "/static/giant_texture2.jpg",
        "/static/giant_texture3.jpg",
        "/static/giant_texture4.jpg",
        "/static/giant_texture5.jpg"
    ];

    // Рандомизация текстур
		const randomGiantTexture = giantTextures[Math.floor(Math.random() * giantTextures.length)];
		planetTexture = textureLoader.load(randomGiantTexture);
		earthTexture = textureLoader.load("/static/earth_texture.jpg");
		planetScale = 1.5;
		earthScale = 0.1;
	} else {
		const randomTexture = rockyTextures[Math.floor(Math.random() * rockyTextures.length)];
		planetTexture = textureLoader.load(randomTexture);
		earthTexture = textureLoader.load("/static/earth_texture.jpg");
		planetScale = radius;
		earthScale = 1;
	}

    // Планета
    const planetGeometry = new THREE.SphereGeometry(planetScale, 64, 64);
    const planetMaterial = new THREE.MeshStandardMaterial({ map: planetTexture });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.position.x = planetScale + earthScale + 0;
    scene.add(planet);

    // Земля
    const earthGeometry = new THREE.SphereGeometry(earthScale, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.position.x = -1.3;
    scene.add(earth);

    // Свет
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(5, 5, 5);
    scene.add(light);

//  Звёзды на фоне
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1000;
    const starVertices = [];

    for (let i = 0; i < starCount; i++) {
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 100;
        starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({ 
    color: 0xFFFF00, // Yellow color
    size: 0.05,       // Increase size to make stars more visible
    sizeAttenuation: false // To make the stars stay the same size regardless of distance
});
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Камера
    camera.position.z = (planetScale + earthScale) * 3;

    // Анимация 
    function animate() {
        requestAnimationFrame(animate);
        planet.rotation.y += 0.002;
        earth.rotation.y += 0.002;
		stars.rotation.y += 0.0005
        renderer.render(scene, camera);
    }
    animate();

    // Ресайз (на телефонах плохо)
    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth * 0.6, window.innerHeight * 0.6);
        camera.aspect = (window.innerWidth * 0.6) / (window.innerHeight * 0.6);
        camera.updateProjectionMatrix();
    });
});
