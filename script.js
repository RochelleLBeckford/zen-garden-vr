// & This will create a Camera Boundary so that the user will not go past the <a-plane> of the Zen Garden
// ~ This will keep the user on the sand
AFRAME.registerComponent('camera-boundary', {
    // ~ This function runs once when the component is first attached to the <a-camera>
    init: function () {
        // ~ This sets the bounds that the user will be prevented from going beyond
        this.bounds = {
            xMin: -7.0,
            xMax: 7.0,
            zMin: -7.0,
            zMax: 7.0,
        };
    },

    // & ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    // & Thus function runs every frame (typically 60 times per second)
    // ~ This reads the cameras position and make sure it stays in the allowed bounds
    tick: function () {
        // ~ This will get the actual 3D position of the camera
        const pos = this.el.object3D.position;
        if (!pos) return;

        // ~ This is a flag to know if anything needs to update
        let changed = false;
        let newX = pos.x;
        let newZ = pos.z;

        // ~ This will clamp the X coordinate (left / right) and stay in the bounds
        if (pos.x < this.bounds.xMin) {
            newX = this.bounds.xMin;
            changed = true;
        } else if (pos.x > this.bounds.xMax) {
            newX = this.bounds.xMax;
            changed = true;
        }

        // ~ This will clamp the Z coordinate (left / right) and stay in the bounds
        if (pos.z < this.bounds.zMin) {
            newZ = this.bounds.zMin;
            changed = true;
        } else if (pos.z > this.bounds.zMax) {
            newZ = this.bounds.zMax;
            changed = true;
        }

        // ~ This will correct the camera if it tried to move outside the allowed area
        if (changed) {
            pos.x = newX;
            pos.z = newZ;

            //  ~ This will also update the A-Frame 'position' attribute & keep the Y coordinate unchanged.
            this.el.setAttribute('position', { x: newX, y: pos.y, z: newZ });
        }
    },
});

// & ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// & The Time of Day Controls for The Zen Garden VR

// ~ This will adds two buttons (Sunset and Night) to my Zen Garden
//~ When you click Sunset: the sky turns warm orange, the moon hides.
//~ When you click Night: the sky turns dark bluish purple, the moon appears, and stars will twinkle.

// & This function will setup everything to create these buttons
function initZenGardenControls() {
    // & This will Find the <a-scene> element (the whole 3D world) and the <a-sky> (the background)
    const scene = document.querySelector('a-scene');
    const sky = document.querySelector('a-sky');

    // & ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    // & This will be a Safety check: if either is missing, the function will stop
    // ~ This will prevent errors if the page hasn't finished loading A‑Frame properly.
    if (!scene || !sky) return;

    // & ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    // & This will remove any old lights that might have been added in earlier tries
    // ~ Removing them so they don't interfere with the bright default lighting.
    const oldLights = [
        'sunset-glow',
        'moon-glow',
        'ambient-light',
        'sun-light',
        'hemi-light',
    ];

    oldLights.forEach((id) => {
        const el = document.getElementById(id);
        //~ This will delete the old light entity from the scene
        if (el) el.remove();
    });

    // & ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    // & This will create the visual moon sphere (it has no light – just a pretty ball)
    // ~ This will check if a moon already exists (to avoid creating duplicates)
    let moonSphere = document.getElementById('moon-sphere');
    if (!moonSphere) {
        moonSphere = document.createElement('a-sphere');
        moonSphere.setAttribute('id', 'moon-sphere');
        moonSphere.setAttribute('radius', '0.6');
        moonSphere.setAttribute('color', '#f5f5ff');
        moonSphere.setAttribute('position', '0 8 -8');
        moonSphere.setAttribute(
            'material',
            'emissive: #aaaaff; emissiveIntensity: 0.3',
        );
        // ~ This will finally, add the moon to the scene so it appears in the garden
        scene.appendChild(moonSphere);
    }

    // & ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    // & This will create stars – a big group of tiny glowing spheres
    // ------------------------------------------------------------------
    let starsGroup = document.getElementById('stars-group');
    if (!starsGroup) {
        starsGroup = document.createElement('a-entity');
        starsGroup.setAttribute('id', 'stars-group');
        starsGroup.setAttribute('visible', 'false');

        const starCount = 200;
        for (let i = 0; i < starCount; i++) {
            // ~ This scatter the stars in a dome above the garden
            const x = (Math.random() - 0.5) * 30;
            const y = 5 + Math.random() * 7;
            const z = (Math.random() - 0.5) * 20 - 5;

            // ~ This will give them random sizes
            const radius = 0.05 + Math.random() * 0.1;

            //~ This will give that stars a slight random colour tint for natural variety
            const colorChoice = Math.random();
            let color = '#ffffff';
            if (colorChoice < 0.2) color = '#ffffaa';
            if (colorChoice > 0.8) color = '#aaccff';

            // ~ This will create one star sphere
            const star = document.createElement('a-sphere');
            star.setAttribute('radius', radius);
            star.setAttribute('color', color);
            star.setAttribute('position', `${x} ${y} ${z}`);
            // ~ This will give it a very faint glow so it looks like a real star
            star.setAttribute(
                'material',
                'emissive: #ffffff; emissiveIntensity: 0.2',
            );
            //~ This will add this star to the stars group container
            starsGroup.appendChild(star);
        }
        // ~ This will attach the whole stars group to the scene
        scene.appendChild(starsGroup);
    }

    // & ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    // & This will add a HTML title overlay (not part of the 3D world)
    //~ This will create a "Zen Garden" text at the top of your browser window.
    let titleDiv = document.getElementById('zen-title');
    if (!titleDiv) {
        titleDiv = document.createElement('div');
        titleDiv.id = 'zen-title';
        titleDiv.className = 'zen-title';
        titleDiv.textContent = 'Zen Garden';
        document.body.appendChild(titleDiv);
    }

    //& This will define the two visual modes (Sunset and Night)
    // ~ These functions will be called when you click the buttons.
    function setSunsetMode() {
        sky.setAttribute('color', '#ffaa77');
        moonSphere.setAttribute('visible', false);
        if (starsGroup) starsGroup.setAttribute('visible', false);
    }

    function setNightMode() {
        sky.setAttribute('color', '#1a1a3a');
        moonSphere.setAttribute('visible', true);
        if (starsGroup) starsGroup.setAttribute('visible', true);
    }

    // & ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    // & This will create the two buttons (Sunset and Night) as HTML elements
    // ~ This will make a <div> to hold both buttons (so can be styled together)
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'zen-controls';

    // ~ This will create the Sunset button
    const sunsetBtn = document.createElement('button');
    sunsetBtn.textContent = '🌅 Sunset';
    sunsetBtn.addEventListener('click', setSunsetMode);

    // ~ This will create the Night button
    const nightBtn = document.createElement('button');
    nightBtn.textContent = '🌙 Night';
    nightBtn.addEventListener('click', setNightMode);

    // ~ This will put both buttons into the container div
    controlsDiv.appendChild(sunsetBtn);
    controlsDiv.appendChild(nightBtn);
    // ~ This will add the whole button bar to the bottom of the webpage
    document.body.appendChild(controlsDiv);

    // ~ This will set the initial state – we start in Sunset mode (no moon, no stars)
    setSunsetMode();
}

// & ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// & This will wait for the A-Frame scene to be fully ready before running the code
// ~ Since A-Frame takes a moment to set up its internal systems (lights, materials, etc.).
// ~ This this will check if the scene is already loaded, run now; otherwise wait for the "loaded" event so there will be no errors.
const sceneEl = document.querySelector('a-scene');

if (sceneEl && sceneEl.hasLoaded) {
    initZenGardenControls();
} else if (sceneEl) {
    sceneEl.addEventListener('loaded', initZenGardenControls);
} else {
    window.addEventListener('load', () => {
        const scene = document.querySelector('a-scene');
        if (scene && scene.hasLoaded) {
            initZenGardenControls();
        } else if (scene) {
            scene.addEventListener('loaded', initZenGardenControls);
        }
    });
}
