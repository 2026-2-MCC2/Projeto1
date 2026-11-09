// Banco SQLite em memória que imita o pool do mysql2, usando os MESMOS scripts SQL do projeto (pasta BD).
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

const BD = new URL('../../BD/', import.meta.url);

function comandos(arquivo) {
    const texto = fs.readFileSync(new URL(arquivo, BD), 'utf8').replace(/\r/g, '').split('\n').filter((l) => !l.trim().startsWith('--')).join('\n');
    return texto.split(';').map((c) => c.trim()).filter(Boolean)
        .filter((c) => !/^(CREATE DATABASE|USE|DESCRIBE|SELECT)\b/i.test(c) && !/ADD CONSTRAINT/i.test(c)) // o SQLite não faz ALTER ... ADD CONSTRAINT
        .map((c) => c.replace(/INT AUTO_INCREMENT PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT'));
}

function executar(db, sql, params = []) {
    const valores = [];
    let i = 0;
    const sqlFinal = sql.replace(/\?/g, () => { // mysql2 expande arrays em IN (?)
        const p = params[i++];
        if (Array.isArray(p)) { valores.push(...p); return p.length ? p.map(() => '?').join(', ') : 'NULL'; }
        valores.push(p === undefined ? null : p);
        return '?';
    });
    try {
        const stmt = db.prepare(sqlFinal);
        if (/^\s*(select|with)\b/i.test(sql)) return [stmt.all(...valores), []];
        const r = stmt.run(...valores);
        return [{ insertId: Number(r.lastInsertRowid), affectedRows: Number(r.changes) }, []];
    } catch (e) {
        if (/UNIQUE constraint failed/.test(e.message)) e.code = 'ER_DUP_ENTRY';
        else if (/FOREIGN KEY constraint failed/.test(e.message)) e.code = 'ER_ROW_IS_REFERENCED_2';
        throw e;
    }
}

export function criarPoolSqlite() {
    const db = new DatabaseSync(':memory:');
    db.exec('PRAGMA foreign_keys = ON');
    for (const arquivo of ['db_TrocaTicket.sql', '02_planejamento.sql']) for (const c of comandos(arquivo)) db.exec(c);
    const q = async (sql, params) => executar(db, sql, params);
    return {
        db,
        query: q,
        execute: q,
        async getConnection() {
            return { query: q, execute: q, beginTransaction: async () => db.exec('BEGIN'), commit: async () => db.exec('COMMIT'), rollback: async () => { try { db.exec('ROLLBACK'); } catch { /* sem transação aberta */ } }, release() {} };
        },
    };
}
