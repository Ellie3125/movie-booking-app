import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import {
  ActionButton,
  Chip,
  HeroCard,
  PageScroll,
  SectionCard,
  SectionTitle,
  getTonePalette,
} from '@/components/ui/experience';
import { useAppStore } from '@/lib/app-store';

const emptyForm = {
  id: undefined as string | undefined,
  cinemaId: '',
  name: '',
  screenLabel: 'SCREEN',
  totalRows: '6',
  totalColumns: '10',
};

export default function AdminRoomsScreen() {
  const { rooms, cinemas, upsertRoom, deleteRoom } = useAppStore();
  const colors = getTonePalette('admin');
  const [form, setForm] = useState({
    ...emptyForm,
    cinemaId: cinemas[0]?.id ?? '',
  });

  const submit = () => {
    if (!form.name.trim() || !form.cinemaId) {
      return;
    }

    upsertRoom({
      id: form.id,
      cinemaId: form.cinemaId,
      name: form.name.trim(),
      screenLabel: form.screenLabel.trim() || 'SCREEN',
      totalRows: Number(form.totalRows) || 1,
      totalColumns: Number(form.totalColumns) || 1,
    });

    setForm({
      ...emptyForm,
      cinemaId: cinemas[0]?.id ?? '',
    });
  };

  return (
    <PageScroll tone="admin">
      <HeroCard
        tone="admin"
        eyebrow="Admin / Rooms"
        title="Room CRUD and seat layout builder"
        description="Room luu so hang, so cot va seat layout. Admin chon o nao khong phai ghe thi o do se bien mat ben user."
      />

      <SectionTitle
        tone="admin"
        title={form.id ? 'Edit room' : 'Create room'}
        description="Sau khi tao room, vao seat layout de scan ra bang ghe va toggle o trong."
      />
      <SectionCard tone="admin">
        <View style={styles.chipRow}>
          {cinemas.map((cinema) => (
            <Chip
              key={cinema.id}
              tone="admin"
              label={`${cinema.brand} ${cinema.name}`}
              active={form.cinemaId === cinema.id}
              onPress={() => setForm((current) => ({ ...current, cinemaId: cinema.id }))}
            />
          ))}
        </View>
        <TextInput
          placeholder="Room name"
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          value={form.name}
          onChangeText={(name) => setForm((current) => ({ ...current, name }))}
        />
        <TextInput
          placeholder="Screen label"
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          value={form.screenLabel}
          onChangeText={(screenLabel) => setForm((current) => ({ ...current, screenLabel }))}
        />
        <View style={styles.buttonRow}>
          <TextInput
            placeholder="Rows"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            style={[styles.input, styles.flexInput, { color: colors.text, borderColor: colors.border }]}
            value={form.totalRows}
            onChangeText={(totalRows) => setForm((current) => ({ ...current, totalRows }))}
          />
          <TextInput
            placeholder="Columns"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            style={[styles.input, styles.flexInput, { color: colors.text, borderColor: colors.border }]}
            value={form.totalColumns}
            onChangeText={(totalColumns) => setForm((current) => ({ ...current, totalColumns }))}
          />
        </View>
        <ActionButton tone="admin" label={form.id ? 'Update room' : 'Create room'} onPress={submit} />
      </SectionCard>

      <SectionTitle
        tone="admin"
        title="Room list"
        description="Mo seat builder de tao ma tran ghe va mapping toa do / ten ghe."
      />
      {rooms.map((room) => {
        const cinema = cinemas.find((item) => item.id === room.cinemaId);

        return (
          <SectionCard key={room.id} tone="admin">
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {room.name} • {cinema?.brand} {cinema?.name}
            </Text>
            <Text style={[styles.cardCopy, { color: colors.muted }]}>
              {room.totalRows} rows • {room.totalColumns} columns • {room.activeSeatCount} active seats
            </Text>
            <View style={styles.buttonRow}>
              <ActionButton
                tone="admin"
                variant="secondary"
                label="Edit"
                onPress={() =>
                  setForm({
                    id: room.id,
                    cinemaId: room.cinemaId,
                    name: room.name,
                    screenLabel: room.screenLabel,
                    totalRows: String(room.totalRows),
                    totalColumns: String(room.totalColumns),
                  })
                }
              />
              <Link href={`/admin/rooms/${room.id}/seat-layout`} style={[styles.link, { color: colors.accent }]}>
                Seat layout
              </Link>
              <ActionButton tone="admin" label="Delete" onPress={() => deleteRoom(room.id)} />
            </View>
          </SectionCard>
        );
      })}
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  flexInput: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  cardCopy: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  link: {
    fontSize: 14,
    fontWeight: '800',
  },
});
