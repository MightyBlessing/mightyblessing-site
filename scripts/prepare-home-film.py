"""Build only local review derivatives; never mutate input or publish footage."""
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'artifacts-local/site-film'
TIMELINE = json.loads((ROOT / 'lib/home-film.json').read_text())
SOURCES = json.loads((ROOT / 'docs/redesign/assets/home-film-sources.json').read_text())['sources']


def run(args):
    subprocess.run(args, check=True)


def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


OUT.mkdir(parents=True, exist_ok=True)
original_hashes = {}
for media_id, source in SOURCES.items():
    file = (ROOT / source['path']).resolve()
    if not file.is_relative_to(ROOT / 'input') or not file.is_file():
        raise ValueError(f'Invalid input {media_id}')
    original_hashes[media_id] = digest(file)

report = {'sources': original_hashes, 'duration': TIMELINE['duration'], 'outputs': {}}
for variant, width, height, limit in [('desktop', 1920, 1080, '3500k'), ('mobile', 720, 1280, '1800k')]:
    segments = []
    for i, cut in enumerate(TIMELINE['cuts']):
        source = SOURCES[cut['mediaId']]
        if source['projectSlug'] != cut['projectSlug']:
            raise ValueError(f'Project mismatch: {cut["id"]}')
        duration = cut['end'] - cut['start']
        file = ROOT / source['path']
        target = OUT / f'{variant}-{i}.mp4'
        x, y = [value / 100 for value in cut[f'{variant}Focal']]
        filters = f'scale={width}:{height}:force_original_aspect_ratio=increase,crop={width}:{height}:(iw-ow)*{x}:(ih-oh)*{y},setsar=1,fps={TIMELINE["fps"]},format=yuv420p'
        args = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y']
        args += ['-loop', '1', '-framerate', str(TIMELINE['fps'])] if cut['kind'] == 'photo' else ['-ss', str(cut['sourceIn'])]
        blend = cut.get('loopBlend', 0)
        if blend:
            full = duration + blend
            graph = f'[0:v]trim=duration={full},setpts=PTS-STARTPTS,{filters},split=2[main][head];[head]trim=duration={blend},setpts=PTS-STARTPTS[opening];[main][opening]xfade=transition=fade:duration={blend}:offset={duration},trim=start={blend}:duration={duration},setpts=PTS-STARTPTS[out]'
            args += ['-i', str(file), '-filter_complex', graph, '-map', '[out]']
        else:
            args += ['-i', str(file), '-t', str(duration), '-vf', filters]
        args += ['-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '22', '-maxrate', limit, '-bufsize', '7000k', '-threads', '2', '-movflags', '+faststart', str(target)]
        run(args)
        segments.append(target)
        print(f'{variant}: {cut["id"]} ({duration}s)', flush=True)
    concat = OUT / f'{variant}-concat.txt'
    concat.write_text(''.join(f"file '{p.name}'\n" for p in segments))
    target = OUT / f'{variant}.mp4'
    run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(concat), '-c', 'copy', '-an', '-movflags', '+faststart', str(target)])
    poster = OUT / f'poster-{variant}.webp'
    still = OUT / f'poster-{variant}.png'
    run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(target), '-frames:v', '1', str(still)])
    run(['node', '-e', "require('sharp')(process.argv[1]).webp({quality:85}).toFile(process.argv[2])", str(still), str(poster)])
    report['outputs'][variant] = {'file': target.name, 'bytes': target.stat().st_size, 'sha256': digest(target), 'width': width, 'height': height}
    if target.stat().st_size > (10_000_000 if variant == 'desktop' else 5_000_000):
        raise ValueError(f'{variant} exceeds size budget')
for media_id, source in SOURCES.items():
    if digest(ROOT / source['path']) != original_hashes[media_id]:
        raise ValueError(f'Source changed: {media_id}')
report['originals_unchanged'] = True
(OUT / 'integrity.json').write_text(json.dumps(report, indent=2) + '\n')
print(f'{TIMELINE["duration"]}-second review films and posters ready; originals unchanged.', flush=True)
