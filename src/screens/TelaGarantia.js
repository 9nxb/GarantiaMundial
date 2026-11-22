import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// Se testar no celular via Expo Go, troque 'localhost' pelo IP do seu PC (ex: https://garantiamundial-production.up.railway.app)
const API_URL = 'https://garantiamundial-production.up.railway.app';

export function TelaGarantia({ route, navigation }) {
  const { fornecedor } = route.params || { fornecedor: 'Electrolux' };

  const categorias = [
    'Compressor',
    'Controladora',
    'Unidade Condensadora',
    'Placa / Outros'
  ];

  const [categoria, setCategoria] = useState('Placa / Outros');
  const [codigoPeca, setCodigoPeca] = useState('');
  const [nomePeca, setNomePeca] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [dataFabricacao, setDataFabricacao] = useState('');
  const [notaVenda, setNotaVenda] = useState('');
  const [notaCompra, setNotaCompra] = useState('');
  const [idSolicitacao, setIdSolicitacao] = useState('');
  const [fotos, setFotos] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [feedback, setFeedback] = useState(null); // { tipo: 'erro' | 'sucesso', texto: string }

  const fornLower = fornecedor.toLowerCase();
  const catLower = categoria.toLowerCase();

  const exigeSerieENF =
    catLower.includes('compressor') ||
    catLower.includes('controladora') ||
    catLower.includes('unidade condensadora') ||
    fornLower.includes('danfoss');

  const exigeDataFabricacao =
    fornLower.includes('cp') || fornLower.includes('emicol');

  const exigeFoto = fornLower.includes('full gauge');

  const adicionarFoto = async () => {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      setFeedback({
        tipo: 'erro',
        texto: 'Autorize o acesso às fotos para anexar imagens da peça.'
      });
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
      base64: true
    });

    if (!resultado.canceled && resultado.assets.length > 0) {
      const asset = resultado.assets[0];
      const imagemSalvar = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;
      setFotos([...fotos, imagemSalvar]);
    }
  };

  const removerFoto = (index) => {
    setFotos(fotos.filter((_, i) => i !== index));
  };

  const salvarGarantia = async () => {
    setFeedback(null);

    if (!codigoPeca.trim()) {
      setFeedback({ tipo: 'erro', texto: 'Informe o Código da Peça.' });
      return;
    }

    if (exigeSerieENF) {
      if (!numeroSerie.trim()) {
        setFeedback({
          tipo: 'erro',
          texto: 'O Número de Série é obrigatório para esta peça/fornecedor.'
        });
        return;
      }
      if (!notaCompra.trim() && !notaVenda.trim()) {
        setFeedback({
          tipo: 'erro',
          texto: 'Informe a Nota de Compra ou Nota de Venda.'
        });
        return;
      }
    }

    if (exigeDataFabricacao && !dataFabricacao.trim()) {
      setFeedback({
        tipo: 'erro',
        texto: 'A Data de Fabricação é obrigatória para CP e Emicol.'
      });
      return;
    }

    if (exigeFoto && fotos.length === 0) {
      setFeedback({
        tipo: 'erro',
        texto: 'Adicione a foto de cada peça relacionada (obrigatório para Full Gauge).'
      });
      return;
    }

    setEnviando(true);
    try {
      const resposta = await fetch(`${API_URL}/garantias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fornecedor,
          categoria,
          codigo_peca: codigoPeca,
          nome_peca: nomePeca,
          data_fabricacao: dataFabricacao,
          numero_serie: numeroSerie,
          nf_compra: notaCompra,
          nf_venda: notaVenda,
          id_solicitacao: idSolicitacao,
          fotos
        })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setFeedback({
          tipo: 'erro',
          texto: dados.erro || 'Não foi possível salvar.'
        });
        return;
      }

      const idFormatado = `#${String(dados.id).padStart(4, '0')}`;
      setFeedback({
        tipo: 'sucesso',
        texto: `Solicitação ${idFormatado} registrada com sucesso e enviada para acompanhamento!`
      });

      setCodigoPeca('');
      setNomePeca('');
      setNumeroSerie('');
      setDataFabricacao('');
      setNotaVenda('');
      setNotaCompra('');
      setIdSolicitacao('');
      setFotos([]);
    } catch (erro) {
      setFeedback({
        tipo: 'erro',
        texto: 'Erro de conexão: verifique se o node server.js está rodando na porta 8082.'
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.titulo}>{fornecedor}</Text>
      <Text style={styles.status}>STATUS INICIAL: Em Tratamento</Text>

      <Text style={styles.label}>Tipo / Categoria da Peça *</Text>
      <View style={styles.categoriasRow}>
        {categorias.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, categoria === cat && styles.chipAtivo]}
            onPress={() => setCategoria(cat)}
          >
            <Text style={[styles.chipTexto, categoria === cat && styles.chipTextoAtivo]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
        placeholder="Ex: Compressor 1/4 R134a"
      />

      <Text style={styles.label}>
        Número de Série {exigeSerieENF ? '* (Obrigatório)' : '(Opcional)'}
      </Text>
      <TextInput
        style={[styles.input, exigeSerieENF && styles.inputDestaque]}
        value={numeroSerie}
        onChangeText={setNumeroSerie}
        placeholder="Ex: SN-987654321"
      />

      <Text style={styles.label}>
        Data de Fabricação {exigeDataFabricacao ? '* (Obrigatório)' : '(Opcional)'}
      </Text>
      <TextInput
        style={[styles.input, exigeDataFabricacao && styles.inputDestaque]}
        value={dataFabricacao}
        onChangeText={setDataFabricacao}
        placeholder="Ex: 15/08/2026"
      />

      <Text style={styles.label}>
        Nota de Compra {exigeSerieENF ? '* (Obrigatório Compra ou Venda)' : '(Opcional)'}
      </Text>
      <TextInput
        style={[styles.input, exigeSerieENF && styles.inputDestaque]}
        value={notaCompra}
        onChangeText={setNotaCompra}
        keyboardType="numeric"
        placeholder="Ex: 55890"
      />

      <Text style={styles.label}>
        Nota de Venda (Cliente) {exigeSerieENF ? '* (Obrigatório Compra ou Venda)' : '(Opcional)'}
      </Text>
      <TextInput
        style={[styles.input, exigeSerieENF && styles.inputDestaque]}
        value={notaVenda}
        onChangeText={setNotaVenda}
        keyboardType="numeric"
        placeholder="Ex: 10452"
      />

      <Text style={styles.label}>ID da Solicitação (Site Fornecedor)</Text>
      <TextInput
        style={styles.input}
        value={idSolicitacao}
        onChangeText={setIdSolicitacao}
        placeholder="Ex: REQ-2026-8841"
      />

      <Text style={styles.label}>
        Fotos das Peças {exigeFoto ? '* (Obrigatório para Full Gauge)' : '(Opcional — aparece no acompanhamento)'}
      </Text>
      <TouchableOpacity style={styles.botaoFoto} onPress={adicionarFoto}>
        <Text style={styles.botaoFotoTexto}>+ Adicionar Foto da Peça</Text>
      </TouchableOpacity>

      <View style={styles.listaFotos}>
        {fotos.map((uri, index) => (
          <TouchableOpacity key={index} onPress={() => removerFoto(index)} style={styles.fotoWrapper}>
            <Image source={{ uri }} style={styles.miniatura} />
            <Text style={styles.removerTexto}>Remover</Text>
          </TouchableOpacity>
        ))}
      </View>

      {feedback && (
        <View
          style={[
            styles.boxFeedback,
            feedback.tipo === 'erro' ? styles.boxErro : styles.boxSucesso
          ]}
        >
          <Text
            style={
              feedback.tipo === 'erro' ? styles.textoErro : styles.textoSucesso
            }
          >
            {feedback.texto}
          </Text>

          {feedback.tipo === 'sucesso' && navigation && (
            <TouchableOpacity
              style={styles.botaoIrAcompanhamento}
              onPress={() => navigation.navigate('GarantiasTratadas')}
            >
              <Text style={styles.textoIrAcompanhamento}>
                Ir para Acompanhamento de Tratativas
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[styles.botaoSalvar, enviando && { opacity: 0.6 }]}
        onPress={salvarGarantia}
        disabled={enviando}
      >
        <Text style={styles.botaoSalvarTexto}>
          {enviando ? 'Salvando...' : 'Salvar e Registrar no Banco'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 4, color: '#222' },
  status: { fontSize: 13, color: '#e65100', marginBottom: 18, fontWeight: 'bold' },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },
  categoriasRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#e0e0e0'
  },
  chipAtivo: { backgroundColor: '#007AFF' },
  chipTexto: { fontSize: 13, color: '#333', fontWeight: '500' },
  chipTextoAtivo: { color: '#fff', fontWeight: 'bold' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 15
  },
  inputDestaque: { borderColor: '#ff9800', borderWidth: 1.5 },
  botaoFoto: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#2196f3',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12
  },
  botaoFotoTexto: { color: '#1565c0', fontWeight: 'bold' },
  listaFotos: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  fotoWrapper: { alignItems: 'center' },
  miniatura: { width: 70, height: 70, borderRadius: 6 },
  removerTexto: { fontSize: 11, color: '#d32f2f', marginTop: 2 },
  boxFeedback: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 1
  },
  boxErro: { backgroundColor: '#fef2f2', borderColor: '#ef4444' },
  boxSucesso: { backgroundColor: '#f0fdf4', borderColor: '#22c55e' },
  textoErro: { color: '#b91c1c', fontWeight: '600', fontSize: 14 },
  textoSucesso: { color: '#15803d', fontWeight: '600', fontSize: 14 },
  botaoIrAcompanhamento: {
    marginTop: 10,
    backgroundColor: '#15803d',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignItems: 'center'
  },
  textoIrAcompanhamento: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  botaoSalvar: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6
  },
  botaoSalvarTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});