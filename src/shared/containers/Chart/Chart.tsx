import {
  ComponentType,
  forwardRef,
  ReactComponentElement,
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { debounce } from 'Utils/debounce';

interface Wrapper {
  button: ComponentType;
}

function Wrapper({ button: Moo }: Wrapper) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Moo />
    </div>
  );
}

// interface Props<P = any> {
interface Props {
  // Chart: ComponentType<P>;
  // Chart: ReactComponentElement<HTMLDivElement>;
  chart: any;
}
function ChartWrapper({ chart: Chart }: Props) {
  /*
        The charts need to have refs as props and turned into forwardRefs.
    */

  const chartForwardRef = useRef(null);
  const [width, setWidth] = useState(1400);
  const [height, setHeight] = useState(500);

  useEffect(() => {
    // This function calculates width and height of the container
    const getSvgContainerSize = debounce(() => {
      console.log('in getSvgContainerSize and resizing');
      const newWidth = chartForwardRef.current.clientWidth;
      setWidth(newWidth);
      const newHeight = chartForwardRef.current.clientHeight;
      setHeight(newHeight);
    });

    // detect 'width' and 'height' on render
    // getSvgContainerSize();
    // listen for resize changes, and detect dimensions again when they change
    window.addEventListener('resize', getSvgContainerSize);
    // cleanup event listener
    return () => window.removeEventListener('resize', getSvgContainerSize);
  }, []);

  console.log(` In container
  height ${height}
  width ${width}
  chart  ${typeof Chart}
  `);

  return (
    <Chart svgContainerRef={chartForwardRef} height={height} width={width} />
  );
}
export { ChartWrapper as Chart };
