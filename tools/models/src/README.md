# Quaternius 원본 (모두 CC0 1.0)

각 팩의 License.txt에 "CC0 1.0 Universal (CC0 1.0) Public Domain Dedication"으로 적혀 있다. 만든이: Quaternius (https://quaternius.com).

| 파일 | 팩 | 가져온 방법 |
| --- | --- | --- |
| `Cow.glb`, `Horse.glb`, `Bull.glb`, `Horse_White.glb`, `Alpaca.glb`, `Donkey.glb` | Ultimate Animated Animals (2021-07) | glTF에서 쓰는 동작만 남김(`trim.mjs`) |
| `Casual*.glb`, `OldClassy_Female.glb`, `Worker_*.glb`, `Cowboy_*.glb` | Ultimate Animated Character Pack (2019-11) | glTF에서 동작을 덜어 냄(`trim.mjs`). 동작은 `Casual_Male.glb`에만 남기고 나머지는 뼈대가 같아 빌려 씀 |
| `Sheep.glb`, `Pig.glb` | Farm Animals Pack (2018) | FBX → GLB |
| `Dino_*.glb` | Dinosaur Animated Pack (2018-12) | FBX → GLB |
| `CommonTree_*`, `PineTree_*`, `BirchTree_1`, `Willow_1`, `Bush_1`, `BushBerries_1`, `Rock_*`, `TreeStump_Moss`, `WoodLog_Moss`, `Flowers`, `Plant_1`, `Lilypad` | Ultimate Nature Pack (2019-06) | FBX → GLB |
| `Koi.glb`, `Dock_Long.glb`, `Dock_Wide.glb`, `Boat_Small.glb` | Cute Fish Pack (2020-02) | FBX → GLB |
| `Ship_*.glb` | Ships (2018) | FBX → GLB |
| `Farm_*.glb` | Farm Buildings (2018-09) | FBX → GLB |
| `Village_*.glb` | Medieval Village Pack (2020-12) | FBX → GLB |
| `RTS_*.glb` | Ultimate Fantasy RTS (2022-08) | glTF → GLB(`trim.mjs`) |
| `Food_*.glb` | Ultimate Food Pack (2019-10) | FBX → GLB |
| `Fish2018_*.glb` | Animated Fish Pack (2018) | FBX → GLB |
| `Survival_*.glb` | Survival Pack (2020-09) | FBX → GLB |
| `Gun_*.glb` | Animated FPS Guns (2018-06) | FBX → GLB. **이 폴더에는 License.txt가 없었다.** 같은 작가의 다른 팩은 모두 CC0이지만 이 팩의 라이선스는 폴더 안에서 확인하지 못했다 |

FBX → GLB는 three.js(0.160)의 FBXLoader로 읽어 GLTFExporter로 내보냈다. 색과 삼각형 수는 `build.mjs`의 옵션(pal · lift · simplify)으로 맞춘다.
