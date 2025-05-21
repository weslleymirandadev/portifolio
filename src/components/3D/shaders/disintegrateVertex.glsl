uniform float uTime;
uniform float uProgress;
uniform float uScale;
varying float vDisplacement;

void main() {
  vec3 newPosition = position;

  // Ruído base fixo por posição
  float noise = fract(sin(dot(position.xy, vec2(12.9898,78.233))) * 43758.5453);

  // Interpolação inversa do progresso
  float displace = 1.0 - smoothstep(0.0, 1.0, uProgress + noise * 0.5);
  vDisplacement = displace;

  // Movimento principal conforme progresso
  newPosition.x += (0.5 - noise) * 250.0 * displace;
  newPosition.y += (-5.0 * displace);
  newPosition.z += (0.5 - noise) * 250.0 * displace;

  float vibrationAmplitude = 0.02; // amplitude do tremor
  float vibrationSpeed = 10.0;     // velocidade do tremor

  // Usa posição + tempo para gerar movimento oscilatório pseudoaleatório
  float vibX = sin(uTime * vibrationSpeed + noise * 10.0) * vibrationAmplitude;
  float vibY = cos(uTime * vibrationSpeed + noise * 20.0) * vibrationAmplitude;
  float vibZ = sin(uTime * vibrationSpeed + noise * 30.0) * vibrationAmplitude;

  newPosition += vec3(vibX, vibY, vibZ);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  gl_PointSize = 2.0;
}
