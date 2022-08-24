let container;
let camera;
let renderer;
let scene;
let bridge;
let controls;
let time='day';
let sunLight;
let lampLightsR=[];
let lampLightsL=[];
let roofLights=[];
let lampLightHelperL=[];
let lampLightHelperR=[];
let roofLightHelper=[];
let sphere1;
let material1;
let geometry1;
let mixer;
let moonTexture;
let sunX=-300,sunY=0;
let a=1,b=1;
let rise=true;
let orbitRadius=300;
let pause=false;
let r=255;
let g=170;
let bl=50;

const clock= new THREE.Clock();

function init(){
    container=document.querySelector('.scene');

    window.addEventListener('keypress',(event)=>{
        console.log(event.key);
        if(event.key=='n'){
            time='night';
        }
        else if(event.key=='d'){
            time='day';
        }
        else if(event.key==' '){
            pause=!pause;
        }
    })

    //Create scene
    scene= new THREE.Scene();

    const fov=35;
    const aspect=container.clientWidth/container.clientHeight;
    const near=0.1;
    const far=2000;

    camera=new THREE.PerspectiveCamera(fov,aspect,near,far);
    camera.position.set(-200,100,350);

    renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
    renderer.setSize(container.clientWidth,container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    controls=new THREE.OrbitControls(camera,renderer.domElement);
    controls.addEventListener('change',renderer);
    controls.listenToKeyEvents(window);

    // controls.maxAzimuthAngle =(1.309);
    // controls.minAzimuthAngle =(-1.309);

    controls.maxPolarAngle =(1.5);
    controls.minPolarAngle  =(0);

    // controls.maxZoom=-600;
    
    moonTexture = new THREE.TextureLoader().load( './3d/moon_texture.jpg' );

   //lights
    const ambient=new THREE.AmbientLight(0xffffff,0.25);
    scene.add(ambient);

    //for sun
    sunLight=new THREE.DirectionalLight(0x0000ff,5);//0xFCF9D9
    sunLight.position.set(-100,10,0);
    // const helper = new THREE.DirectionalLightHelper( sunLight, 10 ,0xffffff);
    // scene.add( helper );
    // scene.add(sunLight);

    //sun model
    geometry1 = new THREE.SphereGeometry( 15, 32, 16 );
    material1 = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    sphere1 = new THREE.Mesh( geometry1, material1 );
    scene.add( sphere1 );
    sphere1.position.set(-100,200,0)

    //right lamps
    let pointLightColor=0xffff00;
    let pointLightIntensity=0.25;
    let pointLightDistance=50;
    let pointLightDecay=1;
    let pointLightXr=-49;
    let pointLightY=6.6;
    let tempZ=10.25;
    const sphereSize = 1;
    for(let i=0;i<6;i++){
        lampLightsR[i]=new THREE.PointLight( pointLightColor, pointLightIntensity, pointLightDistance,pointLightDecay );
        lampLightsR[i].position.set( pointLightXr, pointLightY, tempZ );
        scene.add( lampLightsR[i] );
        lampLightHelperR[i] = new THREE.PointLightHelper( lampLightsR[i], sphereSize );
        scene.add( lampLightHelperR[i] );
        tempZ+=13.6;

    }

    //left lamps
    let pointLightXl=-71;
    tempZ=10.25;
    for(let i=0;i<6;i++){
        lampLightsL[i]=new THREE.PointLight( pointLightColor, pointLightIntensity, pointLightDistance,pointLightDecay );
        lampLightsL[i].position.set( pointLightXl, pointLightY, tempZ );
        scene.add( lampLightsL[i] );
        lampLightHelperL[i] = new THREE.PointLightHelper( lampLightsL[i], sphereSize );
        scene.add( lampLightHelperL[i] );
        tempZ+=13.6;

    }
    
    //Load Model
    let loader=new THREE.GLTFLoader();
    loader.load('./3d/all final.gltf',(gltf)=>{
        scene.add(gltf.scene);
        console.log(gltf.scene);

        for(const child of gltf.scene.children){
            if(child.name=="Plane001"){
                // child.material= new THREE.MeshBasicMaterial();
                child.material.color=new THREE.Color(0x7BFFED);
                child.material.transparent=true;
                child.material.opacity=0.9;
                // child.material.combine=1;
            }
            // else if(child.name=="roof_shape001_Cone001" || child.name=="roof_shape_Cone003" || child.name=="roof_shape003_Cone005" || child.name=="roof_shape002_Cone002" || child.name=="roof_shape002_Cone001" || child.name=="roof_shape003_Cone001" || child.name=="roof_shape_Cone002"){
            //     child.material.color=new THREE.Color(0x323232);
            // }     
            else if(child.name=="Cube001"){
                child.material.roughness=1;
            }
        }
        mixer=new THREE.AnimationMixer(gltf.scene);
        const clips=gltf.animations;
        console.log(clips);
        const clip=THREE.AnimationClip.findByName(clips,'KeyAction');
        const action=mixer.clipAction(clip);
        action.play();
        animate();
    });
}

function animate(){
    
    if(time=='day'){
        if(!pause){
            if(rise){
                sunX+=a;
                sunY=Math.sqrt(Math.pow(orbitRadius,2)-Math.pow(sunX,2));
                g=((sunY*85)/orbitRadius) + 170;
                bl=((sunY*155)/orbitRadius) + 50;
            }
            if(sunY>300){
                rise=false;
            }
            if(!rise){
                sunX+=a;
                sunY=Math.sqrt(Math.pow(orbitRadius,2)-Math.pow(sunX,2));
                g-=((sunY*85)/orbitRadius) ;
                bl-=((sunY*155)/orbitRadius) ;
            }
            if(sunY==0){
                time='night';
                rise=true;
                sunX=-300;
                sunY=0;
            }
        }
        document.body.classList.add('day');
        document.body.classList.remove('night');
        for(let i=0;i<6;i++){
            scene.remove(lampLightsR[i]);
        }
        for(let i=0;i<6;i++){
            scene.remove(lampLightsL[i]);
        }
        scene.remove(sunLight);
        let color=new THREE.Color(r/255,g/255,bl/255);
        sunLight=new THREE.DirectionalLight(color,2);
        sunLight.position.set(sunX,sunY,0);
        scene.add(sunLight);
        scene.remove(sphere1);
        material1 = new THREE.MeshBasicMaterial( { color: color } );
        sphere1 = new THREE.Mesh( geometry1, material1 );
        scene.add( sphere1 );
        sphere1.position.set(sunX,sunY,0)

    }
    else if(time=='night'){
        if(!pause){
            if(rise){
                sunX+=a;
                sunY=Math.sqrt(Math.pow(orbitRadius,2)-Math.pow(sunX,2));
            }
            if(sunY>300){
                rise=false;
            }
            if(!rise){
                sunX+=a;
                sunY=Math.sqrt(Math.pow(orbitRadius,2)-Math.pow(sunX,2));
            }
            if(sunY==0){
                time='day';
                rise=true;
                sunX=-300;
                sunY=0;
            }
        }
        document.body.classList.add('night');
        document.body.classList.remove('day');
        for(let i=0;i<6;i++){
            scene.add(lampLightsR[i]);
        }
        for(let i=0;i<6;i++){
            scene.add(lampLightsL[i]);
        }
        scene.remove(sunLight);
        sunLight=new THREE.DirectionalLight(0xc2c5cc,0.8);
        sunLight.position.set(sunX,sunY,0);
        scene.add(sunLight);
        scene.remove(sphere1);
        material1 = new THREE.MeshBasicMaterial( { map: moonTexture } );
        // material1 = new THREE.MeshBasicMaterial( { color: 0xffffff } );
        sphere1 = new THREE.Mesh( geometry1, material1 );
        scene.add( sphere1 );
        sphere1.position.set(sunX,sunY,0)

    }
    mixer.update(clock.getDelta());
    renderer.render(scene,camera);
    requestAnimationFrame(animate);
}

init();

function onWindowResize(){
    camera.aspect=container.clientWidth/container.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.clientWidth,container.clientHeight);

}

window.addEventListener("resize",onWindowResize);