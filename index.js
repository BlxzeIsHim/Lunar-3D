document.addEventListener('DOMContentLoaded', () => {
    // Open IndexedDB
    const dbName = "3DProjectManagerDB";
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = function (event) {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('projects')) {
            const projectStore = db.createObjectStore('projects', { keyPath: 'id', autoIncrement: true });
            projectStore.createIndex('name', 'name', { unique: false });
        }
    };

    request.onsuccess = function (event) {
        const db = event.target.result;
        fetchProjects(db); // Fetch projects on successful DB open
    };

    request.onerror = function (event) {
        console.error("Database error: ", event.target.errorCode);
    };

    // Fetch and display projects
    function fetchProjects(db) {
        const transaction = db.transaction(['projects'], 'readonly');
        const objectStore = transaction.objectStore('projects');
        const request = objectStore.getAll();

        request.onsuccess = function (event) {
            const projects = event.target.result;
            displayProjects(projects);
        };

        request.onerror = function (event) {
            console.error("Failed to fetch projects: ", event.target.errorCode);
        };
    }

    // Display projects in the UI
    function displayProjects(projects) {
        const projectGrid = document.getElementById('projects');
        projectGrid.innerHTML = '';

        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.dataset.id = project.id;

            const img = document.createElement('img');
            img.alt = 'Project Thumbnail';

            // Load the preview image if available
            if (project.content && project.content.previewImage) {
                img.src = project.content.previewImage;
            } else {
                img.src = 'data:image/svg+xml;base64,' + btoa('<svg width="200" height="120" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="black"/></svg>');
            }

            const info = document.createElement('div');
            info.className = 'project-info';
            info.innerHTML = `<h3 class="project-title">${project.name}</h3>`;

            const buttons = document.createElement('div');
            buttons.className = 'project-buttons';

            const openButton = document.createElement('button');
            openButton.textContent = 'Open Project';
            openButton.addEventListener('click', () => {
                window.location.href = `edit.html?id=${project.id}`;
            });

            const moreOptions = document.createElement('div');
            moreOptions.className = 'more-options';
            moreOptions.innerHTML = '⋮';
            moreOptions.addEventListener('click', (event) => {
                showPopup(project.id, event);
            });

            buttons.appendChild(openButton);
            buttons.appendChild(moreOptions);

            card.appendChild(img);
            card.appendChild(info);
            card.appendChild(buttons);

            projectGrid.appendChild(card);
        });
    }

    // Show the popup with options
    function showPopup(projectId, event) {
        const popup = document.getElementById('project-popup');
        const deleteButton = document.getElementById('delete-project');
        const renameButton = document.getElementById('rename-project');
        const renderButton = document.getElementById('render-file');
        const closePopup = document.getElementById('close-popup');

        deleteButton.onclick = () => deleteProject(projectId);
        renameButton.onclick = () => renameProject(projectId);
        renderButton.onclick = () => renderProject(projectId);

        popup.style.display = 'flex';
        popup.style.top = `${event.clientY + window.scrollY}px`;
        popup.style.left = `${event.clientX + window.scrollX}px`;

        closePopup.onclick = () => {
            popup.style.display = 'none';
        };

        window.onclick = (event) => {
            if (event.target === popup) {
                popup.style.display = 'none';
            }
        };
    }

    // Create a new project
    document.getElementById('create-project').addEventListener('click', () => {
        const projectName = prompt("Enter the name of your new project:");
        if (projectName) {
            const db = request.result;
            const transaction = db.transaction(['projects'], 'readwrite');
            const objectStore = transaction.objectStore('projects');

            const newProject = {
                name: projectName,
                created: new Date(),
                content: {}  // Initialize content object
            };

            const addRequest = objectStore.add(newProject);

            addRequest.onsuccess = function (event) {
                const newProjectId = event.target.result;
                fetchProjects(db); // Refresh project list

                // Redirect to edit page for the new project
                window.location.href = `edit.html?id=${newProjectId}`;
            };

            addRequest.onerror = function (event) {
                console.error("Failed to add project: ", event.target.errorCode);
            };
        }
    });

    // Delete a project
    function deleteProject(projectId) {
        const db = request.result;
        const transaction = db.transaction(['projects'], 'readwrite');
        const objectStore = transaction.objectStore('projects');
        const deleteRequest = objectStore.delete(projectId);

        deleteRequest.onsuccess = function (event) {
            fetchProjects(db); // Refresh project list
            document.getElementById('project-popup').style.display = 'none';
        };

        deleteRequest.onerror = function (event) {
            console.error("Failed to delete project: ", event.target.errorCode);
        };
    }

    // Rename a project
    function renameProject(projectId) {
        const newName = prompt("Enter the new name for your project:");
        if (newName) {
            const db = request.result;
            const transaction = db.transaction(['projects'], 'readwrite');
            const objectStore = transaction.objectStore('projects');
            const getRequest = objectStore.get(projectId);

            getRequest.onsuccess = function (event) {
                const project = event.target.result;
                project.name = newName;

                const updateRequest = objectStore.put(project);

                updateRequest.onsuccess = function () {
                    fetchProjects(db); // Refresh project list
                    document.getElementById('project-popup').style.display = 'none';
                };

                updateRequest.onerror = function (event) {
                    console.error("Failed to rename project: ", event.target.errorCode);
                };
            };
        }
    }

    // Render a project (placeholder functionality)
    function renderProject(projectId) {
        alert('Rendering functionality is not yet implemented.');
        document.getElementById('project-popup').style.display = 'none';
    }

    // Theme toggle functionality
    const themeToggleButton = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'dark-mode';

    document.body.classList.add(currentTheme);

    themeToggleButton.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        document.body.classList.toggle('dark-mode');

        const newTheme = document.body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode';
        localStorage.setItem('theme', newTheme);

        // Update button icon based on the theme
        themeToggleButton.textContent = newTheme === 'dark-mode' ? '🌙' : '☀️';
    });

    // Set initial button icon
    themeToggleButton.textContent = currentTheme === 'dark-mode' ? '🌙' : '☀️';
});
