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
        // 자동차 본체 생성
        const carShape = new CANNON.Box(new CANNON.Vec3(1, 0.1, 2)); // 임의 크기 설정
        this.body = new CANNON.Body({
            mass: 1500,             // 자동차 무게 (kg)
            shape: carShape,
            position: new CANNON.Vec3(0, 1, 0), // 초기 위치
        });
        this.world.addBody(this.body);

        // 바퀴 물리 객체 추가
        const wheelShape = new CANNON.Cylinder(0.1, 0.1, 0.1, 20); // 바퀴 크기
        for (let i = 0; i < 4; i++) {
            const wheelBody = new CANNON.Body({
                mass: 50,          // 바퀴 무게
                shape: wheelShape,
            });
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

                // 각 바퀴 그룹 생성
                // const frontLeftWheelGroup = new THREE.Group();
                // const frontRightWheelGroup = new THREE.Group();
                // const rearLeftWheelGroup = new THREE.Group();
                // const rearRightWheelGroup = new THREE.Group();

                // // 숫자 범위로 메쉬 분류
                // this.car.traverse((child) => {
                //     if (child.isMesh && child.name.startsWith('polySurface')) {
                //         const numberMatch = child.name.match(/polySurface(\d+)/);
                //         if (numberMatch) {
                //             const number = parseInt(numberMatch[1], 10);

                //             // 숫자 범위에 따라 메쉬를 각 바퀴 그룹에 추가
                //             if (number >= 1 && number <= 245) {
                //                 frontLeftWheelGroup.add(child);
                //             } else if (number >= 246 && number <= 490) {
                //                 frontRightWheelGroup.add(child);
                //             } else if (number >= 491 && number <= 746) {
                //                 rearLeftWheelGroup.add(child);
                //             } else if (number >= 747 && number <= 1002) {
                //                 rearRightWheelGroup.add(child);
                //             }
                //         }
                //     }
                // });

                // // 그룹 이름 설정
                // frontLeftWheelGroup.name = 'FLW';
                // frontRightWheelGroup.name = 'FRW';
                // rearLeftWheelGroup.name = 'RLW';
                // rearRightWheelGroup.name = 'RRW';

                // // 자동차 모델에 그룹 추가
                // this.car.add(frontLeftWheelGroup);
                // this.car.add(frontRightWheelGroup);
                // this.car.add(rearLeftWheelGroup);
                // this.car.add(rearRightWheelGroup);

                // // 각 그룹을 this.wheels 객체에 저장
                // this.wheels.frontLeft = frontLeftWheelGroup;
                // this.wheels.frontRight = frontRightWheelGroup;
                // this.wheels.rearLeft = rearLeftWheelGroup;
                // this.wheels.rearRight = rearRightWheelGroup;
                this.car.scale.set(50, 50, 50);
                resolve(this.car);
            }, undefined, (error) => reject(error));
        });
    }

    // 자동차 이동 (앞/뒤로 이동에 따른 물리적 힘 적용)
    setSpeed(speed) {
        this.speed = speed;
        const force = new CANNON.Vec3(0, 0, -this.speed * 50); // 임의 힘 크기 설정
        this.body.applyForce(force, this.body.position);
    }

    // 매 프레임마다 위치와 회전을 업데이트
    update() {
        // Three.js 모델 위치를 Cannon.js 위치와 동기화
        if (this.car) {
            this.car.position.copy(this.body.position);
            this.car.quaternion.copy(this.body.quaternion);

            // 바퀴 위치 업데이트
            Object.values(this.wheels).forEach((wheel, i) => {
                wheel.position.copy(this.wheelBodies[i].position);
                wheel.quaternion.copy(this.wheelBodies[i].quaternion);
            });
        }
    }
}

export default Car;