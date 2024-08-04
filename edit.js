document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');
    document.getElementById('project-id').textContent = projectId;

    document.getElementById('back-button').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    document.getElementById('import-2d').addEventListener('click', import2DSprite);
    document.getElementById('import-3d').addEventListener('click', import3DModel);
    document.getElementById('play').addEventListener('click', () => {
        // Play functionality
        console.log('Play button clicked');
    });
    document.getElementById('pause').addEventListener('click', () => {
        // Pause functionality
        console.log('Pause button clicked');
    });
    document.getElementById('add-layer').addEventListener('click', addLayer);

    function import2DSprite() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (event) => {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'preview-img';
                img.dataset.type = '2d';
                img.dataset.src = e.target.result;
                img.onclick = () => addAssetToLayer(img.src, '2d');
                document.getElementById('preview-grid').appendChild(img);
            };
            reader.readAsDataURL(file);
        };
        input.click();
    }

    function import3DModel() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.glb,.gltf';
        input.onchange = (event) => {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                const loader = new THREE.GLTFLoader();
                loader.load(e.target.result, (gltf) => {
                    const model = gltf.scene;
                    const thumbnail = document.createElement('canvas');
                    thumbnail.width = 80;
                    thumbnail.height = 80;
                    const context = thumbnail.getContext('2d');
                    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
                    camera.position.z = 5;
                    const renderer = new THREE.WebGLRenderer({ canvas: thumbnail });
                    renderer.setSize(80, 80);
                    const scene = new THREE.Scene();
                    scene.add(model);
                    renderer.render(scene, camera);
                    thumbnail.className = 'preview-img';
                    thumbnail.dataset.type = '3d';
                    thumbnail.dataset.src = e.target.result;
                    thumbnail.onclick = () => addAssetToLayer(e.target.result, '3d');
                    document.getElementById('preview-grid').appendChild(thumbnail);
                });
            };
            reader.readAsArrayBuffer(file);
        };
        input.click();
    }

    function addAssetToLayer(src, type) {
        const layerDiv = document.createElement('div');
        layerDiv.className = 'layer';
        layerDiv.dataset.type = type;
        layerDiv.dataset.src = src;

        const preview = document.createElement(type === '2d' ? 'img' : 'canvas');
        preview.className = 'layer-preview';
        if (type === '2d') {
            preview.src = src;
        } else {
            const loader = new THREE.GLTFLoader();
            loader.load(src, (gltf) => {
                const model = gltf.scene;
                const thumbnail = document.createElement('canvas');
                thumbnail.width = 80;
                thumbnail.height = 80;
                const context = thumbnail.getContext('2d');
                const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
                camera.position.z = 5;
                const renderer = new THREE.WebGLRenderer({ canvas: thumbnail });
                renderer.setSize(80, 80);
                const scene = new THREE.Scene();
                scene.add(model);
                renderer.render(scene, camera);
                preview.src = thumbnail.toDataURL();
            });
        }
        layerDiv.appendChild(preview);

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = () => document.getElementById('layers-grid').removeChild(layerDiv);
        layerDiv.appendChild(removeBtn);

        document.getElementById('layers-grid').appendChild(layerDiv);
    }

    function addLayer() {
        const layerDiv = document.createElement('div');
        layerDiv.className = 'layer';
        layerDiv.textContent = 'New Layer';
        layerDiv.onclick = () => {
            // Add functionality to handle layer selection
            console.log('Layer clicked');
        };
        document.getElementById('layers-grid').appendChild(layerDiv);
    }

    function init3DEditor(project) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('threejs-container').appendChild(renderer.domElement);

        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        camera.position.z = 5;

        const animate = function () {
            requestAnimationFrame(animate);
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            renderer.render(scene, camera);
        };

        animate();
    }

    const dbName = "3DProjectManagerDB";
    const request = indexedDB.open(dbName, 1);

    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(['projects'], 'readonly');
        const objectStore = transaction.objectStore('projects');
        const getRequest = objectStore.get(Number(projectId));

        getRequest.onsuccess = function (event) {
            const project = event.target.result;
            if (project) {
                init3DEditor(project);
            } else {
                console.error("Project not found.");
            }
        };

        getRequest.onerror = function (event) {
            console.error("Failed to fetch project: ", event.target.errorCode);
        };
    };

    request.onerror = function (event) {
        console.error("Database error: ", event.target.errorCode);
    };
});
