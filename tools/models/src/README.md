# Quaternius 원본 (모두 CC0 1.0)

각 팩의 License.txt에 "CC0 1.0 Universal (CC0 1.0) Public Domain Dedication"으로 적혀 있다. 만든이: Quaternius (https://quaternius.com).

| 파일 | 팩 | 가져온 방법 |
| --- | --- | --- |
| `Cow.glb`, `Horse.glb` | Ultimate Animated Animals (2021-07) | glTF에서 쓰는 동작만 남김(`trim.mjs`) |
| `Casual*.glb`, `OldClassy_Female.glb`, `Worker_*.glb` | Ultimate Animated Character Pack (2019-11) | glTF에서 쓰는 동작만 남김(`trim.mjs`) |
| `Sheep.glb`, `Pig.glb` | Farm Animals Pack (2018) | FBX → GLB |
| `Dino_*.glb` | Dinosaur Animated Pack (2018-12) | FBX → GLB |
| `CommonTree_*`, `PineTree_*`, `BirchTree_1`, `Willow_1`, `Bush_1`, `BushBerries_1`, `Rock_*`, `TreeStump_Moss`, `WoodLog_Moss`, `Flowers`, `Plant_1`, `Lilypad` | Ultimate Nature Pack (2019-06) | FBX → GLB |
| `Koi.glb`, `Dock_Long.glb`, `Dock_Wide.glb`, `Boat_Small.glb` | Cute Fish Pack (2020-02) | FBX → GLB |
| `Ship_*.glb` | Ships (2018) | FBX → GLB |

FBX → GLB는 three.js(0.160)의 FBXLoader로 읽어 GLTFExporter로 내보냈다. 색과 삼각형 수는 `build.mjs`의 옵션(pal · lift · simplify)으로 맞춘다.
