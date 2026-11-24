import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { TEMA } from '../utils/tema';
import { CabecalhoMundial } from '../components/CabecalhoMundial';

export function TelaConfiguracoes({ navigation, route }) {
  const usuario = route?.params?.usuario;
  const nomeUsuario = typeof usuario === 'string' ? usuario : usuario?.nome || 'Paulo';

  const [alertasVencimento, setAlertasVencimento] = useState(true);
  const [confirmarEnvio, setConfirmarEnvio] = useState(true);

  return (
    <View style={styles.tela}>
      <CabecalhoMundial
        titulo="Configurações"
        subtitulo="Preferências do sistema e informações do operador"
        usuario={usuario}
        navigation={navigation}
      />

      <ScrollView contentContainerStyle={styles.areaPrincipal}>
        {/* Cartão de Perfil */}
        <View style={styles.card}>
          <Text style={styles.tituloSecao}>Perfil Conectado</Text>
          <View style={styles.linhaPerfil}>
            <View style={styles.avatarGrande}>
              <Text style={styles.inicialGrande}>{nomeUsuario[0]?.toUpperCase()}</Text>
            </View>
            <View style={styles.infoPerfil}>
              <Text style={styles.nomeOperador}>{nomeUsuario}</Text>
              <Text style={styles.cargo}>Setor de Garantias • Mundial Refrigeração</Text>
              <Text style={styles.avisoSenha}>
                Senha gerenciada pelo administrador do sistema.
              </Text>
            </View>
          </View>
        </View>

        {/* Cartão de Preferências */}
        <View style={styles.card}>
          <Text style={styles.tituloSecao}>Preferências Operacionais</Text>

          <View style={styles.linhaConfig}>
            <View style={styles.textoConfig}>
              <Text style={styles.tituloItem}>Alertas de Tratativas em Aberto</Text>
              <Text style={styles.descItem}>
                Destacar garantias em amarelo aguardando retorno do fornecedor
              </Text>
            </View>
            <Switch
              value={alertasVencimento}
              onValueChange={setAlertasVencimento}
              trackColor={{ true: TEMA.cores.azulRoyal }}
            />
          </View>

          <View style={[styles.linhaConfig, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <View style={styles.textoConfig}>
              <Text style={styles.tituloItem}>Exibir ID Único após Registro</Text>
              <Text style={styles.descItem}>
                Mostrar atalho rápido para acompanhamento assim que salvar a peça
              </Text>
            </View>
            <Switch
              value={confirmarEnvio}
              onValueChange={setConfirmarEnvio}
              trackColor={{ true: TEMA.cores.azulRoyal }}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.botaoTrocarUsuario}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={styles.textoTrocarUsuario}>Trocar Operador / Voltar ao Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: TEMA.cores.fundoTela },
  areaPrincipal: { padding: 20, maxWidth: 720, width: '100%' },
  card: {
    backgroundColor: TEMA.cores.cardBranco,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: TEMA.cores.azulBorda,
    ...TEMA.sombraSuave,
  },
  tituloSecao: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEMA.cores.azulMundial,
    marginBottom: 14,
  },
  linhaPerfil: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarGrande: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: TEMA.cores.azulMundial,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inicialGrande: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  infoPerfil: { flex: 1 },
  nomeOperador: { fontSize: 18, fontWeight: 'bold', color: TEMA.cores.azulMundial },
  cargo: { fontSize: 13, color: TEMA.cores.textoSuave, marginTop: 2 },
  avisoSenha: { fontSize: 12, color: TEMA.cores.azulRoyal, marginTop: 4, fontWeight: '600' },
  linhaConfig: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  textoConfig: { flex: 1 },
  tituloItem: { fontSize: 14, fontWeight: '700', color: TEMA.cores.textoEscuro },
  descItem: { fontSize: 12, color: TEMA.cores.textoSuave, marginTop: 2 },
  botaoTrocarUsuario: {
    backgroundColor: TEMA.cores.azulMundial,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
    ...TEMA.sombraSuave,
  },
  textoTrocarUsuario: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
});