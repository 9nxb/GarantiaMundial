import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { TEMA } from '../utils/tema';
import { CabecalhoMundial } from '../components/CabecalhoMundial';
import { BarraFornecedores, LISTA_FORNECEDORES } from '../components/BarraFornecedores';

export function TelaFornecedores({ navigation, route }) {
  const usuario = route?.params?.usuario;

  return (
    <View style={styles.tela}>
      <CabecalhoMundial
        titulo="Fornecedores"
        subtitulo="Selecione o fabricante para solicitar garantia"
        usuario={usuario}
        navigation={navigation}
      />

      <View style={styles.corpo}>
        <BarraFornecedores navigation={navigation} usuario={usuario} />

        <ScrollView contentContainerStyle={styles.areaPrincipal}>
          <Text style={styles.tituloSecao}>Fabricantes Cadastrados</Text>
          <Text style={styles.subtituloSecao}>
            Toque em um fornecedor para abrir o formulário de solicitação de garantia
          </Text>

          <View style={styles.grade}>
            {LISTA_FORNECEDORES.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.cardFornecedor}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('TratamentoGarantia', {
                    fornecedor: item.nome,
                    usuario,
                  })
                }
              >
                <View
                  style={[
                    styles.logoGrande,
                    { backgroundColor: item.logo ? '#FFFFFF' : item.cor },
                  ]}
                >
                  {item.logo ? (
                    <Image source={item.logo} style={styles.logoImg} resizeMode="contain" />
                  ) : (
                    <Text style={styles.siglaGrande}>{item.sigla}</Text>
                  )}
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.nomeFornecedor}>{item.nome}</Text>
                  <Text style={styles.categoria}>{item.categoria}</Text>
                </View>

                <Text style={styles.seta}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: TEMA.cores.fundoTela },
  corpo: { flex: 1, flexDirection: 'row' },
  areaPrincipal: { padding: 20, paddingBottom: 40 },
  tituloSecao: { fontSize: 20, fontWeight: 'bold', color: TEMA.cores.azulMundial },
  subtituloSecao: { fontSize: 13, color: TEMA.cores.textoSuave, marginTop: 3, marginBottom: 18 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  cardFornecedor: {
    flexGrow: 1,
    flexBasis: 260,
    backgroundColor: TEMA.cores.cardBranco,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: TEMA.cores.azulBorda,
    gap: 14,
    ...TEMA.sombraSuave,
  },
  logoGrande: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: TEMA.cores.azulBorda,
    overflow: 'hidden',
  },
  logoImg: { width: '85%', height: '85%' },
  siglaGrande: { color: TEMA.cores.branco, fontWeight: 'bold', fontSize: 16 },
  infoBox: { flex: 1 },
  nomeFornecedor: { fontSize: 17, fontWeight: 'bold', color: TEMA.cores.azulMundial },
  categoria: { fontSize: 12, color: TEMA.cores.textoSuave, marginTop: 2 },
  seta: { fontSize: 18, fontWeight: 'bold', color: TEMA.cores.azulRoyal },
});