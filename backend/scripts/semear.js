// Popula o banco com contas e dados de demonstração usando a PRÓPRIA API (assim as regras são as mesmas do sistema).
// Uso:  npm run seed      (precisa do MySQL ligado e do .env preenchido)
// Pode rodar várias vezes: o que já existe é ignorado.
import { fileURLToPath } from 'node:url';

export const SENHA_DEMO = 'Troca@123';

// Gera um CNPJ válido a partir de 12 dígitos-base (só para os dados de exemplo)
export function cnpjValido(base12) {
    const dig = (b) => {
        const pesos = b.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const r = b.split('').reduce((s, n, i) => s + Number(n) * pesos[i], 0) % 11;
        return r < 2 ? 0 : 11 - r;
    };
    const d1 = dig(base12);
    return `${base12}${d1}${dig(base12 + d1)}`;
}
const somaDias = (n) => { const d = new Date(); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

// O administrador não tem autocadastro (de propósito): é criado direto no banco.
export async function garantirAdmin(conexao, bcrypt) {
    const [existe] = await conexao.query('SELECT PK_CodFunc FROM tb_Administrador WHERE Email = ?', ['admin@trocaticket.dev']);
    if (existe.length) return;
    await conexao.query('INSERT INTO tb_Administrador (Email, Senha, Genero, Nome) VALUES (?, ?, ?, ?)',
        ['admin@trocaticket.dev', await bcrypt.hash(SENHA_DEMO, 10), null, 'Admin']);
}

export async function semear(base, log = () => {}) {
    const chamar = async (metodo, caminho, corpo, token) => {
        const r = await fetch(`${base}${caminho}`, {
            method: metodo,
            headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: corpo ? JSON.stringify(corpo) : undefined,
        });
        return { status: r.status, dados: await r.json().catch(() => ({})) };
    };
    const login = async (email) => (await chamar('POST', '/api/auth/login-equipe', { email, senha: SENHA_DEMO })).dados.token;

    // contas de parceiros
    const parceiros = [
        { role: 'organizador', nome: 'Organizador', email: 'organizador@trocaticket.dev', cnpj: cnpjValido('112223330001'), aprovar: true },
        { role: 'fornecedor', nome: 'Fornecedor', email: 'fornecedor@trocaticket.dev', cnpj: cnpjValido('114447770001'), atuacao: ['Iluminação', 'Som'], aprovar: true },
        { role: 'fornecedor', nome: 'Rede Palco Seguro', email: 'contato@palcoseguro.com', cnpj: cnpjValido('123456780001'), atuacao: ['Segurança', 'Estrutura', 'Iluminação'], aprovar: true },
        { role: 'organizador', nome: 'Noite Viva Eventos', email: 'contato@noiteviva.com', cnpj: cnpjValido('987654320001'), aprovar: false },
        { role: 'fornecedor', nome: 'Luz & Som Produções', email: 'contato@luzesom.com', cnpj: cnpjValido('456789120001'), atuacao: ['Iluminação', 'Som'], aprovar: false },
    ];
    const tokenAdmin = await login('admin@trocaticket.dev');
    if (!tokenAdmin) throw new Error('Administrador não encontrado. Rode garantirAdmin antes.');
    for (const p of parceiros) {
        const r = await chamar('POST', '/api/auth/cadastro-parceiro', { ...p, senha: SENHA_DEMO });
        if (r.status === 201 && p.aprovar) {
            await chamar('PATCH', `/api/admin/cadastros/${r.dados.usuario.idConta}`, { status: 'Aprovado', justificativa: 'Cadastro de demonstração' }, tokenAdmin);
            log(`  parceiro aprovado: ${p.email}`);
        } else if (r.status === 201) log(`  parceiro pendente: ${p.email}`);
    }
    await chamar('POST', '/api/auth/cadastro', { nome: 'Cliente Demo', cpf: '52998224725', telefone: '11999990000', email: 'cliente@trocaticket.dev', senha: SENHA_DEMO });

    // eventos de exemplo (só se o organizador ainda não tem nenhum)
    const tokenOrg = await login('organizador@trocaticket.dev');
    const { eventos } = (await chamar('GET', '/api/eventos', null, tokenOrg)).dados;
    if (eventos?.length) { log('  eventos de exemplo já existem'); return; }

    const ev = await chamar('POST', '/api/eventos', { nome: 'Festival Indie Universitário', descricao: 'Festival com bandas independentes e feira de criadores.', inicio: somaDias(30), fim: somaDias(31), local: 'Pátio da FECAP — São Paulo/SP', publicoMin: 300, publicoMax: 600, publicoEsperado: 450, margem: 20 }, tokenOrg);
    const id = ev.dados.id;
    const itens = {};
    for (const [categoria, descricao, quantidade] of [['Iluminação', 'Iluminação de palco e pista', 1], ['Segurança', 'Equipe de segurança (12 profissionais)', 12], ['Bebidas', 'Bar completo com 4 pontos de venda', 4], ['Estrutura', 'Palco, tendas e gradis', 1]]) {
        itens[categoria] = (await chamar('POST', `/api/eventos/${id}/itens`, { categoria, descricao, quantidade }, tokenOrg)).dados.id;
    }
    for (const c of [{ tipo: 'Fiscal', descricao: 'ECAD e impostos', valor: 4200, cobranca: 'total' }, { tipo: 'Operacional', descricao: 'Licenças, seguro e brigada', valor: 3500, cobranca: 'total' }, { tipo: 'Variável', descricao: 'Pulseira e copo personalizado', valor: 2.5, cobranca: 'pessoa' }]) {
        await chamar('POST', `/api/eventos/${id}/custos`, c, tokenOrg);
    }
    await chamar('PATCH', `/api/eventos/${id}/status`, { status: 'Aberto para cotação' }, tokenOrg);
    await chamar('POST', '/api/eventos', { nome: 'Calourada Tech', inicio: somaDias(60), fim: somaDias(60), local: 'Quadra Poliesportiva — São Paulo/SP', publicoMin: 150, publicoMax: 400, margem: 15 }, tokenOrg);

    const tokenForn = await login('fornecedor@trocaticket.dev');
    const tokenPalco = await login('contato@palcoseguro.com');
    const prop = (token, categoria, valor, descricao, dias) => chamar('POST', `/api/cotacoes/${id}/itens/${itens[categoria]}/propostas`, { valor, descricao, validade: somaDias(dias) }, token);
    await prop(tokenForn, 'Iluminação', 9800, 'Truss, moving heads, operador e montagem', 20);
    await prop(tokenPalco, 'Iluminação', 8900, 'Kit de iluminação LED com operador', 15);
    await prop(tokenPalco, 'Segurança', 12500, '12 seguranças credenciados, 8h de turno', 15);
    log('  eventos e propostas de exemplo criados');
}

// Execução direta: npm run seed
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const { default: dotenv } = await import('dotenv');
    dotenv.config();
    const { default: bcrypt } = await import('bcrypt');
    const { default: conexao } = await import('../src/config/database.js');
    const { default: app } = await import('../src/app.js');
    const servidor = app.listen(0);
    try {
        console.log('Criando dados de demonstração...');
        await garantirAdmin(conexao, bcrypt);
        await semear(`http://localhost:${servidor.address().port}`, console.log);
        console.log(`\nPronto! Todas as contas usam a senha: ${SENHA_DEMO}\n  admin@trocaticket.dev | organizador@trocaticket.dev | fornecedor@trocaticket.dev | cliente@trocaticket.dev`);
    } catch (e) { console.error('Falha ao popular:', e.message); process.exitCode = 1; }
    finally { servidor.close(); process.exit(); }
}
