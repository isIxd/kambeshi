<template>
  <v-row no-gutters :class="infoClass">
    <v-col :class="infoNameClass" cols="12">{{ name }}</v-col>
    <v-col :class="infoArtistClass" cols="12"
      >{{ artist
      }}<span id="releaseDate">{{ releaseDate }} {{ $vuetify.breakpoint.name }}</span></v-col
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
    infoNameClass: function() {
      return {
        'text-h1': this.size == 1,
        'text-h2': this.size == 2,
        'text-h3': this.size == 3,
        'text-h4': this.size == 4,
      }
    },
    infoArtistClass: function() {
      return {
        'text-h3': this.size == 1,
        'text-h4': this.size == 2,
        'text-h5': this.size == 3,
        'text-h6': this.size == 4,
      }
    },
    infoClass: function() {
      return {
        'info-xs': this.$vuetify.breakpoint.xs,
        'info-smAndUp': this.$vuetify.breakpoint.smAndUp,
        'info-mdAndUp': this.$vuetify.breakpoint.mdAndUp,
      }
    },
  },
}
</script>

<style lang="sass">

#info
  margin:
    top: 24px
.info
.info-xs
.info-smAndUp
  margin:
    bottom: -76px
.info-mdAndUp
  position: absolute
  bottom: 100px
  margin:
    bottom: -76px
  overflow: hidden
</style>
