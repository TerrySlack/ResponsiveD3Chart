import { TestChart } from 'Components/Charts';

const data = [1, 2, 3, 5, 6, 7, 8, 9, 10];

interface Props {}
function TestChartContainer() {
  return <TestChart data={data} />;
}

export { TestChartContainer as TestChart };
