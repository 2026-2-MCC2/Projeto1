// Reproduz a collection do Postman (docs/TrocaTicket.postman_collection.json) contra a API em memória.
// Garante que a collection exportada continua funcionando na ordem em que ela é executada.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

process.env.JWT_SECRET = 'segredo-de-teste';
const { criarPoolSqlite } = await import('./bancoSqlite.mjs');
const { usarPool, default: conexao } = await import('../src/config/database.js');
const { default: bcrypt } = await import('bcrypt');
const { default: app } = await import('../src/app.js');
const { garantirAdmin, semear } = await import('../scripts/semear.js');

usarPool(criarPoolSqlite());
const colecao = JSON.parse(fs.readFileSync(new URL('../../docs/TrocaTicket.postman_collection.json', import.meta.url), 'utf8'));

test('collection do Postman executa de ponta a ponta', async () => {
    const servidor = app.listen(0);
    const base = `http://localhost:${servidor.address().port}`;
    try {
        await garantirAdmin(conexao, bcrypt);
        await semear(base);
        const vars = Object.fromEntries(colecao.variable.map((v) => [v.key, v.value]));
        vars.baseUrl = base;
        const subst = (t) => String(t).replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);
        const falhas = [];
        let total = 0;
        for (const pasta of colecao.item) {
            for (const r of pasta.item) {
                const caminho = r.request.url.raw.replace('{{baseUrl}}', '');
                const headers = Object.fromEntries(r.request.header.map((h) => [h.key, subst(h.value)]));
                const resposta = await fetch(subst(base + caminho), { method: r.request.method, headers, body: r.request.body ? subst(r.request.body.raw) : undefined });
                const texto = await resposta.text();
                const json = () => JSON.parse(texto);
                const pm = {
                    collectionVariables: { set: (k, v) => { vars[k] = v; } },
                    response: { json, to: { have: { status: (n) => assert.equal(resposta.status, n) } } },
                    test: (nome, fn) => { total++; try { fn(); } catch (e) { falhas.push(`${pasta.name} > ${r.name} > ${nome}: ${e.message}`); } },
                    expect: (valor) => ({ to: { be: { get undefined() { assert.equal(valor, undefined); } }, eql: (esperado) => assert.deepEqual(valor, esperado) } }),
                };
                new Function('pm', r.event[0].script.exec.join('\n'))(pm);
            }
        }
        assert.deepEqual(falhas, [], `\n${falhas.join('\n')}`);
        assert.ok(total >= 40, `poucas verificações executadas: ${total}`);
    } finally { servidor.close(); }
});
