import { mount } from '@vue/test-utils';
import makeRouter from '../../../src/router';
import store from '../../../src/store';
import AccountHorizontal from '../../../src/components/AccountHorizontal.vue';

const router = makeRouter(store);
const account = {
  given_name: 'Teste',
  family_name: 'Silva',
  picture: 'profile-avatar.png',
};

describe('AccountHorizontal.vue', () => {
  it('Apenas foto e nome', async () => {
    window.scrollTo = jest.fn();
    router.push('/public');
    await router.isReady();

    const wrapper = mount(AccountHorizontal, {
      global: {
        plugins: [router],
      },
      props: { account, logout: false },
    });

    expect(wrapper.get('span').text()).toMatch(account.given_name);
    expect(wrapper.get('img').attributes('src')).toMatch(account.picture);
    expect(wrapper.find('a').exists()).toBe(false);
    // O sobrenome não pode estar visível (LGPD)
    expect(wrapper.text().includes(account.family_name)).toBe(false);
  });

  it('Com link para sair (logout)', async () => {
    window.scrollTo = jest.fn();
    router.push('/public');
    await router.isReady();

    const wrapper = mount(AccountHorizontal, {
      global: {
        plugins: [router],
      },
      props: { account, logout: true },
    });

    expect(wrapper.find('a').exists()).toBe(true);
  });
});
