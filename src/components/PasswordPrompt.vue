<template>
  <div class="password-prompt">
    <div class="modal fade show" style="display: block;" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Enter Password</h5>
          </div>
          <div class="modal-body">
            <input v-model="passwordInput" type="password" class="form-control" @keyup.enter="checkPassword" placeholder="Password">
            <div v-if="error" class="text-danger mt-2">{{ error }}</div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click="checkPassword">Submit</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PasswordPrompt',
  props: {
    correctPassword: {
      type: String,
      required: true,
    },
    storageKey: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      passwordInput: '',
      error: '',
    };
  },
  methods: {
    checkPassword() {
      if (this.passwordInput === this.correctPassword) {
        localStorage.setItem(this.storageKey, 'true');
        this.$emit('authenticated');
      } else {
        this.error = 'Incorrect password.';
      }
    },
  },
};
</script>

<style scoped>
.password-prompt {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1050;
}
</style>
