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
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { TEMA } from '../utils/tema';
import { CabecalhoMundial } from '../components/CabecalhoMundial';
import { BarraFornecedores } from '../components/BarraFornecedores';

// Se testar no celular via Expo Go, troque 'localhost' pelo IPv4 do seu PC
const API_URL = 'https://garantiamundial-production.up.railway.app';

const STATUS_INFO = {
  amarelo: {
    label: 'Em Tratamento',
    corFundo: '#FEF3C7',
    corTexto: '#B45309',
    corBorda: '#F59E0B',
  },
  verde: {
    label: 'Concluída',
    corFundo: '#DCFCE7',
    corTexto: '#15803D',
    corBorda: '#22C55E',
  },
  vermelho: {
    label: 'Garantia Negada',
    corFundo: '#FEE2E2',
    corTexto: '#B91C1C',
    corBorda: '#EF4444',
  },
};

export function TelaListaGarantias({ navigation, route }) {
  const usuario = route?.params?.usuario;

  const [garantias, setGarantias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
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
        body: JSON.stringify({ status_cor: novoStatus, observacao }),
      });

      if (resp.ok) {
        setGarantias((lista) =>
          lista.map((item) =>
            item.id === id ? { ...item, status_cor: novoStatus, observacao } : item
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
    vermelho: garantias.filter((g) => g.status_cor === 'vermelho').length,
  };

  const filtradas = garantias.filter((item) => {
    const statusAtual = item.status_cor || 'amarelo';
    if (filtroStatus !== 'todos' && statusAtual !== filtroStatus) return false;

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
    <View style={styles.tela}>
      <CabecalhoMundial
        titulo="Acompanhamento de Garantias"
        subtitulo="Consulte IDs únicos, fotos anexadas e atualize o status"
        usuario={usuario}
        navigation={navigation}
      />

      <View style={styles.corpo}>
        <BarraFornecedores navigation={navigation} usuario={usuario} />

        <View style={styles.areaPrincipal}>
          {/* Filtros de Status */}
          <View style={styles.filtrosRow}>
            {[
              { chave: 'todos', titulo: `Todas (${totais.todos})` },
              { chave: 'amarelo', titulo: `Em Tratamento (${totais.amarelo})` },
              { chave: 'verde', titulo: `Concluídas (${totais.verde})` },
              { chave: 'vermelho', titulo: `Negadas (${totais.vermelho})` },
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
            <ActivityIndicator
              size="large"
              color={TEMA.cores.azulMundial}
              style={{ marginTop: 30 }}
            />
          ) : (
            <FlatList
              data={filtradas}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={{ paddingBottom: 40 }}
              ListEmptyComponent={
                <Text style={styles.vazio}>Nenhuma garantia encontrada neste filtro.</Text>
              }
              renderItem={({ item }) => {
                const statusAtual = item.status_cor || 'amarelo';
                const info = STATUS_INFO[statusAtual] || STATUS_INFO.amarelo;
                const idUnico = `#${String(item.id).padStart(4, '0')}`;

                return (
                  <View style={[styles.card, { borderLeftColor: info.corBorda }]}>
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

                    {item.nf_compra || item.nf_venda ? (
                      <Text style={styles.linhaInfo}>
                        <Text style={styles.negrito}>Notas Fiscais:</Text> Compra:{' '}
                        {item.nf_compra || '-'} | Venda: {item.nf_venda || '-'}
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

                    {item.fotos && item.fotos.length > 0 && (
                      <View style={styles.secaoFotos}>
                        <Text style={styles.labelFotos}>
                          Fotos anexadas ({item.fotos.length}) — toque para ampliar:
                        </Text>
                        <View style={styles.rowFotos}>
                          {item.fotos.map((uri, idx) => (
                            <TouchableOpacity key={idx} onPress={() => setFotoAmpliada(uri)}>
                              <Image source={{ uri }} style={styles.miniatura} />
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}

                    <View style={styles.secaoAtualizacao}>
                      <TextInput
                        style={styles.inputObs}
                        placeholder="Observação do retorno (ex: crédito aprovado, negado por mau uso...)"
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
                            statusAtual === 'amarelo' && styles.btnAtivo,
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
                            statusAtual === 'verde' && styles.btnAtivo,
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
                            statusAtual === 'vermelho' && styles.btnAtivo,
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
        </View>
      </View>

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
  tela: { flex: 1, backgroundColor: TEMA.cores.fundoTela },
  corpo: { flex: 1, flexDirection: 'row' },
  areaPrincipal: { flex: 1, padding: 18 },
  filtrosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  filtroChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: TEMA.cores.cardBranco,
    borderWidth: 1,
    borderColor: TEMA.cores.azulBorda,
  },
  filtroChipAtivo: {
    backgroundColor: TEMA.cores.azulMundial,
    borderColor: TEMA.cores.azulMundial,
  },
  filtroTexto: { fontSize: 13, fontWeight: '600', color: TEMA.cores.textoSuave },
  filtroTextoAtivo: { color: TEMA.cores.branco },
  inputBusca: {
    backgroundColor: TEMA.cores.cardBranco,
    borderWidth: 1,
    borderColor: TEMA.cores.azulBorda,
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    marginBottom: 14,
  },
  vazio: { textAlign: 'center', color: TEMA.cores.textoSuave, marginTop: 40, fontSize: 15 },
  card: {
    backgroundColor: TEMA.cores.cardBranco,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderLeftWidth: 6,
    borderWidth: 1,
    borderColor: TEMA.cores.azulBorda,
    ...TEMA.sombraSuave,
  },
  cardTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badgeId: {
    backgroundColor: TEMA.cores.azulMundial,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  textoBadgeId: { color: TEMA.cores.branco, fontWeight: 'bold', fontSize: 12 },
  fornecedor: { fontSize: 17, fontWeight: 'bold', color: TEMA.cores.azulMundial },
  badgeStatus: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 20 },
  textoStatus: { fontSize: 12, fontWeight: 'bold' },
  linhaInfo: { fontSize: 14, color: TEMA.cores.textoEscuro, marginBottom: 4 },
  negrito: { fontWeight: 'bold', color: TEMA.cores.azulMundial },
  dataRegistro: { fontSize: 12, color: TEMA.cores.textoSuave, marginTop: 4 },
  secaoFotos: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  labelFotos: { fontSize: 12, fontWeight: '600', color: TEMA.cores.textoSuave, marginBottom: 6 },
  rowFotos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  miniatura: {
    width: 64,
    height: 64,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: TEMA.cores.azulBorda,
  },
  secaoAtualizacao: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  inputObs: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    marginBottom: 10,
  },
  botoesStatusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  btnStatus: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1 },
  btnAtivo: { borderWidth: 2 },
  btnAmarelo: { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' },
  btnVerde: { backgroundColor: '#DCFCE7', borderColor: '#22C55E' },
  btnVermelho: { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
  textoBtnAmarelo: { color: '#B45309', fontWeight: 'bold', fontSize: 12 },
  textoBtnVerde: { color: '#15803D', fontWeight: 'bold', fontSize: 12 },
  textoBtnVermelho: { color: '#B91C1C', fontWeight: 'bold', fontSize: 12 },
  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(9, 37, 86, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalConteudo: {
    width: '100%',
    maxWidth: 620,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },
  imagemGrande: { width: '100%', height: 380, borderRadius: 12 },
  btnFecharModal: {
    marginTop: 14,
    backgroundColor: TEMA.cores.azulMundial,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  textoFecharModal: { color: '#FFFFFF', fontWeight: 'bold' },
});