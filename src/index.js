import React, { Component } from "react";
import ReactDOM from "react-dom";
import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

class App extends Component {

    componentDidMount() {
        this.sceneSetup();
        this.addCustomSceneObjects();
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
        const width = this.props.width;
        const height = this.props.height;

        this.renderer.setSize( width, height );
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    };

    sceneSetup = () => {
        // get container dimensions and use them for scene sizing
        const width = this.props.width;
        const height = this.props.height;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75, // fov = field of view
            width / height, // aspect ratio
            0.1, // near plane
            1000 // far plane
        );

        this.controls = new OrbitControls( this.camera, this.el );

        // after that this.controls might be used for enabling/disabling zoom:
        this.controls.enableZoom = true;


        // set some distance from a cube that is located at z = 0
        this.camera.position.z = 0.5;

        this.renderer = new THREE.WebGLRenderer({alpha : true});
        this.renderer.setClearColor( 0x000000, 0 ); // the default

        this.renderer.setSize( width, height );
        this.el.appendChild( this.renderer.domElement ); // mount using React ref
    };

    addCustomSceneObjects = () => {

        const loader = new GLTFLoader().setPath( process.env.PUBLIC_URL );
        loader.load( 'shrinkwrap.gltf', (gltf)=> {
            gltf.scene.traverse( ( child )=> {
                if ( child.isMesh ) {
                    const material = new THREE.MeshBasicMaterial( {
                        side: THREE.FrontSide,
                        flatShading: true,
                        map: child.material.map

                    } );
                    child.material = material;
                    this.scene.add( gltf.scene );
                }
            } );
        } );
    };
    startAnimationLoop = () => {

        this.renderer.render( this.scene, this.camera );
        this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
    };


    render() {

        return(
            <div>
                <img src={process.env.PUBLIC_URL + '/tex/model_texture.jpg'} alt="Unwraped texture from a scan of my head and chest. Like peeling of my skin and pinning it flat to the wall." className={'background_img'}/>
                <div ref={ref => (this.el = ref)} className={'canvas'}/>
            </div>
            )
    }
}

const rootElement = document.getElementById("root");
console.log(`window width ${window.screen.width} height ${window.screen.width}`);
ReactDOM.render(<App width={window.screen.width} height={window.screen.height}/>, rootElement);