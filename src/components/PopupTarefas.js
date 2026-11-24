import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { TEMA } from '../utils/tema';

export function PopupTarefas({ visivel, aoFechar, usuario }) {
  const nomeUsuario = typeof usuario === 'string' ? usuario : usuario?.nome || 'Paulo';

  const [abaAtiva, setAbaAtiva] = useState('proprias'); // 'proprias' | 'geral'
  const [novaNota, setNovaNota] = useState('');
  const [notasProprias, setNotasProprias] = useState([
    { id: '1', texto: 'Conferir retorno da placa Emicol e número de série do compressor.', data: 'Hoje' },
  ]);
  const [notasGerais, setNotasGerais] = useState([
    { id: '1', autor: 'Admin', texto: 'Sempre anexar foto nítida da etiqueta de fabricação nas peças CP e Emicol.', data: 'Aviso Fixo' },
  ]);

  const adicionarNota = () => {
    if (!novaNota.trim()) return;

    if (abaAtiva === 'proprias') {
      setNotasProprias((prev) => [
        { id: String(Date.now()), texto: novaNota.trim(), data: 'Agora' },
        ...prev,
      ]);
    } else {
      setNotasGerais((prev) => [
        { id: String(Date.now()), autor: nomeUsuario, texto: novaNota.trim(), data: 'Agora' },
        ...prev,
      ]);
    }
    setNovaNota('');
  };

  const removerNota = (id) => {
    if (abaAtiva === 'proprias') {
      setNotasProprias((prev) => prev.filter((n) => n.id !== id));
    } else {
      setNotasGerais((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const listaAtual = abaAtiva === 'proprias' ? notasProprias : notasGerais;

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={aoFechar}>
      <View style={styles.fundoEscuro}>
        <View style={styles.caixaModal}>
          <View style={styles.topoModal}>
            <View>
              <Text style={styles.titulo}>Bloco de Anotações</Text>
              <Text style={styles.subtitulo}>Usuário ativo: {nomeUsuario}</Text>
            </View>
            <TouchableOpacity style={styles.btnFechar} onPress={aoFechar}>
              <Text style={styles.textoFechar}>✕ Fechar</Text>
            </TouchableOpacity>
          </View>

          {/* Abas */}
          <View style={styles.abasRow}>
            <TouchableOpacity
              style={[styles.aba, abaAtiva === 'proprias' && styles.abaAtiva]}
              onPress={() => setAbaAtiva('proprias')}
            >
              <Text style={[styles.textoAba, abaAtiva === 'proprias' && styles.textoAbaAtiva]}>
                Anotações Próprias ({nomeUsuario})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.aba, abaAtiva === 'geral' && styles.abaAtiva]}
              onPress={() => setAbaAtiva('geral')}
            >
              <Text style={[styles.textoAba, abaAtiva === 'geral' && styles.textoAbaAtiva]}>
                Mural Geral Mundial
              </Text>
            </TouchableOpacity>
          </View>

          {/* Campo para adicionar anotação */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputNota}
              placeholder={
                abaAtiva === 'proprias'
                  ? 'Escreva um lembrete pessoal...'
                  : 'Deixe um recado para toda a equipe...'
              }
              value={novaNota}
              onChangeText={setNovaNota}
            />
            <TouchableOpacity style={styles.btnAdicionar} onPress={adicionarNota}>
              <Text style={styles.textoAdicionar}>+ Salvar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.listaNotas}>
            {listaAtual.map((item) => (
              <View key={item.id} style={styles.cardNota}>
                <View style={styles.conteudoNota}>
                  {item.autor ? (
                    <Text style={styles.autorTag}>Por {item.autor} • {item.data}</Text>
                  ) : (
                    <Text style={styles.autorTag}>{item.data}</Text>
                  )}
                  <Text style={styles.textoNota}>{item.texto}</Text>
                </View>

                <TouchableOpacity onPress={() => removerNota(item.id)}>
                  <Text style={styles.excluir}>Excluir</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundoEscuro: {
    flex: 1,
    backgroundColor: 'rgba(9, 37, 86, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  caixaModal: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '85%',
    backgroundColor: TEMA.cores.cardBranco,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: TEMA.cores.azulBorda,
    ...TEMA.sombraSuave,
  },
  topoModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titulo: { fontSize: 19, fontWeight: 'bold', color: TEMA.cores.azulMundial },
  subtitulo: { fontSize: 12, color: TEMA.cores.textoSuave },
  btnFechar: {
    backgroundColor: TEMA.cores.fundoTela,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  textoFechar: { color: TEMA.cores.azulMundial, fontWeight: 'bold', fontSize: 12 },
  abasRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  aba: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: TEMA.cores.fundoTela,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: TEMA.cores.azulBorda,
  },
  abaAtiva: {
    backgroundColor: TEMA.cores.azulMundial,
    borderColor: TEMA.cores.azulMundial,
  },
  textoAba: { fontSize: 12, fontWeight: 'bold', color: TEMA.cores.textoSuave },
  textoAbaAtiva: { color: TEMA.cores.branco },
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  inputNota: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  btnAdicionar: {
    backgroundColor: TEMA.cores.azulRoyal,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  textoAdicionar: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  listaNotas: { maxHeight: 300 },
  cardNota: {
    backgroundColor: TEMA.cores.fundoTela,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: TEMA.cores.azulRoyal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  conteudoNota: { flex: 1 },
  autorTag: { fontSize: 11, fontWeight: '700', color: TEMA.cores.azulRoyal, marginBottom: 3 },
  textoNota: { fontSize: 13, color: TEMA.cores.textoEscuro, lineHeight: 18 },
  excluir: { color: TEMA.cores.perigo, fontSize: 12, fontWeight: '600' },
});