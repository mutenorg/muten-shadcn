// ShareButton (muten Custom) - a Button that opens the kit's share sheet (kit/structure.js) in the adaptive modal.
// inputs: label, variant, kind "link" | "product", name, initials, url, text, productName/Meta/Price/Image.
export function mount(el, inputs) {
  const i = { ...inputs, product: inputs.kind === 'product' ? { name: inputs.productName, meta: inputs.productMeta, price: inputs.productPrice, image: inputs.productImage } : null };
  Promise.all([import('@muten/shadcn/registry/kit/core.js'), import('@muten/shadcn/registry/kit/structure.js')]).then(([core, s]) => s.share(el, i, core));
  return () => {};
}
