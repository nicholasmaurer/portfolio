(this["webpackJsonpthreejs-app"]=this["webpackJsonpthreejs-app"]||[]).push([[0],{12:function(e,n,t){e.exports=t.p+"static/media/model_texture.0acb1dd7.jpg"},13:function(e,n,t){e.exports=t(14)},14:function(e,n,t){"use strict";t.r(n);var a=t(2),r=t(8),i=t(4),o=t(3),s=t(5),c=t(1),d=t.n(c),p=t(9),u=t.n(p),l=t(0),h=t(10),m=t(11),w=t(12),b=t.n(w),f=function(e){function n(){var e,t;Object(a.a)(this,n);for(var r=arguments.length,s=new Array(r),c=0;c<r;c++)s[c]=arguments[c];return(t=Object(i.a)(this,(e=Object(o.a)(n)).call.apply(e,[this].concat(s)))).handleWindowResize=function(){var e=t.props.width,n=t.props.height;t.renderer.setSize(e,n),t.camera.aspect=e/n,t.camera.updateProjectionMatrix()},t.sceneSetup=function(){var e=t.props.width,n=t.props.height;t.scene=new l.bb,t.camera=new l.R(75,e/n,.1,1e3),t.controls=new h.a(t.camera,t.el),t.controls.enableZoom=!0,t.camera.position.z=1,t.renderer=new l.qb({alpha:!0}),t.renderer.setClearColor(0,0),t.renderer.setSize(e,n),t.el.appendChild(t.renderer.domElement)},t.addCustomSceneObjects=function(){var e=new l.d(2,2,2),n=new l.I({color:1401481,emissive:468276,side:l.j,flatShading:!0});t.cube=new l.G(e,n),t.scene.add(t.cube);var a=[];a[0]=new l.S(16777215,1,0),a[1]=new l.S(16777215,1,0),a[2]=new l.S(16777215,1,0),a[0].position.set(0,200,0),a[1].position.set(100,200,100),a[2].position.set(-100,-200,-100),t.scene.add(a[0]),t.scene.add(a[1]),t.scene.add(a[2]),(new m.a).setPath("").load("shrinkwrap.gltf",(function(e){e.scene.traverse((function(n){n.isMesh&&t.scene.add(e.scene)}))}))},t.startAnimationLoop=function(){t.cube.rotation.x+=.01,t.cube.rotation.y+=.01,t.renderer.render(t.scene,t.camera),t.requestID=window.requestAnimationFrame(t.startAnimationLoop)},t}return Object(s.a)(n,e),Object(r.a)(n,[{key:"componentDidMount",value:function(){this.sceneSetup(),this.addCustomSceneObjects(),this.startAnimationLoop(),this.handleWindowResize(),window.addEventListener("resize",this.handleWindowResize)}},{key:"componentWillUnmount",value:function(){window.removeEventListener("resize",this.handleWindowResize),window.cancelAnimationFrame(this.requestID),this.controls.dispose()}},{key:"render",value:function(){var e=this;return d.a.createElement("div",null,d.a.createElement("img",{src:b.a,alt:"Logo",className:"background_img"}),d.a.createElement("div",{ref:function(n){return e.el=n},className:"canvas"}))}}]),n}(c.Component),v=document.getElementById("root");u.a.render(d.a.createElement(f,{width:window.screen.width,height:window.screen.height}),v)}},[[13,1,2]]]);
//# sourceMappingURL=main.0d8c48e5.chunk.js.map