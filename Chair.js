/**
 * Created by NamNguyen on 3/12/17.
 */
this.red = vec3.fromValues(1.0, 0.0, 0.0);
this.white = vec3.fromValues(1.0, 1.0, 1.0);
this.grey = vec3.fromValues(170.0 / 255.0, 170.0 / 255.0, 170.0 / 255.0);
this.black = vec3.fromValues (50.0 / 255.0, 50.0 / 255.0, 50.0 / 255.0);
this.brown = vec3.fromValues (153.0 / 255.0, 102.0 / 255.0, 0.0);

class Chair{
    constructor(gl) {
        this.chairBack = new Torus(gl, 1, 0.1, 30, 30, black, grey);
        this.chairBottom = new Cube(gl, 1, 5, grey, grey, black);

        this.backSupport1 = new Cylinder(gl, 0.05, 0.05, 1, 10, white, brown, brown);
        this.backSupport2 = new Cylinder(gl, 0.05, 0.05, 1.3, 10, white, brown, brown);
        this.backSupport3 = new Cylinder(gl, 0.05, 0.05, 1.3, 10, white, brown, brown);
        this.backSupport4 = new Cylinder(gl, 0.05, 0.05, 1, 10, white, brown, brown);

        this.chairLeg1 = new Cylinder(gl, 0.05, 0.05, 1, 10, white, brown, brown);
        this.chairLeg2 = new Cylinder(gl, 0.05, 0.05, 1, 10, white, brown, brown);
        this.chairLeg3 = new Cylinder(gl, 0.05, 0.05, 1, 10, white, brown, brown);
        this.chairLeg4 = new Cylinder(gl, 0.05, 0.05, 1, 10, white, brown, brown);

        this.chairBackTransform = mat4.create();
        mat4.rotateX(this.chairBackTransform, this.chairBackTransform, Math.PI/2);
        mat4.scale(this.chairBackTransform, this.chairBackTransform, [0.5, 0.7, 0.7]);

        this.chairBottomTransfrom = mat4.create();
        mat4.scale(this.chairBottomTransfrom, this.chairBottomTransfrom, [1, 1.1, 0.1]);
        mat4.translate(this.chairBottomTransfrom, this.chairBottomTransfrom, vec3.fromValues(0, 0, -6.5));
        mat4.translate(this.chairBottomTransfrom, this.chairBottomTransfrom, vec3.fromValues(0, 0.5, 0));

        this.chairLeg1Transform = mat4.create();
        mat4.translate(this.chairLeg1Transform, this.chairLeg1Transform, vec3.fromValues(0, 0, -1.2));
        mat4.translate(this.chairLeg1Transform, this.chairLeg1Transform, vec3.fromValues(0.35 , 0, 0));
        mat4.translate(this.chairLeg1Transform, this.chairLeg1Transform, vec3.fromValues(0, 0.1, 0));

        this.chairLeg2Transform = mat4.create();
        mat4.translate(this.chairLeg2Transform, this.chairLeg2Transform, vec3.fromValues(0, 0, -1.2));
        mat4.translate(this.chairLeg2Transform, this.chairLeg2Transform, vec3.fromValues(-0.35 , 0, 0));
        mat4.translate(this.chairLeg2Transform, this.chairLeg2Transform, vec3.fromValues(0, 0.1, 0));

        this.chairLeg3Transform = mat4.create();
        mat4.translate(this.chairLeg3Transform, this.chairLeg3Transform, vec3.fromValues(0, 0, -1.2));
        mat4.translate(this.chairLeg3Transform, this.chairLeg3Transform, vec3.fromValues(-0.35 , 0, 0));
        mat4.translate(this.chairLeg3Transform, this.chairLeg3Transform, vec3.fromValues(0, 1, 0));

        this.chairLeg4Transform = mat4.create();
        mat4.translate(this.chairLeg4Transform, this.chairLeg4Transform, vec3.fromValues(0, 0, -1.2));
        mat4.translate(this.chairLeg4Transform, this.chairLeg4Transform, vec3.fromValues(0.35 , 0, 0));
        mat4.translate(this.chairLeg4Transform, this.chairLeg4Transform, vec3.fromValues(0, 1, 0));

        this.backSupport1Transform = mat4.create();
        mat4.translate(this.backSupport1Transform, this.backSupport1Transform, vec3.fromValues(-0.3, 0, 0));

        this.backSupport2Transform = mat4.create();
        mat4.translate(this.backSupport2Transform, this.backSupport2Transform, vec3.fromValues(-0.1, 0, 0));

        this.backSupport3Transform = mat4.create();
        mat4.translate(this.backSupport3Transform, this.backSupport3Transform, vec3.fromValues(0.1, 0, 0));

        this.backSupport4Transform = mat4.create();
        mat4.translate(this.backSupport4Transform, this.backSupport4Transform, vec3.fromValues(0.3, 0, 0));

        this.tmp = mat4.create();
    }

    draw (vertexAttr, colorAttr, modelUniform, coordFrame) {
        mat4.mul (this.tmp, coordFrame, this.chairBackTransform);
        this.chairBack.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.chairBottomTransfrom);
        this.chairBottom.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.chairLeg1Transform);
        this.chairLeg1.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.chairLeg2Transform);
        this.chairLeg2.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.chairLeg3Transform);
        this.chairLeg3.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.chairLeg4Transform);
        this.chairLeg4.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.backSupport1Transform);
        this.backSupport1.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.backSupport2Transform);
        this.backSupport2.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.backSupport3Transform);
        this.backSupport3.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.backSupport4Transform);
        this.backSupport4.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
    }
}