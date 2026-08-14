import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  Text,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useAddresses } from '../state/AddressesContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Address } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function AddressesScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const { addresses, deleteAddress, updateAddress } = useAddresses();
  const navigation = useNavigation<NavigationProp>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleDelete = (id: string) => {
    Alert.alert('حذف العنوان', 'هل تريد حذف هذا العنوان؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        onPress: () => deleteAddress(id),
        style: 'destructive',
      },
    ]);
  };

  const handleEditSave = async (id: string) => {
    if (editName.trim()) {
      await updateAddress(id, { name: editName.trim() });
      setEditingId(null);
      setEditName('');
    }
  };

  const renderAddress = ({ item }: { item: Address }) => {
    const isEditing = editingId === item.id;

    return (
      <View style={[styles.addressCard, { backgroundColor: theme.surface }]}>
        <View style={styles.addressHeader}>
          <Ionicons name="location" size={20} color={theme.primary} />
          {isEditing ? (
            <TextInput
              style={[
                styles.editInput,
                {
                  color: theme.text,
                  borderColor: theme.primary,
                  backgroundColor: theme.background,
                },
              ]}
              value={editName}
              onChangeText={setEditName}
              placeholder="اسم العنوان"
              placeholderTextColor={theme.textSecondary}
            />
          ) : (
            <Text style={[styles.addressName, { color: theme.text }]}>{item.name}</Text>
          )}
        </View>

        {item.notes && !isEditing && (
          <Text style={[styles.addressNotes, { color: theme.textSecondary }]}>{item.notes}</Text>
        )}

        <Text style={[styles.coordinates, { color: theme.textSecondary }]}>
          {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)} • {item.radius}m
        </Text>

        <View style={styles.actions}>
          {isEditing ? (
            <>
              <Pressable
                onPress={() => handleEditSave(item.id)}
                style={[styles.actionButton, { backgroundColor: theme.primary }]}
              >
                <Text style={[styles.actionText, { color: '#FFF' }]}>حفظ</Text>
              </Pressable>
              <Pressable
                onPress={() => setEditingId(null)}
                style={[styles.actionButton, { backgroundColor: theme.border }]}
              >
                <Text style={[styles.actionText, { color: theme.text }]}>إلغاء</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                onPress={() => {
                  setEditingId(item.id);
                  setEditName(item.name);
                }}
                style={[styles.actionButton, { backgroundColor: theme.primary + '40' }]}
              >
                <Ionicons name="pencil" size={18} color={theme.primary} />
              </Pressable>
              <Pressable
                onPress={() => handleDelete(item.id)}
                style={[styles.actionButton, { backgroundColor: '#FF6B6B40' }]}
              >
                <Ionicons name="trash" size={18} color="#FF6B6B" />
              </Pressable>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>العناوين المحفوظة</Text>
        <Pressable
          onPress={() => navigation.navigate('LocationPicker')}
          style={[styles.addButton, { backgroundColor: theme.primary }]}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </Pressable>
      </View>

      {addresses.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="location-outline" size={48} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            لا توجد عناوين محفوظة
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            اضغط الزر أعلاه لإضافة عنوان جديد
          </Text>
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          renderItem={renderAddress}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addressCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  addressNotes: {
    fontSize: 13,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  coordinates: {
    fontSize: 12,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
  },
});
