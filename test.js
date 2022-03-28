
class Convolution {
    private drawCanvas() {
        var canvas = <HTMLCanvasElement>document.getElementById('canvas');
        var ctx = canvas.getContext("2d");

        var width = canvas.width;
        var height = canvas.height;
        var image = this.state.image;

        ctx.clearRect(0, 0, width, height);

        if (!image) {
            return;
        }

        var imageRatio = image.width / image.height;
        var canvasRatio = width / height;

        var destWidth = width;
        var destHeight = height;

        // Take the ratio that fit within the canvas
        // ImageData requires even dimensions
        if (imageRatio > canvasRatio) {
            destHeight = Math.ceil(destWidth / imageRatio);
            destHeight = destHeight + destHeight % 2;
        } else {
            destWidth = Math.ceil(destHeight * imageRatio);
            destWidth = destWidth + destWidth % 2;
        }

        var r = {
            x: (width - destWidth) / 2,
            y: (height - destHeight) / 2,
            width: destWidth,
            height: destHeight
        };

        ctx.drawImage(image, r.x, r.y, r.width, r.height);

        var imageData = ctx.getImageData(r.x, r.y, r.width, r.height);


        // Edge detection
        imageData = this.applyConvolutionFilter(imageData, [
                [0, 0, -1, 0, 0],
                [0, 0, -2, 0, 0],
                [-1, -2, 9, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
            ],
            1, 0);


        ctx.putImageData(imageData, r.x, r.y);
    }

    private applyConvolutionFilter(src: ImageData, kernel: number[][], divisor = 1, offset = 0, opaque = true) {
        var w = src.width;
        var h = src.height;

        var dst = new ImageData(w, h);

        var dstBuf = dst.data;
        var srcBuf = src.data;

        var rowOffset = Math.floor(kernel.length / 2);
        var colOffset = Math.floor(kernel[0].length / 2);

        for (var row = 0; row < h; row++) {
            for (var col = 0; col < w; col++) {
                var result = [0, 0, 0, 0];

                for (var kRow = 0; kRow < kernel.length; kRow++) {
                    for (var kCol = 0; kCol < kernel[kRow].length; kCol++) {
                        var kVal = kernel[kRow][kCol]

                        var pixelRow = row + kRow - rowOffset;
                        var pixelCol = col + kCol - colOffset;

                        if (pixelRow < 0 || pixelRow >= h ||
                            pixelCol < 0 || pixelCol >= w) {
                            continue;
                        }

                        var srcIndex = (pixelRow * w + pixelCol) * 4;

                        for (var channel = 0; channel < 4; channel++) {
                            if (opaque && channel === 3) {
                                continue;
                            } else {
                                var pixel = srcBuf[srcIndex + channel];
                                result[channel] += pixel * kVal;
                            }
                        }
                    }
                }

                var dstIndex = (row * w + col) * 4;

                for (var channel = 0; channel < 4; channel++) {
                    var val = (opaque && channel === 3) ? 255 : result[channel] / divisor + offset;
                    dstBuf[dstIndex + channel] = val;
                }
            }
        }
        return dst;
    }

    private applyPixelFilter(imageData: ImageData, filter: Filter) {
        var data = imageData.data;
        for (var i = 0; i < data.length; i += 4) {
            var p = {
                r: data[i],
                g: data[i + 1],
                b: data[i + 2],
                a: data[i + 3]
            };
            p = filter(p);
            data[i] = p.r;
            data[i + 1] = p.g;
            data[i + 2] = p.b;
            data[i + 3] = p.a;
        }

    }

}