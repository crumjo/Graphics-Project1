/**
 * Created by Hans Dulimarta on 1/31/17.
 */

var gl;
var glCanvas, textOut;
var orthoProjMat, persProjMat, viewMat, viewMatInverse, topViewMat, deskCF, joystickCF, monitorCF, chairCF, light1CF, light2CF;
var axisBuff, tmpMat, tmpMat2, normalMat, eyePos;
var currSelection = 0;
var objSelection = 0;
var currentCF;
var light1Pos, light2Pos, useLightingUnif, useLightingUnif2;
var normalUnif, isEnabledUnif;
var lightingComponentEnabled = [true, true, true];
var timeStamp;
var totalAngle = 0.0;
var chairQuat;
var startAnimation;
var now;
const CHAIR_TIP_SPEED = 1;


/* Vertex shader attribute variables */
var posAttr, colAttr, normalAttr;

/* Shader uniform variables */
var projUnif, viewUnif, modelUnif, lightPosUnif;
var objTintUnif;
var ambCoeffUnif, diffCoeffUnif, specCoeffUnif, shininessUnif;
const IDENTITY = mat4.create();
var lineBuff, lineBuff2, normBuff, objTint;
var redrawNeeded;
var showLight1, showLight2;

// const IDENTITY = mat4.create();
var coneSpinAngle;
var obj, obj2, obj3, obj4, pointLight, pointLight2;
var shaderProg;
var axes;

function main() {
    /* setup event listener for drop-down menu */
    let menu = document.getElementById("menu");
    menu.addEventListener("change", menuSelected);

    /* setup click listener for th "insert" button */
    let button = document.getElementById("select");
    button.addEventListener("click", createObject);

    let objectMenu = document.getElementById("objectMenu");
    objectMenu.addEventListener("change", objectSelected);

    let button2 = document.getElementById("select2");
    button2.addEventListener("click", selectObject);

    let animateButton = document.getElementById("animate");
    animateButton.addEventListener("click", animate);

    let light1CheckBox = document.getElementById("showLight1");
    light1CheckBox.addEventListener('change', ev => {
        showLight1 = ev.target.checked;
        redrawNeeded = true;
    }, false);

    let light2CheckBox = document.getElementById("showLight2");
    light2CheckBox.addEventListener('change', ev => {
        showLight2 = ev.target.checked;
        redrawNeeded = true;
    }, false);

    let animationCheckbox = document.getElementById("animate");
    animationCheckbox.addEventListener('change', ev => {
        startAnimation = ev.target.checked;
        redrawNeeded = true;
        now = Date.now();
        timeStamp = now;
    }, false);

    let lightxslider = document.getElementById("lightx");
    let lightyslider = document.getElementById("lighty");
    let lightzslider = document.getElementById("lightz");
    lightxslider.addEventListener('input', lightPosChanged, false);
    lightyslider.addEventListener('input', lightPosChanged, false);
    lightzslider.addEventListener('input', lightPosChanged, false);

    let lightx2slider = document.getElementById("lightx2");
    let lighty2slider = document.getElementById("lighty2");
    let lightz2slider = document.getElementById("lightz2");
    lightx2slider.addEventListener('input', light2PosChanged, false);
    lighty2slider.addEventListener('input', light2PosChanged, false);
    lightz2slider.addEventListener('input', light2PosChanged, false);

    let eyexslider = document.getElementById("eyex");
    let eyeyslider = document.getElementById("eyey");
    let eyezslider = document.getElementById("eyez");
    eyexslider.addEventListener('input', eyePosChanged, false);
    eyeyslider.addEventListener('input', eyePosChanged, false);
    eyezslider.addEventListener('input', eyePosChanged, false);

    glCanvas = document.getElementById("gl-canvas");
    textOut = document.getElementById("msg");
    gl = WebGLUtils.setupWebGL(glCanvas, null);
    axes = new Axes(gl);
    axisBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, axisBuff);
    window.addEventListener("resize", resizeHandler, false);
    window.addEventListener("keypress", keyboardHandler, false);
    ShaderUtils.loadFromFile(gl, "vshader.glsl", "fshader.glsl")
        .then(prog => {
            this.chairAnimation = mat4.create();
            chairQuat= quat.create();
            shaderProg = prog;
            gl.useProgram(prog);
            gl.clearColor(0, 0, 0, 1);
            gl.enable(gl.DEPTH_TEST);
            /* enable hidden surface removal */
            //gl.enable(gl.CULL_FACE);     /* cull back facing polygons */
            //gl.cullFace(gl.BACK);
            lineBuff = gl.createBuffer();
            lineBuff2 = gl.createBuffer();
            normBuff = gl.createBuffer();
            posAttr = gl.getAttribLocation(prog, "vertexPos");
            colAttr = gl.getAttribLocation(prog, "vertexCol");
            normalAttr = gl.getAttribLocation(prog, "vertexNormal");
            lightPosUnif = gl.getUniformLocation(prog, "lightPosWorld");
            projUnif = gl.getUniformLocation(prog, "projection");
            viewUnif = gl.getUniformLocation(prog, "view");
            modelUnif = gl.getUniformLocation(prog, "modelCF");
            normalUnif = gl.getUniformLocation(prog, "normalMat");
            useLightingUnif = gl.getUniformLocation (prog, "useLighting");
            useLightingUnif2 = gl.getUniformLocation (prog, "useLighting2");
            objTintUnif = gl.getUniformLocation(prog, "objectTint");
            isEnabledUnif = gl.getUniformLocation(prog, "isEnabled");
             gl.enableVertexAttribArray(posAttr);
            // gl.enableVertexAttribArray(colAttr);
            orthoProjMat = mat4.create();
            persProjMat = mat4.create();
            viewMat = mat4.create();
            normalMat = mat3.create();
            viewMatInverse = mat4.create();
            topViewMat = mat4.create();
            deskCF = mat4.create();
            joystickCF = mat4.create();
            monitorCF = mat4.create();

            chairCF = mat4.create();

            light1CF = mat4.create();
            light2CF = mat4.create();
            tmpMat = mat4.create();
            eyePos = vec3.fromValues(3, 2, 3);
            mat4.lookAt(viewMat,
                eyePos,
                vec3.fromValues(0, 0, 0), /* focal point */
                vec3.fromValues(0, 0, 1)); /* up */

            ambCoeffUnif = gl.getUniformLocation(prog, "ambientCoeff");
            diffCoeffUnif = gl.getUniformLocation(prog, "diffuseCoeff");
            specCoeffUnif = gl.getUniformLocation(prog, "specularCoeff");
            shininessUnif = gl.getUniformLocation(prog, "shininess");
            mat4.lookAt(viewMat,
                vec3.fromValues(0, -6, 0), /* eye */
                vec3.fromValues(0, 0, 0), /* focal point */
                vec3.fromValues(0, 0, 1)); /* up */
            gl.uniformMatrix4fv(modelUnif, false, deskCF);

            light1Pos = vec3.fromValues(0, 0, 1);
            let vertices = [0, 0, 0, 1, 1, 1,
                light1Pos[0], 0, 0, 1, 1, 1,
                light1Pos[0], light1Pos[1], 0, 1, 1, 1,
                light1Pos[0], light1Pos[1], light1Pos[2], 1, 1, 1];
            gl.bindBuffer(gl.ARRAY_BUFFER, lineBuff);
            gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

            light2Pos = vec3.fromValues(0, 0, 1);
            let vertices2 = [0, 0, 0, 1, 1, 1,
                light2Pos[0], 0, 0, 1, 1, 1,
                light2Pos[0], light2Pos[1], 0, 1, 1, 1,
                light2Pos[0], light2Pos[1], light2Pos[2], 1, 1, 1];
            gl.bindBuffer(gl.ARRAY_BUFFER, lineBuff2);
            gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices2), gl.STATIC_DRAW);

            gl.uniform3i(isEnabledUnif, true, true, true);
            let yellow = vec3.fromValues (0xe7/255, 0xf2/255, 0x4d/255);
            pointLight = new UniSphere(gl, 0.03, 3, yellow, yellow);
            pointLight2 = new UniSphere(gl, 0.03, 3, yellow, yellow);

            gl.uniform1f(ambCoeffUnif, 0.19);
            gl.uniform1f(diffCoeffUnif, 0.50);
            gl.uniform1f(specCoeffUnif, 0.50);
            gl.uniform1f(shininessUnif, 51);
            objTint = vec3.fromValues(170/255, 170/255, 170/255);
            gl.uniform3fv(objTintUnif, objTint);

            obj = new Desk(gl);
            obj2 = new Joystick(gl);
            obj3 = new Monitor(gl);
            obj4 = new Chair(gl);
            mat4.translate(chairCF, chairCF, vec3.fromValues(0, -1.5, -1.5));

            redrawNeeded = true;
            resizeHandler();
            render();
        });
}

function resizeHandler() {
    glCanvas.width = window.innerWidth;
    glCanvas.height = 0.9 * window.innerHeight;
    if (glCanvas.width > glCanvas.height) { /* landscape */
        let ratio = glCanvas.height / glCanvas.width;
        console.log("Landscape mode, ratio is " + ratio);
        mat4.ortho(orthoProjMat, -3, 3, -3 * ratio, 3 * ratio, -5, 5);
        mat4.perspective(persProjMat,
            Math.PI / 3, /* 60 degrees vertical field of view */
            1 / ratio, /* must be width/height ratio */
            1, /* near plane at Z=1 */
            20);
        /* far plane at Z=20 */
    } else {
        alert("Window is too narrow!");
    }
}

function keyboardHandler(event) {
    const transXpos = mat4.fromTranslation(mat4.create(), vec3.fromValues(0.5, 0, 0));
    const transXneg = mat4.fromTranslation(mat4.create(), vec3.fromValues(-0.5, 0, 0));
    const transYpos = mat4.fromTranslation(mat4.create(), vec3.fromValues(0, 0.5, 0));
    const transYneg = mat4.fromTranslation(mat4.create(), vec3.fromValues(0, -0.5, 0));
    const transZpos = mat4.fromTranslation(mat4.create(), vec3.fromValues(0, 0, 0.5));
    const transZneg = mat4.fromTranslation(mat4.create(), vec3.fromValues(0, 0, -0.5));
    switch (event.key) {
        case "x":
            mat4.multiply(currentCF, transXneg, currentCF);  // deskCF = Trans * deskCF
            break;
        case "X":
            mat4.multiply(currentCF, transXpos, currentCF);  // deskCF = Trans * deskCF
            break;
        case "y":
            mat4.multiply(currentCF, transYneg, currentCF);  // deskCF = Trans * deskCF
            break;
        case "Y":
            mat4.multiply(currentCF, transYpos, currentCF);  // deskCF = Trans * deskCF
            break;
        case "z":
            mat4.multiply(currentCF, transZneg, currentCF);  // deskCF = Trans * deskCF
            break;
        case "Z":
            mat4.multiply(currentCF, transZpos, currentCF);  // deskCF = Trans * deskCF
            break;
    }
}

function render() {
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        draw3D();
        if(startAnimation){
            animateChair();
        }
        /* looking at the XY plane, Z-axis points towards the viewer */
        // coneSpinAngle += 1;  /* add 1 degree */
        //redrawNeeded = false;
    requestAnimationFrame(render);
}

function drawScene() {
    gl.uniform1i(useLightingUnif, false);
    gl.uniform1i(useLightingUnif2, false);
    gl.disableVertexAttribArray(normalAttr);
    gl.enableVertexAttribArray(colAttr);

    /* Use LINE_STRIP to mark light position */
    gl.uniformMatrix4fv(modelUnif, false, IDENTITY);
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuff);
    gl.vertexAttribPointer(posAttr, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(colAttr, 3, gl.FLOAT, false, 24, 12);
    gl.drawArrays(gl.LINE_STRIP, 0, 4);

    gl.uniformMatrix4fv(modelUnif, false, IDENTITY);
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuff2);
    gl.vertexAttribPointer(posAttr, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(colAttr, 3, gl.FLOAT, false, 24, 12);
    gl.drawArrays(gl.LINE_STRIP, 0, 4);

    /* Draw the light source (a sphere) using its own coordinate frame */
    pointLight.draw(posAttr, colAttr, modelUnif, light1CF);
    pointLight2.draw(posAttr, colAttr, modelUnif, light2CF);

    var xPos = -1.2;
    gl.uniform1i (useLightingUnif, showLight1);
    gl.uniform1i (useLightingUnif2, showLight2);
    for(let i = 0; i < 3; i++){
        mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, 0, 0.55));
        mat4.multiply(tmpMat, monitorCF, tmpMat);
        //mat4.translate(tmpMat, monitorCF, vec3.fromValues(xPos, 0, 0.55));
        if(i == 0){
            // mat4.fromZRotation(tmpMat, Math.PI/6);
            // mat4.multiply(tmpMat, monitorCF, tmpMat);
            mat4.rotateZ(tmpMat, tmpMat, Math.PI/6);
        }
        if(i == 1){
            // mat4.fromTranslation(tmpMat, vec3.fromValues(0, 0.3, 0));
            // mat4.multiply(tmpMat, monitorCF, tmpMat);
            mat4.translate(tmpMat, tmpMat, vec3.fromValues(0, 0.3, 0));
        }
        if(i == 2){
            mat4.rotateZ(tmpMat, tmpMat, -Math.PI/6);
        }
        gl.disableVertexAttribArray(colAttr);
        gl.enableVertexAttribArray(normalAttr);
        objTint = vec3.fromValues(58/255, 58/255, 58/255);
        gl.uniform3fv(objTintUnif, objTint);
        obj3.draw(posAttr, normalAttr, modelUnif, tmpMat);
        xPos += 1.2;
    }

    tmpMat = mat4.create();
    mat4.scale(tmpMat, joystickCF, [0.2,0.2,0.2]);
    mat4.translate(tmpMat, tmpMat, vec3.fromValues(0, -3, 0.2));
    objTint = vec3.fromValues(168/255, 0/255, 0/255);
    gl.uniform3fv(objTintUnif, objTint);
    obj2.draw(posAttr, normalAttr, modelUnif, tmpMat);

    if (typeof obj !== 'undefined') {
        var yPos = 0;
        mat4.fromTranslation(tmpMat, vec3.fromValues(0, yPos, 0));
        mat4.multiply(tmpMat, deskCF, tmpMat);   // tmp = deskCF * tmpMat
        objTint = vec3.fromValues(124/255, 79/255, 0/255);
        gl.uniform3fv(objTintUnif, objTint);

        // gl.uniform1f(ambCoeffUnif, 0);
        // gl.uniform1f(diffCoeffUnif, 0.01);
        // gl.uniform1f(specCoeffUnif, 0.50);
        // gl.uniform1f(shininessUnif, 32);

        obj.draw(posAttr, normalAttr, modelUnif, tmpMat);
    }
    gl.disableVertexAttribArray(colAttr);
    gl.enableVertexAttribArray(normalAttr);

    if(typeof obj4 != 'undefined'){
        tmpMat2 = mat4.create();
        // mat4.fromTranslation(tmpMat2, vec3.fromValues(0, 0, -0.1));
        // mat4.multiply(chairCF, tmpMat2, chairCF);
        objTint = vec3.fromValues(170/255, 170/255, 170/255);
        gl.uniform3fv(objTintUnif, objTint);
        //mat4.translate(tmpMat, chairCF, vec3.fromValues(0, -1.5, -1.5));
        obj4.draw(posAttr, normalAttr, modelUnif, chairCF);
        gl.enableVertexAttribArray(colAttr);
        gl.disableVertexAttribArray(normalAttr);
        gl.uniform1i(useLightingUnif, false);
        gl.uniform1i(useLightingUnif2, false);
        // axes.draw(posAttr, colAttr, modelUnif, chairCF);
    }
}

function draw3D() {
    /* We must update the projection and view matrices in the shader */
    gl.uniformMatrix4fv(projUnif, false, persProjMat);
    gl.uniformMatrix4fv(viewUnif, false, viewMat);
    mat4.mul (tmpMat, viewMat, chairCF);
    mat3.normalFromMat4 (normalMat, tmpMat);
    gl.uniformMatrix3fv (normalUnif, false, normalMat);
    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    drawScene();
    if (typeof obj4 !== 'undefined') {
        gl.uniform1i(useLightingUnif, false);
        gl.uniform1i(useLightingUnif2, false);
        gl.disableVertexAttribArray(normalAttr);
        gl.enableVertexAttribArray(colAttr);
    }
}

function menuSelected(ev) {
    let sel = ev.currentTarget.selectedIndex;
    currSelection = sel;
    console.log("New selection is ", currSelection);
}

function createObject(){
    switch(currSelection){
        case 0:
            mat4.lookAt(viewMat,
                vec3.fromValues(0, -6, 0), /* eye */
                vec3.fromValues(0, 0, 0), /* focal point */
                vec3.fromValues(0, 0, 1)); /* up */
            break;
        case 1:
            mat4.lookAt(viewMat,
                vec3.fromValues(-6, -6, 2), /* eye */
                vec3.fromValues(0, 0, 0), /* focal point */
                vec3.fromValues(0, 0, 1)); /* up */
            break;
        case 2:
            mat4.lookAt(viewMat,
                vec3.fromValues(0,0,6),
                vec3.fromValues(0,0,0),
                vec3.fromValues(0,1,0)
            );
            break;
        case 3:
            mat4.lookAt(viewMat,
                vec3.fromValues(4, -2, 2), /* eye */
                vec3.fromValues(0, 0, 0), /* focal point */
                vec3.fromValues(0, 0, 1)); /* up */
    }
}

function objectSelected(ev){
    let sel = ev.currentTarget.selectedIndex;
    objSelection = sel;
}

function selectObject(){
    switch (objSelection){
        case 0:
            currentCF = deskCF;
            break;
        case 1:
            currentCF = monitorCF;
            break;
        case 2:
            currentCF = joystickCF;
            break;
        case 3:
            currentCF = chairCF;
            break;
    }
}

function lightPosChanged(ev) {
    switch (ev.target.id) {
        case 'lightx':
            light1Pos[0] = ev.target.value;
            break;
        case 'lighty':
            light1Pos[1] = ev.target.value;
            break;
        case 'lightz':
            light1Pos[2] = ev.target.value;
            break;
    }
    mat4.fromTranslation(light1CF, light1Pos);
    gl.uniform3fv (lightPosUnif, light1Pos);
    let vertices = [
        0, 0, 0, 1, 1, 1,
        light1Pos[0], 0, 0, 1, 1, 1,
        light1Pos[0], light1Pos[1], 0, 1, 1, 1,
        light1Pos[0], light1Pos[1], light1Pos[2], 1, 1, 1];
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuff);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);
    redrawNeeded = true;
}

function light2PosChanged(ev) {
    switch (ev.target.id) {
        case 'lightx2':
            light2Pos[0] = ev.target.value;
            break;
        case 'lighty2':
            light2Pos[1] = ev.target.value;
            break;
        case 'lightz2':
            light2Pos[2] = ev.target.value;
            break;
    }
    mat4.fromTranslation(light2CF, light2Pos);
    gl.uniform3fv (lightPosUnif, light2Pos);
    let vertices = [
        0, 0, 0, 1, 1, 1,
        light2Pos[0], 0, 0, 1, 1, 1,
        light2Pos[0], light2Pos[1], 0, 1, 1, 1,
        light2Pos[0], light2Pos[1], light2Pos[2], 1, 1, 1];
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuff2);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);
    redrawNeeded = true;
}

function eyePosChanged(ev) {
    switch (ev.target.id) {
        case 'eyex':
            eyePos[0] = ev.target.value;
            break;
        case 'eyey':
            eyePos[1] = ev.target.value;
            break;
        case 'eyez':
            eyePos[2] = ev.target.value;
            break;
    }
    mat4.lookAt(viewMat,
        eyePos,
        vec3.fromValues(0, 0, 0), /* focal point */
        vec3.fromValues(0, 0, 1)); /* up */
    mat4.invert (viewMatInverse, viewMat);
    redrawNeeded = true;
}

function animateChair() {
    now = Date.now();
    //timeStamp = now;
    let elapse = (now - timeStamp) / 1000; /* convert to second */
    let angle = elapse * (CHAIR_TIP_SPEED / 60) * Math.PI * 2;
    totalAngle += angle;
    if (totalAngle <= Math.PI/2) {
        this.chairAnimation = mat4.create();
        let axisRot = vec3.fromValues(1,0,0);
        mat4.fromRotation(this.chairAnimation, angle, axisRot);
        mat4.multiply(chairCF, chairCF, this.chairAnimation);
        mat4.translate(chairCF, chairCF, vec3.fromValues(0, -0.04, 0.02));
    }
}
