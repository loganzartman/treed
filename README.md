# treed

_it's a tree_

<img src="https://github.com/loganzartman/treed/assets/3401573/d78831ef-10c1-4528-b6a7-ce7b88144794" style="width: 400px" />

The tree is procedurally generated using an algorithm that I made up. Basically, branches grow from the root and occasionally split off. Once they get small enough, the grow leaves.

Tree segments and leaves are rendered as instanced geometry. The lighting is made up of a few simple light sources, plus PCSS shadows.

## running:

`python -m http.server 8080`
