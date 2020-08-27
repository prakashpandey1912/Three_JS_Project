(function () {
  
  let scene, //modal scene
  renderer, //render
  camera, //view camera
  model, // Our character
  possibleAnims, // Animations Click
  mixer, // THREE.js animations mixer
  idle, // Idle, the default state 
  clock = new THREE.Clock(), // Used for anims, which run to a clock instead of frame rate 
  currentlyAnimating = false, // Used to check whether characters neck is being used in another anim
  raycaster = new THREE.Raycaster(); // Used to detect the click on our character
  var myMusic;

  init();

  function init() {
    //modal or canvas ko variable me store kiyaaa
    const MODEL_PATH = "stacy_lightweight_prakash.glb";
    const canvas = document.querySelector('#c');
    const backgroundColor = 0xf1f1f1;
    
    // Init the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    scene.fog = new THREE.Fog(backgroundColor, 30, 100);
    
    // Init the renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);
    
    // camera position add jidar modal display hogaa
    camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.2,
    1000);
    camera.position.z = 30;
    camera.position.x = 0;
    camera.position.y = -3; 

// create a global audio source
// load a sound and set it as the Audio object's buffer
    // create a global audio source
    // load a sound and set it as the Audio object's buffer
    
    //color set for modal
     const stacy_mtl = new THREE.MeshPhongMaterial({
      color: "pink",
      skinning: true });

    //this load a modal jisase modal dikhegaa
    var loader = new THREE.GLTFLoader();
    loader.load(
    MODEL_PATH,
    function (gltf) {
      model = gltf.scene;
      console.log(model);
      let fileAnimations = gltf.animations;
      console.log(fileAnimations);
      model.traverse(o => {
      if (o.isMesh) {
      
      //shadow dikhana hai ya nahi
      o.castShadow = true;
      o.receiveShadow = true;
      
      //colour kesa ho modal ka
      o.material = stacy_mtl;
  }  
 });
      model.scale.set(7, 7,7);
      model.position.y = -11;
      scene.add(model);

      //isase modal ke movement diya hai
      mixer = new THREE.AnimationMixer(model);

      //clip me sare animation aa jaegaa idle ko chd ke
      let clips = fileAnimations.filter(val => val.name !== 'idle');
      console.log(clips);

      // animation liyaa hua hai ye pata chlegaa
      possibleAnims = clips.map(val => {
        let clip = THREE.AnimationClip.findByName(clips,val.name);
        clip.tracks.splice(3, 3);
        clip.tracks.splice(9, 3);
        clip = mixer.clipAction(clip);
        return clip;
      });
      console.log(possibleAnims);

      //first time jab aaegaa bina click ke to esa dikhana hai 
      let idleAnim = THREE.AnimationClip.findByName(fileAnimations, 'idle');
      idleAnim.tracks.splice(3, 3);
      idleAnim.tracks.splice(9, 3);
      idle = mixer.clipAction(idleAnim);
      idle.play();
      console.log(idleAnim);
    },
    undefined,
    function (error) {
      console.error(error);
    });

    // Add lights
    // Add hemisphere light to modal
    let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    //Add Directional light to modal
    let d = 8.25;
    let dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
    dirLight.position.set(-8, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 1500;
    dirLight.shadow.camera.left = d * -1;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = d * -1;
    scene.add(dirLight);

    // Add Floor jisame modal stand hai
    let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
    let floorMaterial = new THREE.MeshPhongMaterial({
      color: 0xeeeeee,
      shininess: 10 });
    let floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -0.5 * Math.PI;
    floor.receiveShadow = true;
    floor.position.y = -11;
    scene.add(floor);
  }

    //update the modal
  function update() {
    if (mixer) {
      mixer.update(clock.getDelta());
    }
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(update);
  }

  update();

  //resize the pixel and clear the modal
  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let canvasPixelWidth = canvas.width / window.devicePixelRatio;
    let canvasPixelHeight = canvas.height / window.devicePixelRatio;
    const needResize =
    canvasPixelWidth !== width || canvasPixelHeight !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  // modal ke click ke kya honaa cheyaa 
  window.addEventListener('click', e => raycast(e));
  
  function raycast(e, touch = false) {
    var mouse = {};
    if (touch) {
      mouse.x = 2 * (e.changedTouches[0].clientX / window.innerWidth) - 1;
      mouse.y = 1 - 2 * (e.changedTouches[0].clientY / window.innerHeight);
    } else {
      mouse.x = 2 * (e.clientX / window.innerWidth) - 1;
      mouse.y = 1 - 2 * (e.clientY / window.innerHeight);
    }

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene.children, true);

    //particular body pe click hone pe animation chle 
    if (intersects[0]) {
      var object = intersects[0].object;
      if (object.name === 'stacy') {
     if (!currentlyAnimating) {
          currentlyAnimating = true;
          playOnClick();
        }
      }
    }
  }

  // Get a animation and play it 
  function playOnClick() {
    console.log(possibleAnims);
    var data=0;
        var x=document.getElementsByName("animation")
        x.forEach((xx) => {
          if (xx.checked) {
          console.log("You rated: "+xx.value);
          data=xx.value;
        }
        })
        myMusic= document.getElementById(data+"Audio");
        myMusic.play();
        console.log(myMusic.play());
        console.log(data);
    playModifierAnimation(idle, 0.25, possibleAnims[data], 0.25);
  }

  //play animation from this and set currenrly Animatinf false to stop
  function playModifierAnimation(from, fSpeed, to, tSpeed) {
    to.setLoop(THREE.LoopOnce);
    to.reset();
    to.play();
    from.crossFadeTo(to, fSpeed, true);
    setTimeout(function () {
      from.enabled = true;
      to.crossFadeTo(from, tSpeed, true);
      currentlyAnimating = false;
      myMusic.pause(); 
    }, to._clip.duration * 1000 - (tSpeed + fSpeed) * 1000);
  }

})();