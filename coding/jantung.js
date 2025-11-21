import { loadAudio } from "/FYP/libs/loader.js";
import { DRACOLoader } from "/FYP/libs/three.js-r132/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "/FYP/libs/three.js-r132/examples/jsm/loaders/GLTFLoader.js";

const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', () => {
  const start = async () => {
    try {

      // ---------------------------------------------------------
      // BACK BUTTON
      // ---------------------------------------------------------
      const backBtn = document.createElement("a");
      backBtn.innerHTML = "&#11013;";
      backBtn.href = "organ.html"; 
      backBtn.style.position = "absolute";
      backBtn.style.top = "10px";
      backBtn.style.left = "10px";
      backBtn.style.fontSize = "70px";
      backBtn.style.fontWeight = "bold";
      backBtn.style.textDecoration = "none";
      backBtn.style.color = "black";
      backBtn.style.cursor = "pointer";
      backBtn.style.zIndex = "9999";
      document.body.appendChild(backBtn);

      // ---------------------------------------------------------
      // AUDIO BUTTON
      // ---------------------------------------------------------
      const audioBtn = document.createElement("div");
      audioBtn.innerHTML = "🔊";
      audioBtn.style.position = "absolute";
      audioBtn.style.top = "10px";
      audioBtn.style.right = "90px";
      audioBtn.style.fontSize = "50px";
      audioBtn.style.cursor = "pointer";
      audioBtn.style.zIndex = "9999";
      document.body.appendChild(audioBtn);

      // ---------------------------------------------------------
      // INFO BUTTON
      // ---------------------------------------------------------
      const infoBtn = document.createElement("div");
      infoBtn.innerHTML = "♥️";
      infoBtn.style.position = "absolute";
      infoBtn.style.top = "10px";
      infoBtn.style.right = "20px";
      infoBtn.style.fontSize = "50px";
      infoBtn.style.cursor = "pointer";
      infoBtn.style.zIndex = "9999";
      document.body.appendChild(infoBtn);


      // ---------------------------------------------------------
      // CUTE CARTOON INFO TEXT BUBBLE
      // ---------------------------------------------------------
      const infoText = document.createElement("div");
      infoText.innerText = "JANTUNG - Organ yang mengepam darah ke seluruh badan ❤️";

      infoText.style.position = "absolute";
      infoText.style.bottom = "30px";
      infoText.style.left = "50%";
      infoText.style.transform = "translateX(-50%)";

      infoText.style.padding = "18px 28px";
      infoText.style.maxWidth = "85%";

      infoText.style.background = "#ffe6f2";              
      infoText.style.border = "3px solid #ff99cc";        
      infoText.style.color = "#ff3385";                   

      infoText.style.fontSize = "24px";
      infoText.style.fontWeight = "bold";
      infoText.style.fontFamily = "'Comic Sans MS', 'Poppins', sans-serif";

      infoText.style.borderRadius = "25px";               
      infoText.style.boxShadow = "0px 8px 18px rgba(255, 100, 150, 0.3)";

      infoText.style.display = "none";
      infoText.style.zIndex = "9999";
      infoText.style.textAlign = "center";

      infoText.style.transition = "all 0.25s ease";
      infoText.style.transformOrigin = "center";
      infoText.style.opacity = "0";

      document.body.appendChild(infoText);

      let infoShown = false;

      infoBtn.onclick = () => {
        infoShown = !infoShown;

        if (infoShown) {
          infoText.style.display = "block";

          setTimeout(() => {
            infoText.style.opacity = "1";
            infoText.style.transform = "translateX(-50%) scale(1.05)";
          }, 10);

          setTimeout(() => {
            infoText.style.transform = "translateX(-50%) scale(1)";
          }, 150);

        } else {
          infoText.style.opacity = "0";
          infoText.style.transform = "translateX(-50%) scale(0.9)";

          setTimeout(() => {
            infoText.style.display = "none";
          }, 200);
        }
      };


      // ---------------------------------------------------------
      // AR INITIALIZATION
      // ---------------------------------------------------------
      const mindarThree = new window.MINDAR.IMAGE.MindARThree({
        container: document.body,
        imageTargetSrc: '/FYP/assets/targets/jantung.mind',
      });

      const { renderer, scene, camera } = mindarThree;

      const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
      scene.add(light);

      const dLoader = new DRACOLoader();
      dLoader.setDecoderPath('/FYP/libs/draco/');
      dLoader.setDecoderConfig({ type: 'js' });

      const gltfLoader = new GLTFLoader();
      gltfLoader.setDRACOLoader(dLoader);

      const model = await new Promise((resolve, reject) => {
        gltfLoader.load('/FYP/assets/models/jantung.glb', resolve, undefined, reject);
      });

      model.scene.scale.set(0.2, 0.2, 0.2);
      model.scene.position.set(0, 0, 0);

      const anchor1 = mindarThree.addAnchor(0);
      anchor1.group.add(model.scene);


      // ---------------------------------------------------------
      // AUDIO SETUP
      // ---------------------------------------------------------
      const audioClip1 = await loadAudio('/FYP/assets/sounds/jantung.mp4');
      const listener1 = new THREE.AudioListener();
      camera.add(listener1);

      const audio1 = new THREE.PositionalAudio(listener1);
      anchor1.group.add(audio1);

      audio1.setBuffer(audioClip1);
      audio1.setLoop(true);
      audio1.setRefDistance(9999999999);

      let audioEnabled = true;

      audioBtn.onclick = () => {
        if (audioEnabled) {
          audio1.pause();
          audioEnabled = false;
          audioBtn.innerHTML = "🔇";
        } else {
          audio1.play();
          audioEnabled = true;
          audioBtn.innerHTML = "🔊";
        }
      };


      // ---------------------------------------------------------
      // MODEL ANIMATION
      // ---------------------------------------------------------
      const mixer1 = new THREE.AnimationMixer(model.scene);
      const action1 = mixer1.clipAction(model.animations[0]);
      action1.play();

      const clock = new THREE.Clock();


      // ---------------------------------------------------------
      // ROTATE & ZOOM FUNCTIONALITY
      // ---------------------------------------------------------
      let isDragging = false;
      let previousX = 0;
      let previousY = 0;
      let modelRotation = model.scene.rotation;

      // Desktop drag rotate
      document.addEventListener("mousedown", (e) => {
        isDragging = true;
        previousX = e.clientX;
        previousY = e.clientY;
      });

      document.addEventListener("mouseup", () => {
        isDragging = false;
      });

      document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const dx = e.clientX - previousX;
        const dy = e.clientY - previousY;
        modelRotation.y += dx * 0.01;
        modelRotation.x += dy * 0.01;
        previousX = e.clientX;
        previousY = e.clientY;
      });

      // Desktop wheel zoom
      document.addEventListener("wheel", (e) => {
        const scale = model.scene.scale.x + (e.deltaY > 0 ? -0.02 : 0.02);
        if (scale > 0.05 && scale < 1) {
          model.scene.scale.set(scale, scale, scale);
        }
      });

      // Mobile pinch zoom
      let pinchStart = 0;

      document.addEventListener("touchmove", (e) => {
        if (e.touches.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (pinchStart === 0) pinchStart = distance;

          let zoom = model.scene.scale.x + (distance - pinchStart) * 0.0005;
          if (zoom > 0.05 && zoom < 1) {
            model.scene.scale.set(zoom, zoom, zoom);
          }
        }
      });

      document.addEventListener("touchend", () => {
        pinchStart = 0;
      });


      // ---------------------------------------------------------
      // RENDER LOOP
      // ---------------------------------------------------------
      await mindarThree.start();

      renderer.setAnimationLoop(() => {
        const delta = clock.getDelta();
        mixer1.update(delta);
        renderer.render(scene, camera);
      });

    } catch (error) {
      console.error("Error initializing AR experience:", error);
    }
  };

  start();
});
