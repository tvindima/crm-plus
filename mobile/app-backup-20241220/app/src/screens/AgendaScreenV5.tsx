/**
 * AgendaScreenV5 - Agenda com vistas Diário/Semana/Mês
 * Botão criar evento no topo, calendário, lista de eventos
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { apiService } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ViewMode = 'day' | 'week' | 'month';

interface AgentProfile {
  id: number;
  name: string;
  photo?: string;
}

interface Event {
  id: number;
  scheduled_at: string;
  title: string;
  type: string;
  lead_name?: string;
  property_title?: string;
  property_location?: string;
  property_image?: string;
  status: string;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEKDAYS_SHORT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const EVENT_TYPES = [
  { id: 'visita', label: 'Visita', icon: 'home-outline', color: '#00d9ff' },
  { id: 'reuniao', label: 'Reunião', icon: 'people-outline', color: '#8b5cf6' },
  { id: 'chamada', label: 'Chamada', icon: 'call-outline', color: '#10b981' },
  { id: 'tarefa', label: 'Tarefa', icon: 'checkbox-outline', color: '#f59e0b' },
  { id: 'lembrete', label: 'Lembrete', icon: 'alarm-outline', color: '#ef4444' },
  { id: 'outro', label: 'Outro', icon: 'ellipsis-horizontal', color: '#6b7280' },
];

type RouteParams = {
  params?: {
    createNew?: boolean;
  };
};

export default function AgendaScreenV5() {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<RouteProp<RouteParams, 'params'>>();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Event Modal
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [newEventType, setNewEventType] = useState('visita');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventTime, setNewEventTime] = useState('10:00');
  const [newEventLocation, setNewEventLocation] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (route.params?.createNew) {
      setShowNewEventModal(true);
      navigation.setParams({ createNew: undefined });
    }
  }, [route.params?.createNew]);

  // ✅ NOVO: Recarregar eventos quando voltar
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.refresh) {
        loadData(); // Função que carrega eventos/tasks/visits
        
        // Limpar parâmetro
        navigation.setParams({ refresh: undefined } as any);
      }
    }, [route.params?.refresh])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      
      const statsResponse = await apiService.get<any>('/mobile/dashboard/stats');
      if (statsResponse.agent_id) {
        const agentResponse = await apiService.get<any>(`/agents/${statsResponse.agent_id}`);
        setAgentProfile({
          id: agentResponse.id,
          name: agentResponse.name,
          photo: agentResponse.photo,
        });
      }

      // Mock events
      setEvents([
        {
          id: 1,
          scheduled_at: new Date().toISOString(),
          title: 'Visita T3 Parque das Nações',
          type: 'visita',
          lead_name: 'Marcos Costa',
          property_title: 'Apartamento de Luxo',
          property_location: 'Parque das Nações, Lisboa',
          property_image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200',
          status: 'confirmed',
        },
        {
          id: 2,
          scheduled_at: new Date().toISOString(),
          title: 'Reunião com proprietário',
          type: 'reuniao',
          lead_name: 'João Silva',
          status: 'pending',
        },
        {
          id: 3,
          scheduled_at: new Date().toISOString(),
          title: 'Chamada follow-up',
          type: 'chamada',
          lead_name: 'Ana Santos',
          status: 'pending',
        },
      ]);
    } catch (error) {
      console.error('Error loading agenda:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = () => {
    if (agentProfile?.photo) {
      if (agentProfile.photo.startsWith('http')) {
        return agentProfile.photo;
      }
      return `https://fantastic-simplicity-production.up.railway.app${agentProfile.photo}`;
    }
    return null;
  };

  const getWeekDays = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push({
        day: date.getDate(),
        date: date,
        weekday: WEEKDAYS_SHORT[i],
        hasEvents: [0, 2, 4].includes(i),
        isToday: date.toDateString() === today.toDateString(),
        isSelected: date.toDateString() === selectedDate.toDateString(),
      });
    }
    return days;
  };

  const getMonthDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    
    const days = [];
    
    // Padding from previous month
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ day: date.getDate(), date, isPrevMonth: true });
    }
    
    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        day: i,
        date,
        isToday: date.toDateString() === new Date().toDateString(),
        isSelected: date.toDateString() === selectedDate.toDateString(),
        hasEvents: [5, 12, 18, 25].includes(i),
      });
    }
    
    return days;
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
  };

  const formatSelectedDate = () => {
    return selectedDate.toLocaleDateString('pt-PT', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const getEventTypeInfo = (type: string) => {
    return EVENT_TYPES.find(t => t.id === type) || EVENT_TYPES[5];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00d9ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Create Button */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color="#00d9ff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Agenda</Text>
          </View>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => setShowNewEventModal(true)}
          >
            <LinearGradient
              colors={['#00d9ff', '#0099cc']}
              style={styles.createButtonGradient}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.createButtonText}>Novo</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* View Mode Tabs */}
        <View style={styles.viewModeContainer}>
          {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[styles.viewModeTab, viewMode === mode && styles.viewModeTabActive]}
              onPress={() => setViewMode(mode)}
            >
              <Text style={[styles.viewModeText, viewMode === mode && styles.viewModeTextActive]}>
                {mode === 'day' ? 'Diário' : mode === 'week' ? 'Semana' : 'Mensal'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => navigateMonth(-1)}>
            <Ionicons name="chevron-back" size={24} color="#00d9ff" />
          </TouchableOpacity>
          <Text style={styles.monthText}>{formatMonth(selectedDate)}</Text>
          <TouchableOpacity onPress={() => navigateMonth(1)}>
            <Ionicons name="chevron-forward" size={24} color="#00d9ff" />
          </TouchableOpacity>
        </View>

        {/* Calendar View */}
        {viewMode === 'week' && (
          <View style={styles.weekContainer}>
            <View style={styles.weekDays}>
              {getWeekDays().map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayButton,
                    day.isSelected && styles.dayButtonSelected,
                    day.isToday && !day.isSelected && styles.dayButtonToday,
                  ]}
                  onPress={() => setSelectedDate(day.date)}
                >
                  <Text style={[styles.dayWeekday, day.isSelected && styles.dayTextSelected]}>
                    {day.weekday}
                  </Text>
                  <Text style={[styles.dayText, day.isSelected && styles.dayTextSelected]}>
                    {day.day}
                  </Text>
                  {day.hasEvents && <View style={[styles.dayDot, day.isSelected && styles.dayDotSelected]} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {viewMode === 'month' && (
          <View style={styles.monthContainer}>
            <View style={styles.monthHeader}>
              {WEEKDAYS_SHORT.map((day, index) => (
                <Text key={index} style={styles.monthWeekday}>{day}</Text>
              ))}
            </View>
            <View style={styles.monthGrid}>
              {getMonthDays().map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.monthDay,
                    day.isSelected && styles.monthDaySelected,
                    day.isToday && !day.isSelected && styles.monthDayToday,
                    day.isPrevMonth && styles.monthDayPrev,
                  ]}
                  onPress={() => !day.isPrevMonth && setSelectedDate(day.date)}
                >
                  <Text style={[
                    styles.monthDayText,
                    day.isSelected && styles.monthDayTextSelected,
                    day.isPrevMonth && styles.monthDayTextPrev,
                  ]}>
                    {day.day}
                  </Text>
                  {day.hasEvents && !day.isPrevMonth && (
                    <View style={[styles.monthDayDot, day.isSelected && styles.monthDayDotSelected]} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {viewMode === 'day' && (
          <View style={styles.dayViewContainer}>
            <Text style={styles.dayViewDate}>{formatSelectedDate()}</Text>
          </View>
        )}

        {/* Events List */}
        <View style={styles.eventsSection}>
          <Text style={styles.eventsSectionTitle}>
            Eventos de <Text style={styles.eventsTitleCyan}>{formatSelectedDate()}</Text>
          </Text>

          {events.length === 0 ? (
            <View style={styles.emptyEvents}>
              <Ionicons name="calendar-outline" size={48} color="#6b7280" />
              <Text style={styles.emptyEventsText}>Sem eventos para este dia</Text>
              <TouchableOpacity 
                style={styles.emptyEventsButton}
                onPress={() => setShowNewEventModal(true)}
              >
                <Text style={styles.emptyEventsButtonText}>Criar Evento</Text>
              </TouchableOpacity>
            </View>
          ) : (
            events.map((event) => {
              const typeInfo = getEventTypeInfo(event.type);
              return (
                <TouchableOpacity 
                  key={event.id} 
                  style={styles.eventCard}
                  onPress={() => navigation.navigate('VisitDetail', { id: event.id })}
                >
                  <View style={[styles.eventTypeIndicator, { backgroundColor: typeInfo.color }]} />
                  <View style={styles.eventContent}>
                    <View style={styles.eventHeader}>
                      <View style={[styles.eventTypeIcon, { backgroundColor: `${typeInfo.color}20` }]}>
                        <Ionicons name={typeInfo.icon as any} size={18} color={typeInfo.color} />
                      </View>
                      <Text style={styles.eventTime}>
                        {new Date(event.scheduled_at).toLocaleTimeString('pt-PT', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                    </View>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    {event.lead_name && (
                      <Text style={styles.eventLead}>
                        <Ionicons name="person-outline" size={12} color="#6b7280" /> {event.lead_name}
                      </Text>
                    )}
                    {event.property_location && (
                      <Text style={styles.eventLocation}>
                        <Ionicons name="location-outline" size={12} color="#6b7280" /> {event.property_location}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* New Event Modal */}
      <Modal
        visible={showNewEventModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNewEventModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Evento</Text>
              <TouchableOpacity onPress={() => setShowNewEventModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>Tipo de Evento</Text>
              <View style={styles.eventTypesGrid}>
                {EVENT_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.eventTypeButton,
                      newEventType === type.id && { borderColor: type.color, backgroundColor: `${type.color}15` },
                    ]}
                    onPress={() => setNewEventType(type.id)}
                  >
                    <Ionicons 
                      name={type.icon as any} 
                      size={24} 
                      color={newEventType === type.id ? type.color : '#6b7280'} 
                    />
                    <Text style={[
                      styles.eventTypeLabel,
                      newEventType === type.id && { color: type.color },
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Título</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ex: Visita ao T3 em Lisboa"
                placeholderTextColor="#6b7280"
                value={newEventTitle}
                onChangeText={setNewEventTitle}
              />

              <Text style={styles.modalLabel}>Descrição (opcional)</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="Adicione notas..."
                placeholderTextColor="#6b7280"
                value={newEventDescription}
                onChangeText={setNewEventDescription}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.modalLabel}>
                <Ionicons name="location" size={14} color="#ef4444" /> Localização
              </Text>
              <View style={styles.locationInputContainer}>
                <TextInput
                  style={styles.locationInput}
                  placeholder="Ex: Av. da Liberdade 120, Lisboa"
                  placeholderTextColor="#6b7280"
                  value={newEventLocation}
                  onChangeText={setNewEventLocation}
                />
                <TouchableOpacity 
                  style={styles.mapsButton}
                  onPress={() => {
                    // TODO: Open Google Maps picker
                    const address = newEventLocation || 'Lisboa, Portugal';
                    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
                  }}
                >
                  <Ionicons name="map" size={20} color="#10b981" />
                </TouchableOpacity>
              </View>
              <Text style={styles.locationHint}>
                Será aberto no Google Maps para navegação
              </Text>

              <Text style={styles.modalLabel}>Data</Text>
              <TouchableOpacity style={styles.dateTimeButton}>
                <Ionicons name="calendar-outline" size={20} color="#00d9ff" />
                <Text style={styles.dateTimeText}>{formatSelectedDate()}</Text>
              </TouchableOpacity>

              <Text style={styles.modalLabel}>Hora</Text>
              <View style={styles.timeOptions}>
                {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[styles.timeChip, newEventTime === time && styles.timeChipActive]}
                    onPress={() => setNewEventTime(time)}
                  >
                    <Text style={[styles.timeChipText, newEventTime === time && styles.timeChipTextActive]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowNewEventModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={() => {
                  // TODO: Implementar apiService.post('/mobile/visits', visitData) quando backend estiver pronto
                  setShowNewEventModal(false);
                  setNewEventTitle('');
                  setNewEventDescription('');
                  setNewEventLocation('');
                  
                  // ✅ NOVO: Forçar reload da agenda
                  navigation.navigate('Agenda', { refresh: Date.now() });
                }}
              >
                <LinearGradient
                  colors={['#00d9ff', '#0099cc']}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>Criar Evento</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1f2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  createButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  viewModeContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  viewModeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  viewModeTabActive: {
    backgroundColor: '#00d9ff',
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  viewModeTextActive: {
    color: '#0a0e1a',
    fontWeight: '700',
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'capitalize',
  },
  weekContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: 44,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1f2e',
  },
  dayButtonSelected: {
    backgroundColor: '#00d9ff',
  },
  dayButtonToday: {
    borderWidth: 2,
    borderColor: '#00d9ff',
  },
  dayWeekday: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  dayTextSelected: {
    color: '#0a0e1a',
  },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00d9ff',
    marginTop: 4,
  },
  dayDotSelected: {
    backgroundColor: '#0a0e1a',
  },
  monthContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  monthWeekday: {
    width: 40,
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthDay: {
    width: `${100/7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  monthDaySelected: {
    backgroundColor: '#00d9ff',
    borderRadius: 20,
  },
  monthDayToday: {
    borderWidth: 2,
    borderColor: '#00d9ff',
    borderRadius: 20,
  },
  monthDayPrev: {
    opacity: 0.3,
  },
  monthDayText: {
    fontSize: 14,
    color: '#ffffff',
  },
  monthDayTextSelected: {
    color: '#0a0e1a',
    fontWeight: '700',
  },
  monthDayTextPrev: {
    color: '#6b7280',
  },
  monthDayDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00d9ff',
  },
  monthDayDotSelected: {
    backgroundColor: '#0a0e1a',
  },
  dayViewContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dayViewDate: {
    fontSize: 20,
    fontWeight: '600',
    color: '#00d9ff',
    textTransform: 'capitalize',
  },
  eventsSection: {
    paddingHorizontal: 20,
  },
  eventsSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 16,
  },
  eventsTitleCyan: {
    color: '#00d9ff',
    fontWeight: '600',
  },
  emptyEvents: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#1a1f2e',
    borderRadius: 16,
  },
  emptyEventsText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 16,
  },
  emptyEventsButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00d9ff',
  },
  emptyEventsButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#00d9ff',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  eventTypeIndicator: {
    width: 4,
  },
  eventContent: {
    flex: 1,
    padding: 14,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  eventTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTime: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00d9ff',
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 6,
  },
  eventLead: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 12,
    color: '#6b7280',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0a0e1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#00d9ff40',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff10',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalScroll: {
    padding: 20,
    maxHeight: 450,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 10,
    marginTop: 16,
  },
  eventTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  eventTypeButton: {
    width: '30%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1a1f2e',
  },
  eventTypeLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 6,
  },
  modalInput: {
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#333',
  },
  dateTimeText: {
    fontSize: 15,
    color: '#ffffff',
    textTransform: 'capitalize',
  },
  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1a1f2e',
    borderWidth: 1,
    borderColor: '#333',
  },
  timeChipActive: {
    backgroundColor: '#00d9ff20',
    borderColor: '#00d9ff',
  },
  timeChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  timeChipTextActive: {
    color: '#00d9ff',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#ffffff10',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6b7280',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  saveButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationInput: {
    flex: 1,
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#333',
  },
  mapsButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#10b98120',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#10b98140',
  },
  locationHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 6,
    fontStyle: 'italic',
  },
});
