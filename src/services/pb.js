import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

pb.authStore.onChange(() => {
  console.log('Auth store changed:', pb.authStore.isValid, pb.authStore.token);
});

export default pb;