import React, { Component } from "react";
import ReactDOM from "react-dom";
import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {Vector3} from "three";
import {Object3D} from "three";

class ExampleAnimation extends Component {

    constructor(props){
        super(props);
        this.state = {
        };
    }
    componentDidMount() {
        this.sceneSetup();
        this.startAnimationLoop();
        this.handleWindowResize();

        window.addEventListener('resize', this.handleWindowResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowResize);
        window.cancelAnimationFrame(this.requestID);
        this.controls.dispose();

    }

    handleWindowResize = () => {

        const width = window.innerWidth;
        const height = window.outerHeight;

        this.renderer.setSize( width, height );
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.setState({
            width: document.getElementById('root').clientWidth * 0.7,

        });
    };

    sceneSetup = () => {
        // get container dimensions and use them for scene sizing
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75, // fov = field of view
            width / height, // aspect ratio
            0.1, // near plane
            1000 // far plane
        );
        this.camera.position.x = 20;
        this.camera.position.y = 20;
        this.camera.position.z = 20;

        // this.cameraParent = new Object3D();
        // this.cameraParent.add(this.camera);
        // // set some distance from a cube that is located at z = 0
        // this.scene.add(this.cameraParent);
        // this.cameraParent.position.z = -1;
        // console.log(this.cameraParent.position);

        this.renderer = new THREE.WebGLRenderer({alpha : true});
        this.renderer.setClearColor( 0x000000, 0); // the default
        this.renderer.setSize( width, height );
        this.el.appendChild( this.renderer.domElement ); // mount using React ref

        // const loader = new GLTFLoader().setPath( process.env.PUBLIC_URL );
        // loader.load( 'python.gltf', (gltf)=> {
        //     gltf.scene.traverse( ( child )=> {
        //         if ( child.isMesh ) {
        //             const normalMaterial = new THREE.MeshNormalMaterial();
        //             child.material = normalMaterial;
        //             this.scene.add( gltf.scene );
        //         }
        //     } );
        // } );
        this.mixer = null;
        this.loaded = false;
        const loader = new GLTFLoader().setPath( process.env.PUBLIC_URL );
        loader.load( 'cube-animation.gltf', (gltf)=> {
            console.log(gltf);
            var clip = gltf.animations[0];
            gltf.scene.traverse( ( child )=> {
                console.log("gltf obj: ", child.name);
                if ( child.isMesh ) {
                    const normalMaterial = new THREE.MeshNormalMaterial();
                    child.material = normalMaterial;
                    if(child.name == "Cube"){
                        // Create an AnimationMixer, and get the list of AnimationClip instances
                        this.mixer = new THREE.AnimationMixer( child );
                        const action = this.mixer.clipAction( clip );
                        action.play();
                    }
                }
            } );
            console.log("this.camera: ", this.camera);
            console.log("gltf.cameras[0]: ", gltf.cameras[0]);
            // this.camera.copy(gltf.cameras[0]);
            // this.camera.position.x = gltf.cameras[0].parent.position.x;
            // this.camera.setRotationFromEuler(gltf.cameras[0].rotation);
            // this.camera.lookAt(Vector3(0,0,0));
            this.scene.add(gltf.scene);



            this.loaded = true;
        } );
        // orbit controls for debugging
        this.controls = new OrbitControls( this.camera, this.el );
        // after that this.controls might be used for enabling/disabling zoom:
        this.controls.enableZoom = true;
        this.controls.enabled = true;
        // clock to get frame times
        this.clock = new THREE.Clock();
    };

    startAnimationLoop = () => {
        this.renderer.render( this.scene, this.camera );
        this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
        console.log(new THREE.Clock().getDelta());
        if(this.loaded)
            this.mixer.update( this.clock.getDelta() );
    };

    render() {
        const three = {
            position : 'fixed',
            justifyContent: 'center',
            top: '0',
            left: '0%',
            width: '100%',
            height: '100%',
            zIndex: '-1',
        };
        return(
            <div style={three} ref={ref => (this.el = ref)}/>
        );
    }
}

export default ExampleAnimation