import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { TEMA } from '../utils/tema';

const LOGO_MUNDIAL = require('../assets/logo-mundial.png');

const FOTOS_USUARIOS = {
  // Descomente conforme salvar as fotos em app/src/assets/
  // Paulo: require('../assets/paulo.jpg'),
  // Ocione: require('../assets/ocione.jpg'),
  // Wallace: require('../assets/wallace.jpg'),
};

export function CabecalhoMundial({
  titulo,
  subtitulo,
  usuario,
  navigation,
  mostrarVoltar = true,
}) {
  const nomeUsuario = typeof usuario === 'string' ? usuario : usuario?.nome || 'Equipe';
  const fotoUsuario = FOTOS_USUARIOS[nomeUsuario] || null;

  const voltar = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      navigation?.navigate('MenuPrincipal', { usuario });
    }
  };

  return (
    <View style={styles.faixaTopo}>
      <View style={styles.esquerda}>
        {mostrarVoltar && (
          <TouchableOpacity style={styles.botaoVoltar} onPress={voltar}>
            <Text style={styles.textoVoltar}>← Voltar</Text>
          </TouchableOpacity>
        )}

        <Image source={LOGO_MUNDIAL} style={styles.logo} resizeMode="contain" />

        <View style={styles.blocoTitulo}>
          <Text style={styles.titulo} numberOfLines={1}>
            {titulo || 'Mundial Refrigeração'}
          </Text>
          {subtitulo ? (
            <Text style={styles.subtitulo} numberOfLines={1}>
              {subtitulo}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.perfilBox}>
        <View style={styles.avatarCirculo}>
          {fotoUsuario ? (
            <Image source={fotoUsuario} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarInicial}>{nomeUsuario[0]?.toUpperCase()}</Text>
          )}
        </View>
        <Text style={styles.nomeUsuario} numberOfLines={1}>
          {nomeUsuario}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  faixaTopo: {
    backgroundColor: TEMA.cores.azulMundial,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: TEMA.cores.azulRoyal,
  },
  esquerda: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  botaoVoltar: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  textoVoltar: {
    color: TEMA.cores.branco,
    fontWeight: '700',
    fontSize: 13,
  },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 8,
  },
  blocoTitulo: {
    flex: 1,
  },
  titulo: {
    color: TEMA.cores.branco,
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitulo: {
    color: '#BFDBFE',
    fontSize: 12,
  },
  perfilBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 8,
    marginLeft: 8,
  },
  avatarCirculo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: TEMA.cores.azulRoyal,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarInicial: {
    color: TEMA.cores.branco,
    fontWeight: 'bold',
    fontSize: 13,
  },
  nomeUsuario: {
    color: TEMA.cores.branco,
    fontWeight: '600',
    fontSize: 13,
    maxWidth: 80,
  },
});