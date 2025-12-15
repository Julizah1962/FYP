import { loadAudio } from "/FYP/libs/loader.js";
import { DRACOLoader } from "/FYP/libs/three.js-r132/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "/FYP/libs/three.js-r132/examples/jsm/loaders/GLTFLoader.js";

const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', () => {
  const start = async () => {
    try {

      // ================= BACK BUTTON =================
      const backBtn = document.createElement("a");
      backBtn.innerHTML = "&#11013;";
      backBtn.href = "caraPeredaranDarah.html"; 
      Object.assign(backBtn.style, {
        position: "absolute",
        top: "10px",
        left: "10px",
        fontSize: "45px",
        fontWeight: "bold",
        textDecoration: "none",
        color: "black",
        cursor: "pointer",
        zIndex: "9999"
      });
      document.body.appendChild(backBtn);

      // ================= INFO TEXT =================
      const infoText = document.createElement("div");
      Object.assign(infoText.style, {
        position: "absolute",
        textAlign: "center",
        bottom: "30px",
        left: "20px",
		right: "20px",
        padding: "15px 15px",
        background: "#ffe6f2",
        color: "ff3385",
        fontSize: "22px",
        borderRadius: "12px",
		boxShadow: "0 8px 18px rgba(255,100,150,0.3)",
        display: "none",
        zIndex: "9999",
		transition: "opacity 0.25s ease",
      });
      document.body.appendChild(infoText);

      // ================= INFO CONTENT =================
      const infoList = [
        "🫀 Setiap kali jantung berdegup, darah akan dipam masuk ke jantung dan dipam keluar dari jantung",
        "🎈 Sistem Peredaran Darah terdiri daripada jantung, paru-paru, saluran darah dan sel darah merah",
		"❤️ Sistem Peredaran Darah berfungsi untuk mengangkut darah bagi menyampaikan oksigen, nutrien, hormon",
		"🫁 Sistem ini juga membawa bahan buangan seperti karbon dioksida ke organ penyingkiran.",
        "🔄 Sistem peredaran darah ini sentiasa bekerja tanpa henti untuk memastikan setiap sel dalam badan menerima oksigen dan nutrien yang mencukupi. 💪"
      ];
      let infoIndex = 0;

      // ================= SOUND EFFECT =================
      const tapSound = new Audio("/FYP/assets/sounds/tapscreen.mp4");
      tapSound.volume = 0.6;

      // ================= BACKGROUND MUSIC =================
      const bgMusic = new Audio("/FYP/assets/sounds/backgroundInfo.mp4");
      bgMusic.loop = true;
      bgMusic.volume = 0.4;
      let musicPlaying = false;

      const musicBtn = document.createElement("div");
      musicBtn.innerHTML = "🎵";
      Object.assign(musicBtn.style, {
        position: "absolute",
        top: "30px",
        right: "25px",
        fontSize: "40px",
        cursor: "pointer",
        zIndex: "9999"
      });
      document.body.appendChild(musicBtn);

      musicBtn.onclick = () => {
        if (musicPlaying) {
          bgMusic.pause();
          musicBtn.innerHTML = "🎵";
        } else {
          bgMusic.play();
		  bgMusic.volume = 0.05;
          musicBtn.innerHTML = "⏸️";
        }
        musicPlaying = !musicPlaying;
      };

      // ================= TAP SCREEN INFO =================
      document.addEventListener("click", (e) => {
        if (e.target === infoText || e.target === musicBtn || e.target === backBtn) return;

        infoText.innerText = infoList[infoIndex];
        infoText.style.display = "block";

        tapSound.currentTime = 0;
        tapSound.play();

        infoIndex = (infoIndex + 1) % infoList.length;
      });


      // ================= AR INIT =================
      const mindarThree = new window.MINDAR.IMAGE.MindARThree({
        container: document.body,
        imageTargetSrc: '/FYP/assets/targets/peredarandarah.mind',
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
        gltfLoader.load('/FYP/assets/models/simulation.glb', resolve, undefined, reject);
      });

      model.scene.scale.set(0.2, 0.2, 0.2);
      model.scene.position.set(0, 0, 0);

      const anchor1 = mindarThree.addAnchor(0);
      anchor1.group.add(model.scene);

      // ================= ANIMATION =================
      const mixer1 = new THREE.AnimationMixer(model.scene);
      const action1 = mixer1.clipAction(model.animations[0]);
      action1.play();

      const clock = new THREE.Clock();

      // ================= ROTATE & ZOOM =================
      let isDragging = false;
      let previousX = 0;
      let previousY = 0;
      let modelRotation = model.scene.rotation;

      document.addEventListener("mousedown", (e) => {
        isDragging = true;
        previousX = e.clientX;
        previousY = e.clientY;
      });

      document.addEventListener("mouseup", () => isDragging = false);

      document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const dx = e.clientX - previousX;
        const dy = e.clientY - previousY;
        modelRotation.y += dx * 0.01;
        modelRotation.x += dy * 0.01;
        previousX = e.clientX;
        previousY = e.clientY;
      });

      document.addEventListener("wheel", (e) => {
        const scale = model.scene.scale.x + (e.deltaY > 0 ? -0.02 : 0.02);
        if (scale > 0.05 && scale < 1) {
          model.scene.scale.set(scale, scale, scale);
        }
      });

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

      document.addEventListener("touchend", () => pinchStart = 0);

      // ================= RENDER LOOP =================
      await mindarThree.start();
      renderer.setAnimationLoop(() => {
        mixer1.update(clock.getDelta());
        renderer.render(scene, camera);
      });

    } catch (error) {
      console.error("Error initializing AR experience:", error);
    }
  };

  start();
});
