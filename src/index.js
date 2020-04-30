import React, { Component } from "react";
import ReactDOM from "react-dom";
import * as THREE from 'three';
// import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import Stories from 'react-insta-stories';

class App extends Component {

    constructor(props){
        super(props);
        this.state = {
            width: props.width,
            height: props.height,
            chhange: false,
        };
    }
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
        // this.controls.dispose();

    }

    handleWindowResize = () => {

        const width = window.innerWidth;
        const height = 768;

        this.renderer.setSize( width, height );
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.state.width = rootElement.clientWidth * 0.7;
        this.state.height = rootElement.clientHeight * 0.7;
        this.setState({
           width: document.getElementById('root').clientWidth * 0.7,

        });
    };

    sceneSetup = () => {
        // get container dimensions and use them for scene sizing
        const width = window.innerWidth;
        const height = 768;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75, // fov = field of view
            width / height, // aspect ratio
            0.1, // near plane
            1000 // far plane
        );

        // this.controls = new OrbitControls( this.camera, this.el );

        // after that this.controls might be used for enabling/disabling zoom:
        // this.controls.enableZoom = true;


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
        const row = {
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: 'row',
            // justifyContent: 'center',
        };
        const side = {
            height: '700px',
            flexGrow: '1',
            // flex: '50%',
            textAlign: 'center',
            backgroundColor: 'blue',
        };
        const main = {
            height: '700px',
            width: '300px',
        };
        const center = {
            margin: 'auto',
            width: '50%',
            border: '3px dashed white',
            padding: '10px',
        };
        const storyContent = {
            width: 'auto',
            maxWidth: '100%',
            maxHeight: '100%',
            margin: 'auto',
        }
        return(
            <div>
                <div style={row}>
                    <div style={side}>Profile
                        <div style={center}>
                            <div style={main}>

                            </div>
                        </div>
                    </div>
                    <div style={side}>Main
                        <div style={center}>
                            <Stories
                                stories={stories}
                                defaultInterval={5000}
                                storyStyles={storyContent}
                            />
                        </div>
                    </div>
                </div>
                <div ref={ref => (this.el = ref)}/>
            </div>
        );
    }
}
const stories = [
    //🆕! Rendering Components instead of video or images can now be done by passing a 'content' property into the story.
    //The props contain properties 'action'(fn) and 'isPaused'(bool)
    {
        content: ({action, isPaused}) => {
            const handleClick=(e)=>{e.preventDefault(); action(isPaused ? 'play': 'pause') };
            return (
                <div onClick={handleClick}>
                    <h2>Hi</h2>
                    <span>{isPaused ? 'Paused' : 'Playing'}</span>
                </div>
            );
        }
    },
    {
        url: 'https://picsum.photos/1080/1920',
        seeMore: ({ close }) => (
            <div style>Hello</div>
        ),
        header: {
            heading: 'Mohit Karekar',
            subheading: 'Posted 5h ago',
            profileImage: 'https://picsum.photos/1000/1000'
        }
    },
    {
        url:
            'https://fsa.zobj.net/crop.php?r=dyJ08vhfPsUL3UkJ2aFaLo1LK5lhjA_5o6qEmWe7CW6P4bdk5Se2tYqxc8M3tcgYCwKp0IAyf0cmw9yCmOviFYb5JteeZgYClrug_bvSGgQxKGEUjH9H3s7PS9fQa3rpK3DN3nx-qA-mf6XN',
        header: {
            heading: 'Mohit Karekar',
            subheading: 'Posted 32m ago',
            profileImage: 'https://picsum.photos/1080/1920'
        }
    },
    {
        url:
            'https://media.idownloadblog.com/wp-content/uploads/2016/04/iPhone-wallpaper-abstract-portrait-stars-macinmac.jpg',
        header: {
            heading: 'mohitk05/react-insta-stories',
            subheading: 'Posted 32m ago',
            profileImage:
                'https://avatars0.githubusercontent.com/u/24852829?s=400&v=4'
        }
    },
    // {
    //     url: 'https://storage.googleapis.com/coverr-main/mp4/Footboys.mp4',
    //     type: 'video',
    //     duration: 1000
    // },
    // {
    //     url:
    //         'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    //     type: 'video',
    //     seeMore: ({ close }) => (
    //         <div style>Hello</div>
    //     )
    // },
    // {
    //     url:
    //         'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    //     type: 'video'
    // },
    'https://images.unsplash.com/photo-1534856966153-c86d43d53fe0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=564&q=80'
];

const rootElement = document.getElementById("root");
ReactDOM.render(<App width={rootElement.clientWidth * 0.7} height={rootElement.clientWidth * 0.7}/>, rootElement);