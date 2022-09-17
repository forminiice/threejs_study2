import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

export default function(params) {
  // Init gui

  const gui = new GUI({ width: 280 });

  gui.add(params, 'edgeStrength', 0.01, 10).onChange(function (value) {

    outlinePass.edgeStrength = Number(value);

  });

  gui.add(params, 'edgeGlow', 0.0, 1).onChange(function (value) {

    outlinePass.edgeGlow = Number(value);

  });

  gui.add(params, 'edgeThickness', 1, 4).onChange(function (value) {

    outlinePass.edgeThickness = Number(value);

  });

  gui.add(params, 'pulsePeriod', 0.0, 5).onChange(function (value) {

    outlinePass.pulsePeriod = Number(value);

  });

  gui.add(params, 'rotate');

  gui.add(params, 'usePatternTexture').onChange(function (value) {

    outlinePass.usePatternTexture = value;

  });

  function Configuration() {

    this.visibleEdgeColor = '#ffffff';
    this.hiddenEdgeColor = '#190a05';

  }

  const conf = new Configuration();

  gui.addColor(conf, 'visibleEdgeColor').onChange(function (value) {

    outlinePass.visibleEdgeColor.set(value);

  });

  gui.addColor(conf, 'hiddenEdgeColor').onChange(function (value) {

    outlinePass.hiddenEdgeColor.set(value);

  });
}