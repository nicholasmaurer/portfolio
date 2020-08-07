import React, { Component } from "react";
import ReactDOM from "react-dom";
import * as THREE from 'three';
// import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

class Scene extends Component {

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

        // this.controls = new OrbitControls( this.camera, this.el );
        //
        // // after that this.controls might be used for enabling/disabling zoom:
        // this.controls.enableZoom = true;
        // this.controls.enabled = false;


        // set some distance from a cube that is located at z = 0
        this.camera.position.z = 0.5;

        this.renderer = new THREE.WebGLRenderer({alpha : true});
        this.renderer.setClearColor( 0x000000, 0); // the default
        this.renderer.setSize( width, height );
        this.el.appendChild( this.renderer.domElement ); // mount using React ref

        const loader = new GLTFLoader().setPath( process.env.PUBLIC_URL );
        loader.load( 'python.gltf', (gltf)=> {
            gltf.scene.traverse( ( child )=> {
                if ( child.isMesh ) {
                    const normalMaterial = new THREE.MeshNormalMaterial();
                    child.material = normalMaterial;
                    this.scene.add( gltf.scene );
                }
            } );
        } );
        console.log(this.scene);
    };

    addCustomSceneObjects = () => {


    };
    startAnimationLoop = () => {
        this.renderer.render( this.scene, this.camera );
        this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
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

export default Scene