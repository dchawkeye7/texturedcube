var vertexShaderText = 
[
'precision mediump float;',
'',
'attribute vec3 vertPosition;',
'attribute vec2 vertTexCoord;',
'varying vec2 fragTexCoord;',
'uniform mat4 mWorld;',
'uniform mat4 mView;',
'uniform mat4 mProj;',
'',
'void main()',
'{',
'  fragTexCoord = vertTexCoord;',
'  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
'}'
].join('\n');

var fragmentShaderText =
[
'precision mediump float;',
'',
'varying vec2 fragTexCoord;',
'uniform sampler2D imgSampler;',
'',
'void main()',
'{',
'  gl_FragColor = texture2D(imgSampler, fragTexCoord);',
'}'
].join('\n');

var InitProgram = function () {
	console.log('InitProgram function is working.');

	var canvas = document.getElementById('WebGLCanvas');
	var gl = canvas.getContext('webgl');
	if(!gl) {
		console.log('webgl not supported. Loading experimental-webgl');
		gl = canvas.getContext('experimental-webgl');
	}
	if(!gl) {
		alert('Your browser does not support HTML5.');
	}

	// Render to entire window size
	//canvas.width = window.innerWidth;
	//canvas.height = window.innerHeight;
	//gl.viewport(0,0,window.innerWidth,window.innerHeight);

	gl.clearColor(0.75,0.75,0.75,1.0);
	gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);

	// Create Shaders
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	gl.shaderSource(vertexShader, vertexShaderText);
	gl.shaderSource(fragmentShader, fragmentShaderText);

	// Compile
	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error('Unable to compile vertexShader.', gl.getShaderInfoLog(vertexShader));
		return;
	}
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error('Unable to compile fragmentShader.', gl.getShaderInfoLog(fragmentShader));
		return;
	}

	// Create program for graphics card
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);

	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('Cannot link program.', gl.getProgramInfoLog(program));
		return;
	}
	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		console.error('Cannot validate program.', gl.getProgramInfoLog(program));
		return;
	}

	var boxVertices = 
	[ //   X,    Y,    Z,    U, V,
		
	  // Top
		-1.0,  1.0, -1.0,    0, 0,
		-1.0,  1.0,  1.0,    0, 1,
		 1.0,  1.0,  1.0,    1, 1,
		 1.0,  1.0, -1.0,    1, 0,

	  // Left
		-1.0,  1.0,  1.0,    0, 0,
		-1.0, -1.0,  1.0,    1, 0,
		-1.0, -1.0, -1.0,    1, 1,
		-1.0,  1.0, -1.0,    0, 1,

	  // Right
		 1.0,  1.0,  1.0,    1, 1,
		 1.0, -1.0,  1.0,    0, 1,
		 1.0, -1.0, -1.0,    0, 0,
		 1.0,  1.0, -1.0,    1, 0,

	  // Front
		 1.0,  1.0,  1.0,    1, 1,
		 1.0, -1.0,  1.0,    1, 0,
		-1.0, -1.0,  1.0,    0, 0,
		-1.0,  1.0,  1.0,    0, 1,

	  // Back
		 1.0,  1.0, -1.0,    0, 0,
		 1.0, -1.0, -1.0,    0, 1,
		-1.0, -1.0, -1.0,    1, 1,
		-1.0,  1.0, -1.0,    1, 0,

	  // Bottom
		-1.0, -1.0, -1.0,    1, 1,
		-1.0, -1.0,  1.0,    1, 0,
		 1.0, -1.0,  1.0,    0, 0,
		 1.0, -1.0, -1.0,    0, 1,
	];

	var boxIndices =
	[
		// Top
		0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
	];

	var boxVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

	var boxIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	var texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 // Offset from the beginning of a single vertex to this attribute
	);
	gl.vertexAttribPointer(
		texCoordAttribLocation, // Attribute location
		2, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	);

	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(texCoordAttribLocation);

	// Create Texture
	var boxTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, boxTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(
		gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
		gl.UNSIGNED_BYTE,
		document.getElementById('crate_image')
	);
	gl.bindTexture(gl.TEXTURE_2D, null);

	// Use the program named program
	gl.useProgram(program)

	var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
	var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
	var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

	var WorldMatrix = new Float32Array(16);
	var ViewMatrix = new Float32Array(16);
	var ProjMatrix = new Float32Array(16);
	mat4.identity(WorldMatrix); //GLMatrix mat4
	mat4.lookAt(ViewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);  //GLMatrix mat4 lookAt
	mat4.perspective(ProjMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);  //GLMatrix mat4 perspective

	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, WorldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, ViewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, ProjMatrix);

	var IdentityMatrix = new Float32Array(16);
	mat4.identity(IdentityMatrix);
	var angle = 0;

	var xRotationMatrix = new Float32Array(16);
	var yRotationMatrix = new Float32Array(16);

	// Main render loop
	var loop = function() {
		angle = performance.now() / 25000 * 6 * 2 * Math.PI;
		mat4.rotate(yRotationMatrix, IdentityMatrix, angle, [0, 1, 0]);
		mat4.rotate(xRotationMatrix, IdentityMatrix, angle / 8, [1, 0, 0]);
		mat4.mul(WorldMatrix, yRotationMatrix, xRotationMatrix);
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, WorldMatrix);
		
		gl.clearColor(0.75,0.75,0.75,1.0);
		gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);
		gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

		requestAnimationFrame(loop);	
	}
	requestAnimationFrame(loop);
};