/**
 * Login Screen - PASSO 1 Design (Dark Neon)
 * Autenticação com backend Vercel (mesma database do backoffice)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { ScreenWrapper, NeonButton } from '../components';
import { colors, spacing, radius, glow } from '../theme/tokens';
import { textStyles } from '../theme/typography';

// CREDENCIAIS DE TESTE (mesma database do backoffice Railway)
const DEFAULT_EMAIL = 'tvindima@imoveismais.pt';
const DEFAULT_PASSWORD = 'testepassword123';

export default function LoginScreenV2() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('⚠️ Campos obrigatórios', 'Preencha email e senha para continuar');
      return;
    }

    setLoading(true);
    try {
      console.log('[LOGIN] Tentando login com:', email);
      await signIn(email, password);
      console.log('[LOGIN] ✅ Login bem-sucedido!');
      // Navigation automática via AuthContext
    } catch (error: any) {
      console.error('[LOGIN] ❌ Erro completo:', error);
      
      // Extrair mensagem de erro legível
      let errorMessage = 'Verifique suas credenciais e tente novamente';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.detail) {
        errorMessage = error.detail;
      }
      
      console.error('[LOGIN] Mensagem erro:', errorMessage);
      
      Alert.alert(
        '❌ Erro ao fazer login',
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFillTestCredentials = () => {
    setEmail(DEFAULT_EMAIL);
    setPassword(DEFAULT_PASSWORD);
    Alert.alert(
      '✅ Credenciais de Teste',
      `Email: ${DEFAULT_EMAIL}\nPassword: testepassword123\n\n(Mesma database do backoffice Railway)`
    );
  };

  return (
    <ScreenWrapper noPadding>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <LinearGradient
            colors={[colors.brand.cyan, colors.brand.magenta]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoContainer}
          >
            <Text style={styles.logoText}>CRM</Text>
          </LinearGradient>

          <Text style={styles.title}>CRM PLUS</Text>
          <Text style={styles.subtitle}>Acesso Mobile para Agentes</Text>

          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Backend: Vercel Production</Text>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="agente@imoveismais.pt"
              placeholderTextColor={colors.text.tertiary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.text.tertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
              autoComplete="password"
            />
          </View>

          <TouchableOpacity
            onPress={handleFillTestCredentials}
            style={styles.testLink}
            disabled={loading}
          >
            <Text style={styles.testLinkText}>🔑 Preencher credenciais de teste</Text>
          </TouchableOpacity>

          <NeonButton
            title={loading ? 'Autenticando...' : 'Entrar'}
            onPress={handleLogin}
            variant="primary"
            loading={loading}
            style={styles.loginButton}
          />

          {/* Info Section */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>📌 Informação</Text>
            <Text style={styles.infoText}>
              • Usa mesma database do backoffice Railway{'\n'}
              • Login com credenciais de agente{'\n'}
              • Autenticação JWT unificada{'\n'}
              • Dados reais sincronizados
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Versão 0.1.0 • PASSO 1</Text>
          <Text style={styles.footerSubtext}>Mobile App • Dark Neon Design</Text>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing['6xl'],
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...glow.cyan,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: 1,
  },
  title: {
    ...textStyles.h1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.brand.cyan + '30',
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand.cyan,
    marginRight: spacing.sm,
  },
  badgeText: {
    ...textStyles.caption,
    color: colors.brand.cyan,
    fontWeight: '600',
  },
  form: {
    flex: 1,
    paddingTop: spacing['2xl'],
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    ...textStyles.label,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.card.secondary,
    borderWidth: 1,
    borderColor: colors.card.elevated + '50',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  testLink: {
    alignSelf: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.sm,
  },
  testLinkText: {
    ...textStyles.caption,
    color: colors.brand.magenta,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  loginButton: {
    marginBottom: spacing['2xl'],
  },
  infoCard: {
    backgroundColor: colors.card.secondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.brand.purple + '20',
  },
  infoTitle: {
    ...textStyles.label,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  infoText: {
    ...textStyles.caption,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  footerText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  footerSubtext: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    fontSize: 12,
  },
});
