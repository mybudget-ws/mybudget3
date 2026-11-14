
<script setup>
import { useBlog } from '~/composables/useBlog';
const { posts } = useBlog();

useSeoMeta({
  title: 'Новости и обновления — MyBudget',
  description: 'Новости, обновления и развитие MyBudget.',
});

const formatDate = (date) => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
};
</script>

<template>
  <div class='container-xl'>
    <div class='page-header mb-4'>
      <div>
        <h1 class='page-title'>Новости и обновления</h1>
        <div class='text-secondary mt-1'>
          Новости, изменения и развитие MyBudget.
        </div>
      </div>
    </div>

    <div v-if='posts.length' class='row row-cards'>
      <div
        v-for='post in posts'
        :key='post.slug'
        class='col-12'
      >
        <NuxtLink
          :to='`/blog/${post.slug}/`'
          class='card card-link'
        >
          <div class='card-body'>
            <div class='text-secondary small mb-2'>
              {{ formatDate(post.date) }}
            </div>

            <h2 class='card-title mb-2'>
              {{ post.title }}
            </h2>

            <div class='text-secondary'>
              {{ post.description }}
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <div v-else class='empty'>
      <p class='empty-title'>Публикаций пока нет</p>
    </div>
  </div>
</template>
