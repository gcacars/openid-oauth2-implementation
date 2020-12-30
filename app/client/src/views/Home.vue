<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    <pre>
      <code v-html="user"></code>
    </pre>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue';
import Auth from '../app/Auth';

export default {
  name: 'Home',
  components: {
    HelloWorld,
  },
  
  data: () => ({
    user: null,
  }),
  
  created() {
    console.log(Auth.events.userLoaded);
    /*await Auth.events.userLoaded(async (x) => {
      console.log('login', x);
      const user = await Auth.getUser();
      console.log('user', user);
      this.user = user;
    });*/
  },
};
</script>
