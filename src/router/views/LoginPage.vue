<template>
  <div>
    <form class="form--login">
      <label class="label--login-form" for="userId"> ID </label>
      <input type="text" id="userId" v-model="userId" />
      <label class="label--login-form" for="password"> Password </label>
      <input type="password" id="password" v-model="password" />
      <label class="label--login-form" for="nickname"> Nickname </label>
      <input type="text" id="nickname" v-model="nickname" />
      <button class="button--sign-in" @click="submit">Sign In</button>
    </form>
    <hr />
    <button @click="startLogin">login</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userId: "",
      password: "",
      nickname: "",
    };
  },
  methods: {
    async submit(e) {
      e.preventDefault();
      const response = await this.$axios.post(
        "http://localhost:8080/api/user/",
        {
          username: this.userId,
          password: this.password,
          displayName: this.nickname,
        }
      );
      console.log(response.data);
      localStorage.setItem("userId", response.data);
    },
    async startLogin() {
      const response = (
        await this.$axios.get(
          "http://localhost:8080/api/auth/credential/options",
          {}
        )
      ).data;
      console.log(response);

      const publicKeyCredentialCreateOptions = {
        challenge: Uint8Array.from(response.challenge, (c) => c.charCodeAt(0)),
        rp: {
          name: response.rp.name,
          id: response.rp.id,
        },
        user: {
          id: Uint8Array.from(response.user.id, (c) => c.charCodeAt(0)),
          name: response.user.name,
          displayName: response.user.displayName,
        },
        authenticatorSelection: {
          attachment: response.authenticatorSelection.attachment,
          requireResidentKey: response.requireResidentKey,
          residentKey: response.residentKey,
          residentKeyRequired: response.residentKeyRequired,
        },
        pubKeyCredParams: response.pubKeyCredParams,
        timeout: response.timeout,
        attestation: response.attestation,
      };
      console.log(publicKeyCredentialCreateOptions);
      const publicKeyCredential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreateOptions,
      });
      console.log("=== credential ===");
      console.log(publicKeyCredential);
      window.localStorage.setItem("publickeyCredential", publicKeyCredential);

      this.$axios.post(
        "http://localhost:8080/api/auth/credential/attestation",
        {
          authenticatorAttachment: publicKeyCredential.authenticatorAttachment,
          id: publicKeyCredential.id,
          attestationObject: this.arrayBufferToBase64(
            publicKeyCredential.response.attestationObject
          ),
          clientDataJSON: this.arrayBufferToBase64(
            publicKeyCredential.response.clientDataJSON
          ),
          type: publicKeyCredential.type,
        }
      );
    },
    arrayBufferToBase64(arrayBuffer) {
      return window.btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    },
  },
};
</script>

<style scoped>
.form--login {
  display: flex;
  flex-direction: column;
  width: 50vw;
}
.form--login > input {
  height: 25px;
  font-size: 18px;
  border-width: 1.5px;
  border-radius: 7px;
}
.label--login-form {
  display: flex;
  margin-left: 5px;
  margin-top: 10px;
  margin-bottom: 10px;
  font-weight: 600;
}
.button--sign-in {
  margin-top: 40px;
  font-size: 20px;
  font-weight: 700;
}
</style>
