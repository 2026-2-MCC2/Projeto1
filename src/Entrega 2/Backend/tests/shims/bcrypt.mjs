import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const derivar = promisify(scrypt);
export default {
    async hash(senha) { const sal = randomBytes(8).toString('hex'); return `${sal}:${(await derivar(senha, sal, 32)).toString('hex')}`; },
    async compare(senha, guardado) { const [sal, h] = guardado.split(':'); return timingSafeEqual(Buffer.from(h, 'hex'), await derivar(senha, sal, 32)); },
};
