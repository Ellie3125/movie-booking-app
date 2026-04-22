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

const brands = ['CGV', 'Beta', 'Lotte'];

const emptyForm = {
  id: undefined as string | undefined,
  brand: 'CGV',
  name: '',
  city: 'Ha Noi',
  address: '',
  hotline: '',
  features: '',
};

export default function AdminCinemasScreen() {
  const { cinemas, upsertCinema, deleteCinema } = useAppStore();
  const colors = getTonePalette('admin');
  const [form, setForm] = useState(emptyForm);

  const submit = () => {
    if (!form.name.trim() || !form.address.trim()) {
      return;
    }

    upsertCinema({
      id: form.id,
      brand: form.brand,
      name: form.name.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
      hotline: form.hotline.trim(),
      features: form.features
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    });
    setForm(emptyForm);
  };

  return (
    <PageScroll tone="admin">
      <HeroCard
        tone="admin"
        eyebrow="Admin / Cinemas"
        title="CRUD cinema branches"
      />

      <SectionTitle tone="admin" title={form.id ? 'Edit cinema' : 'Create cinema'} />
      <SectionCard tone="admin">
        <View style={styles.chipRow}>
          {brands.map((brand) => (
            <Chip
              key={brand}
              tone="admin"
              label={brand}
              active={form.brand === brand}
              onPress={() => setForm((current) => ({ ...current, brand }))}
            />
          ))}
        </View>
        <TextInput
          placeholder="Cinema name"
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          value={form.name}
          onChangeText={(name) => setForm((current) => ({ ...current, name }))}
        />
        <TextInput
          placeholder="City"
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          value={form.city}
          onChangeText={(city) => setForm((current) => ({ ...current, city }))}
        />
        <TextInput
          placeholder="Address"
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          value={form.address}
          onChangeText={(address) => setForm((current) => ({ ...current, address }))}
        />
        <TextInput
          placeholder="Hotline"
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          value={form.hotline}
          onChangeText={(hotline) => setForm((current) => ({ ...current, hotline }))}
        />
        <TextInput
          placeholder="Features, comma separated"
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          value={form.features}
          onChangeText={(features) => setForm((current) => ({ ...current, features }))}
        />
        <ActionButton tone="admin" label={form.id ? 'Update cinema' : 'Create cinema'} onPress={submit} />
      </SectionCard>

      <SectionTitle tone="admin" title="Branch list" />
      {cinemas.map((cinema) => (
        <SectionCard key={cinema.id} tone="admin">
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {cinema.brand} {cinema.name}
          </Text>
          <Text style={[styles.cardCopy, { color: colors.muted }]}>{cinema.address}</Text>
          <Text style={[styles.cardCopy, { color: colors.muted }]}>
            {cinema.city} • {cinema.features.join(' • ')}
          </Text>
          <View style={styles.buttonRow}>
            <ActionButton
              tone="admin"
              variant="secondary"
              label="Edit"
              onPress={() =>
                setForm({
                  id: cinema.id,
                  brand: cinema.brand,
                  name: cinema.name,
                  city: cinema.city,
                  address: cinema.address,
                  hotline: cinema.hotline,
                  features: cinema.features.join(', '),
                })
              }
            />
            <ActionButton tone="admin" label="Delete" onPress={() => deleteCinema(cinema.id)} />
          </View>
        </SectionCard>
      ))}
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
    gap: 10,
  },
});
