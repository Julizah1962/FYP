import { loadAudio } from "/FYP/libs/loader.js";
import { DRACOLoader } from "/FYP/libs/three.js-r132/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "/FYP/libs/three.js-r132/examples/jsm/loaders/GLTFLoader.js";

const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', () => {
  const start = async () => {
    try {

      // Back Button (Top-Left)
      const backBtn = document.createElement("a");
      backBtn.innerHTML = "&#11013;";
      backBtn.href = "caraPeredaranDarah.html"; 
      backBtn.style.position = "absolute";
      backBtn.style.top = "10px";
      backBtn.style.left = "10px";
      backBtn.style.fontSize = "70px";
      backBtn.style.fontWeight = "bold";
	  backBtn.style.textDecoration = "none";
	  backBtn.style.color = "black";
	  backBtn.style.transition ="transform 0.2s ease, color 0.2s ease";
	  backBtn.style.cursor = "pointer";
      backBtn.style.zIndex = "9999";
      document.body.appendChild(backBtn);

      // Audio Toggle Button (Top-Right)
      const audioBtn = document.createElement("div");
      audioBtn.innerHTML = "🔊";
      audioBtn.style.position = "absolute";
      audioBtn.style.top = "10px";
      audioBtn.style.right = "10px";
      audioBtn.style.fontSize = "50px";
      audioBtn.style.cursor = "pointer";
      audioBtn.style.zIndex = "9999";
      document.body.appendChild(audioBtn);


      /* -------------------------
         MINDAR + THREE SETUP
      --------------------------*/

      const mindarThree = new window.MINDAR.IMAGE.MindARThree({
        container: document.body,
        imageTargetSrc: '/FYP/assets/targets/seldarahmerah.mind',
      });

      const { renderer, scene, camera } = mindarThree;
      const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
      scene.add(light);

      const dLoader = new DRACOLoader();
      dLoader.setDecoderPath('/FYP/libs/draco/');
      dLoader.setDecoderConfig({ type: 'js' });

      const gltfLoader = new GLTFLoader();
      gltfLoader.setDRACOLoader(dLoader);

      const kadazan2 = await new Promise((resolve, reject) => {
        gltfLoader.load('/FYP/assets/models/seldarahmerah.glb', resolve, undefined, reject);
      });

      kadazan2.scene.scale.set(0.2, 0.2, 0.2);
      kadazan2.scene.position.set(0, 0, 0);

      const anchor1 = mindarThree.addAnchor(0);
      anchor1.group.add(kadazan2.scene);


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


      const mixer1 = new THREE.AnimationMixer(kadazan2.scene);
      const action1 = mixer1.clipAction(kadazan2.animations[0]);
      action1.play();

      const clock = new THREE.Clock();

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
