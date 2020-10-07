import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

export default function ExampleCurves(parentElement, parentCamera, parentScene, parentRenderer, newPositions) {

    var container, stats;
    var camera, scene, renderer;
    var splineHelperObjects = [];
    var splinePointsLength = 4;
    var positions = [];
    var point = new THREE.Vector3();

    var raycaster = new THREE.Raycaster();
    var pointer = new THREE.Vector2();
    var onUpPosition = new THREE.Vector2();
    var onDownPosition = new THREE.Vector2();

    var geometry = new THREE.BoxBufferGeometry( 20, 20, 20 );
    var transformControl;

    var ARC_SEGMENTS = 200;

    var splines = {};

    var params = {
        uniform: true,
        tension: 0.5,
        centripetal: true,
        chordal: true,
        addPoint: addPoint,
        removePoint: removePoint,
        exportSpline: exportSpline
    };

    String.prototype.format = function () {

        var str = this;

        for ( var i = 0; i < arguments.length; i ++ ) {

            str = str.replace( '{' + i + '}', arguments[ i ] );

        }

        return str;

    };



    function addSplineObject( position ) {

        var material = new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } );
        var object = new THREE.Mesh( geometry, material );

        if ( position ) {

            object.position.copy( position );

        } else {

            object.position.x = Math.random();
            object.position.y = Math.random();
            object.position.z = Math.random();

        }

        object.castShadow = true;
        object.receiveShadow = true;
        scene.add( object );
        splineHelperObjects.push( object );
        return object;

    }

    function addPoint() {

        splinePointsLength ++;

        positions.push( addSplineObject().position );

        updateSplineOutline();

    }

    function removePoint() {

        if ( splinePointsLength <= 4 ) {

            return;

        }

        const point = splineHelperObjects.pop();
        splinePointsLength --;
        positions.pop();

        if ( transformControl.object === point ) transformControl.detach();
        scene.remove( point );

        updateSplineOutline();

    }

    function updateSplineOutline() {

        for ( var k in splines ) {

            var spline = splines[ k ];

            var splineMesh = spline.mesh;
            var position = splineMesh.geometry.attributes.position;

            for ( var i = 0; i < ARC_SEGMENTS; i ++ ) {

                var t = i / ( ARC_SEGMENTS - 1 );
                spline.getPoint( t, point );
                position.setXYZ( i, point.x, point.y, point.z );

            }

            position.needsUpdate = true;

        }

    }

    function exportSpline() {

        var strplace = [];

        for ( var i = 0; i < splinePointsLength; i ++ ) {

            var p = splineHelperObjects[ i ].position;
            strplace.push( 'new THREE.Vector3({0}, {1}, {2})'.format( p.x, p.y, p.z ) );

        }

        console.log( strplace.join( ',\n' ) );
        var code = '[' + ( strplace.join( ',\n\t' ) ) + ']';
        prompt( 'copy and paste code', code );

    }

    function load( new_positions ) {

        while ( new_positions.length > positions.length ) {

            addPoint();

        }

        while ( new_positions.length < positions.length ) {

            removePoint();

        }

        for ( var i = 0; i < positions.length; i ++ ) {

            positions[ i ].copy( new_positions[ i ] );

        }

        updateSplineOutline();

    }

    function animate() {

        requestAnimationFrame( animate );
        render();
        stats.update();

    }

    function render() {

        splines.uniform.mesh.visible = params.uniform;
        splines.centripetal.mesh.visible = params.centripetal;
        splines.chordal.mesh.visible = params.chordal;
        renderer.render( scene, camera );

    }

    function onPointerDown( event ) {

        onDownPosition.x = event.clientX;
        onDownPosition.y = event.clientY;

    }

    function onPointerUp(event) {

        onUpPosition.x = event.clientX;
        onUpPosition.y = event.clientY;

        if ( onDownPosition.distanceTo( onUpPosition ) === 0 ) transformControl.detach();

    }

    function onPointerMove( event ) {

        pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        raycaster.setFromCamera( pointer, camera );

        var intersects = raycaster.intersectObjects( splineHelperObjects );

        if ( intersects.length > 0 ) {

            var object = intersects[ 0 ].object;

            if ( object !== transformControl.object ) {

                transformControl.attach( object );

            }

        }
    }

    container = parentElement;
    scene = parentScene;
    camera = parentCamera;

    scene.add( new THREE.AmbientLight( 0xf0f0f0 ) );
    var light = new THREE.SpotLight( 0xffffff, 1.5 );
    light.position.set( 0, 1500, 200 );
    light.angle = Math.PI * 0.2;
    light.castShadow = true;
    light.shadow.camera.near = 200;
    light.shadow.camera.far = 2000;
    light.shadow.bias = - 0.000222;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    scene.add( light );

    var planeGeometry = new THREE.PlaneBufferGeometry( 2000, 2000 );
    planeGeometry.rotateX( - Math.PI / 2 );
    var planeMaterial = new THREE.ShadowMaterial( { opacity: 0.2 } );

    var plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.position.y = - 200;
    plane.receiveShadow = true;
    scene.add( plane );

    var helper = new THREE.GridHelper( 2000, 100 );
    helper.position.y = - 199;
    helper.material.opacity = 0.25;
    helper.material.transparent = true;
    scene.add( helper );


    renderer = parentRenderer;
    renderer.shadowMap.enabled = true;

    stats = new Stats();
    container.appendChild( stats.dom );

    var gui = new GUI();

    gui.add( params, 'uniform' );
    gui.add( params, 'tension', 0, 1 ).step( 0.01 ).onChange( function ( value ) {

        splines.uniform.tension = value;
        updateSplineOutline();

    } );
    gui.add( params, 'centripetal' );
    gui.add( params, 'chordal' );
    gui.add( params, 'addPoint' );
    gui.add( params, 'removePoint' );
    gui.add( params, 'exportSpline' );
    gui.open();

    // Controls
    var controls = new OrbitControls( camera, renderer.domElement );
    controls.damping = 0.2;
    controls.addEventListener( 'change', render );

    transformControl = new TransformControls( camera, renderer.domElement );
    transformControl.addEventListener( 'change', render );
    transformControl.addEventListener( 'dragging-changed', function ( event ) {

        controls.enabled = ! event.value;

    } );
    scene.add( transformControl );

    transformControl.addEventListener( 'objectChange', function () {

        updateSplineOutline();

    } );

    document.addEventListener( 'pointerdown', onPointerDown, false );
    document.addEventListener( 'pointerup', onPointerUp, false );
    document.addEventListener( 'pointermove', onPointerMove, false );

    /*******
     * Curves
     *********/

    for ( var i = 0; i < splinePointsLength; i ++ ) {

        addSplineObject( positions[ i ] );

    }

    positions = [];

    for ( var i = 0; i < splinePointsLength; i ++ ) {

        positions.push( splineHelperObjects[ i ].position );

    }

    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( ARC_SEGMENTS * 3 ), 3 ) );

    var curve = new THREE.CatmullRomCurve3( positions );
    curve.curveType = 'catmullrom';
    curve.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
        color: 0xff0000,
        opacity: 0.35
    } ) );
    curve.mesh.castShadow = true;
    splines.uniform = curve;

    curve = new THREE.CatmullRomCurve3( positions );
    curve.curveType = 'centripetal';
    curve.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
        color: 0x00ff00,
        opacity: 0.35
    } ) );
    curve.mesh.castShadow = true;
    splines.centripetal = curve;

    curve = new THREE.CatmullRomCurve3( positions );
    curve.curveType = 'chordal';
    curve.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
        color: 0x0000ff,
        opacity: 0.35
    } ) );
    curve.mesh.castShadow = true;
    splines.chordal = curve;

    for ( var k in splines ) {

        var spline = splines[ k ];
        scene.add( spline.mesh );

    }

    load( newPositions );

    animate();

    return splines;
}