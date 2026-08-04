<script setup>
import { useAuth } from '~/composables/use_auth';
const { isSignedIn } = useAuth();

setPageLayout(isSignedIn.value ? 'default' : 'landing');
</script>

<template>
  <Dashboard v-if='isSignedIn' />
  <Landing v-else />
</template>