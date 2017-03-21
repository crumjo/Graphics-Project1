/**
 * Created by Hans Dulimarta on 1/31/17.
 */

var gl;
var glCanvas, textOut;
var orthoProjMat, persProjMat, viewMat, viewMatInverse, topViewMat, deskCF, joystickCF, monitorCF, chairCF, lightCF;
var axisBuff, tmpMat, normalMat, eyePos;
var globalAxes;
var currSelection = 0;
var objSelection = 0;
var currentCF;
var lightPos, useLightingUnif;
var normalUnif, isEnabledUnif;
var lightingComponentEnabled = [true, true, true];


/* Vertex shader attribute variables */
var posAttr, colAttr, normalAttr;

/* Shader uniform variables */
var projUnif, viewUnif, modelUnif, lightPosUnif;
var objAmbientUnif, objTintUnif;
var ambCoeffUnif, diffCoeffUnif, specCoeffUnif, shininessUnif;
const IDENTITY = mat4.create();
var lineBuff, normBuff, objTint;
var redrawNeeded, showNormal, showLightVectors;

// const IDENTITY = mat4.create();
var coneSpinAngle;
var obj, obj2, obj3, obj4, pointLight;
var shaderProg;

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

    let lightxslider = document.getElementById("lightx");
    let lightyslider = document.getElementById("lighty");
    let lightzslider = document.getElementById("lightz");
    lightxslider.addEventListener('input', lightPosChanged, false);
    lightyslider.addEventListener('input', lightPosChanged, false);
    lightzslider.addEventListener('input', lightPosChanged, false);

    glCanvas = document.getElementById("gl-canvas");
    textOut = document.getElementById("msg");
    gl = WebGLUtils.setupWebGL(glCanvas, null);
    axisBuff = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, axisBuff);
    window.addEventListener("resize", resizeHandler, false);
    window.addEventListener("keypress", keyboardHandler, false);
    ShaderUtils.loadFromFile(gl, "vshader.glsl", "fshader.glsl")
        .then(prog => {
            shaderProg = prog;
            gl.useProgram(prog);
            gl.clearColor(0, 0, 0, 1);
            gl.enable(gl.DEPTH_TEST);
            /* enable hidden surface removal */
            //gl.enable(gl.CULL_FACE);     /* cull back facing polygons */
            //gl.cullFace(gl.BACK);
            lineBuff = gl.createBuffer();
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
            lightCF = mat4.create();
            tmpMat = mat4.create();
            ambCoeffUnif = gl.getUniformLocation(prog, "ambientCoeff");
            diffCoeffUnif = gl.getUniformLocation(prog, "diffuseCoeff");
            specCoeffUnif = gl.getUniformLocation(prog, "specularCoeff");
            shininessUnif = gl.getUniformLocation(prog, "shininess");
            mat4.lookAt(viewMat,
                vec3.fromValues(0, -6, 0), /* eye */
                vec3.fromValues(0, 0, 0), /* focal point */
                vec3.fromValues(0, 0, 1)); /* up */
            gl.uniformMatrix4fv(modelUnif, false, deskCF);
            lightPos = vec3.fromValues(0, 0, 4);
            let vertices = [0, 0, 0, 1, 1, 1,
                lightPos[0], 0, 0, 1, 1, 1,
                lightPos[0], lightPos[1], 0, 1, 1, 1,
                lightPos[0], lightPos[1], lightPos[2], 1, 1, 1];
            gl.bindBuffer(gl.ARRAY_BUFFER, lineBuff);
            gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

            gl.uniform3i(isEnabledUnif, true, true, true);
            let yellow = vec3.fromValues (0xe7/255, 0xf2/255, 0x4d/255);
            pointLight = new UniSphere(gl, 0.03, 3, yellow, yellow);

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
            // mat4.rotateX(deskCF, deskCF, -Math.PI/2);
            coneSpinAngle = 0;
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
    const transXpos = mat4.fromTranslation(mat4.create(), vec3.fromValues(1, 0, 0));
    const transXneg = mat4.fromTranslation(mat4.create(), vec3.fromValues(-1, 0, 0));
    const transYpos = mat4.fromTranslation(mat4.create(), vec3.fromValues(0, 1, 0));
    const transYneg = mat4.fromTranslation(mat4.create(), vec3.fromValues(0, -1, 0));
    const transZpos = mat4.fromTranslation(mat4.create(), vec3.fromValues(0, 0, 1));
    const transZneg = mat4.fromTranslation(mat4.create(), vec3.fromValues(0, 0, -1));
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
    textOut.innerHTML = "Ring origin (" + deskCF[12].toFixed(1) + ", "
        + deskCF[13].toFixed(1) + ", "
        + deskCF[14].toFixed(1) + ")";
}

function render() {
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        draw3D();
        /* looking at the XY plane, Z-axis points towards the viewer */
        // coneSpinAngle += 1;  /* add 1 degree */
        //redrawNeeded = false;
    requestAnimationFrame(render);
}

function drawScene() {
    //globalAxes.draw(posAttr, colAttr, modelUnif, IDENTITY);
    // mat4.translate(tmpMat, tmpMat, vec3.fromValues(-1.2, 0, 0.55));
    // obj3.draw(posAttr, colAttr, modelUnif, tmpMat);
    gl.uniform1i(useLightingUnif, false);
    gl.disableVertexAttribArray(normalAttr);
    gl.enableVertexAttribArray(colAttr);

    /* Use LINE_STRIP to mark light position */
    gl.uniformMatrix4fv(modelUnif, false, IDENTITY);
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuff);
    gl.vertexAttribPointer(posAttr, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(colAttr, 3, gl.FLOAT, false, 24, 12);
    gl.drawArrays(gl.LINE_STRIP, 0, 4);

    /* Draw the light source (a sphere) using its own coordinate frame */
    pointLight.draw(posAttr, colAttr, modelUnif, lightCF);

    var xPos = -1.2;
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
        obj3.draw(posAttr, colAttr, modelUnif, tmpMat);
        xPos += 1.2;
    }
    tmpMat = mat4.create();
    mat4.scale(tmpMat, joystickCF, [0.2,0.2,0.2]);
    mat4.translate(tmpMat, tmpMat, vec3.fromValues(0, -3, 0.2));
    obj2.draw(posAttr, colAttr, modelUnif, tmpMat);

    if (typeof obj !== 'undefined') {
        var yPos = 0;
        mat4.fromTranslation(tmpMat, vec3.fromValues(0, yPos, 0));
        mat4.multiply(tmpMat, deskCF, tmpMat);   // tmp = deskCF * tmpMat
        obj.draw(posAttr, colAttr, modelUnif, tmpMat);
    }
    gl.uniform1i (useLightingUnif, true);
    gl.disableVertexAttribArray(colAttr);
    gl.enableVertexAttribArray(normalAttr);
    mat4.translate(tmpMat, chairCF, vec3.fromValues(0, -1.5, 0));
    obj4.draw(posAttr, normalAttr, modelUnif, tmpMat);
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
            lightPos[0] = ev.target.value;
            break;
        case 'lighty':
            lightPos[1] = ev.target.value;
            break;
        case 'lightz':
            lightPos[2] = ev.target.value;
            break;
    }
    mat4.fromTranslation(lightCF, lightPos);
    gl.uniform3fv (lightPosUnif, lightPos);
    let vertices = [
        0, 0, 0, 1, 1, 1,
        lightPos[0], 0, 0, 1, 1, 1,
        lightPos[0], lightPos[1], 0, 1, 1, 1,
        lightPos[0], lightPos[1], lightPos[2], 1, 1, 1];
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuff);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);
    redrawNeeded = true;
}
