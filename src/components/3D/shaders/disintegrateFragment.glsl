varying float vDisplacement;

void main() {
  float alpha = smoothstep(0.3, 0.0, vDisplacement); // Fica mais opaco conforme se organiza
  gl_FragColor = vec4(vec3(0.0), alpha); // Preto sólido
}
