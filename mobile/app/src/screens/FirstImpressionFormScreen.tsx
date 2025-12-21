import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { firstImpressionService, FirstImpressionData } from '../services/firstImpressionService';

export default function FirstImpressionFormScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const impressionId = (route.params as any)?.impressionId;
  const isEditMode = !!impressionId;

  // States - Dados Cliente
  const [clientName, setClientName] = useState('');
  const [clientNif, setClientNif] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  // States - Dados CMI
  const [artigoMatricial, setArtigoMatricial] = useState('');
  const [freguesia, setFreguesia] = useState('');
  const [concelho, setConcelho] = useState('');
  const [distrito, setDistrito] = useState('');
  const [areaBruta, setAreaBruta] = useState('');
  const [areaUtil, setAreaUtil] = useState('');
  const [tipologia, setTipologia] = useState('');
  const [anoConstrucao, setAnoConstrucao] = useState('');
  const [valorPatrimonial, setValorPatrimonial] = useState('');

  // States - Outros
  const [observations, setObservations] = useState('');
  const [status, setStatus] = useState<string>('draft');

  // States UI
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Carregar dados se modo edição
  useEffect(() => {
    if (isEditMode) {
      loadImpressionData();
    }
  }, [impressionId]);

  const loadImpressionData = async () => {
    try {
      setLoadingData(true);
      const data = await firstImpressionService.getById(impressionId);

      // Preencher formulário
      setClientName(data.client_name || '');
      setClientNif(data.client_nif || '');
      setClientPhone(data.client_phone || '');
      setClientEmail(data.client_email || '');

      setArtigoMatricial(data.artigo_matricial || '');
      setFreguesia(data.freguesia || '');
      setConcelho(data.concelho || '');
      setDistrito(data.distrito || '');
      setAreaBruta(data.area_bruta?.toString() || '');
      setAreaUtil(data.area_util?.toString() || '');
      setTipologia(data.tipologia || '');
      setAnoConstrucao(data.ano_construcao?.toString() || '');
      setValorPatrimonial(data.valor_patrimonial?.toString() || '');

      setObservations(data.observations || '');
      setStatus(data.status || 'draft');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
      navigation.goBack();
    } finally {
      setLoadingData(false);
    }
  };

  // Validações
  const validateForm = (): boolean => {
    if (!clientName.trim()) {
      Alert.alert('Campo Obrigatório', 'Preencha o nome do cliente');
      return false;
    }

    if (!clientPhone.trim()) {
      Alert.alert('Campo Obrigatório', 'Preencha o telefone do cliente');
      return false;
    }

    if (clientPhone.trim().length < 9) {
      Alert.alert('Telefone Inválido', 'Telefone deve ter no mínimo 9 dígitos');
      return false;
    }

    if (clientNif.trim() && clientNif.trim().length !== 9) {
      Alert.alert('NIF Inválido', 'NIF deve ter exatamente 9 dígitos');
      return false;
    }

    if (clientEmail.trim() && !clientEmail.includes('@')) {
      Alert.alert('Email Inválido', 'Formato de email inválido');
      return false;
    }

    return true;
  };

  // Guardar
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload: Partial<FirstImpressionData> = {
        client_name: clientName.trim(),
        client_phone: clientPhone.trim(),
        client_nif: clientNif.trim() || null,
        client_email: clientEmail.trim() || null,

        artigo_matricial: artigoMatricial.trim() || null,
        freguesia: freguesia.trim() || null,
        concelho: concelho.trim() || null,
        distrito: distrito.trim() || null,
        area_bruta: areaBruta ? parseFloat(areaBruta) : null,
        area_util: areaUtil ? parseFloat(areaUtil) : null,
        tipologia: tipologia.trim() || null,
        ano_construcao: anoConstrucao ? parseInt(anoConstrucao) : null,
        valor_patrimonial: valorPatrimonial ? parseFloat(valorPatrimonial) : null,

        observations: observations.trim() || null,
      };

      if (isEditMode) {
        await firstImpressionService.update(impressionId, payload);
        Alert.alert('✅ Sucesso', 'Documento atualizado com sucesso');
      } else {
        await firstImpressionService.create(payload as any);
        Alert.alert('✅ Sucesso', 'Documento criado com sucesso');
      }

      navigation.goBack();
    } catch (error: any) {
      console.error('Erro ao guardar:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Erro desconhecido';
      Alert.alert('Erro', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00d9ff" />
        <Text style={styles.loadingText}>A carregar...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditMode ? 'Editar Documento' : 'Nova 1ª Impressão'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* SEÇÃO: DADOS DO CLIENTE */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color="#00d9ff" />
            <Text style={styles.sectionTitle}>Dados do Cliente</Text>
          </View>

          {/* Nome Completo */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Nome Completo <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: João Silva"
              placeholderTextColor="#6b7280"
              value={clientName}
              onChangeText={setClientName}
              autoCapitalize="words"
            />
          </View>

          {/* NIF */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>NIF</Text>
            <TextInput
              style={styles.input}
              placeholder="123456789"
              placeholderTextColor="#6b7280"
              value={clientNif}
              onChangeText={setClientNif}
              keyboardType="number-pad"
              maxLength={9}
            />
          </View>

          {/* Telefone */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Telefone <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="+351 912 345 678"
              placeholderTextColor="#6b7280"
              value={clientPhone}
              onChangeText={setClientPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* Email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="joao@example.com"
              placeholderTextColor="#6b7280"
              value={clientEmail}
              onChangeText={setClientEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* SEÇÃO: DADOS CMI */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={20} color="#00d9ff" />
            <Text style={styles.sectionTitle}>Dados CMI (Caderneta Predial)</Text>
          </View>

          {/* Artigo Matricial */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Artigo Matricial</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 1234-2024"
              placeholderTextColor="#6b7280"
              value={artigoMatricial}
              onChangeText={setArtigoMatricial}
            />
          </View>

          {/* Localização - Grid 3 campos */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Freguesia</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: São Domingos de Rana"
              placeholderTextColor="#6b7280"
              value={freguesia}
              onChangeText={setFreguesia}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.rowFields}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Concelho</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Cascais"
                placeholderTextColor="#6b7280"
                value={concelho}
                onChangeText={setConcelho}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.halfField}>
              <Text style={styles.label}>Distrito</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Lisboa"
                placeholderTextColor="#6b7280"
                value={distrito}
                onChangeText={setDistrito}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Áreas - Grid 2 campos */}
          <View style={styles.rowFields}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Área Bruta (m²)</Text>
              <TextInput
                style={styles.input}
                placeholder="120.50"
                placeholderTextColor="#6b7280"
                value={areaBruta}
                onChangeText={setAreaBruta}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.halfField}>
              <Text style={styles.label}>Área Útil (m²)</Text>
              <TextInput
                style={styles.input}
                placeholder="95.30"
                placeholderTextColor="#6b7280"
                value={areaUtil}
                onChangeText={setAreaUtil}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Tipologia + Ano - Grid 2 campos */}
          <View style={styles.rowFields}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Tipologia</Text>
              <TextInput
                style={styles.input}
                placeholder="T3"
                placeholderTextColor="#6b7280"
                value={tipologia}
                onChangeText={setTipologia}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.halfField}>
              <Text style={styles.label}>Ano Construção</Text>
              <TextInput
                style={styles.input}
                placeholder="2005"
                placeholderTextColor="#6b7280"
                value={anoConstrucao}
                onChangeText={setAnoConstrucao}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
          </View>

          {/* Valor Patrimonial */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Valor Patrimonial (€)</Text>
            <TextInput
              style={styles.input}
              placeholder="180000.00"
              placeholderTextColor="#6b7280"
              value={valorPatrimonial}
              onChangeText={setValorPatrimonial}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* SEÇÃO: OBSERVAÇÕES */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="create" size={20} color="#00d9ff" />
            <Text style={styles.sectionTitle}>Observações</Text>
          </View>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Notas adicionais sobre o imóvel ou cliente..."
            placeholderTextColor="#6b7280"
            value={observations}
            onChangeText={setObservations}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Botão Guardar */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>
                {isEditMode ? 'Guardar Alterações' : 'Criar Documento'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0e1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1f2e',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2d3748',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  rowFields: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfField: {
    flex: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00d9ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    gap: 8,
    shadowColor: '#00d9ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
