<script lang="ts">
  import "./layout.css";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import {
    TriangleAlert,
    FileQuestionMark,
    Lock,
    ServerCrash,
  } from "@lucide/svelte";

  const status = $derived(page.status);

  const content = $derived.by(() => {
    switch (status) {
      case 404:
        return {
          icon: FileQuestionMark,
          title: "Halaman Tidak Ditemukan",
          desc: "Halaman yang kamu cari mungkin sudah dipindah atau tidak pernah ada.",
        };
      case 401:
        return {
          icon: Lock,
          title: "Belum Login",
          desc: "Kamu perlu login dulu untuk mengakses halaman ini.",
        };
      case 403:
        return {
          icon: Lock,
          title: "Akses Ditolak",
          desc: "Kamu tidak punya izin untuk mengakses halaman ini.",
        };
      case 500:
        return {
          icon: ServerCrash,
          title: "Terjadi Kesalahan Server",
          desc: "Ada masalah di sisi kami. Coba lagi beberapa saat lagi.",
        };
      default:
        return {
          icon: TriangleAlert,
          title: "Terjadi Kesalahan",
          desc: page.error?.message ?? "Sesuatu tidak berjalan sesuai rencana.",
        };
    }
  });
</script>

<div
  class="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center"
>
  <content.icon class="h-12 w-12 text-neutral-400" />
  <h1 class="text-2xl font-semibold">{content.title}</h1>
  <p class="max-w-md text-neutral-500">{content.desc}</p>
  <a
    href={resolve("/")}
    class="mt-2 rounded-md bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-700"
  >
    Kembali ke Beranda
  </a>
</div>
