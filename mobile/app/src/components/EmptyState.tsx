/**
 * EmptyState - Componente para estados vazios
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  icon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: Typography.sizes.md,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    maxWidth: 300,
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  buttonText: {
    color: '#fff',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
});
