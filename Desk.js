/**
 * Created by Joshua Crum and Nam Nguyen on 03/12/17
 */

this.red = vec3.fromValues(1.0, 0.0, 0.0);
this.white = vec3.fromValues(1.0, 1.0, 1.0);
this.grey = vec3.fromValues(170.0 / 255.0, 170.0 / 255.0, 170.0 / 255.0);
this.black = vec3.fromValues (50.0 / 255.0, 50.0 / 255.0, 50.0 / 255.0);
this.brown = vec3.fromValues (153.0 / 255.0, 102.0 / 255.0, 0.0);
this.green = vec3.fromValues(0.0, 200.0 / 255.0, 0.0);
this.blue = vec3.fromValues(0.0, 51.0 / 255.0, 204.0 / 255.0);

class Desk {
    constructor (gl) {
        this.tableTop = new Cube(gl, 1, 5, blue, grey, black);
        this.tableDrawer = new Cube(gl, 1, 5, black, grey, white);

        this.leg1 = new Cylinder(gl, 0.08, 0.08, 1.8, 10, black, grey);
        this.leg2 = new Cylinder(gl, 0.08, 0.08, 1.8, 10, black, grey);
        this.topHandle = new Torus(gl, 0.27, 0.05, 30, 30, white, grey);
        this.middleHandle = new Torus(gl, 0.27, 0.05, 30, 30, white, grey);
        this.bottomHandle = new Torus(gl, 0.27, 0.05, 30, 30, white, grey);
        this.topDrawerFace = new Cube(gl, 1, 5, white, black, white);
        this.midDrawerFace = new Cube(gl, 1, 5, white, black, white);
        this.botDrawerFace = new Cube(gl, 1, 5, white, black, white);

        let moveDown = vec3.fromValues (0, 0, -.95);
        let moveLeft = vec3.fromValues (-1.45, 0, 0);
        let moveRight = vec3.fromValues (1.8, 0, 0);
        let moveBack = vec3.fromValues (0, 0.8, 0);
        let moveForward = vec3.fromValues (0, -0.8, 0);

        this.tableTopTransformation = mat4.create();
        mat4.scale(this.tableTopTransformation, this.tableTopTransformation, [4,2.2,0.1]);

        this.tableDrawerTransformation = mat4.create();
        mat4.translate(this.tableDrawerTransformation, this.tableDrawerTransformation, moveDown);
        mat4.translate(this.tableDrawerTransformation, this.tableDrawerTransformation, moveLeft);
        mat4.scale(this.tableDrawerTransformation, this.tableDrawerTransformation, [1.1, 2.2, 1.8]);

        this.leg1Transformation = mat4.create();
        mat4.translate(this.leg1Transformation, this.leg1Transformation, moveDown);
        mat4.translate(this.leg1Transformation, this.leg1Transformation, moveRight);
        mat4.translate(this.leg1Transformation, this.leg1Transformation, moveBack);

        this.leg2Transformation = mat4.create();
        mat4.translate(this.leg2Transformation, this.leg2Transformation, moveDown);
        mat4.translate(this.leg2Transformation, this.leg2Transformation, moveRight);
        mat4.translate(this.leg2Transformation, this.leg2Transformation, moveForward);

        this.topHandleTransformation = mat4.create();
        mat4.scale(this.topHandleTransformation, this.topHandleTransformation, [0.75, 0.5, 0.35]);
        mat4.translate(this.topHandleTransformation, this.topHandleTransformation, vec3.fromValues(-1.95, -2.2, -0.9));

        this.middleHandleTransformation = mat4.create();
        mat4.scale(this.middleHandleTransformation, this.middleHandleTransformation, [0.75, 0.5, 0.35]);
        mat4.translate(this.middleHandleTransformation, this.middleHandleTransformation, vec3.fromValues(-1.95, -2.2, -2.2));

        this.bottomHandleTransformation = mat4.create();
        mat4.scale(this.bottomHandleTransformation, this.bottomHandleTransformation, [0.75, 0.5, 0.35]);
        mat4.translate(this.bottomHandleTransformation, this.bottomHandleTransformation, vec3.fromValues(-1.95, -2.2, -3.5));

        this.topDrawerFaceTransformation = mat4.create();
        mat4.scale(this.topDrawerFaceTransformation, this.topDrawerFaceTransformation, [0.85, 0.25, 0.4]);
        mat4.translate(this.topDrawerFaceTransformation, this.topDrawerFaceTransformation, [-1.72, -4.0, -0.75]);

        this.midDrawerFaceTransformation = mat4.create();
        mat4.scale(this.midDrawerFaceTransformation, this.midDrawerFaceTransformation, [0.85, 0.25, 0.4]);
        mat4.translate(this.midDrawerFaceTransformation, this.midDrawerFaceTransformation, [-1.72, -4.0, -1.90]);

        this.botDrawerFaceTransformation = mat4.create();
        mat4.scale(this.botDrawerFaceTransformation, this.botDrawerFaceTransformation, [0.85, 0.25, 0.75]);
        mat4.translate(this.botDrawerFaceTransformation, this.botDrawerFaceTransformation, [-1.72, -4.0, -1.87]);

        this.tmp = mat4.create();
    }

    draw (vertexAttr, colorAttr, modelUniform, coordFrame) {
        mat4.mul (this.tmp, coordFrame, this.tableTopTransformation);
        this.tableTop.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.tableDrawerTransformation);
        this.tableDrawer.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.leg1Transformation);
        this.leg1.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.leg2Transformation);
        this.leg2.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.topHandleTransformation);
        this.topHandle.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.middleHandleTransformation);
        this.middleHandle.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.bottomHandleTransformation);
        this.bottomHandle.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.topDrawerFaceTransformation);
        this.topDrawerFace.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.midDrawerFaceTransformation);
        this.midDrawerFace.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.botDrawerFaceTransformation);
        this.botDrawerFace.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
    }
}