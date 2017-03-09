/**
 * Created by NamNguyen on 3/9/17.
 */
class Monitor{
    constructor(gl){
        this.monitor = new Cube(gl, 1, 1);
        this.monitorTransformation = mat4.create();
        mat4.scale(this.monitorTransformation, this.monitorTransformation, [1.5,0.1,0.8]);

        this.tmp = mat4.create();
    }

    draw (vertexAttr, colorAttr, modelUniform, coordFrame) {
        mat4.mul (this.tmp, coordFrame, this.monitorTransformation);
        this.monitor.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
    }
}