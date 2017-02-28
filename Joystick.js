this.red = vec3.fromValues(1.0, 0.0, 0.0);
this.white = vec3.fromValues(1.0, 1.0, 1.0);
this.grey = vec3.fromValues(170.0 / 255.0, 170.0 / 255.0, 170.0 / 255.0);
this.black = vec3.fromValues (50.0 / 255.0, 50.0 / 255.0, 50.0 / 255.0);

class Joystick {
    constructor (gl) {
        this.base = new Cube(gl, 1, 1, grey, grey, grey);
        this.stick = new Cylinder(gl, 0.125, 0.125, 1.0, 10, black, black);
        this.ball = new Globe(gl, 0.5, 20, 10, red, red);
        this.button = new Cylinder(gl, 0.25, 0.25, 0.1, 20, white, white);
        this.buttonRecess = new Cylinder(gl, 0.27, 0.27, 0.02, 20, black, black);
        this.joint = new Torus(gl, 0.25, 0.15, 30, 30, black, black);

        let moveBaseUp = vec3.fromValues (0, 0, 0.5);
        let moveStickUp = vec3.fromValues (0, 0, 1.0);
        let moveBallUp = vec3.fromValues (0, 0, 1.75);
        let moveButtonUp = vec3.fromValues (0, 0, 0.5);
        let moveButtonForward = vec3.fromValues (0, -0.7, 0);
        let moveButtonLeft = vec3.fromValues (-0.6, 0, 0);
        let moveJointUp = vec3.fromValues (0, 0, 0.55);

        this.baseTransformation = mat4.create();
        mat4.scale(this.baseTransformation, this.baseTransformation, [2.0, 2.0, 0.5]);
        mat4.translate(this.baseTransformation, this.baseTransformation, moveBaseUp);

        this.stickTransformation = mat4.create();
        mat4.translate(this.stickTransformation, this.stickTransformation, moveStickUp);

        this.ballTransformation = mat4.create();
        mat4.translate(this.ballTransformation, this.ballTransformation, moveBallUp);

        this.buttonTransformation = mat4.create();
        mat4.translate(this.buttonTransformation, this.buttonTransformation, moveButtonUp);
        mat4.translate(this.buttonTransformation, this.buttonTransformation, moveButtonForward);
        mat4.translate(this.buttonTransformation, this.buttonTransformation, moveButtonLeft);

        this.recessTransformation = mat4.create();
        mat4.translate(this.recessTransformation, this.recessTransformation, moveButtonUp);
        mat4.translate(this.recessTransformation, this.recessTransformation, moveButtonForward);
        mat4.translate(this.recessTransformation, this.recessTransformation, moveButtonLeft);

        this.jointTransformation = mat4.create();
        mat4.translate(this.jointTransformation, this.jointTransformation, moveJointUp);

        this.tmp = mat4.create();
    }

    draw (vertexAttr, colorAttr, modelUniform, coordFrame) {
        mat4.mul(this.tmp, coordFrame, this.baseTransformation);
        this.base.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul(this.tmp, coordFrame, this.stickTransformation);
        this.stick.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul(this.tmp, coordFrame, this.ballTransformation);
        this.ball.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul(this.tmp, coordFrame, this.buttonTransformation);
        this.button.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul(this.tmp, coordFrame, this.recessTransformation);
        this.buttonRecess.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul(this.tmp, coordFrame, this.jointTransformation);
        this.joint.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
    }
}




// this.speakTransformation = mat4.create();
//
// this.baseTransformation = mat4.create();
// mat4.translate(this.baseTransformation, this.baseTransformation, moveDown);
// mat4.scale(this.baseTransformation, this.baseTransformation, [1.0, 1.0, 0.125]);
//
// this.centerPoleTransformation = mat4.create();
// mat4.translate(this.centerPoleTransformation, this.centerPoleTransformation, poleMoveDown);
//
//

// this.tableDrawerTransformation = mat4.create();
// mat4.translate(this.tableDrawerTransformation, this.tableDrawerTransformation, moveDown);
// mat4.translate(this.tableDrawerTransformation, this.tableDrawerTransformation, moveLeft);
// mat4.scale(this.tableDrawerTransformation, this.tableDrawerTransformation, [1.1, 2.2, 1.8]);
//
// this.leg1Transformation = mat4.create();
// mat4.translate(this.leg1Transformation, this.leg1Transformation, moveDown);
// mat4.translate(this.leg1Transformation, this.leg1Transformation, moveRight);
// mat4.translate(this.leg1Transformation, this.leg1Transformation, moveBack);
//
// this.leg2Transformation = mat4.create();
// mat4.translate(this.leg2Transformation, this.leg2Transformation, moveDown);
// mat4.translate(this.leg2Transformation, this.leg2Transformation, moveRight);
// mat4.translate(this.leg2Transformation, this.leg2Transformation, moveForward);