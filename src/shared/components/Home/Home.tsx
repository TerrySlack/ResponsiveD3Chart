import { LineChart } from 'Components/Charts';
import { useChart } from 'Hooks/useCharts';
import { useMemo } from 'react';
import { data } from './data';
import classes from './home.module.css';

interface Props {
  title: string;
}

interface ChartProps {
  data: any[];
  yAxisLabel: string;
  // height: number;
  // width: number;
}

export function Home({ title }: Props) {
  // Memoize the props object to help prevent rerenders
  const props = useMemo(
    () => ({
      data,
      yAxisLabel: 'Impressions',
    }),
    [data],
  );

  /*
    Props:
      LineChart:  a method to render a component
      Props:  Props for the LineChart.  These need to be passed in, because the LineChart component is a forwardRef.  The props will be added inside the hook
  */
  const Chart = useChart<ChartProps>(LineChart, props);

  return (
    <div className="container mx-auto bg-gray-200 rounded-xl shadow border p-8 m-10 ">
      <p className="text-3xl text-gray-700 font-bold mb-5">Welcome!</p>
      <p className="text-gray-500 text-lg">React and Tailwind CSS in action</p>
      <p>{title}</p>
      <Chart />
    </div>
  );
}
