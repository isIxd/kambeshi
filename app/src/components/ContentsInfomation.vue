<template>
  <v-row no-gutters>
    <v-col :class="contentsInfoNameClass" cols="12">{{ name }}</v-col>
    <v-col :class="contentsInfoArtistClass" cols="12"
      >{{ artist
      }}<span class="releaseDate">{{ releaseDate }} {{ $vuetify.breakpoint.name }}</span></v-col
    >
    <slot> </slot>
  </v-row>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      default: '',
      required: true,
    },
    artist: {
      type: String,
      default: '',
      required: true,
    },
    releaseDate: {
      type: String,
      default: '',
      required: true,
    },
    size: {
      type: Number,
      default: 2,
      validator: function(value) {
        return 1 <= value && value <= 4
      },
    },
  },
  computed: {
    contentsInfoNameClass: function() {
      return {
        'text-h1': this.size == 1,
        'text-h2': this.size == 2,
        'text-h3': this.size == 3,
        'text-h4': this.size == 4,
      }
    },
    contentsInfoArtistClass: function() {
      return {
        'text-h3': this.size == 1,
        'text-h4': this.size == 2,
        'text-h5': this.size == 3,
        'text-h6': this.size == 4,
      }
    },
  },
}
</script>

<style lang="sass" scoped>
.releaseDate
  &::before
   content: "・"
</style>
