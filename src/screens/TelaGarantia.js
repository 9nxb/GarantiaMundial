import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { TEMA } from '../utils/tema';
import { CabecalhoMundial } from '../components/CabecalhoMundial';
import { BarraFornecedores } from '../components/BarraFornecedores';

// Se testar no celular via Expo Go, troque 'localhost' pelo IPv4 do seu PC (ex: http://192.168.2.251:8082)
const API_URL = 'https://garantiamundial-production.up.railway.app';

const CATEGORIAS = [
  'Geral / Outra Peça',
  'Placa Eletrônica',
  'Compressor',
  'Controladora',
  'Unidade Condensadora',
];

export function TelaGarantia({ navigation, route }) {
  const fornecedor = route?.params?.fornecedor || 'Electrolux';
  const usuario = route?.params?.usuario;

  const [categoria, setCategoria] = useState('Geral / Outra Peça');
  const [codigoPeca, setCodigoPeca] = useState('');
  const [nomePeca, setNomePeca] = useState('');
  const [dataFabricacao, setDataFabricacao] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [notaCompra, setNotaCompra] = useState('');
  const [notaVenda, setNotaVenda] = useState('');
  const [idSolicitacao, setIdSolicitacao] = useState('');
  const [fotos, setFotos] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [feedback, setFeedback] = useState(null); // { tipo: 'erro' | 'sucesso', texto, idGerado }

  useEffect(() => {
    setFeedback(null);
  }, [fornecedor]);

  const exigeSerieENota =
    fornecedor === 'Danfoss' ||
    ['Compressor', 'Controladora', 'Unidade Condensadora'].includes(categoria);
  const exigeFabricacaoECompra = ['CP', 'Emicol'].includes(fornecedor);
  const exigeTodasNotas = fornecedor === 'Full Gauge';

  const escolherFoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setFeedback({ tipo: 'erro', texto: 'Permita o acesso à galeria para anexar fotos.' });
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
      base64: true,
    });

    if (!res.canceled && res.assets?.[0]) {
      const asset = res.assets[0];
      const uriFinal = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;
      setFotos((prev) => [...prev, uriFinal]);
    }
  };

  const tirarFoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setFeedback({ tipo: 'erro', texto: 'Permita o acesso à câmera para fotografar a peça.' });
      return;
    }

    const res = await ImagePicker.launchCameraAsync({
      quality: 0.6,
      base64: true,
    });

    if (!res.canceled && res.assets?.[0]) {
      const asset = res.assets[0];
      const uriFinal = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;
      setFotos((prev) => [...prev, uriFinal]);
    }
  };

  const salvarGarantia = async () => {
    setFeedback(null);

    if (!codigoPeca.trim()) {
      setFeedback({ tipo: 'erro', texto: 'Informe o Código da Peça antes de salvar.' });
      return;
    }

    setEnviando(true);
    try {
      const resp = await fetch(`${API_URL}/garantias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fornecedor,
          categoria,
          codigo_peca: codigoPeca.trim(),
          nome_peca: nomePeca.trim() || codigoPeca.trim(),
          data_fabricacao: dataFabricacao.trim(),
          numero_serie: numeroSerie.trim(),
          nf_compra: notaCompra.trim(),
          nf_venda: notaVenda.trim(),
          id_solicitacao: idSolicitacao.trim(),
          fotos,
        }),
      });

      const dados = await resp.json();
      if (!resp.ok) {
        setFeedback({ tipo: 'erro', texto: dados.erro || 'Erro ao salvar garantia.' });
        return;
      }

      const idFormatado = `#${String(dados.id).padStart(4, '0')}`;
      setFeedback({
        tipo: 'sucesso',
        texto: `Garantia registrada com sucesso! ID Único: ${idFormatado}`,
        idGerado: idFormatado,
      });

      // Limpa os campos para o próximo registro
      setCodigoPeca('');
      setNomePeca('');
      setDataFabricacao('');
      setNumeroSerie('');
      setNotaCompra('');
      setNotaVenda('');
      setIdSolicitacao('');
      setFotos([]);
    } catch (e) {
      setFeedback({
        tipo: 'erro',
        texto: 'Falha de conexão com o servidor (porta 8082).',
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <View style={styles.tela}>
      <CabecalhoMundial
        titulo={`Solicitar Garantia — ${fornecedor}`}
        subtitulo="Preencha os dados técnicos da peça e anexe fotos"
        usuario={usuario}
        navigation={navigation}
      />

      <View style={styles.corpo}>
        <BarraFornecedores
          navigation={navigation}
          usuario={usuario}
          fornecedorAtivo={fornecedor}
        />

        <ScrollView contentContainerStyle={styles.areaPrincipal}>
          {/* Cartão 1: Fabricante e Categoria */}
          <View style={styles.cardSecao}>
            <View style={styles.linhaTopoCard}>
              <View>
                <Text style={styles.etiquetaSecao}>FABRICANTE SELECIONADO</Text>
                <Text style={styles.nomeFabricante}>{fornecedor}</Text>
              </View>
              <View style={styles.badgeStatusInicial}>
                <Text style={styles.textoStatusInicial}>● Em Tratamento</Text>
              </View>
            </View>

            <Text style={styles.label}>Categoria da Peça</Text>
            <View style={styles.chipsRow}>
              {CATEGORIAS.map((cat) => {
                const ativo = categoria === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, ativo && styles.chipAtivo]}
                    onPress={() => setCategoria(cat)}
                  >
                    <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Cartão 2: Identificação da Peça */}
          <View style={styles.cardSecao}>
            <Text style={styles.tituloBloco}>1. Identificação da Peça</Text>

            <Text style={styles.label}>Código da Peça *</Text>
            <TextInput
              style={styles.input}
              value={codigoPeca}
              onChangeText={setCodigoPeca}
              placeholder="Ex: A0123456789"
            />

            <Text style={styles.label}>Nome / Descrição da Peça</Text>
            <TextInput
              style={styles.input}
              value={nomePeca}
              onChangeText={setNomePeca}
              placeholder="Ex: Compressor 1/4 R134a ou Placa Interface"
            />

            <Text style={styles.label}>
              Número de Série {exigeSerieENota ? '* (Obrigatório)' : '(Opcional)'}
            </Text>
            <TextInput
              style={styles.input}
              value={numeroSerie}
              onChangeText={setNumeroSerie}
              placeholder="Ex: SN-987654321"
            />

            <Text style={styles.label}>
              Data de Fabricação {exigeFabricacaoECompra ? '* (Obrigatório)' : '(Opcional)'}
            </Text>
            <TextInput
              style={styles.input}
              value={dataFabricacao}
              onChangeText={setDataFabricacao}
              placeholder="Ex: 15/08/2026 ou Lote 26W32"
            />
          </View>

          {/* Cartão 3: Notas Fiscais e Protocolo */}
          <View style={styles.cardSecao}>
            <Text style={styles.tituloBloco}>2. Notas Fiscais e Protocolo</Text>

            <Text style={styles.label}>
              Nota Fiscal de Compra {exigeFabricacaoECompra || exigeTodasNotas ? '* (Obrigatório)' : ''}
            </Text>
            <TextInput
              style={styles.input}
              value={notaCompra}
              onChangeText={setNotaCompra}
              placeholder="Ex: 55890"
              keyboardType="numeric"
            />

            <Text style={styles.label}>
              Nota Fiscal de Venda (Cliente) {exigeSerieENota || exigeTodasNotas ? '* (Obrigatório)' : ''}
            </Text>
            <TextInput
              style={styles.input}
              value={notaVenda}
              onChangeText={setNotaVenda}
              placeholder="Ex: 10452"
              keyboardType="numeric"
            />

            <Text style={styles.label}>ID da Solicitação (Site do Fabricante)</Text>
            <TextInput
              style={styles.input}
              value={idSolicitacao}
              onChangeText={setIdSolicitacao}
              placeholder="Ex: REQ-2026-8841"
            />
          </View>

          {/* Cartão 4: Fotos da Peça / Etiqueta */}
          <View style={styles.cardSecao}>
            <Text style={styles.tituloBloco}>3. Fotos da Peça e Etiquetas</Text>
            <Text style={styles.ajudaFoto}>
              Anexe fotos da etiqueta, número de série ou defeito para consulta no Windows
            </Text>

            <View style={styles.botoesFotoRow}>
              <TouchableOpacity style={styles.botaoFoto} onPress={tirarFoto}>
                <Text style={styles.textoBotaoFoto}>📷 Tirar Foto</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.botaoFoto} onPress={escolherFoto}>
                <Text style={styles.textoBotaoFoto}>🖼️ Escolher da Galeria</Text>
              </TouchableOpacity>
            </View>

            {fotos.length > 0 && (
              <View style={styles.gradeFotos}>
                {fotos.map((uri, idx) => (
                  <View key={idx} style={styles.boxMiniatura}>
                    <Image source={{ uri }} style={styles.miniatura} />
                    <TouchableOpacity
                      style={styles.btnRemoverFoto}
                      onPress={() => setFotos((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      <Text style={styles.textoRemover}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Mensagem de Feedback */}
          {feedback && (
            <View
              style={[
                styles.boxFeedback,
                feedback.tipo === 'sucesso' ? styles.feedbackSucesso : styles.feedbackErro,
              ]}
            >
              <Text
                style={[
                  styles.textoFeedback,
                  feedback.tipo === 'sucesso' ? styles.textoSucesso : styles.textoErro,
                ]}
              >
                {feedback.texto}
              </Text>

              {feedback.tipo === 'sucesso' && (
                <TouchableOpacity
                  style={styles.botaoVerLista}
                  onPress={() => navigation.navigate('GarantiasTratadas', { usuario })}
                >
                  <Text style={styles.textoBotaoVerLista}>
                    Ir para Acompanhamento de Garantias →
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Botão Principal */}
          <TouchableOpacity
            style={styles.botaoSalvar}
            onPress={salvarGarantia}
            disabled={enviando}
          >
            {enviando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.textoSalvar}>Salvar e Registrar Garantia</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: TEMA.cores.fundoTela },
  corpo: { flex: 1, flexDirection: 'row' },
  areaPrincipal: { padding: 20, paddingBottom: 50, maxWidth: 860, width: '100%' },
  cardSecao: {
    backgroundColor: TEMA.cores.cardBranco,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: TEMA.cores.azulBorda,
    ...TEMA.sombraSuave,
  },
  linhaTopoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 8,
  },
  etiquetaSecao: { fontSize: 11, fontWeight: '700', color: TEMA.cores.textoSuave },
  nomeFabricante: { fontSize: 22, fontWeight: 'bold', color: TEMA.cores.azulMundial },
  badgeStatusInicial: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  textoStatusInicial: { color: '#B45309', fontWeight: 'bold', fontSize: 12 },
  tituloBloco: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEMA.cores.azulMundial,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: TEMA.cores.textoEscuro,
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: TEMA.cores.textoEscuro,
    marginBottom: 8,
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: TEMA.cores.fundoTela,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  chipAtivo: {
    backgroundColor: TEMA.cores.azulMundial,
    borderColor: TEMA.cores.azulMundial,
  },
  chipTexto: { fontSize: 12, fontWeight: '600', color: TEMA.cores.textoSuave },
  chipTextoAtivo: { color: TEMA.cores.branco },
  ajudaFoto: { fontSize: 12, color: TEMA.cores.textoSuave, marginBottom: 12 },
  botoesFotoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  botaoFoto: {
    backgroundColor: TEMA.cores.azulClaro,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: TEMA.cores.azulBorda,
  },
  textoBotaoFoto: { color: TEMA.cores.azulMundial, fontWeight: 'bold', fontSize: 13 },
  gradeFotos: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  boxMiniatura: { position: 'relative' },
  miniatura: {
    width: 76,
    height: 76,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: TEMA.cores.azulBorda,
  },
  btnRemoverFoto: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: TEMA.cores.perigo,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoRemover: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  boxFeedback: { padding: 16, borderRadius: 14, marginBottom: 16, borderWidth: 1 },
  feedbackSucesso: { backgroundColor: '#DCFCE7', borderColor: '#22C55E' },
  feedbackErro: { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
  textoFeedback: { fontWeight: 'bold', fontSize: 14 },
  textoSucesso: { color: '#15803D' },
  textoErro: { color: '#B91C1C' },
  botaoVerLista: {
    marginTop: 10,
    backgroundColor: '#15803D',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  textoBotaoVerLista: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  botaoSalvar: {
    backgroundColor: TEMA.cores.azulMundial,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    ...TEMA.sombraSuave,
  },
  textoSalvar: { color: TEMA.cores.branco, fontSize: 16, fontWeight: 'bold' },
});