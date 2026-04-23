import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { MoviePoster } from '@/components/ui/movie-poster';
import {
  ActionButton,
  Chip,
  HeroCard,
  PageScroll,
  SectionCard,
  SectionTitle,
  getTonePalette,
} from '@/components/ui/experience';
import { Fonts } from '@/constants/theme';
import { type MovieStatus, useAppStore } from '@/lib/app-store';

const statuses: MovieStatus[] = ['now_showing', 'coming_soon', 'ended'];

const createEmptyForm = () => ({
  id: undefined as string | undefined,
  title: '',
  description: '',
  duration: '120',
  genre: 'Action, Drama',
  poster: '',
  releaseDate: '2026-05-01',
  status: 'coming_soon' as MovieStatus,
  language: 'English subtitle',
  rating: 'T13',
  formats: '2D, IMAX',
  featuredNote: 'Marketing note',
});

export default function AdminMoviesScreen() {
  const { movies, upsertMovie, deleteMovie } = useAppStore();
  const colors = getTonePalette('admin');
  const [form, setForm] = useState(createEmptyForm);
  const [posterNotice, setPosterNotice] = useState('');
  const [pickingPoster, setPickingPoster] = useState(false);

  const resetForm = () => {
    setForm(createEmptyForm());
    setPosterNotice('');
  };

  const handlePickPoster = async () => {
    setPosterNotice('');
    setPickingPoster(true);

    try {
      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          setPosterNotice('Chưa có quyền truy cập thư viện ảnh để chọn poster.');
          setPickingPoster(false);
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [2, 3],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) {
        setPickingPoster(false);
        return;
      }

      const asset = result.assets[0];

      setForm((current) => ({ ...current, poster: asset.uri }));
      setPosterNotice('Đã chọn poster mới từ thư viện ảnh.');
    } catch {
      setPosterNotice('Không thể mở thư viện ảnh. Hãy thử lại hoặc dán URL poster.');
    } finally {
      setPickingPoster(false);
    }
  };

  const submit = () => {
    if (!form.title.trim()) {
      setPosterNotice('Tên phim là bắt buộc trước khi lưu.');
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

    resetForm();
  };

  return (
    <PageScroll tone="admin">
      <HeroCard
        tone="admin"
        eyebrow="Admin / Movies"
        title="Quản lý phim với poster preview và chọn ảnh trực tiếp."
        description="Form admin giờ hỗ trợ vừa dán URL poster vừa chọn ảnh từ thư viện để tạo hoặc cập nhật phim nhanh hơn." />

      <SectionTitle
        tone="admin"
        title={form.id ? 'Edit movie' : 'Create movie'}
        description="Poster được preview ngay trên form để kiểm tra trước khi lưu."
      />
      <SectionCard tone="admin">
        <View style={styles.posterComposer}>
          <MoviePoster
            uri={form.poster}
            title={form.title || 'Poster mới'}
            tone="admin"
            width={124}
            height={178}
            borderRadius={20}
          />
          <View style={styles.posterComposerBody}>
            <Text style={[styles.posterHeading, { color: colors.text }]}>Poster phim</Text>
            <Text style={[styles.posterCopy, { color: colors.muted }]}>
              Chọn ảnh từ thư viện hoặc dán một URL poster. Preview sẽ cập nhật ngay trên form.
            </Text>
            <View style={styles.buttonRow}>
              <ActionButton
                tone="admin"
                variant="secondary"
                label={pickingPoster ? 'Đang mở thư viện...' : 'Chọn từ thư viện'}
                onPress={handlePickPoster}
                disabled={pickingPoster}
                style={styles.flexButton}
              />
              <ActionButton
                tone="admin"
                label="Xóa poster"
                onPress={() => setForm((current) => ({ ...current, poster: '' }))}
                style={styles.flexButton}
              />
            </View>
            {posterNotice ? (
              <Text style={[styles.posterNotice, { color: colors.muted }]}>{posterNotice}</Text>
            ) : null}
          </View>
        </View>

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
          placeholder="Poster URL hoặc đường dẫn ảnh local"
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          value={form.poster}
          onChangeText={(poster) => setForm((current) => ({ ...current, poster }))}
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
        <ActionButton
          tone="admin"
          label={form.id ? 'Update movie' : 'Create movie'}
          onPress={submit}
        />
      </SectionCard>

      <SectionTitle
        tone="admin"
        title="Movie list"
        description="Danh sách admin cũng hiển thị poster để đối chiếu nhanh trước khi sửa hoặc xóa."
      />
      {movies.map((movie) => (
        <SectionCard key={movie.id} tone="admin" style={styles.listCard}>
          <MoviePoster
            uri={movie.poster}
            title={movie.title}
            tone="admin"
            width={102}
            height={146}
            borderRadius={18}
          />

          <View style={styles.listCardBody}>
            <View style={styles.listCardCopy}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{movie.title}</Text>
              <Text style={[styles.cardCopy, { color: colors.muted }]}>
                {movie.genre.join(' • ')} • {movie.duration} min • {movie.status}
              </Text>
              <Text numberOfLines={3} style={[styles.cardCopy, { color: colors.muted }]}>
                {movie.featuredNote}
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <ActionButton
                tone="admin"
                variant="secondary"
                label="Edit"
                style={styles.flexButton}
                onPress={() => {
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
                  });
                  setPosterNotice('Đang chỉnh poster và metadata của phim đã chọn.');
                }}
              />
              <ActionButton
                tone="admin"
                label="Delete"
                style={styles.flexButton}
                onPress={() => deleteMovie(movie.id)}
              />
            </View>
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
  posterComposer: {
    flexDirection: 'row',
    gap: 14,
  },
  posterComposerBody: {
    flex: 1,
    gap: 10,
  },
  posterHeading: {
    fontSize: 18,
    fontFamily: Fonts.sansBold,
  },
  posterCopy: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.sans,
  },
  posterNotice: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: Fonts.sans,
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
  listCard: {
    flexDirection: 'row',
    gap: 14,
  },
  listCardBody: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 12,
  },
  listCardCopy: {
    gap: 4,
  },
  cardTitle: {
    fontSize: 19,
    lineHeight: 24,
    fontFamily: Fonts.rounded,
  },
  cardCopy: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.sans,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  flexButton: {
    flex: 1,
  },
});
