/**
 * Created by NamNguyen on 3/9/17.
 */
this.grey = vec3.fromValues(170.0 / 255.0, 170.0 / 255.0, 170.0 / 255.0);
this.black = vec3.fromValues (50.0 / 255.0, 50.0 / 255.0, 50.0 / 255.0);

class Monitor{
    constructor(gl){
        this.monitor = new Cube(gl, 1, 5, black, grey, black);
        this.screen = new Cube(gl, 1, 1, black, black, black);

        this.monitorTransformation = mat4.create();
        mat4.scale(this.monitorTransformation, this.monitorTransformation, [1.2,0.1,0.7]);

        this.screenTransformation = mat4.create();
        mat4.scale(this.screenTransformation, this.screenTransformation, [1.1,0.11,0.6]);

        this.tmp = mat4.create();
    }

    draw (vertexAttr, colorAttr, modelUniform, coordFrame) {
        mat4.mul (this.tmp, coordFrame, this.monitorTransformation);
        this.monitor.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.screenTransformation);
        this.screen.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
    }
}