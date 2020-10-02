import React, { Component } from "react";
import * as THREE from 'three';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import * as dat from 'dat.gui';

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
        this.camera.position.set(0,200,-50);
        this.camera.rotation.set(-90,0,0);

        this.renderer = new THREE.WebGLRenderer({alpha : true});
        this.renderer.setClearColor( 0x000000, 0); // the default
        this.renderer.setSize( width, height );
        this.el.appendChild( this.renderer.domElement ); // mount using React ref

        // load gltf file
        this.loaded = false;
        this.parent = null;
        const loader = new GLTFLoader().setPath( process.env.PUBLIC_URL );
        loader.load( 'python.gltf', (gltf)=> {
            console.log("Loaded python.gltf");
            console.log(gltf);
            gltf.scene.traverse( ( child )=> {
                console.log("gltf traverse: ", child.name);
                if ( child.isMesh ) {
                    const normalMaterial = new THREE.MeshNormalMaterial();
                    child.material = normalMaterial;
                }
            } );
            this.scene.add(gltf.scene);
            this.parent = gltf.scene;
            console.log(this.parent);
            this.loaded = true;

            this.head = this.scene.getObjectByName('head');
            this.bone = this.scene.getObjectByName('bone');
            this.tail = [this.head, this.bone];
            // TODO: scale bone as 0 from a curve
            this.boneCount = 100;
            this.boneOffset = 5;
            for(var i = 0; i < this.boneCount; i++){
                var clone = this.bone.clone(true);
                this.tail.push(clone);
                var position = clone.position;
                position = new THREE.Vector3(position.x,position.y,position.z + (i* this.boneOffset));
                clone.position.set(position.x, position.y, position.z);
                this.scene.add(clone);
                //TODO: scale bone along curve
            }
            this.forwardScalar = 1;
            this.lateralScalar = 1;
            this.distanceDelta = 1;
            // curve to define tail object size
            this.target = new THREE.Vector3();
        } );



        // clock to get frame times for animation
        this.clock = new THREE.Clock();

        // Creating a GUI
        this.gui = new dat.GUI();
        this.position = {x:0, y:0, z:0};
        this.gui.add(this.position, 'x').onChange((value)=>{
            this.position.x = value;
        });
        this.gui.add(this.position, 'y').onChange((value)=>{
            this.position.y = value;
        });;
        this.gui.add(this.position, 'z').onChange((value)=>{
            this.position.z = value;
        });;

        this.pickPosition = {x: 0, y: 0};
        this.clearPickPosition();
        this.canvas = this.renderer.domElement;

        window.addEventListener('mousemove', this.setPickPosition);
        window.addEventListener('mouseout', this.clearPickPosition);
        window.addEventListener('mouseleave', this.clearPickPosition);


    };

    getCanvasRelativePosition = (event) => {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) * this.canvas.width  / rect.width,
            y: (event.clientY - rect.top ) * this.canvas.height / rect.height,
        };
    }

    setPickPosition = (event) => {
        const pos = this.getCanvasRelativePosition(event);
        this.pickPosition.x = (pos.x / this.canvas.width ) *  2 - 1;
        this.pickPosition.y = (pos.y / this.canvas.height) * -2 + 1;  // note we flip Y
    }

    clearPickPosition = () => {
        // unlike the mouse which always has a position
        // if the user stops touching the screen we want
        // to stop picking. For now we just pick a value
        // unlikely to pick something
        this.pickPosition.x = -100000;
        this.pickPosition.y = -100000;
    }

    startAnimationLoop = () => {
        this.renderer.render( this.scene, this.camera );
        this.requestID = window.requestAnimationFrame(this.startAnimationLoop);

        if(this.loaded){
            var normalizedPosition = this.pickPosition;
            this.raycaster = new THREE.Raycaster();
            // cast a ray through the frustum
            this.raycaster.setFromCamera(normalizedPosition, this.camera);
            var distance = new THREE.Vector3(this.camera.position.x, 0, this.camera.position.z);
            distance = distance.distanceTo(this.camera.position);
            this.raycaster.ray.at(distance, this.target);
            // console.log(this.target);
            var headDirection = this.target.sub(this.head.position);
            headDirection.normalize();
            this.head.translateOnAxis(headDirection, this.distanceDelta);
            for(var i = 1; i < this.boneCount; i++){
                var direction = new THREE.Vector3();
                direction.subVectors(this.tail[i-1].position, this.tail[i].position).normalize();
                if(this.tail[i].position.distanceTo(this.tail[i-1].position) > this.boneOffset){
                    this.tail[i].translateOnAxis(direction, this.distanceDelta);
                }
            }
        }
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