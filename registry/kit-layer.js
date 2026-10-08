// KitLayer (muten Custom) - loads kit/core.js once; importing it installs the tooltip, the island and the sprite.
export function mount() { import('@muten/shadcn/registry/kit/core.js'); return () => {}; }
