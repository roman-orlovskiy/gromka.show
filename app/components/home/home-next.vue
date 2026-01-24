<template>
  <section class="home-next">
    <div class="home-next__content">
      <h2 class="home-next__title">Next view</h2>
      <p class="home-next__text">Заглушка следующего блока. Здесь будет следующий экран.</p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use "@/assets/scss/variables.scss" as *;

.home-next {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  &__content {
    text-align: center;
    padding: 2rem;
  }

  &__title {
    margin: 0 0 1rem 0;
    font-size: 2.444rem; // 44px
    color: $color-black;
    font-weight: $font-weight-medium;
    font-family: $font-default;
  }

  &__text {
    margin: 0;
    font-size: 1rem;
    font-family: $font-inter;
    color: $color-gray-700;
    max-width: 36rem;
  }
}
</style>

