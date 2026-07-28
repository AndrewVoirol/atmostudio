

// Vertex Shader for basic plane geometry
export const BASE_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Cloud Fragment Shader (Simplex Noise based)
export const CLOUD_FRAGMENT_SHADER = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uDensity;
  uniform float uOpacity;
  varying vec2 vUv;

  // Simple pseudo-random noise
  float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }

  float noise(vec2 p){
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u*u*(3.0-2.0*u);
    float res = mix(
      mix(rand(ip), rand(ip+vec2(1.0,0.0)), u.x),
      mix(rand(ip+vec2(0.0,1.0)), rand(ip+vec2(1.0,1.0)), u.x), u.y);
    return res*res;
  }

  float fbm(vec2 x) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for (int i = 0; i < 5; ++i) {
      v += a * noise(x);
      x = rot * x * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float time = uTime * 0.1;
    
    // Create multiple layers of noise moving at different speeds
    float q = fbm(uv * 3.0 + vec2(time * 0.5, time * 0.2));
    float r = fbm(uv + q + vec2(time * 0.4, time * 0.6));
    float f = fbm(uv + r);

    // Add high frequency noise for "fluffiness" / detail
    float detail = noise(uv * 12.0 - vec2(time * 0.5));
    f += detail * 0.1;
    
    // Add micro-grain for texture realism
    float grain = rand(uv * 100.0 + vec2(time));
    f += grain * 0.03;

    // Density threshold
    float alpha = smoothstep(1.0 - uDensity - 0.1, 1.0 - uDensity + 0.3, f);
    
    // Soften edges of the plane
    alpha *= smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
    
    gl_FragColor = vec4(uColor, alpha * uOpacity);
  }
`;

// Rain/Snow/Mist/Dust Fragment Shader
export const PRECIPITATION_FRAGMENT_SHADER = `
  uniform float uTime;
  uniform float uRainIntensity;
  uniform float uSnowIntensity;
  uniform float uWindX;
  uniform float uWindY;
  varying vec2 vUv;

  float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
  }

  float noise(vec2 p){
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u*u*(3.0-2.0*u);
    float res = mix(
      mix(rand(ip), rand(ip+vec2(1.0,0.0)), u.x),
      mix(rand(ip+vec2(0.0,1.0)), rand(ip+vec2(1.0,1.0)), u.x), u.y);
    return res*res;
  }

  float fbm(vec2 x) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for (int i = 0; i < 5; ++i) {
      v += a * noise(x);
      x = rot * x * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    
    // --- 1. Mist/Fog Layer (Background atmosphere) ---
    // Drifts slowly, intensity based on overall precipitation + base atmosphere
    vec2 mistUV = uv * 2.5 + vec2(uTime * 0.05 * uWindX, uTime * 0.03);
    
    // Use FBM for mist to make it smokey
    float mistVal = fbm(mistUV);
    
    // Calculate mist intensity: Base amount + precipitation amount
    float baseMist = 0.05; 
    float precipMist = (uRainIntensity + uSnowIntensity) * 0.4;
    float mistOpacity = baseMist + precipMist;

    float mistAlpha = smoothstep(0.3, 0.8, mistVal) * mistOpacity;
    vec4 mistColor = vec4(0.9, 0.95, 1.0, mistAlpha);


    // --- 2. Dust/Particulate Layer ---
    // Floating particles that twinkle
    vec2 dustUV = uv * 25.0; // Dense grid
    
    // Movement: Wind + slight vertical float + swirl
    dustUV.x += uTime * 0.1 * uWindX;
    dustUV.y += sin(uTime * 0.5 + uv.x * 5.0) * 0.05 - uTime * 0.05;
    
    float dustNoiseVal = noise(dustUV);
    // High threshold for sparse particles
    float dust = step(0.96, dustNoiseVal); 
    
    // Twinkle: modulate opacity with time
    float twinkle = 0.5 + 0.5 * sin(uTime * 3.0 + dot(uv, vec2(10.0)));
    
    // Dust is always present but subtle
    vec4 dustColor = vec4(1.0, 1.0, 0.9, dust * 0.15 * twinkle);


    // --- 3. Rain Layer ---
    vec2 rainUV = uv * vec2(40.0, 4.0); // Stretch vertically
    // Wind affects rain significantly
    rainUV.x -= uTime * uWindX * 20.0; 
    rainUV.y -= uTime * uWindY * 20.0;
    
    vec2 rainGrid = floor(rainUV);
    float rainRnd = rand(rainGrid);
    // Adjust density based on intensity
    float rainDrop = step(1.0 - (uRainIntensity * 0.5), rainRnd);
    float rainAlpha = rainDrop * (1.0 - fract(rainUV.y)); 
    vec4 rainColor = vec4(0.8, 0.9, 1.0, rainAlpha * 0.8);


    // --- 4. Snow Layer ---
    vec2 snowUV = uv * 8.0; // Grid size
    // Snow falls slower and wiggles
    snowUV.x += sin(uv.y * 10.0 + uTime) * 0.1; 
    snowUV.x -= uTime * uWindX * 2.0;
    snowUV.y -= uTime * uWindY * 2.0; // Slower than rain
    
    vec2 snowGrid = floor(snowUV);
    // Center the flake in the grid cell
    vec2 snowCenter = vec2(0.5);
    vec2 snowCellUV = fract(snowUV);
    
    float snowRnd = rand(snowGrid);
    float snowFlakeExist = step(1.0 - (uSnowIntensity * 0.6), snowRnd);
    
    // Soft round flakes
    float d = distance(snowCellUV, snowCenter);
    float snowShape = smoothstep(0.4, 0.3, d);

    float snowAlpha = snowFlakeExist * snowShape;
    vec4 snowColor = vec4(1.0, 1.0, 1.0, snowAlpha * uSnowIntensity);

    // Compositing Layers
    // Order: Mist -> Dust -> Rain -> Snow
    
    vec4 finalColor = mistColor;
    
    // Add Dust (additive)
    finalColor = finalColor + dustColor;
    
    // Blend Rain
    finalColor = mix(finalColor, rainColor, rainColor.a);

    // Blend Snow
    finalColor = mix(finalColor, snowColor, snowColor.a);
    
    gl_FragColor = finalColor;
    
    // Clip fully transparent pixels
    if (gl_FragColor.a < 0.001) discard;
  }
`;