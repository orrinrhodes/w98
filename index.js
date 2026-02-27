function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();

    const AmPm = hours >= 12 ? 'PM':'AM';
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    document.getElementById('clock').textContent = `${hours}:${minutes} ${AmPm}`;
}

const startButton = document.getElementById('start-button');
const startMenu = document.getElementById('start-menu');

startButton.addEventListener('click', ()=> {
    if (startMenu.style.display === 'flex') {
        startMenu.style.display = 'none';
    } else {
        startMenu.style.display = 'flex';
    };
});

window.addEventListener ('click', (e) => {
    if (!startButton.contains(e.target) && e.target !== startButton) {
        startMenu.style.display = 'none';
    };
});

// WINDOW FACTORY

const desktop = document.querySelector('.desktop');
const appTray = document.getElementById('app-tray');

function createTaskbarButton(title, iconURL, windowId) {
    const taskButton = document.createElement('div');
    taskButton.className = 'task-button active';
    taskButton.id = `button-${windowId}`;
    taskButton.innerHTML = `<img src="${iconURL}"> <span>${title}</span>`;

    taskButton.onclick = () => {
        const win = document.getElementById(windowId);

        if (win.style.display === 'none') {
            //restore window
            win.style.display = 'block';
            taskButton.classList.add('active');

            //bring to front
            document.querySelectorAll('.window').forEach(w => w.style.zIndex = '200');
            win.style.zIndex = '1000';
        } else {
            win.style.display = 'none';
            taskButton.classList.remove('active');
        };
    };

    appTray.appendChild(taskButton);
};

function setupWindowEvents(win, windowId) {
    const handle = win.querySelector('.window-titlebar');
    const maxButton = win.querySelector('.max-button');
    const miniButton = win.querySelector('.mini-button');
    const closeButton = win.querySelector('.close-button');

    //dragging
    handle.onmousedown = (e) => {
        e.preventDefault();
        // if (win.classList.contains('maximized')) return;

        document.querySelectorAll('.window').forEach(w => w.style.zIndex = '200');
        win.style.zIndex = '1000';

        const ghost = document.createElement('div');
        ghost.className = 'window-ghost';

        const rect = win.getBoundingClientRect();
        ghost.style.width = rect.width + 'px';
        ghost.style.height = rect.height + 'px';
        ghost.style.left = rect.left + 'px';
        ghost.style.top = rect.top + 'px';

        document.body.appendChild(ghost);

        let offset = {
            x: e.clientX - win.offsetLeft,
            y: e.clientY - win.offsetTop
        };

        const onMouseMove = (moveEvent) => {
            // win.style.inset = "auto";
            ghost.style.left = (moveEvent.clientX - offset.x) + 'px';
            ghost.style.top = (moveEvent.clientY - offset.y) + 'px';
        };

        const onMouseUp = () => {
            win.style.inset = "auto";
            win.style.left =ghost.style.left;
            win.style.top = ghost.style.top;

            ghost.remove();
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        
    };

    handle.ondblclick = () => {
        maxButton.click();
    }

    maxButton.onclick = () => {
        win.classList.toggle('maximized');
        if (win.classList.contains('maximized')) {
            maxButton.innerHTML = '❐';
        } else {
            maxButton.innerHTML = '[]';
        };
    };

    miniButton.onclick = () => {
        win.style.display = 'none';
        taskButton.classList.remove('active');
    };

    closeButton.onclick = () => {
        win.remove();
        const taskButton = document.getElementById(`button-${windowId}`);
        if (taskButton) taskButton.remove();
    };
};

function createWindow(title, iconURL, content) {
    const windowId = `window-${title.replace(/\s+/g,'-').toLowerCase()}`;

    if (document.getElementById(windowId)) return;

    const win = document.createElement('div');
    win.id = windowId;
    win.className = 'window'
    win.style.display = 'block';
    win.style.zIndex = '200';

    win.innerHTML = `
        <div class="window-titlebar" id="window-handle">
            <img src="${iconURL}" width="16">
            ${title}
            <div class="titlebar-controls">
                <button aria-label="Minimize" class="mini-button">_</button>
                <button aria-label="Maximize" class="max-button">[]</button>
                <button aria-label="Close" class="close-button">X</button>
            </div>
        </div>
         <div class="window-body">
            ${content}
        </div>
    `;

    document.body.appendChild(win);
    createTaskbarButton(title, iconURL, windowId);
    setupWindowEvents(win, windowId);
};


//init

const placeholder = (title) => `
    <p>Welcome to ${title}... WIP!</p>
    <div class="drive-list">
        <div class="drive"><img src="https://win98icons.alexmeub.com/icons/png/floppy_drive_3_5_cool-3.png"> 3½ Floppy (A:)</div>
        <div class="drive"><img src="https://win98icons.alexmeub.com/icons/png/directory_closed-4.png"> (C:)</div>
    </div>
`;

const dino = (title) => `
    <p>Welcome to ${title}... model viewer</p>
     <model-viewer
                src="https://sketchfab-prod-media.s3.amazonaws.com/archives/546a12d165224378a68a935d30fa5204/glb/273f8a2117bf49a0a7c45779f75f389b/tyrannosaurus_rex.glb?AWSAccessKeyId=ASIAZ4EAQ242O4JWP3RM&Signature=iVNtX487XdyfjJ%2FjmmG9HjhO%2BCM%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEGsaCWV1LXdlc3QtMSJGMEQCIHuw%2BjMQXw62fQowGHBYAYRaMsWwLg7FHCuJxstrbFiRAiBZac%2Bmx5H0s7wKwWYIft34WcGM3lRp3%2B6MiXzhsgbYRCqyBQg0EAAaDDY3ODg3NDM3MTg5MiIMQ6ZVbGDpZWwvsOrpKo8F%2FUmqFMQWT1ftzOeSo7ZfUyTACuyIpAVsjXYe9fuslWHiVmsvnOjSLhQg0dzqh7W5znetjeTSzKBhouzpq2OVBABDwLr1OWmzG62iNu97IAjLqHbwvFBXZguSKOerf6h6CIQ7q6qb7RS7WgNTUVI%2Fx8l%2BLKtevacVTsrFnkcY1smclYb%2BKtvE41rp2i92hQuHBVDAWU4c%2BYTRsQulXZR8zumQd6Q0Pa%2FquyEi6IvVDDLtqTf7fvxyynHyi1dsLSHIFu8NiuxDKs6HIFGOLTIcF6BaVY%2B8Gk5hs2GqRrfBmpMu%2FNLNqbJrDt2Q4h3JtfavXGOF%2F38NZghgsUDnUv9qtrQiS9fSbjLWzIOw0z3J8xmFVHaxPU1dC6WdzV16S9YY0toouGQ5GihHJa2ecTnd1h4EUc96ESCyHvJIJTXXIez3tIZuiZJjw7gUkTvsmiUpLdIqDK3%2F%2BB%2FAW4dgARr%2FzZ9OPinz0qGVgwhiF4qm0LuR4nrLN3lWsmVL%2FI5DDmChkSJtXCMCxPWoirMFashrNwSwF7Ps7h0SDWqzd4VBC26GajQxjY6zcANPoDPDcSzfHfK92VlWGFMOPzxQHtJdKC63TdzqxifrGjgUCNfwU8eWBA9hTQFPmkfzn8zPdAJEawoj67dVWLworgx150rCXSz53NUt75OqWq2xi6pgjkkXA2HHJt9%2FkC2GEJktPsNHRvJUTUSzprmVEs0IW%2Bb0oaIxFjAm3zj0EfnWziuxdi1B9X%2FeaMCSKQkhBgcZYt1AFht7EZ5B35vLJJYHWhKwoAN69A45FjZicv%2FIGEorhjNSPp4S5jCpz6B20CPyo1QIW7d028nTn0xB%2Bw%2FxDTveX%2F499YfMjy4v27Gf1g0CJDD%2Fk4TNBjqyAYM713D6ElYZ3LbrVE7XFCbK065RUltbWQZhWxVejqILUlr4Wz4fF49qxOMGQNAjf28aytZWeeckGUzKkoGswq%2Fw%2Bj3uh%2FIZQYZoWydIuBWwaMepuNv0CUPb6t%2B5ujH%2FF2srn1K2pcwOGLeiurUwA99MDI3ZJs3J1FFvJOP85yFjhb%2FB6XuF1KV7xI7%2Bci0FKH9mg2tZoRiDPtD4EraSeU1BA%2FVcgjDS7VVMYAat1NI95rI%3D&Expires=1772170115"
                auto-rotate
                autoplay
                camera-orbit="0deg 75deg 3m"
                shadow-intensity="1" camera-controls touch-action="pan-y">
            </model-viewer>
    </div>
`;

document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('dblclick', () => {
        const title = icon.getAttribute('data-title');
        const img = icon.getAttribute('data-img');
        
        let content = placeholder(title)
        if(title) {
            if(title === 'Frank') {
                content = dino(title);
            };
            createWindow(title, img, content);
        };
    });
});

document.querySelectorAll('.menu-items li').forEach(item => {
    item.addEventListener('click', () => {
        const title = item.getAttribute('data-title');
        const img = item.getAttribute('data-img');

        const content = `
        <p>My socials</p>
        <a href="https://github.com/orrinrhodes" target="_blank">My OnlyFans</a><br>
        <a href="https://github.com/orrinrhodes" target="_blank">My GitHub!</a>
        `;
        if(title) {
            createWindow(title, img, content);
            startMenu.style.display = 'none';
        };
    });
});

// SOUNDS AND BSOD \/

const startSound = document.getElementById('startup-sound');
function playStartup() {
    startSound.play().catch(error => {
        console.log('Autoplay may be the issue.'); //click again
    });
    window.removeEventListener('click', playStartup);
};

window.addEventListener('click', playStartup);

const shutdownButton = document.querySelector('.menu-items li:last-child');
const bsod = document.getElementById('bsod');

const bsodSound = document.getElementById('bsod-sound');
shutdownButton.addEventListener('click', () => {
    startMenu.style.display = 'none';

    document.body.classList.add('wait-cursor');
    setTimeout( () => {
        document.body.classList.remove('wait-cursor');
        bsod.style.display = 'flex';
    }, 2000);
    //play glitch sound
    bsodSound.play();
});

window.addEventListener('keydown', ()=> {
    if (bsod.style.display === 'flex') bsod.style.display = 'none'; startSound.play();
});

updateClock();
setInterval(updateClock, 60000);
