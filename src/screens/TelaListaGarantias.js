import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// Se testar no celular via Expo Go, troque 'localhost' pelo IP do seu PC (ex: http://192.168.2.251:8082)
const API_URL = 'http://localhost:8082';

const STATUS_INFO = {
  amarelo: {
    label: 'Em Tratamento',
    corFundo: '#fef3c7',
    corTexto: '#b45309',
    corBorda: '#f59e0b'
  },
  verde: {
    label: 'Concluída',
    corFundo: '#dcfce7',
    corTexto: '#15803d',
    corBorda: '#22c55e'
  },
  vermelho: {
    label: 'Garantia Negada',
    corFundo: '#fee2e2',
    corTexto: '#b91c1c',
    corBorda: '#ef4444'
  }
};

export function TelaListaGarantias() {
  const [garantias, setGarantias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos'); // todos | amarelo | verde | vermelho
  const [observacoesEditadas, setObservacoesEditadas] = useState({});
  const [salvandoId, setSalvandoId] = useState(null);
  const [fotoAmpliada, setFotoAmpliada] = useState(null);

  const carregarGarantias = async () => {
    setCarregando(true);
    try {
      const resp = await fetch(`${API_URL}/garantias`);
      const dados = await resp.json();
      if (resp.ok && Array.isArray(dados)) {
        setGarantias(dados);
        const obsIniciais = {};
        dados.forEach((g) => {
          obsIniciais[g.id] = g.observacao || '';
        });
        setObservacoesEditadas(obsIniciais);
      }
    } catch (e) {
      console.log('Erro ao carregar tratativas:', e);
    } finally {
      setCarregando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarGarantias();
    }, [])
  );

  const atualizarStatus = async (id, novoStatus) => {
    setSalvandoId(id);
    try {
      const observacao = observacoesEditadas[id] || '';
      const resp = await fetch(`${API_URL}/garantias/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_cor: novoStatus, observacao })
      });

      if (resp.ok) {
        setGarantias((lista) =>
          lista.map((item) =>
            item.id === id
              ? { ...item, status_cor: novoStatus, observacao }
              : item
          )
        );
      }
    } catch (e) {
      console.log('Erro ao atualizar status:', e);
    } finally {
      setSalvandoId(null);
    }
  };

  const totais = {
    todos: garantias.length,
    amarelo: garantias.filter((g) => (g.status_cor || 'amarelo') === 'amarelo').length,
    verde: garantias.filter((g) => g.status_cor === 'verde').length,
    vermelho: garantias.filter((g) => g.status_cor === 'vermelho').length
  };

  const filtradas = garantias.filter((item) => {
    const statusAtual = item.status_cor || 'amarelo';
    if (filtroStatus !== 'todos' && statusAtual !== filtroStatus) {
      return false;
    }

    const termo = busca.trim().toLowerCase();
    if (!termo) return true;

    const idUnico = `#${String(item.id).padStart(4, '0')}`;
    return (
      idUnico.includes(termo) ||
      String(item.id) === termo ||
      (item.fornecedor || '').toLowerCase().includes(termo) ||
      (item.codigo_peca || '').toLowerCase().includes(termo) ||
      (item.nome_peca || '').toLowerCase().includes(termo) ||
      (item.numero_serie || '').toLowerCase().includes(termo) ||
      (item.nf_compra || '').toLowerCase().includes(termo) ||
      (item.nf_venda || '').toLowerCase().includes(termo) ||
      (item.id_solicitacao || '').toLowerCase().includes(termo)
    );
  });

  return (
    <View style={styles.container}>
      {/* Resumo / Filtros do Relatório */}
      <View style={styles.filtrosRow}>
        {[
          { chave: 'todos', titulo: `Todas (${totais.todos})` },
          { chave: 'amarelo', titulo: `Em Tratamento (${totais.amarelo})` },
          { chave: 'verde', titulo: `Concluídas (${totais.verde})` },
          { chave: 'vermelho', titulo: `Negadas (${totais.vermelho})` }
        ].map((aba) => {
          const ativo = filtroStatus === aba.chave;
          return (
            <TouchableOpacity
              key={aba.chave}
              style={[styles.filtroChip, ativo && styles.filtroChipAtivo]}
              onPress={() => setFiltroStatus(aba.chave)}
            >
              <Text style={[styles.filtroTexto, ativo && styles.filtroTextoAtivo]}>
                {aba.titulo}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TextInput
        placeholder="Buscar por ID (#0001), fornecedor, código, série ou NF..."
        value={busca}
        onChangeText={setBusca}
        style={styles.inputBusca}
      />

      {carregando ? (
        <ActivityIndicator size="large" color="#1d4ed8" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={filtradas}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 30 }}
          ListEmptyComponent={
            <Text style={styles.vazio}>Nenhuma tratativa encontrada neste filtro.</Text>
          }
          renderItem={({ item }) => {
            const statusAtual = item.status_cor || 'amarelo';
            const info = STATUS_INFO[statusAtual] || STATUS_INFO.amarelo;
            const idUnico = `#${String(item.id).padStart(4, '0')}`;

            return (
              <View style={[styles.card, { borderLeftColor: info.corBorda }]}>
                {/* Cabeçalho com ID Único e Status */}
                <View style={styles.cardTopo}>
                  <View style={styles.idRow}>
                    <View style={styles.badgeId}>
                      <Text style={styles.textoBadgeId}>ID {idUnico}</Text>
                    </View>
                    <Text style={styles.fornecedor}>{item.fornecedor}</Text>
                  </View>

                  <View style={[styles.badgeStatus, { backgroundColor: info.corFundo }]}>
                    <Text style={[styles.textoStatus, { color: info.corTexto }]}>
                      {info.label}
                    </Text>
                  </View>
                </View>

                {/* Detalhes da Peça e Notas */}
                <Text style={styles.linhaInfo}>
                  <Text style={styles.negrito}>Peça:</Text> {item.codigo_peca}
                  {item.nome_peca ? ` — ${item.nome_peca}` : ''}
                  {item.categoria ? ` (${item.categoria})` : ''}
                </Text>

                {item.numero_serie ? (
                  <Text style={styles.linhaInfo}>
                    <Text style={styles.negrito}>Nº Série:</Text> {item.numero_serie}
                  </Text>
                ) : null}

                {item.data_fabricacao ? (
                  <Text style={styles.linhaInfo}>
                    <Text style={styles.negrito}>Fabricação:</Text> {item.data_fabricacao}
                  </Text>
                ) : null}

                {(item.nf_compra || item.nf_venda) ? (
                  <Text style={styles.linhaInfo}>
                    <Text style={styles.negrito}>Notas Fiscais:</Text>{' '}
                    Compra: {item.nf_compra || '-'} | Venda: {item.nf_venda || '-'}
                  </Text>
                ) : null}

                {item.id_solicitacao ? (
                  <Text style={styles.linhaInfo}>
                    <Text style={styles.negrito}>Protocolo Site Fornecedor:</Text>{' '}
                    {item.id_solicitacao}
                  </Text>
                ) : null}

                <Text style={styles.dataRegistro}>
                  Registrado em: {item.data_registro || '-'}
                </Text>

                {/* Fotos anexadas no cadastro */}
                {item.fotos && item.fotos.length > 0 && (
                  <View style={styles.secaoFotos}>
                    <Text style={styles.labelFotos}>
                      Fotos anexadas ({item.fotos.length}) — toque para ampliar:
                    </Text>
                    <View style={styles.rowFotos}>
                      {item.fotos.map((uri, idx) => (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => setFotoAmpliada(uri)}
                        >
                          <Image source={{ uri }} style={styles.miniatura} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Observação e atualização de status */}
                <View style={styles.secaoAtualizacao}>
                  <TextInput
                    style={styles.inputObs}
                    placeholder="Observação do retorno (ex: aprovado crédito, negado por mau uso...)"
                    value={observacoesEditadas[item.id] ?? ''}
                    onChangeText={(texto) =>
                      setObservacoesEditadas((prev) => ({ ...prev, [item.id]: texto }))
                    }
                  />

                  <View style={styles.botoesStatusRow}>
                    <TouchableOpacity
                      style={[
                        styles.btnStatus,
                        styles.btnAmarelo,
                        statusAtual === 'amarelo' && styles.btnAtivo
                      ]}
                      disabled={salvandoId === item.id}
                      onPress={() => atualizarStatus(item.id, 'amarelo')}
                    >
                      <Text style={styles.textoBtnAmarelo}>Em Tratamento</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.btnStatus,
                        styles.btnVerde,
                        statusAtual === 'verde' && styles.btnAtivo
                      ]}
                      disabled={salvandoId === item.id}
                      onPress={() => atualizarStatus(item.id, 'verde')}
                    >
                      <Text style={styles.textoBtnVerde}>Concluída</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.btnStatus,
                        styles.btnVermelho,
                        statusAtual === 'vermelho' && styles.btnAtivo
                      ]}
                      disabled={salvandoId === item.id}
                      onPress={() => atualizarStatus(item.id, 'vermelho')}
                    >
                      <Text style={styles.textoBtnVermelho}>Garantia Negada</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Modal para ampliar foto da peça */}
      <Modal
        visible={!!fotoAmpliada}
        transparent
        animationType="fade"
        onRequestClose={() => setFotoAmpliada(null)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalConteudo}>
            {fotoAmpliada && (
              <Image
                source={{ uri: fotoAmpliada }}
                style={styles.imagemGrande}
                resizeMode="contain"
              />
            )}
            <TouchableOpacity
              style={styles.btnFecharModal}
              onPress={() => setFotoAmpliada(null)}
            >
              <Text style={styles.textoFecharModal}>Fechar Foto</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f1f5f9' },
  filtrosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12
  },
  filtroChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#e2e8f0'
  },
  filtroChipAtivo: { backgroundColor: '#1d4ed8' },
  filtroTexto: { fontSize: 13, fontWeight: '600', color: '#334155' },
  filtroTextoAtivo: { color: '#ffffff' },
  inputBusca: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 14
  },
  vazio: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: 40,
    fontSize: 15
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 6,
    elevation: 2
  },
  cardTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8
  },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badgeId: {
    backgroundColor: '#1e293b',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6
  },
  textoBadgeId: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  fornecedor: { fontSize: 17, fontWeight: 'bold', color: '#0f172a' },
  badgeStatus: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12
  },
  textoStatus: { fontSize: 12, fontWeight: 'bold' },
  linhaInfo: { fontSize: 14, color: '#334155', marginBottom: 4 },
  negrito: { fontWeight: 'bold', color: '#0f172a' },
  dataRegistro: { fontSize: 12, color: '#64748b', marginTop: 4 },
  secaoFotos: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0'
  },
  labelFotos: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 6 },
  rowFotos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  miniatura: {
    width: 64,
    height: 64,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  secaoAtualizacao: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0'
  },
  inputObs: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    marginBottom: 10
  },
  botoesStatusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  btnStatus: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1
  },
  btnAtivo: { borderWidth: 2 },
  btnAmarelo: { backgroundColor: '#fef3c7', borderColor: '#f59e0b' },
  btnVerde: { backgroundColor: '#dcfce7', borderColor: '#22c55e' },
  btnVermelho: { backgroundColor: '#fee2e2', borderColor: '#ef4444' },
  textoBtnAmarelo: { color: '#b45309', fontWeight: 'bold', fontSize: 12 },
  textoBtnVerde: { color: '#15803d', fontWeight: 'bold', fontSize: 12 },
  textoBtnVermelho: { color: '#b91c1c', fontWeight: 'bold', fontSize: 12 },
  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalConteudo: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center'
  },
  imagemGrande: { width: '100%', height: 380, borderRadius: 8 },
  btnFecharModal: {
    marginTop: 14,
    backgroundColor: '#1d4ed8',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  textoFecharModal: { color: '#fff', fontWeight: 'bold' }
});