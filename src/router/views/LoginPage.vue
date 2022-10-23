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
    <button class="button--auth" @click="regist">Regist Credential</button>
    <button class="button--auth" @click="login">login</button>
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
    async login() {
      const response = (
        await this.$axios.get(
          "http://localhost:8080/api/auth/credential/request/options",
          {}
        )
      ).data;
      console.log("pubKeyCredReqOpts");
      console.log(response);
      const allowCredentials = new Array(response.allowCredentials)[0];
      console.log("credentialId");
      console.log(allowCredentials[0].id);
      const publicKeyCredentialRequestOptions = {
        challenge: Uint8Array.from(response.challenge, (c) => c.charCodeAt(0)),
        allowCredentials: [
          // {
          //   id: Uint8Array.from(allowCredentials[0].id, (c) => c.charCodeAt(0)),
          //   type: allowCredentials[0].type,
          //   transports: [...allowCredentials[0].transports, "ble"],
          // },
        ],
        timeout: response.timeout,
        userVerification: "required",
        rpId: response.rpId,
      };
      console.log(publicKeyCredentialRequestOptions);
      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      });

      console.log(":::Assertion:::");
      console.log(assertion);

      this.$axios.post("http://localhost:8080/api/auth/credential/assertion", {
        id: assertion.id,
        authenticatorData: this.arrayBufferToBase64(
          assertion.response.authenticatorData
        ),
        clientDataJSON: this.arrayBufferToBase64(
          assertion.response.clientDataJSON
        ),
        signature: this.arrayBufferToBase64(assertion.response.signature),
        userHandle: this.arrayBufferToBase64(assertion.response.userHandle),
        type: assertion.type,
      });
    },
    async regist() {
      const response = (
        await this.$axios.get(
          "http://localhost:8080/api/auth/credential/creating/options",
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
          authenticatorAttachment:
            response.authenticatorSelection.authenticatorAttachment,
          requireResidentKey:
            response.authenticatorSelection.requireResidentKey,
          residentKey: response.authenticatorSelection.residentKey,
          userVerification: response.authenticatorSelection.userVerification,
        },
        pubKeyCredParams: response.pubKeyCredParams,
        timeout: response.timeout,
        attestation: response.attestation,
      };
      console.log("=== 전달 할 값 ===");
      console.log(publicKeyCredentialCreateOptions);
      const publicKeyCredential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreateOptions,
      });
      console.log("=== credential ===");
      console.log(publicKeyCredential);

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

.button--auth {
  margin: 50px;
  width: fit-content;
  height: 30px;
  font-weight: 600;
  font-size: 20px;
  background-color: #f2a2a2;
  border: #a2a2a2;
}
</style>
