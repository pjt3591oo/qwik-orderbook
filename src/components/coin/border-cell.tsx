import { component$, useClientEffect$, useStore } from "@builder.io/qwik";

interface Props {
  code: string;
  change: 'RISE' | 'FALL';
  color: string;
  price?: number;
}

export const BorderCell = component$((props: Props) => {
  
  const store = useStore({
    change: '',
    classname: ''
  });

  useClientEffect$(async () => {
    
    if (props.change === 'RISE') {
      store.classname = 'price-border-up';
    } else if (props.change === 'FALL') {
      store.classname = 'price-border-down';
    } else {
      store.classname = 'price-border-keep';
    }
    // console.log(props)
    setTimeout(() => {
      store.classname = '';
    }, 1000)
  })

  return (
    <td class={`align-right ${store.classname}`}>
      <span class={`price ${props.color} `}>{props.price?.toLocaleString()}</span>
    </td>
  )
})

