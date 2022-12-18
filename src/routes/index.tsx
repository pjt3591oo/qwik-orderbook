import { component$, useStore, $, useServerMount$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import Chart from '~/components/chart';
import { ICoin, Coins } from '~/components/coin';
import { Orderbook } from '~/components/orderbook';

export default component$(() => {
  const store = useStore({
    code: 'KRW-BTC',
    coins: [],
  });

  const onCodeChangeHandler$ = $((code: string) => {
    store.code = code;
  })

  useServerMount$(async () => {
    const res = await fetch('https://api.upbit.com/v1/market/all?isDetails=true')
    
    const coins = await res.json();
    store.coins = coins.filter((coin: ICoin) => {
      return coin.market.slice(0, 3) === 'KRW';
    })
  })

  return (
    <div>
      <div style={{width: '100%', maxWidth: 1024}}>
        <Chart code={store.code}/>
      </div>
      
      <div style={{display: 'flex', maxWidth: 1024}}>
        <div style={{width: '50%'}}>
          <Orderbook code={store.code}/>
        </div>

        <div style={{width: '50%'}}>
          <Coins 
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
