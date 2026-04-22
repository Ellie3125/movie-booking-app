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
import { type MovieStatus, useAppStore } from '@/lib/app-store';

const statuses: MovieStatus[] = ['now_showing', 'coming_soon', 'ended'];

const emptyForm = {
  id: undefined as string | undefined,
  title: '',
  description: '',
  duration: '120',
  genre: 'Action, Drama',
  poster: 'https://images.unsplash.com/photo-1517602302552-471fe67acf66?auto=format&fit=crop&w=900&q=80',
  releaseDate: '2026-05-01',
  status: 'coming_soon' as MovieStatus,
  language: 'English subtitle',
  rating: 'T13',
  formats: '2D, IMAX',
  featuredNote: 'Marketing note',
};

export default function AdminMoviesScreen() {
  const { movies, upsertMovie, deleteMovie } = useAppStore();
  const colors = getTonePalette('admin');
  const [form, setForm] = useState(emptyForm);

  const submit = () => {
    if (!form.title.trim()) {
      return;
    }

    upsertMovie({
      id: form.id,
      title: form.title.trim(),
      description: form.description.trim(),
      duration: Number(form.duration) || 0,
      genre: form.genre.split(',').map((item) => item.trim()).filter(Boolean),
      poster: form.poster.trim(),
      releaseDate: form.releaseDate,
      status: form.status,
      language: form.language.trim(),
      rating: form.rating.trim(),
      formats: form.formats.split(',').map((item) => item.trim()).filter(Boolean),
      featuredNote: form.featuredNote.trim(),
    });

    setForm(emptyForm);
  };

  return (
    <PageScroll tone="admin">
      <HeroCard
        tone="admin"
        eyebrow="Admin / Movies"
        title="Movie CRUD with user sync"
      />

      <SectionTitle tone="admin" title={form.id ? 'Edit movie' : 'Create movie'} />
      <SectionCard tone="admin">
        <TextInput
          placeholder="Movie title"
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          value={form.title}
          onChangeText={(title) => setForm((current) => ({ ...current, title }))}
        />
        <TextInput
          placeholder="Description"
          placeholderTextColor={colors.muted}
          multiline
          style={[styles.input, styles.textarea, { color: colors.text, borderColor: colors.border }]}
          value={form.description}
          onChangeText={(description) => setForm((current) => ({ ...current, description }))}
        />
        <TextInput
          placeholder="Duration"
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          value={form.duration}
          keyboardType="numeric"
          onChangeText={(duration) => setForm((current) => ({ ...current, duration }))}
        />
        <TextInput
          placeholder="Genres"
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          value={form.genre}
          onChangeText={(genre) => setForm((current) => ({ ...current, genre }))}
        />
        <TextInput
          placeholder="Poster URL"
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          value={form.poster}
          onChangeText={(poster) => setForm((current) => ({ ...current, poster }))}
        />
        <TextInput
          placeholder="Release date YYYY-MM-DD"
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          value={form.releaseDate}
          onChangeText={(releaseDate) => setForm((current) => ({ ...current, releaseDate }))}
        />
        <View style={styles.chipRow}>
          {statuses.map((status) => (
            <Chip
              key={status}
              tone="admin"
              label={status}
              active={form.status === status}
              onPress={() => setForm((current) => ({ ...current, status }))}
            />
          ))}
        </View>
        <TextInput
          placeholder="Language"
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          value={form.language}
          onChangeText={(language) => setForm((current) => ({ ...current, language }))}
        />
        <TextInput
          placeholder="Rating"
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          value={form.rating}
          onChangeText={(rating) => setForm((current) => ({ ...current, rating }))}
        />
        <TextInput
          placeholder="Formats"
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          value={form.formats}
          onChangeText={(formats) => setForm((current) => ({ ...current, formats }))}
        />
        <TextInput
          placeholder="Featured note"
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          value={form.featuredNote}
          onChangeText={(featuredNote) => setForm((current) => ({ ...current, featuredNote }))}
        />
        <ActionButton tone="admin" label={form.id ? 'Update movie' : 'Create movie'} onPress={submit} />
      </SectionCard>

      <SectionTitle tone="admin" title="Movie list" />
      {movies.map((movie) => (
        <SectionCard key={movie.id} tone="admin">
          <Text style={[styles.cardTitle, { color: colors.text }]}>{movie.title}</Text>
          <Text style={[styles.cardCopy, { color: colors.muted }]}>
            {movie.genre.join(' • ')} • {movie.duration} min • {movie.status}
          </Text>
          <Text style={[styles.cardCopy, { color: colors.muted }]}>{movie.featuredNote}</Text>
          <View style={styles.buttonRow}>
            <ActionButton
              tone="admin"
              variant="secondary"
              label="Edit"
              onPress={() =>
                setForm({
                  id: movie.id,
                  title: movie.title,
                  description: movie.description,
                  duration: String(movie.duration),
                  genre: movie.genre.join(', '),
                  poster: movie.poster,
                  releaseDate: movie.releaseDate.slice(0, 10),
                  status: movie.status,
                  language: movie.language,
                  rating: movie.rating,
                  formats: movie.formats.join(', '),
                  featuredNote: movie.featuredNote,
                })
              }
            />
            <ActionButton tone="admin" label="Delete" onPress={() => deleteMovie(movie.id)} />
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
  textarea: {
    minHeight: 96,
    paddingVertical: 12,
    textAlignVertical: 'top',
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
