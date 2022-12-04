import { component$, useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Orderbook } from '~/components/orderbook';

export default component$(() => {
  const store = useStore({
    code: 'KRW-BTC'
  });

  return (
    <div>
      <button onClick$={() => store.code = 'KRW-BTC'}>KRW-BTC</button>
      <button onClick$={() => store.code = 'KRW-ETH'}>KRW-ETH</button>
      <button onClick$={() => store.code = 'KRW-CELO'}>KRW-CELO</button>
      <Orderbook code={store.code}/>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'mung exchange',
  meta: [
    {
      name: 'description',
      content: 'orderbook of mung exchange',
    },
  ],
};
