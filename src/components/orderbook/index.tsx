import { component$, useClientEffect$, useStore, } from "@builder.io/qwik";

import './index.css';

interface Order {
  ask_price: number;
  bid_price: number;
  ask_size: number;
  bid_size: number;
}

interface Orderbook {
  code: string;
  orderbook_units: Order[];
  stream_type: string;
  timestamp: number;
  total_ask_size: number;
  total_bid_size: number;
  type: number;
}

interface Props {
  code: string;
}

const Orderbook = component$((props: Props) => {
  const store = useStore({
    code: props.code,
    orderbook: {
      code: '',
      timestamp: 0,
      total_ask_size: 0,
      total_bid_size: 0,
      orderbook_units: [],
      stream_type: '',
    },
    trade: {
      prev_closing_price: 0,
    },
    ticker: {
      trade_price: 15,
    },
  });

  useClientEffect$(async ({track}) => {
    const code = track(() => props.code);
    const ws = new WebSocket('wss://api.upbit.com/websocket/v1');
    const payload = [
      {"ticket":"UNIQUE_TICKET"},
      {"type":"trade","codes":[code]},
      {"type":"orderbook","codes":[code]},
      {"type":"ticker", "codes":[code]
    }];

    ws.addEventListener('open', ()=> {
      ws.send(JSON.stringify(payload));
    });

    const receiveHandler = async (event: any) => {
      const data = JSON.parse(await event.data.text());
      
      if (data.type === 'orderbook') { 
        store.orderbook = data;
      } else if (data.type === 'trade') {
        store.trade = data;
      } else if (data.type === 'ticker') {
        store.ticker = data;
      }
    }

    ws.addEventListener('message', receiveHandler);

    return () => {
      ws.removeEventListener('message', receiveHandler);
    }
  })

  const percent = (target: number, base: number) => {
    const value = (target - base )/ base * 100;
    return {
      value: value.toFixed(2),
      signed: value > 0 ? '+' : '-',
    }
  }

  return (
    <div id="orderbook">
      <table id="orderbook-table">
        <tbody id="orderbook" class="content">
          {[...store.orderbook.orderbook_units].reverse().map((unit: Order, index: number) => {
            const tradeRate = percent(unit.ask_price, store.trade.prev_closing_price);
            return (
              <tr class='ask' key={`${store.orderbook.code}-${unit.ask_price}`}>
                <td class='empty'></td>
                <td class='size'>
                  <span class='bar' style={{width: `${unit.ask_size / store.orderbook.total_ask_size * 100}%`}}>{parseFloat(unit.ask_size.toFixed(3)).toLocaleString()}</span>
                </td>
                <td class={`${store.ticker.trade_price === unit.ask_price ? 'price trade': 'price'}`}>
                  <div class={`ty3 ${tradeRate.signed === '+' ? 'up': 'down'}`}>{unit.ask_price.toLocaleString()}</div>
                  <div class={`ty2 ${tradeRate.signed === '+' ? 'up': 'down'}`}>{tradeRate.signed}{tradeRate.value} %</div>
                </td>
                {!index && (
                  <td class="desc" rowSpan={store.orderbook.orderbook_units.length} colSpan={2}>
                    <div></div>
                  </td>  
                )}
              </tr>
            )
          })}
        
          {store.orderbook.orderbook_units.map((unit: Order, index: number) => {
            const tradeRate = percent(unit.bid_price, store.trade.prev_closing_price);

            return (
              <tr class='bid' key={`${store.orderbook.code}-${unit.bid_price}`}>
                {!index && (
                  <td class="trade-list" rowSpan={store.orderbook.orderbook_units.length} colSpan={2}>
                    <div></div>
                  </td>  
                )}
                <td class={`${store.ticker.trade_price === unit.bid_price ? 'price trade': 'price'}`}>
                  <div class={`ty3 ${tradeRate.signed === '+' ? 'up': 'down'}`}>{unit.bid_price.toLocaleString()}</div>
                  <div class={`ty2 ${tradeRate.signed === '+' ? 'up': 'down'}`}>{tradeRate.signed}{tradeRate.value} %</div>
                </td>
                <td class='size'>
                  <span class='bar' style={{width: `${unit.bid_size / store.orderbook.total_bid_size * 100}%`}}>{parseFloat(unit.bid_size.toFixed(3)).toLocaleString()}</span>
                </td>
                <td class='empty' />
              </tr>
            )
          })}
        </tbody>
      </table>
      
      <table id="orderbook-desc">
        <tbody>
          <tr>
            <td class="empty"></td>
            <td class="right">{parseFloat(store.orderbook.total_ask_size.toFixed(3)).toLocaleString()}</td>
            <td class="center">수량({props.code.split('-').length > 1? props.code.split('-')[1] : ''})</td>
            <td class="left">{parseFloat(store.orderbook.total_bid_size.toFixed(3)).toLocaleString()}</td>
            <td class="empty"></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
})

export { Orderbook };