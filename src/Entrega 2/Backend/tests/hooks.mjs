// Nos testes, o pacote nativo "bcrypt" é trocado por uma versão simples (scrypt do próprio Node).
export async function resolve(specifier, context, next) {
    if (specifier === 'bcrypt') return { url: new URL('./shims/bcrypt.mjs', import.meta.url).href, shortCircuit: true };
    return next(specifier, context);
}
