// InputOtp (muten Custom) - the verification code: slots, caret, checking / ok / bad, resend countdown
// (kit/values.js otpField). The page checks the code: onInput gets it when complete; answer with state + message.
export function mount(el, inputs, on) {
  let update = null;
  Promise.all([import('@muten/shadcn/registry/kit/core.js'), import('@muten/shadcn/registry/kit/values.js')]).then(([core, v]) => {
    update = v.otpField(el, inputs, core, { complete: (code) => (on.input || on.complete)?.(code), resend: () => on.resend?.() });
  });
  return (next) => update?.(next);
}
