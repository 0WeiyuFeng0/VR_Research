var videoSource = ["doorway.jpg", "Final_1206_6_Fusion_4k.mp4", "Final_Advising1_Fusion_4k.mp4", "Final_Dean1_Fusion_4k.mp4", "Final_DrSun1_Fusion_4K.mp4"];

var currentIndex = 0; // set default index

var video = document.createElement('video');


/* ControlBar*/
var seekBar = document.querySelector('#seekBar');
var isPlaying = true;
var isPlayingBefore = true;

// for play\pause button
function playPause() {
    //change icon
    if (isPlaying)
        $("#playButton").html('<i class="fa fa-play"></i>');
    else
        $("#playButton").html('<i class="fa fa-pause"></i>');
    // change video status
    if (isPlaying) {
        video.pause();
    } else {
        video.play();
    }
    isPlaying = !isPlaying;
}
$("#playButton").click(playPause);

// for seek bar
seekBar.addEventListener("change", function () {
    // Calculate the new time
    var time = video.duration * (seekBar.value / 100);

    // Update the video time
    video.currentTime = time;
});

// Update the seek bar as the video plays
video.addEventListener("timeupdate", function () {
    // Calculate the slider value
    var value = (100 / video.duration) * video.currentTime;

    // Update the slider value
    seekBar.value = value;
});

// Pause the video when the seek handle is being dragged
seekBar.addEventListener("mousedown", function () {
    if (isPlaying) {
        playPause();
        isPlayingBefore = true;
    } else
        isPlayingBefore = false;
});

// remain the video status when the seek handle is dropped
seekBar.addEventListener("mouseup", function () {
    if (!isPlaying)
        if (isPlayingBefore == true)
            playPause();
});

// for volume button
$("#volumeButton").click(function () {
    //change icon
    if (video.muted == false)
        $("#volumeButton").html('<i class="fa fa-volume-off"></i>');
    else
        $("#volumeButton").html('<i class="fa fa-volume-up"></i>');
    // change video status
    if (video.muted == false)
        video.muted = true;
    else
        video.muted = false;
});

//  for the volume bar
$("#volumeBar").change(function () {
    // Update the video volume
    video.volume = volumeBar.value;
});

// for full screen button
function enterFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}
$("#fullScreenButton").click(function () {
    var domElement = document.querySelector('#fullScreenContainer');
    enterFullscreen(domElement);
});

// for reset button
$("#resetButton").click(function () {
    vrDisplay.resetPose();
});

// for vr button
$("#vrButton").click(function () {
    vrDisplay.requestPresent([{
        source: renderer.domElement
        }]);
});

// for previous button
var videoNumber = videoSource.length;
$("#previousButton").click(function () {
    currentIndex--;
    if (currentIndex >= 0)
        switchSource(currentIndex);
    else {
        currentIndex = videoNumber - 1;
        switchSource(currentIndex);
    }
});

// for next button
var videoNumber = videoSource.length;
$("#nextButton").click(function () {
    currentIndex++;
    if (currentIndex < videoNumber)
        switchSource(currentIndex);
    else {
        currentIndex = 0;
        switchSource(currentIndex);
    }
});

// reset control bar and position when change source
function resetControlBar() {
    vrDisplay.resetPose(); // reset position
    video.currentTime = 0; // reset video time
    seekBar.value = 0; // reset control bar
    if (currentIndex == 0 && isPlaying == true)
        playPause();
    else if (isPlaying == false)
        playPause();
}



/* 360Video */


WebVRConfig = {
    BUFFER_SCALE: 0.5,
};

document.addEventListener('touchmove', function (event) {
    event.preventDefault();
});

var onRenderFcts = []

// Setup three.js WebGL renderer. Note: Antialiasing is a big performance hit.
// Only enable it if you actually need to.
var renderer = new THREE.WebGLRenderer({
    antialias: false
});
renderer.setPixelRatio(Math.floor(window.devicePixelRatio));

// Append the canvas element created by the renderer to fullScreenContainer
document.querySelector('#fullScreenContainer').appendChild(renderer.domElement);

// Create a three.js scene.
var scene = new THREE.Scene();

// Create a three.js camera.
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

// Apply VR headset positional data to camera.
var controls = new THREE.VRControls(camera);

// Apply VR stereo rendering to renderer.
var effect = new THREE.VREffect(renderer);
effect.setSize(window.innerWidth, window.innerHeight);

// Get the VRDisplay and save it for later.
var vrDisplay = null;
navigator.getVRDisplays().then(function (displays) {
    if (displays.length > 0) {
        vrDisplay = displays[0];
    }

    //    if (vrDisplay !== null) {
    //        if (vrDisplay.capabilities.canPresent !== true) {
    //            document.querySelector('#vrButton').style.display = 'none';
    //        }
    //    }
});

// Request animation frame loop function
var lastRender = 0;

function animate(timestamp) {
    var delta = Math.min(timestamp - lastRender, 500);
    lastRender = timestamp;

    // Apply rotation to cube mesh
    onRenderFcts.forEach(function (onRenderFct) {
        onRenderFct(delta)
    })

    // Update VR headset position and apply to camera.
    controls.update();

    // Render the scene.
    effect.render(scene, camera);

    // Keep looping.
    requestAnimationFrame(animate);
}

// Kick off animation loop.
requestAnimationFrame(animate);

//////////////////////////////////////////////////////////////////////////////////
//		Comments
//////////////////////////////////////////////////////////////////////////////////

function onResize() {
    console.log('Resizing to %s x %s.', window.innerWidth, window.innerHeight);
    effect.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

// Resize the WebGL canvas when we resize and also when we change modes.
window.addEventListener('resize', onResize);
window.addEventListener('vrdisplaypresentchange', function onVRDisplayPresentChange() {
    console.log('onVRDisplayPresentChange');
    onResize();
});



renderer.domElement.addEventListener('click', function (event) {
    var element = renderer.domElement
    // check it is the proper click
    if (event.target !== element) return
    if (vrDisplay.displayName !== "Mouse and Keyboard VRDisplay (webvr-polyfill)") return
    // Ask the browser to lock the pointer
    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
    if (/Firefox/i.test(navigator.userAgent)) {
        var fullscreenchange = function (event) {
            if (document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element) {
                document.removeEventListener('fullscreenchange', fullscreenchange);
                document.removeEventListener('mozfullscreenchange', fullscreenchange);
                element.requestPointerLock();
            }
        };
        document.addEventListener('fullscreenchange', fullscreenchange, false);
        document.addEventListener('mozfullscreenchange', fullscreenchange, false);
        element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
        element.requestFullscreen();
    } else {
        element.requestPointerLock();
    }
})



//////////////////////////////////////////////////////////////////////////////
//		Code Separator
//////////////////////////////////////////////////////////////////////////////



var container = null;

// set default page
if (location.hash === '') {
    if (container) container.parent.remove(container);
    container = createImageMono();
    scene.add(container);
}

// switch video source
function switchSource(index) {
    currentIndex = index;
    if (container) container.parent.remove(container);
    if (index == 0)
        container = createImageMono();
    else
        container = createVideo(index);

    scene.add(container);
    resetControlBar(); // reset control
}


document.addEventListener('sourceChange', function onSourceChange(event) {
    console.log('sourceChange', event)
})

function createImageMono() {

    var geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);

    var material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('image/' + videoSource[0])
    });
    material.map.minFilter = THREE.LinearFilter;
    material.map.format = THREE.RGBFormat;

    var mesh = new THREE.Mesh(geometry, material);
    return mesh;
}



function createVideo(index) {
    var geometry = new THREE.SphereBufferGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);

    video.width = 640;
    video.height = 360;
    video.autoplay = true;
    video.loop = true;
    video.src = "video/" + videoSource[index];
    var texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;
    var material = new THREE.MeshBasicMaterial({
        map: texture
    });
    mesh = new THREE.Mesh(geometry, material);


    function onClick() {
        video.play()
        document.body.removeEventListener('click', onClick)
    }
    document.body.addEventListener('click', onClick)

    document.addEventListener('sourceChange', function onSourceChange(event) {
        video.pause()
        document.removeEventListener('sourceChange', onSourceChange)
        document.body.removeEventListener('click', onClick)
    })
    return mesh;

}
