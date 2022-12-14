import {
  BufferAttribute, BufferGeometry, Color, DoubleSide, Group, Material, Mesh, MeshBasicMaterial, NormalBlending,
  Object3D,
  Points, PointsMaterial, ShaderMaterial,
  SphereGeometry, Sprite, SpriteMaterial, Texture, TextureLoader, Vector3
} from "three";
import { gsap } from "gsap";
import html2canvas from "html2canvas"


import { createPointMesh, createLightPillar, createWaveMesh, getCirclePoints, createAnimateLine, lon2xyz } from "../Utils/common.js";
import { flyArc } from "../Utils/arc.js";


// 着色器相关代码
// import earthVertex from '../../shaders/earth/vertex.vs';
// import earthFragment from '../../shaders/earth/fragment.fs';

export default class Earth {
  constructor(options) {
    this.options = options

    this.group = new Group()
    this.group.name = 'group'
    this.group.scale.set(0, 0, 0)
    this.earthGroup = new Group()
    this.group.add(this.earthGroup)
    this.earthGroup.name = 'EarthGroup'

    // 标注点效果
    this.markupPoint = new Group()
    this.markupPoint.name = 'markupPoint'
    this.waveMeshArr = []

    // 卫星和标签
    this.circleLineList = []
    this.circleList = []
    this.x = 0;
    this.n = 0;

    // 地球自转
    this.isRotation = this.options.earth.isRotation
    // 着色器参数
    this.uniforms = {
      glowColor: {
        value: new Color(0x0cd1eb),
      },
      scale: {
        type: 'f',
        value: -1.0,
      },
      bias: {
        type: 'f',
        value: 1.0,
      },
      power: {
        type: 'f',
        value: 3.3
      },
      time: {
        type: 'f',
        value: this.timeValue
      },
      isHover: {
        value: false,
      },
      map: {
        value: null
      }
    }
  }

  // 地球初始化操作
  async init() {
    return new Promise(async (resolve) => {
      this.createEarth(); // 创建地球
      this.createStars(); // 添加星星
      this.createEarthGlow() // 创建地球辉光
      this.createEarthAperture() // 创建地球的大气层
      await this.createMarkupPoint() // 创建柱状点位
      await this.createSpriteLabel() // 创建标签
      this.createAnimateCircle() // 创建环绕卫星
      this.createFlyLine() // 创建飞线
      
      this.show()
      resolve()
    })
  }

  // 创建地球
  createEarth() {
    // 地球本体
    const earth_geometry = new SphereGeometry(
      this.options.earth.radius,
      50,
      50
    )

    // 地球外围圆点
    const earth_border = new SphereGeometry(
      this.options.earth.radius + 10,
      60,
      60
    )

    // 定义点材质
    const pointMaterial = new PointsMaterial({
      color: 0x81ffff,  // 设置颜色，默认0xFFFFFF
      transparent: true,
      sizeAttenuation: true,
      opacity: 0.1,
      vertexColors: false,  // 定义材料是否使用顶点颜色，默认false ---如果该选项设置为true，则color属性失效
      size: 0.01, // 定义粒子大小， 默认未1.0
    })
    
    // 创建圆点模型，将模型添加到场景
    const points = new Points(earth_border, pointMaterial)
    this.earthGroup.add(points)

    // 自定义着色器材质，由于这里设置失败（不知道是不是因为没用webpack引入的原因，此处着色器代码报错，故先使用基本材质类型
    // // 设置着色器相关变量
    // // Uniforms是所有顶点都具有相同的值的变量
    // this.uniforms.map.value = this.options.textures.earth;

    // // 地球材质
    // const earth_material = new ShaderMaterial({
    //   // wireframe:true, // 显示模型线条
    //   uniforms: this.uniforms,
    //   vertexShader: `
    //     uniform vec3 glowColor;
    //     uniform float bias;
    //     uniform float power;
    //     uniform float time;
    //     varying vec3 vp;
    //     varying vec3 vNormal;
    //     varying vec3 vPositionNormal;
    //     uniform float scale;
    //     // 获取纹理
    //     uniform sampler2D map;
    //     // 纹理坐标
    //     varying vec2 vUv;

    //     void main(void){
    //       float a = pow( bias + scale * abs(dot(vNormal, vPositionNormal)), power );
    //       if(vp.y > time && vp.y < time + 20.0) {
    //         float t =  smoothstep(0.0, 0.8,  (1.0 - abs(0.5 - (vp.y - time) / 20.0)) / 3.0  );
    //         gl_FragColor = mix(gl_FragColor, vec4(glowColor, 1.0), t * t );
    //       }
    //       gl_FragColor = mix(gl_FragColor, vec4( glowColor, 1.0 ), a);
    //       float b = 0.8;
    //       gl_FragColor = gl_FragColor + texture2D( map, vUv );
    //     }
    //   `,
    //   fragmentShader: `
    //     uniform vec3 glowColor;
    //     uniform float bias;
    //     uniform float power;
    //     uniform float time;
    //     varying vec3 vp;
    //     varying vec3 vNormal;
    //     varying vec3 vPositionNormal;
    //     uniform float scale;
    //     // 获取纹理
    //     uniform sampler2D map;
    //     // 纹理坐标
    //     varying vec2 vUv;

    //     void main(void){
    //       float a = pow( bias + scale * abs(dot(vNormal, vPositionNormal)), power );
    //       if(vp.y > time && vp.y < time + 20.0) {
    //         float t =  smoothstep(0.0, 0.8,  (1.0 - abs(0.5 - (vp.y - time) / 20.0)) / 3.0  );
    //         gl_FragColor = mix(gl_FragColor, vec4(glowColor, 1.0), t * t );
    //       }
    //       gl_FragColor = mix(gl_FragColor, vec4( glowColor, 1.0 ), a);
    //       float b = 0.8;
    //       gl_FragColor = gl_FragColor + texture2D( map, vUv );
    //     }
    //   `,
    // });
    // // 更新材质
    // earth_material.needsUpdate = true;

    const earth_material = new MeshBasicMaterial({
      map: this.options.textures.earth
    })

    // 地球
    this.earth = new Mesh(earth_geometry, earth_material)
    this.earth.name = "earth";
    this.earthGroup.add(this.earth);
  }

  // 星空
  createStars() {
    const vertices = []
    const colors = []
    // 获取星星位置（顶点）、颜色数组
    for (let i = 0; i < 500; i++) {
      const vertex = new Vector3();
      vertex.x = 800 * Math.random() - 300;
      vertex.y = 800 * Math.random() - 300;
      vertex.z = 800 * Math.random() - 300;
      vertices.push(vertex.x, vertex.y, vertex.z);
      colors.push(new Color(1, 1, 1));
    }

    // 星空效果
    this.around = new BufferGeometry()
    this.around.setAttribute("position", new BufferAttribute(new Float32Array(vertices), 3));
    this.around.setAttribute("color", new BufferAttribute(new Float32Array(colors), 3));

    const aroundMaterial = new PointsMaterial({
      size: 2,
      sizeAttenuation: true, // 尺寸衰减
      color: 0x4d76cf,
      transparent: true,
      opacity: 1,
      map: this.options.textures.gradient,
    });

    this.aroundPoints = new Points(this.around, aroundMaterial);
    this.aroundPoints.name = "星空";
    this.aroundPoints.scale.set(1, 1, 1);
    this.group.add(this.aroundPoints);
  }

  // 地球辉光
  createEarthGlow() {
    const R = this.options.earth.radius; //地球半径

    // TextureLoader创建一个纹理加载器对象，可以加载图片作为纹理贴图
    const texture = this.options.textures.glow; // 加载纹理贴图

    // 创建精灵材质对象SpriteMaterial
    const spriteMaterial = new SpriteMaterial({
      map: texture, // 设置精灵纹理贴图
      color: 0x4390d1,
      transparent: true, //开启透明
      opacity: 0.7, // 可以通过透明度整体调节光圈
      depthWrite: false, //禁止写入深度缓冲区数据
    });

    // 创建表示地球光圈的精灵模型
    const sprite = new Sprite(spriteMaterial);
    sprite.scale.set(R * 3.0, R * 3.0, 1); //适当缩放精灵
    this.earthGroup.add(sprite);
  }

  // 内部光圈
  createEarthAperture() {

    const vertexShader = [
      "varying vec3	vVertexWorldPosition;",
      "varying vec3	vVertexNormal;",
      "varying vec4	vFragColor;",
      "void main(){",
      "	vVertexNormal	= normalize(normalMatrix * normal);", //将法线转换到视图坐标系中
      "	vVertexWorldPosition	= (modelMatrix * vec4(position, 1.0)).xyz;", //将顶点转换到世界坐标系中
      "	// set gl_Position",
      "	gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
      "}",
    ].join("\n");

    //大气层效果
    const AeroSphere = {
      uniforms: {
        coeficient: {
          type: "f",
          value: 1.0,
        },
        power: {
          type: "f",
          value: 2,
        },
        glowColor: {
          type: "c",
          value: new Color(0x4390d1),
        },
      },
      vertexShader: vertexShader,
      fragmentShader: [
        "uniform vec3	glowColor;",
        "uniform float	coeficient;",
        "uniform float	power;",

        "varying vec3	vVertexNormal;",
        "varying vec3	vVertexWorldPosition;",

        "varying vec4	vFragColor;",

        "void main(){",
        "	vec3 worldCameraToVertex = vVertexWorldPosition - cameraPosition;", //世界坐标系中从相机位置到顶点位置的距离
        "	vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;", //视图坐标系中从相机位置到顶点位置的距离
        "	viewCameraToVertex= normalize(viewCameraToVertex);", //规一化
        "	float intensity	= pow(coeficient + dot(vVertexNormal, viewCameraToVertex), power);",
        "	gl_FragColor = vec4(glowColor, intensity);",
        "}",
      ].join("\n"),
    };
    //球体 辉光 大气层
    const material1 = new ShaderMaterial({
      uniforms: AeroSphere.uniforms,
      vertexShader: AeroSphere.vertexShader,
      fragmentShader: AeroSphere.fragmentShader,
      blending: NormalBlending,
      transparent: true,
      depthWrite: false,
    });
    const sphere = new SphereGeometry(
      this.options.earth.radius + 0.01,
      50,
      50
    );
    const mesh = new Mesh(sphere, material1);
    this.earthGroup.add(mesh);
  }

  // 创建柱状点位
  async createMarkupPoint() {

    await Promise.all(this.options.data.map(async (item) => {

      const radius = this.options.earth.radius;
      const lon = item.startArray.E; //经度
      const lat = item.startArray.N; //纬度

      // 光柱底座
      this.punctuationMaterial = new MeshBasicMaterial({
        color: this.options.punctuation.circleColor,
        map: this.options.textures.label,
        transparent: true, //使用背景透明的png贴图，注意开启透明计算
        depthWrite: false, //禁止写入深度缓冲区数据
      });
      const mesh = createPointMesh({ radius, lon, lat, material: this.punctuationMaterial }); //光柱底座矩形平面
      this.markupPoint.add(mesh);

      // 创建光柱
      const LightPillar = createLightPillar({
        radius: this.options.earth.radius,
        lon,
        lat,
        index: 0,
        textures: this.options.textures,
        punctuation: this.options.punctuation,
      }); //光柱
      this.markupPoint.add(LightPillar);
      
      // 光波
      const WaveMesh = createWaveMesh({ radius, lon, lat, textures: this.options.textures }); //波动光圈
      this.markupPoint.add(WaveMesh);
      this.waveMeshArr.push(WaveMesh);

      await Promise.all(item.endArray.map((obj) => {
        const lon = obj.E; //经度
        const lat = obj.N; //纬度
        const mesh = createPointMesh({ radius, lon, lat, material: this.punctuationMaterial }); //光柱底座矩形平面
        this.markupPoint.add(mesh);
        const LightPillar = createLightPillar({
          radius: this.options.earth.radius,
          lon,
          lat,
          index: 1,
          textures: this.options.textures,
          punctuation: this.options.punctuation
        }); //光柱
        this.markupPoint.add(LightPillar);
        const WaveMesh = createWaveMesh({ radius, lon, lat, textures: this.options.textures }); //波动光圈
        this.markupPoint.add(WaveMesh);
        this.waveMeshArr.push(WaveMesh);
      }))
      this.earthGroup.add(this.markupPoint)
    }))
  }

  // 创建文字标签
  async createSpriteLabel() {
    await Promise.all(this.options.data.map(async item => {
      let cityArry = [];
      cityArry.push(item.startArray);
      cityArry = cityArry.concat(...item.endArray);
      await Promise.all(cityArry.map(async e => {
        const p = lon2xyz(this.options.earth.radius * 1.001, e.E, e.N);
        const div = `<div class="fire-div">${e.name}</div>`;
        const shareContent = document.getElementById("html2canvas");
        shareContent.innerHTML = div;
        const opts = {
          backgroundColor: null, // 背景透明
          scale: 6,
          dpi: window.devicePixelRatio,
        };
        const canvas = await html2canvas(document.getElementById("html2canvas"), opts)
        const dataURL = canvas.toDataURL("image/png");
        const map = new TextureLoader().load(dataURL);
        const material = new SpriteMaterial({
          map: map,
          transparent: true,
        });
        const sprite = new Sprite(material);
        const len = 5 + (e.name.length - 2) * 2;
        sprite.scale.set(len, 3, 1);
        sprite.position.set(p.x * 1.1, p.y * 1.1, p.z * 1.1);
        this.earth.add(sprite);

        // 修改材质颜色测试
        // setTimeout(() => {
        //   console.log("111")
        //   material.color = new Color( 0xffff00 )
        // }, 10000);
      }))
    }))
  }
  
  // 创建动画轨道卫星
  createAnimateCircle() {
    // 创建 圆环 点
    const list = getCirclePoints({
      radius: this.options.earth.radius + 15,
      number: 150, //切割数
      closed: true, // 闭合
    });
    // 基本网格材质
    const mat = new MeshBasicMaterial({
      color: "#0c3172",
      transparent: true,
      opacity: 0.4,
      side: DoubleSide,
    });
    const line = createAnimateLine({
      pointList: list,
      material: mat,
      number: 100,
      radius: 0.1,
    });
    this.earthGroup.add(line);

    // 在clone两条线出来
    const l2 = line.clone();
    l2.scale.set(1.2, 1.2, 1.2);
    l2.rotateZ(Math.PI / 6);
    this.earthGroup.add(l2);

    const l3 = line.clone();
    l3.scale.set(0.8, 0.8, 0.8);
    l3.rotateZ(-Math.PI / 6);
    this.earthGroup.add(l3);

    /**
     * 旋转的球
     */
    const ball = new Mesh(
      new SphereGeometry(this.options.satellite.size, 32, 32),
      new MeshBasicMaterial({
        color: "#e0b187", // 745F4D
      })
    );

    const ball2 = new Mesh(
      new SphereGeometry(this.options.satellite.size, 32, 32),
      new MeshBasicMaterial({
        color: "#628fbb", // 324A62
      })
    );

    const ball3 = new Mesh(
      new SphereGeometry(this.options.satellite.size, 32, 32),
      new MeshBasicMaterial({
        color: "#806bdf", //6D5AC4
      })
    );

    this.circleLineList.push(line, l2, l3);
    ball.name = ball2.name = ball3.name = "卫星";

    for (let i = 0; i < this.options.satellite.number; i++) {
      const ball01 = ball.clone();
      // 一根线上总共有几个球，根据数量平均分布一下
      const num = Math.floor(list.length / this.options.satellite.number)
      ball01.position.set(
        list[num * (i + 1)][0] * 1,
        list[num * (i + 1)][1] * 1,
        list[num * (i + 1)][2] * 1
      );
      line.add(ball01);

      const ball02 = ball2.clone();
      const num02 = Math.floor(list.length / this.options.satellite.number)
      ball02.position.set(
        list[num02 * (i + 1)][0] * 1,
        list[num02 * (i + 1)][1] * 1,
        list[num02 * (i + 1)][2] * 1
      );
      l2.add(ball02);

      const ball03 = ball2.clone();
      const num03 = Math.floor(list.length / this.options.satellite.number)
      ball03.position.set(
        list[num03 * (i + 1)][0] * 1,
        list[num03 * (i + 1)][1] * 1,
        list[num03 * (i + 1)][2] * 1
      );
      l3.add(ball03);
    }
  }

  createFlyLine() {

    this.flyLineArcGroup = new Group();
    this.flyLineArcGroup.userData['flyLineArray'] = []
    this.earthGroup.add(this.flyLineArcGroup)

    this.options.data.forEach((cities) => {
      cities.endArray.forEach(item => {

        // 调用函数flyArc绘制球面上任意两点之间飞线圆弧轨迹
        const arcline = flyArc(
          this.options.earth.radius,
          cities.startArray.E,
          cities.startArray.N,
          item.E,
          item.N,
          this.options.flyLine
        );

        this.flyLineArcGroup.add(arcline); // 飞线插入flyArcGroup中
        this.flyLineArcGroup.userData['flyLineArray'].push(arcline.userData['flyLine'])
      });

    })

  }

  // 显示动画
  show() {
    gsap.to(this.group.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 2,
      ease: "Quadratic",
    })
  }

  // 渲染
  render() {
    // 是否旋转
    if (this.isRotation) {
      this.earthGroup.rotation.y += this.options.earth.rotateSpeed;
    }

    // 光波扩散
    if (this.waveMeshArr.length) {
      this.waveMeshArr.forEach((mesh) => {
        mesh.userData['scale'] += 0.007;
        mesh.scale.set(
          mesh.userData['size'] * mesh.userData['scale'],
          mesh.userData['size'] * mesh.userData['scale'],
          mesh.userData['size'] * mesh.userData['scale']
        );
        if (mesh.userData['scale'] <= 1.5) {
          (mesh.material).opacity = (mesh.userData['scale'] - 1) * 2; //2等于1/(1.5-1.0)，保证透明度在0~1之间变化
        } else if (mesh.userData['scale'] > 1.5 && mesh.userData['scale'] <= 2) {
          (mesh.material).opacity = 1 - (mesh.userData['scale'] - 1.5) * 2; //2等于1/(2.0-1.5) mesh缩放2倍对应0 缩放1.5被对应1
        } else {
          mesh.userData['scale'] = 1;
        }
      });
    }

    // 轨道卫星旋转
    this.circleLineList.forEach((e) => {
      e.rotateY(this.options.satellite.rotateSpeed);
    });

    // 飞线动画
    this.flyLineArcGroup?.userData['flyLineArray']?.forEach(fly => {
      fly.rotation.z += this.options.flyLine.speed; // 调节飞线速度
      if (fly.rotation.z >= fly.flyEndAngle) fly.rotation.z = 0;
    })
  }
}