// CC0 모형(Kenney · Quaternius)을 게임에 맞게 줄여 한 파일로 묶는다.
//   npm install && npm run build
// 하는 일: 쓰지 않는 동작 지우기 · 텍스처와 재질 색을 꼭짓점 색으로 굽기(텍스처 없음, 재질 하나) ·
//          조각 합치기 · 양자화 · meshopt 압축 풀기(게임에서 디코더 없이 읽도록) · base64로 pack_models.js에 쓰기
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, join, flatten, resample, weld, quantize } from '@gltf-transform/functions';
import { MeshoptDecoder } from 'meshoptimizer';
import { PNG } from 'pngjs';
import { createRequire } from 'node:module';
import { dirname, join as pjoin } from 'node:path';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const SRC = pjoin(dirname(require.resolve('@netforge/asset-library-files/package.json')), 'library', 'lowpoly');
const OUT = pjoin(dirname(fileURLToPath(import.meta.url)), '..', '..', 'app', 'src', 'main', 'assets', 'pack_models.js');
const HERE = dirname(fileURLToPath(import.meta.url));
const ANIMAL = ['Idle', 'Walk', 'Gallop', 'Eating'], PERSON = ['idle', 'walk', 'emote-yes'], OLD = ['Armature|Idle', 'Armature|Jump'];
const MODELS = {   // 게임에서 쓰는 이름: [원본, 남길 동작]. 'src/'로 시작하면 이 폴더의 파일, 아니면 npm 꾸러미의 모형
  tree_oak: ['tree_oak'], tree_fat: ['tree_fat'], tree_autumn: ['tree_autumn'], tree_pine: ['tree_pine'], tree_pine_tall: ['tree_pine_tall'], tree_dark: ['tree_dark'],
  bush: ['bush'], bush_large: ['bush_large'], rock_small: ['rock_small'], rock_large: ['rock_large'], rock_tall: ['rock_tall'], stump: ['stump'], log: ['log'],
  flower_red: ['flower_red'], mushroom_red: ['mushroom_red'], tractor: ['tractor'],
  cow: ['src/Cow.gltf', ANIMAL], horse: ['src/Horse.gltf', ANIMAL], sheep: ['src/Sheep.glb', OLD], pig: ['src/Pig.glb', OLD],
  stag: ['stag', ANIMAL], deer: ['deer', ANIMAL], fox: ['fox', ANIMAL], wolf: ['wolf', ANIMAL],
  person_a: ['mini_male_a', PERSON], person_b: ['mini_female_a', PERSON], person_c: ['mini_male_b', PERSON], person_d: ['mini_female_b', PERSON], person_e: ['mini_female_c', PERSON]
};
// Kenney 자연물은 원래 색이 밝은 민트빛이라 게임의 색으로 바꿔 칠한다(재질 이름 기준, 모형별로 덮어쓸 수 있다)
const PAL = { leafsGreen: '#4f9d5d', leafsDark: '#2f7a45', leafsFall: '#d98a3a', woodBark: '#8a5a3a', woodBarkDark: '#6b4a2e', woodBirch: '#e8e0d0', woodInner: '#d9b98a', grass: '#5fae6a', dirt: '#8f949c', colorRed: '#d94f3a', _defaultMat: '#f3e6cf' };
const PAL_BY = { pig: { 'Material.003': '#f2a6b4', Material: '#8a4a52' }, tree_fat: { leafsGreen: '#3f8a4f' }, bush: { grass: '#7fb24a' }, bush_large: { grass: '#6fa844' }, rock_small: { grass: '#a7acb3' }, rock_large: { grass: '#a7acb3' }, rock_tall: { grass: '#a7acb3', _defaultMat: '#7b8088' } };
const lin = v => { v /= 255; return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
const hex = h => [1, 3, 5].map(i => lin(parseInt(h.slice(i, i + 2), 16)));

await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const out = {}; let total = 0;
for (const [id, [src, keep]] of Object.entries(MODELS)) {
  const seenS = new Set(), doc = await io.read(src.startsWith('src/') ? pjoin(HERE, src) : pjoin(SRC, src + '.glb')), root = doc.getRoot(), seen = {};
  for (const a of root.listAnimations()) { const n = a.getName(); if (!keep || !keep.includes(n) || seen[n]) { for (const c of a.listChannels()) c.dispose(); for (const q of a.listSamplers()) q.dispose(); a.dispose(); } else seen[n] = 1; }
  for (const a of root.listAnimations()) {   // 동작 줄이기: 크기 변화 트랙은 버리고, 키프레임은 초당 12개쯤만 남긴다
    for (const ch of a.listChannels()) { if (ch.getTargetPath() === 'scale') { const s0 = ch.getSampler(); ch.dispose(); if (s0) s0.dispose(); continue; } const sm = ch.getSampler(); if (!sm || sm.getInterpolation() === 'CUBICSPLINE' || seenS.has(sm)) continue; seenS.add(sm);
      const ti = sm.getInput(), to = sm.getOutput(), t = ti.getArray(), o = to.getArray(), n = ti.getCount(), w = to.getElementSize(), keepI = []; let last = -1;
      for (let i = 0; i < n; i++) if (i === 0 || i === n - 1 || t[i] - last >= 1 / 12 - 1e-4) { keepI.push(i); last = t[i]; }
      if (keepI.length === n) continue; const t2 = new Float32Array(keepI.length), o2 = new Float32Array(keepI.length * w); keepI.forEach((k, j) => { t2[j] = t[k]; for (let c = 0; c < w; c++) o2[j * w + c] = o[k * w + c]; });
      sm.setInput(doc.createAccessor().setType('SCALAR').setArray(t2).setBuffer(ti.getBuffer())).setOutput(doc.createAccessor().setType(to.getType()).setArray(o2).setBuffer(to.getBuffer())); } }
  const one = doc.createMaterial('v').setRoughnessFactor(1).setMetallicFactor(0), pngs = new Map(), buf = root.listBuffers()[0];
  for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) {
    const mat = prim.getMaterial(), pc = mat && ((PAL_BY[id] || {})[mat.getName()] || (!keep && PAL[mat.getName()])), f = pc ? hex(pc) : mat ? mat.getBaseColorFactor() : [1, 1, 1, 1], tex = mat && mat.getBaseColorTexture(), uv = prim.getAttribute('TEXCOORD_0'), old = prim.getAttribute('COLOR_0'), n = prim.getAttribute('POSITION').getCount(), col = new Uint16Array(n * 3);
    let img = null, off = [0, 0], sc = [1, 1];
    if (tex && uv) { img = pngs.get(tex) || PNG.sync.read(Buffer.from(tex.getImage())); pngs.set(tex, img); const tt = mat.getBaseColorTextureInfo().getExtension('KHR_texture_transform'); if (tt) { off = tt.getOffset(); sc = tt.getScale(); } }
    for (let i = 0; i < n; i++) { let c = [f[0], f[1], f[2]];
      if (img) { const q = uv.getElement(i, []), u = q[0] * sc[0] + off[0], v = q[1] * sc[1] + off[1], x = Math.min(img.width - 1, Math.max(0, Math.floor((u - Math.floor(u)) * img.width))), y = Math.min(img.height - 1, Math.max(0, Math.floor((v - Math.floor(v)) * img.height))), p = (y * img.width + x) * 4; c = [c[0] * lin(img.data[p]), c[1] * lin(img.data[p + 1]), c[2] * lin(img.data[p + 2])]; }
      if (old) { const q = old.getElement(i, []); c = [c[0] * q[0], c[1] * q[1], c[2] * q[2]]; }
      for (let k = 0; k < 3; k++) col[i * 3 + k] = Math.round(Math.min(1, Math.max(0, c[k])) * 65535); }
    prim.setAttribute('COLOR_0', doc.createAccessor().setType('VEC3').setArray(col).setNormalized(true).setBuffer(buf)).setAttribute('TEXCOORD_0', null).setMaterial(one);
  }
  for (const mesh of root.listMeshes()) {   // 한 모형의 조각을 하나로 합친다(그리는 횟수 줄이기)
    const ps = mesh.listPrimitives(), sem = ps[0].listSemantics(); if (ps.length < 2 || !ps.every(p => p.getIndices() && p.getMode() === ps[0].getMode() && p.listSemantics().join() === sem.join() && sem.every(k => p.getAttribute(k).getArray().constructor === ps[0].getAttribute(k).getArray().constructor))) continue;
    const tot = ps.reduce((n, p) => n + p.getAttribute('POSITION').getCount(), 0), np = doc.createPrimitive().setMaterial(one), idx = []; let base = 0;
    for (const k of sem) { const a0 = ps[0].getAttribute(k), arr = new (a0.getArray().constructor)(tot * a0.getElementSize()); let o = 0; for (const p of ps) { const a = p.getAttribute(k).getArray(); arr.set(a, o); o += a.length; } np.setAttribute(k, doc.createAccessor().setType(a0.getType()).setArray(arr).setNormalized(a0.getNormalized()).setBuffer(buf)); }
    for (const p of ps) { for (const v of p.getIndices().getArray()) idx.push(v + base); base += p.getAttribute('POSITION').getCount(); }
    np.setIndices(doc.createAccessor().setType('SCALAR').setArray(tot > 65535 ? new Uint32Array(idx) : new Uint16Array(idx)).setBuffer(buf)); for (const p of ps) { mesh.removePrimitive(p); p.dispose(); } mesh.addPrimitive(np);
  }
  for (const e of root.listExtensionsUsed()) if (['EXT_meshopt_compression', 'KHR_materials_unlit', 'KHR_texture_transform'].includes(e.extensionName)) e.dispose();
  await doc.transform(dedup(), ...(keep ? [resample()] : [flatten()]), join(), weld(), prune(), quantize({ quantizePosition: 14, quantizeNormal: 8, quantizeColor: 8, quantizeWeight: 8 }));
  const glb = await io.writeBinary(doc); out[id] = Buffer.from(glb).toString('base64'); total += glb.byteLength;
  console.log(id.padEnd(16), String(glb.byteLength).padStart(8), 'bytes', root.listAnimations().map(a => a.getName()).join(' '));
}
writeFileSync(OUT, '/* CC0 1.0 모형 묶음. Kenney (kenney.nl): Nature Kit · Car Kit · Mini Characters / Quaternius (quaternius.com): 동물(Ultimate Animated Animals · Farm Animals).\n   tools/models/build.mjs로 만든다. 직접 고치지 않는다. */\nwindow.PACK_GLB = ' + JSON.stringify(out) + ';\n');
console.log('total', total, 'bytes ->', OUT);
