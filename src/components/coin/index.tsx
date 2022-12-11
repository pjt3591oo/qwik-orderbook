/* eslint-disable qwik/valid-lexical-scope */
import { component$, PropFunction, useClientEffect$, useStore } from "@builder.io/qwik";
import { BorderCell } from "./border-cell";
import './index.css';

export interface Coin {
  market_warning: string; //"NONE",
  market: string; //"KRW-BTC",
  korean_name: string; // "비트코인",
  english_name: string; //"Bitcoin"
}

interface Props {
  code: string;
  coins: Coin[];
  onCodeChangeHandler$: PropFunction<(code: string) => void>;
}

interface Ticker {
  acc_ask_volume: string;
  acc_bid_volume: string;
  acc_trade_price: string;
  acc_trade_price_24h: string;
  acc_trade_volume: string;
  acc_trade_volume_24h: string;
  ask_bid: string;
  change: string;
  change_price: string;
  change_rate: string;
  code: string;
  delisting_date: string;
  high_price: string;
  highest_52_week_date: string;
  highest_52_week_price: string;
  is_trading_suspended: string;
  low_price: string;
  lowest_52_week_date: string;
  lowest_52_week_price: string;
  market_state: string;
  market_warning: string;
  opening_price: string;
  prev_closing_price: string;
  signed_change_price: string;
  signed_change_rate: string;
  stream_type: string;
  timestamp: string;
  trade_date: string;
  trade_price: string;
  trade_time: string;
  trade_timestamp: string;
  trade_volume: string;
  type: string;
}

export const Coin = component$((props: {coins: Props['coins'], onCodeChangeHandler$: Props['onCodeChangeHandler$'], code: Props['code']}) => {
  const store = useStore({
    price: {} as any,
  });

  useClientEffect$(async ({track}) => {
    const coins = track(() => props.coins);
    const ws = new WebSocket('wss://api.upbit.com/websocket/v1');
    const codes = coins.map((coin: Coin) => coin.market)//.slice(0, 20);

    const payload = [
      {ticket: 'UNIQUE_TICKET'},
      {type: 'ticker', codes,},
    ];
    ws.addEventListener('open', ()=> {
      ws.send(JSON.stringify(payload));
    });

    const receiveHandler = async (event: any) => {
      const data = JSON.parse(await event.data.text());
      const temp = {...store.price};
      temp[data.code] = data as Ticker;
      store.price = temp;
    }

    ws.addEventListener('message', receiveHandler);

    return () => {
      ws.removeEventListener('message', receiveHandler);
    }
  })

  const getColor = (change: 'RISE' | 'FALL'): string => {
    if (change === 'RISE') return 'up';
    else if (change === 'FALL') return 'down';
    return 'keep';
  }
  return (
    <div id="coin">
      <table>
        <thead>
          <tr>
            <th class="align-left">한글명</th>
            <th>현재가</th>
            <th>전일대비</th>
            <th>거래대금</th>
          </tr>
        </thead>
        <tbody>
          {props.coins.map((coin: Coin) => {
            return (
              <tr 
                key={`${coin.market}-${store.price[coin.market]?.trade_price}`}
                onClick$={() => props.onCodeChangeHandler$(coin.market)}
                class={`${props.code === coin.market ? 'select' : ''}`}
              >
                <td class="align-left">
                  <div class="data-name">{coin.korean_name}</div>
                  <div class="data-code">{coin.market}</div>
                </td>
                
                <BorderCell 
                  color={getColor(store.price[coin.market]?.change)} 
                  price={store.price[coin.market]?.trade_price || 0}
                  change={store.price[coin.market]?.change}
                  code={coin.market}
                />
                <td class="align-right">
                  <div class={`price ${getColor(store.price[coin.market]?.change)}`}>{(store.price[coin.market]?.signed_change_rate * 100 || 0)?.toLocaleString()}%</div>
                  <div class={`price ${getColor(store.price[coin.market]?.change)}`}>{store.price[coin.market]?.signed_change_price?.toLocaleString() || 0}</div>
                </td>
                <td class="align-right">
                  <span>{store.price[coin.market]?.trade_price}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
})

