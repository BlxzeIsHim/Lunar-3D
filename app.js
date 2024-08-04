document.addEventListener('DOMContentLoaded', () => {
    const layerPopup = document.getElementById('layer-popup');
    const importPopup = document.getElementById('import-popup');
    const playButton = document.getElementById('play-button');
    const stopButton = document.getElementById('stop-button');
    const playhead = document.getElementById('playhead');
    let playheadPosition = 0;
    let isPlaying = false;

    function togglePopup(popup, show) {
        popup.classList.toggle('show', show);
    }

    function addLayerToTimeline(layerElement, start, end) {
        const timelineLayers = document.getElementById('timeline-layers');
        layerElement.style.position = 'absolute';
        layerElement.style.left = `${start}px`;
        layerElement.style.width = `${end - start}px`;
        timelineLayers.appendChild(layerElement);
    }

    // Handle layer grid click
    document.getElementById('layers-grid').addEventListener('click', (event) => {
        if (event.target.closest('.layer')) {
            const layer = event.target.closest('.layer');
            layer.style.zIndex = 10;
            togglePopup(layerPopup, true);
        }
    });

    // Close layer popup
    document.getElementById('close-popup').addEventListener('click', () => {
        togglePopup(layerPopup, false);
    });

    // Button actions for layer management
    document.getElementById('split-layer').addEventListener('click', () => {
        console.log('Split Layer');
    });

    document.getElementById('split-delete-layer').addEventListener('click', () => {
        console.log('Split and Delete Rest');
    });

    document.getElementById('remove-split').addEventListener('click', () => {
        console.log('Remove Split');
    });

    // Play/Stop Video
    playButton.addEventListener('click', () => {
        playButton.style.display = 'none';
        stopButton.style.display = 'inline-block';
        isPlaying = true;
        playhead.style.transform = `translateX(${playheadPosition}px)`;
        playVideo();
    });

    stopButton.addEventListener('click', () => {
        playButton.style.display = 'inline-block';
        stopButton.style.display = 'none';
        isPlaying = false;
        stopVideo();
    });

    function playVideo() {
        if (isPlaying) {
            playheadPosition += 2;
            playhead.style.transform = `translateX(${playheadPosition}px)`;
            requestAnimationFrame(playVideo);
        }
    }

    function stopVideo() {
        cancelAnimationFrame(playVideo);
    }

    // Handle file imports
    document.getElementById('import-assets').addEventListener('click', () => {
        togglePopup(importPopup, true);
    });

    document.getElementById('close-import-popup').addEventListener('click', () => {
        togglePopup(importPopup, false);
    });

    document.getElementById('import-file').addEventListener('change', (event) => {
        const files = event.target.files;
        for (const file of files) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'layer-preview';

                const layerDiv = document.createElement('div');
                layerDiv.className = 'layer';
                layerDiv.appendChild(img);
                layerDiv.appendChild(document.createTextNode(file.name));

                document.getElementById('layers-grid').appendChild(layerDiv);
                addLayerToTimeline(layerDiv, 0, 100); // Example start/end values
            };
            reader.readAsDataURL(file);
        }
        togglePopup(importPopup, false);
    });
});
