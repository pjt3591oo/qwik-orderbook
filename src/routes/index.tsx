import { component$, useStore, $, useClientEffect$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Coin } from '~/components/coin';
import { Orderbook } from '~/components/orderbook';

export default component$(() => {
  const store = useStore({
    code: 'KRW-BTC',
    coins: [],
  });

  const onCodeChangeHandler$ = $((code: string) => {
    store.code = code;
  })

  useClientEffect$(async () => {
    const res = await fetch('https://api.upbit.com/v1/market/all?isDetails=true')
    
    const coins = await res.json();
    store.coins = coins.filter((coin: Coin) => {
      return coin.market.slice(0, 3) === 'KRW';
    })
  })

  return (
    <div>
      <div style={{display: 'flex'}}>
        <div style={{width: '50%'}}>
          <Orderbook code={store.code}/>
        </div>

        <div style={{width: '50%'}}>
          <Coin 
            onCodeChangeHandler$={onCodeChangeHandler$}
            code={store.code}
            coins={store.coins}
          />
        </div>
      </div>
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
