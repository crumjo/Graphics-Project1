/**
 * Created by Hans Dulimarta on 2/16/17.
 */
class Desk {
    constructor (gl) {
        this.tableTop = new Cube(gl, 1, 1);
        this.tableDrawer = new Cube(gl, 1, 1);
        this.leg1 = new Cylinder(gl, 0.08, 0.08, 1.8, 10);
        this.leg2 = new Cylinder(gl, 0.08, 0.08, 1.8, 10);

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
    }
}