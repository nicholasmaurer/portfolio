import React, { Component } from "react";
import * as THREE from 'three';
import * as dat from 'dat.gui';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import ExampleCurves from './exampleCurves';
import {MathUtils} from "three";

class Scene extends Component {

    constructor(props){
        super(props);
        this.state = {
        };
    }

    componentDidMount() {

        // mouse events
        var mouseDown = false;
        var mouseEvent = null;
        function onMouseDown( event ) {
            mouseDown = true;
            mouseEvent = event;
        }
        function onMouseUp( event ) {
            mouseDown = false;
            mouseEvent = event;
        }

        document.addEventListener( 'mousedown', onMouseDown);
        document.addEventListener( 'mouseup', onMouseUp);


        // get container dimensions and use them for scene sizing
        const width = window.innerWidth;
        const height = window.innerHeight;

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(
            75, // fov = field of view
            width / height, // aspect ratio
            0.1, // near plane
            10000// far plane
        );
        camera.position.set(0,400,-300);
        camera.rotation.set(-90,0,0);

        var renderer = new THREE.WebGLRenderer({alpha : true});
        renderer.setClearColor( 0x000000, 0); // the default
        renderer.setSize( width, height );
        this.el.appendChild( renderer.domElement ); // mount using React ref

        // curves
        // var snakePositions = [
        //     new THREE.Vector3(-10.657144030829084, 211.99130690995395, 99.86265881127014),
        //     new THREE.Vector3(-43.49690716512492, 225.10926097943525, 36.95996588601584),
        //     new THREE.Vector3(24.821357073694088, 224.10441463693127, -26.866490091034876),
        //     new THREE.Vector3(84.16861703024286, 205.36801053420552, -16.975468402584724),
        //     new THREE.Vector3(69.61007822080799, 200, 54.33746486487491),
        //     new THREE.Vector3(0.32706263537991886, 179.41271486533108, 51.48333485625092),
        //     new THREE.Vector3(-17.28386229061062, 194.8205294571316, -40.359357678395355),
        //     new THREE.Vector3(-31.380997129299487, 215.17788864263986, -104.65504944158074),
        //     new THREE.Vector3(15.33207544746891, 136.65648842140624, -131.69671749171363),
        //     new THREE.Vector3(97.18466693812094, 168.56383448805283, -128.7059712255733),
        //     new THREE.Vector3(118.87331394182995, 215.17788864263986, -203.8980095499624),
        //     new THREE.Vector3(104.49232632490069, 172.06872382886493, -267.90279002000716),
        //     new THREE.Vector3(-8.699453378760792, 179.42908644393134, -274.64687039170155),
        //     new THREE.Vector3(-7.668573284840512, 136.65648842140624, -224.0501500102585),
        //     new THREE.Vector3(50.69356062981741, 187.21163987956413, -235.72970635208276),
        //     new THREE.Vector3(41.89206398492601, 215.17788864263986, -302.3916893862612),
        //     new THREE.Vector3(-27.868468878159902, 194.7515932463285, -313.58998612057064),
        //     new THREE.Vector3(-96.21963197236764, 181.87482717275833, -274.3008383663488),
        //     new THREE.Vector3(-53.68109588198873, 219.0416058969576, -210.12338385945162)
        // ];
        var scalePoints = [
            new THREE.Vector3(0,0.35,0),
            new THREE.Vector3(1,1,0),
            new THREE.Vector3(2,1,0),
            new THREE.Vector3(3,1,0),
            new THREE.Vector3(4,0.4,0),
            new THREE.Vector3(5,0.1,0),
        ];
        var curve = new THREE.CatmullRomCurve3( scalePoints);
        curve.curveType = 'catmullrom';

        // debuggin curves
        // this.curves = new ExampleCurves(this.el, camera, scene, renderer, scalePoints, true);
        // this.curve = this.curves.curves.uniform;

        var raycaster = new THREE.Raycaster();
        var boxGeometry = new THREE.BoxBufferGeometry( 20, 20, 20);
        var material = new THREE.MeshLambertMaterial( { color: '#000000'
        } );
        var object = new THREE.Mesh( boxGeometry, material );
        scene.add(object);
        object.visible = false;

        // load gltf file
        var loaded = false;
        var head = null;
        var tail = [];
        var bone = null;
        var boneCount = 100;
        var boneOffset = 5;
        const loader = new GLTFLoader().setPath( process.env.PUBLIC_URL );
        loader.load( 'python.gltf', (gltf)=> {
            console.log("Loaded python.gltf", gltf);
            gltf.scene.traverse( ( child )=> {
                console.log("gltf traverse mesh objects: ", child.name);
                if ( child.isMesh ) {
                    const normalMaterial = new THREE.MeshNormalMaterial();
                    child.material = normalMaterial;
                }
            } );
            scene.add(gltf.scene);
            raycaster.setFromCamera( new THREE.Vector2(1,-1), camera );
            var rayPos = new THREE.Vector3();
            raycaster.ray.at(400, rayPos);
            object.position.set(rayPos.x, rayPos.y, rayPos.z);

            loaded = true;

            head = scene.getObjectByName('head');
            bone = scene.getObjectByName('bone');
            head.position.set(rayPos.x, rayPos.y, rayPos.z);
            bone.position.set(rayPos.x, rayPos.y, rayPos.z);
            tail = [head, bone];
            // TODO: scale bone as 0 from a curve
            for(var i = 0; i < boneCount; i++){
                var clone = bone.clone(true);
                tail.push(clone);
                var position = clone.position;
                position = new THREE.Vector3(position.x,position.y,position.z + (i* boneOffset));
                clone.position.set(position.x, position.y, position.z);
                var t = THREE.MathUtils.mapLinear(i, 0, boneCount, 0,1);
                var curveValue = curve.getPoint(t);
                clone.scale.set(curveValue.y, curveValue.y, curveValue.y);
                scene.add(clone);
            }
        } );

        var target = new THREE.Vector3();
        var lerpTarget = new THREE.Vector3();
        // clock to get frame times for animation
        var clock = new THREE.Clock();
        var pickPosition = {x: 0, y: 0};
        clearPickPosition();

        document.addEventListener('mousemove', setPickPosition);
        document.addEventListener('mouseout', clearPickPosition);
        document.addEventListener('mouseleave', clearPickPosition);

        var time = 0;
        startAnimationLoop();

        function startAnimationLoop () {

            renderer.render( scene, camera );
            var requestID = window.requestAnimationFrame(startAnimationLoop);

            if(loaded){

                time += clock.getDelta();
                lerpTarget.lerp(target, 0.01);
                var distance = head.position.distanceTo(target);
                if(distance < 100){
                    var pos = new THREE.Vector2(THREE.MathUtils.randFloat(-1,1), THREE.MathUtils.randFloat(-1,1));
                    raycaster.setFromCamera( pos, camera );
                    target = raycaster.ray.at(THREE.MathUtils.randFloat(200, 400));
                }
                var normalizedPosition = pickPosition;
                raycaster.setFromCamera(normalizedPosition, camera);
                var distance = target.distanceTo(camera.position);
                head.lookAt(lerpTarget);
                head.translateZ(1);
                tail[1].lookAt(head.position);
                tail[1].translateZ(1);
                for(var i = 2; i < boneCount; i++){
                    tail[i].lookAt(tail[i-1].position);
                    var boneDistance = tail[i].position.distanceTo(tail[i-1].position);
                    tail[i].translateZ(boneDistance * 0.1);
                }
            }
        }
        handleWindowResize();
        window.addEventListener('resize', handleWindowResize);
        function handleWindowResize() {

            const width = window.innerWidth;
            const height = window.outerHeight;

            renderer.setSize( width, height );
            camera.aspect = width / height;
            camera.updateProjectionMatrix();

        }

        function getCanvasRelativePosition(event){
            const rect = renderer.domElement.getBoundingClientRect();
            var vec2 = {x: event.clientY, y: event.clientX}
            return getCanvasPosition(rect, vec2);
        }

        function getCanvasPosition(rect, vec2){
            return {
                x: (vec2.x - rect.left) * renderer.domElement.width  / rect.width,
                y: (vec2.y - rect.top ) * renderer.domElement.height / rect.height,
            };
        }

        function setPickPosition(event){
            const pos = getCanvasRelativePosition(event);
            pickPosition.x = (pos.x / renderer.domElement.width ) *  2 - 1;
            pickPosition.y = (pos.y / renderer.domElement.height) * -2 + 1;  // note we flip Y
        }

        function clearPickPosition() {
            // unlike the mouse which always has a position
            // if the user stops touching the screen we want
            // to stop picking. For now we just pick a value
            // unlikely to pick something
            pickPosition.x = -100000;
            pickPosition.y = -100000;
        }
    }

    componentWillUnmount() {

        window.removeEventListener('resize', this.handleWindowResize);
        window.cancelAnimationFrame(this.requestID);

    }

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