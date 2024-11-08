// car.js
import * as THREE from './three/build/three.module.js';
import * as CANNON from './cannon-es/dist/cannon-es.js';
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js';

class Car {
    constructor(modelUrl, world) {
        this.modelUrl = modelUrl;  // GLTF 모델 URL
        this.car = null;           // Three.js 자동차 모델
        this.wheels = {};          // 바퀴 객체들
        this.rpm = 0;            // 이동 속도
        this.wheelDirection;

        this.world = world;        // Cannon.js 월드 객체
        this.body = null;          // Cannon.js 자동차 본체
        this.wheelBodies = [];     // Cannon.js 바퀴들
        this.setupPhysics();       // 물리 설정 초기화
    }

    // 자동차의 물리적 본체 및 바퀴를 설정

    setupPhysics() {
        const carShape = new CANNON.Box(new CANNON.Vec3(1, 0.1, 2));
        this.body = new CANNON.Body({
            mass: 1500,
            shape: carShape,
            position: new CANNON.Vec3(0, 1, 0),
        });
        this.world.addBody(this.body);

        // 바퀴 물리 객체 추가
        const wheelShape = new CANNON.Cylinder(0.1, 0.1, 0.1, 20); // 실린더 형태 바퀴
        const wheelPositions = [
            new CANNON.Vec3(-0.9, 0.5, 1.8),  // front-left
            new CANNON.Vec3(0.9, 0.5, 1.8),   // front-right
            new CANNON.Vec3(-0.9, 0.5, -1.8), // rear-left
            new CANNON.Vec3(0.9, 0.5, -1.8),  // rear-right
        ];

        for (let i = 0; i < 4; i++) {
            const wheelBody = new CANNON.Body({
                mass: 50,
                shape: wheelShape,
            });

            // 바퀴의 기본 축을 y축에서 x축으로 회전시킴
            const wheelQuaternion = new CANNON.Quaternion();
            wheelQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI / 2); // z축을 기준으로 90도 회전
            wheelBody.quaternion.copy(wheelQuaternion);

            // 각 바퀴의 위치 설정
            wheelBody.position.copy(wheelPositions[i]);

            this.wheelBodies.push(wheelBody);
            this.world.addBody(wheelBody);
        }
    }

    // GLTF 모델 로드 및 바퀴 객체 찾기
    async loadModel() {
        const loader = new GLTFLoader();
        return new Promise((resolve, reject) => {
            loader.load(this.modelUrl, (gltf) => {
                this.car = gltf.scene;
                this.car.scale.set(50, 50, 50);
                const wheelScale = 0.01;

                // 스케일을 일관되게 설정하기 위해 본체와 바퀴 그룹을 모두 포함
                // 바퀴 그룹을 생성하고 본체에 추가
                const FL = new THREE.Group();
                const FR = new THREE.Group();
                const RL = new THREE.Group();
                const RR = new THREE.Group();

                this.car.traverse((child) => {
                    if (child.isMesh && child.name.startsWith('polySurface')) {
                        const numberMatch = child.name.match(/polySurface(\d+)/);
                        if (numberMatch) {
                            const number = parseInt(numberMatch[1], 10);
                            if (number >= 1 && number <= 245) {
                                FL.add(child);
                            } else if (number >= 246 && number <= 490) {
                                FR.add(child);
                            } else if (number >= 491 && number <= 746) {
                                RL.add(child);
                            } else if (number >= 747 && number <= 1002) {
                                RR.add(child);
                            }
                        }
                    }
                });

                // 바퀴 그룹의 이름 설정 및 본체에 추가
                FL.name = 'FLW';
                FR.name = 'FRW';
                RL.name = 'RLW';
                RR.name = 'RRW';

                const front = 0.0135;
                const back = -0.0136;
                const right = -0.0095;
                const left = 0.008;
                const h = 0.003;

                FL.position.set(left, h, front);  // 예시 좌표
                FR.position.set(right, h, front);
                RL.position.set(left, h, back);
                RR.position.set(right, h, back);
                

                FL.scale.set(wheelScale, wheelScale, wheelScale);
                FR.scale.set(wheelScale, wheelScale, wheelScale);
                RL.scale.set(wheelScale, wheelScale, wheelScale);
                RR.scale.set(wheelScale, wheelScale, wheelScale);

                // 각 바퀴 그룹을 this.car 본체에 추가
                this.car.add(FL);
                this.car.add(FR);
                this.car.add(RL);
                this.car.add(RR);

                // 각 바퀴 그룹을 this.wheels 객체에 저장
                this.wheels.frontLeft = FL;
                this.wheels.frontRight = FR;
                this.wheels.rearLeft = RL;
                this.wheels.rearRight = RR;

                resolve(this.car);
            }, undefined, (error) => reject(error));
        });
    }

    // 매 프레임마다 위치와 회전을 업데이트
    update() {
        if (this.car) {
            this.car.position.copy(this.body.position);
            this.car.quaternion.copy(this.body.quaternion);

            Object.values(this.wheels).forEach((wheel, i) => {
                wheel.position.copy(this.wheelBodies[i].position);
                wheel.quaternion.copy(this.wheelBodies[i].quaternion);
            });
        }
    }
}
export default Car;