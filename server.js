const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite com sucesso!');
    }
});

db.serialize(() => {
    const SENHAS_ADMIN = {
        'Paulo': '1234',
        'Ocione': '1234',
        'Wallace': '1234'
    };

    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            nivel_acesso TEXT DEFAULT 'operador'
        )
    `);

    db.run(`ALTER TABLE usuarios ADD COLUMN senha TEXT NOT NULL DEFAULT '1234'`, () => {
        Object.entries(SENHAS_ADMIN).forEach(([nome, senha]) => {
            db.run(
                `INSERT OR IGNORE INTO usuarios (nome, senha, nivel_acesso) VALUES (?, ?, 'operador')`,
                [nome, senha]
            );
            db.run(
                `UPDATE usuarios SET senha = ? WHERE nome = ?`,
                [senha, nome]
            );
        });
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS garantias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fornecedor TEXT NOT NULL,
            categoria TEXT,
            codigo_peca TEXT NOT NULL,
            nome_peca TEXT,
            data_fabricacao TEXT,
            numero_serie TEXT,
            nf_compra TEXT,
            nf_venda TEXT,
            id_solicitacao TEXT,
            status_cor TEXT DEFAULT 'amarelo',
            observacao TEXT,
            data_registro DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Garante a coluna observacao caso o banco já exista
    db.run(`ALTER TABLE garantias ADD COLUMN observacao TEXT`, () => {});

    db.run(`
        CREATE TABLE IF NOT EXISTS imagens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            garantia_id INTEGER NOT NULL,
            caminho_arquivo TEXT NOT NULL,
            FOREIGN KEY (garantia_id) REFERENCES garantias (id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS anotacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conteudo TEXT NOT NULL,
            tipo TEXT NOT NULL,
            usuario_id INTEGER,
            data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error('Erro ao criar tabelas:', err.message);
        else console.log('Todas as tabelas foram criadas com sucesso!');
    });
});

app.get('/', (req, res) => {
    res.send('API de Gestão de Garantias online!');
});

app.post('/login', (req, res) => {
    const { nome, senha } = req.body;

    if (!nome || !senha) {
        return res.status(400).json({ erro: 'Informe o usuário e a senha.' });
    }

    db.get(
        `SELECT id, nome, nivel_acesso FROM usuarios WHERE nome = ? AND senha = ?`,
        [nome, senha],
        (err, usuario) => {
            if (err) return res.status(500).json({ erro: err.message });
            if (!usuario) return res.status(401).json({ erro: 'Senha incorreta. Solicite ao administrador.' });
            return res.json({ mensagem: 'Login realizado!', usuario });
        }
    );
});

// Listar todas as garantias com suas fotos vinculadas
app.get('/garantias', (req, res) => {
    db.all('SELECT * FROM garantias ORDER BY id DESC', [], (err, garantias) => {
        if (err) return res.status(500).json({ erro: err.message });

        db.all('SELECT garantia_id, caminho_arquivo FROM imagens', [], (errImg, imagens) => {
            if (errImg) return res.status(500).json({ erro: errImg.message });

            const fotosPorGarantia = {};
            imagens.forEach((img) => {
                if (!fotosPorGarantia[img.garantia_id]) {
                    fotosPorGarantia[img.garantia_id] = [];
                }
                fotosPorGarantia[img.garantia_id].push(img.caminho_arquivo);
            });

            const resultado = garantias.map((g) => ({
                ...g,
                fotos: fotosPorGarantia[g.id] || []
            }));

            res.json(resultado);
        });
    });
});

// Registrar nova garantia
app.post('/garantias', (req, res) => {
    const {
        fornecedor,
        categoria,
        codigo_peca,
        nome_peca,
        data_fabricacao,
        numero_serie,
        nf_compra,
        nf_venda,
        id_solicitacao,
        fotos
    } = req.body;

    if (!fornecedor || !codigo_peca) {
        return res.status(400).json({ erro: 'Fornecedor e Código da Peça são obrigatórios.' });
    }

    const forn = fornecedor.toLowerCase();
    const cat = (categoria || '').toLowerCase();

    const exigeSerieENF =
        cat.includes('compressor') ||
        cat.includes('controladora') ||
        cat.includes('unidade condensadora') ||
        forn.includes('danfoss');

    if (exigeSerieENF) {
        if (!numero_serie || !numero_serie.trim()) {
            return res.status(400).json({ erro: 'Número de série é obrigatório para esta peça/fornecedor.' });
        }
        if ((!nf_compra || !nf_compra.trim()) && (!nf_venda || !nf_venda.trim())) {
            return res.status(400).json({ erro: 'Nota fiscal (compra ou venda) é obrigatória para esta peça/fornecedor.' });
        }
    }

    if (forn.includes('cp') || forn.includes('emicol')) {
        if (!data_fabricacao || !data_fabricacao.trim()) {
            return res.status(400).json({ erro: 'Data de fabricação é obrigatória para CP e Emicol.' });
        }
    }

    if (forn.includes('full gauge')) {
        if (!fotos || !Array.isArray(fotos) || fotos.length === 0) {
            return res.status(400).json({ erro: 'Foto de cada peça relacionada é obrigatória para Full Gauge.' });
        }
    }

    const sql = `
        INSERT INTO garantias (
            fornecedor, categoria, codigo_peca, nome_peca,
            data_fabricacao, numero_serie, nf_compra, nf_venda, id_solicitacao, status_cor
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'amarelo')
    `;

    db.run(
        sql,
        [fornecedor, categoria, codigo_peca, nome_peca, data_fabricacao, numero_serie, nf_compra, nf_venda, id_solicitacao],
        function (err) {
            if (err) {
                return res.status(500).json({ erro: err.message });
            }

            const garantiaId = this.lastID;

            if (Array.isArray(fotos) && fotos.length > 0) {
                const stmt = db.prepare('INSERT INTO imagens (garantia_id, caminho_arquivo) VALUES (?, ?)');
                fotos.forEach((caminho) => stmt.run(garantiaId, caminho));
                stmt.finalize();
            }

            res.status(201).json({
                mensagem: 'Garantia registrada com sucesso!',
                id: garantiaId
            });
        }
    );
});

// Atualizar status da tratativa (amarelo = Em Tratamento, verde = Concluída, vermelho = Garantia Negada)
app.put('/garantias/:id/status', (req, res) => {
    const { id } = req.params;
    const { status_cor, observacao } = req.body;

    const statusPermitidos = ['amarelo', 'verde', 'vermelho'];
    if (!statusPermitidos.includes(status_cor)) {
        return res.status(400).json({ erro: 'Status inválido.' });
    }

    db.run(
        `UPDATE garantias SET status_cor = ?, observacao = ? WHERE id = ?`,
        [status_cor, observacao || '', id],
        function (err) {
            if (err) return res.status(500).json({ erro: err.message });
            if (this.changes === 0) return res.status(404).json({ erro: 'Solicitação não encontrada.' });
            res.json({ mensagem: 'Status atualizado com sucesso!' });
        }
    );
});

const PORT = 8082;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});