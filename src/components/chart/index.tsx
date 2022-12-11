import { component$, useClientEffect$, useStore } from "@builder.io/qwik";
import './index.css';

interface Props {
  code: string;
}

interface Candle {
  timestamp: number;
  openingPrice: number;
  highPrice: number;
  lowPrice: number;
  tradePrice: number;
}

export default component$((props: Props) => {
  const store = useStore({
    isFirst: true,
  });
  useClientEffect$(async ({track}) => {
    const {code} = track(() => ({code: props.code}));
    console.log(code);
    const res = await fetch(`https://crix-api-cdn.upbit.com/v1/crix/candles/lines?code=CRIX.UPBIT.${props.code}`)
    const {candles} = await res.json();

    // ohlc
    const series = candles.map((candle: Candle) => ({
      x: new Date(candle.timestamp),
      y: [candle.openingPrice, candle.highPrice, candle.lowPrice, candle.tradePrice],
    }))
    const options = {
      series: [{data: series}],
      chart: {
        type: 'candlestick',
        height: 350
      },
      title: {
        text: 'CandleStick Chart',
        align: 'left'
      },
      xaxis: {
        type: 'datetime'
      },
      yaxis: {
        tooltip: {
          enabled: true
        }
      }
    };
    
    if (store.isFirst) {
      store.isFirst = false;
      const chart = new (window as any).ApexCharts(document.querySelector("#chart"), options);
      (window as any).chart = chart;
      chart.render();
    } else {
      (window as any)?.chart?.updateSeries([{
        data: series,
      }])
    }

  })
  
  return (
    <div id="chart"></div>
  )
})
