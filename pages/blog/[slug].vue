
<script setup>
import { useBlog } from '~/composables/useBlog';

const route = useRoute();
const { getPost } = useBlog();

const post = getPost(route.params.slug);

if (!post) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Статья не найдена',
  });
}

useSeoMeta({
  title: post.title,
  description: post.description,
});
</script>

<template>
  <div class='container-xl'>
    <article class='blog-content'>
      <div class='mb-4'>
        <NuxtLink
          to='/blog/'
          class='text-secondary'
        >
          ← Все новости
        </NuxtLink>
      </div>

      <h1 class='mb-3'>
        {{ post.title }}
      </h1>

      <div class='text-secondary mb-4'>
        {{ new Intl.DateTimeFormat('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(new Date(`${post.date}T00:00:00`)) }}
      </div>

      <div
        class='blog-content-body'
        v-html='post.html'
      />
    </article>
  </div>
</template>
