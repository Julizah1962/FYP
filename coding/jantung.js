import { loadAudio } from "/FYP/libs/loader.js";
import { DRACOLoader } from "/FYP/libs/three.js-r132/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "/FYP/libs/three.js-r132/examples/jsm/loaders/GLTFLoader.js";

const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener("DOMContentLoaded", () => {
  const start = async () => {
    try {

      /* ================= UI ================= */

      const backBtn = document.createElement("a");
      backBtn.innerHTML = "&#11013;";
      backBtn.href = "organ.html";
      Object.assign(backBtn.style, {
        position: "absolute",
        top: "10px",
        left: "10px",
        fontSize: "45px",
        fontWeight: "bold",
        color: "black",
        textDecoration: "none",
        cursor: "pointer",
        zIndex: 9999
      });
      document.body.appendChild(backBtn);

      const audioBtn = document.createElement("div");
      audioBtn.innerHTML = "🔇";
      Object.assign(audioBtn.style, {
        position: "absolute",
        top: "10px",
        right: "90px",
        fontSize: "50px",
        cursor: "pointer",
        zIndex: 9999
      });
      document.body.appendChild(audioBtn);

      const infoBtn = document.createElement("div");
      infoBtn.innerHTML = "❤️";
      Object.assign(infoBtn.style, {
        position: "absolute",
        top: "10px",
        right: "20px",
        fontSize: "50px",
        cursor: "pointer",
        zIndex: 9999
      });
      document.body.appendChild(infoBtn);

      const infoText = document.createElement("div");
      infoText.innerText = "JANTUNG - mengepam darah ke seluruh badan 🫀";
      Object.assign(infoText.style, {
        position: "absolute",
		textAlign: "center", 
        bottom: "30px",
		left: "20px",
		right: "20px",
        padding: "15px 15px",
        background: "#ffe6f2",
        border: "3px solid #ff99cc",
        color: "#ff3385",
        fontSize: "20px",
        fontWeight: "bold",
        borderRadius: "25px",
        boxShadow: "0 8px 18px rgba(255,100,150,0.3)",
        display: "none",
        opacity: "0",
        transition: "opacity 0.25s ease",
        zIndex: 9999
      });
      document.body.appendChild(infoText);

      let infoShown = false;

      /* ================= MINDAR ================= */

      const mindarThree = new window.MINDAR.IMAGE.MindARThree({
        container: document.body,
        imageTargetSrc: "/FYP/assets/targets/jantung.mind"
      });

      const { renderer, scene, camera } = mindarThree;
      scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1));

      /* ================= MODEL ================= */

      const draco = new DRACOLoader();
      draco.setDecoderPath("/FYP/libs/draco/");

      const loader = new GLTFLoader();
      loader.setDRACOLoader(draco);

      const model = await new Promise((res, rej) => {
        loader.load("/FYP/assets/models/jantung.glb", res, null, rej);
      });

      model.scene.scale.set(0.2, 0.2, 0.2);

      const anchor = mindarThree.addAnchor(0);
      anchor.group.add(model.scene);

      /* ================= AUDIO ================= */

      const listener = new THREE.AudioListener();
      camera.add(listener);

      const soundBtnSFX = new THREE.Audio(listener);
      soundBtnSFX.setBuffer(await loadAudio("/FYP/assets/sounds/buttonicon.mp4"));

      const infoBtnSFX = new THREE.Audio(listener);
      infoBtnSFX.setBuffer(await loadAudio("/FYP/assets/sounds/infotext.mp4"));

      const screenTapSFX = new THREE.Audio(listener);
      screenTapSFX.setBuffer(await loadAudio("/FYP/assets/sounds/tapscreen.mp4"));

      const playSFX = (audio) => {
        if (audio.isPlaying) audio.stop();
        audio.play();
      };

		//button icon
      const narration = new THREE.PositionalAudio(listener);
      narration.setBuffer(await loadAudio("/FYP/assets/sounds/jantung.mp4"));
      narration.setLoop(true);
      narration.setRefDistance(999999);
      anchor.group.add(narration);
	  let audioEnabled = false;
      audioBtn.onclick = (e) => {
        e.stopPropagation();
        playSFX(soundBtnSFX);

        audioEnabled ? narration.stop() : narration.play();
        audioEnabled = !audioEnabled;
        audioBtn.innerHTML = audioEnabled ? "🔊" : "🔇";
      };

	//screen tap and when model shown
      const breathing = new THREE.Audio(listener);
      breathing.setBuffer(await loadAudio("/FYP/assets/sounds/JantungBerdetak.mp4"));
      breathing.setLoop(true);
      breathing.setVolume(2.0);
      anchor.group.add(breathing);
	  
	  anchor.onTargetFound = () => {
        breathing.play();
      };

      anchor.onTargetLost = () => {
        breathing.pause();
      };
	  
	  let autoPlaying = true;

      document.addEventListener("click", () => {
        if (autoPlaying) {
          breathing.pause();
		  playSFX(soundBtnSFX);
          autoPlaying = false;
        } else {
          breathing.play();
		  playSFX(soundBtnSFX);
          autoPlaying = true;
        }
      });

      document.addEventListener("touchstart", () => {
        if (autoPlaying) {
          breathing.pause();
          autoPlaying = false;
        } else {
          breathing.play();
          autoPlaying = true;
        }
      });


      /* ================= EVENTS ================= */

      backBtn.onclick = (e) => {
        e.stopPropagation();
        playSFX(screenTapSFX);
        window.location.href = "organ.html";
      };

	//info text
      infoBtn.onclick = (e) => {
        e.stopPropagation();
        playSFX(infoBtnSFX);

        infoShown = !infoShown;
        infoText.style.display = infoShown ? "block" : "none";
        infoText.style.opacity = infoShown ? "1" : "0";
		infoBtn.innerHTML = infoShown ? "💙" : "❤️";
		
      };

      /* ================= ANIMATION ================= */

      const mixer = new THREE.AnimationMixer(model.scene);
      mixer.clipAction(model.animations[0]).play();
      const clock = new THREE.Clock();

      await mindarThree.start();

      renderer.setAnimationLoop(() => {
        mixer.update(clock.getDelta());
        renderer.render(scene, camera);
      });

    } catch (err) {
      console.error("AR init error:", err);
    }
  };

  start();
});
