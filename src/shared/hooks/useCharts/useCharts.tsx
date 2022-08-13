import {
  useLayoutEffect,
  useRef,
  FC,
  useState,
  useEffect,
  ForwardedRef,
} from 'react';
import { debounce } from 'Utils/debounce';

// Using Generics for the props.  This allows us to pass in the type for every different prop object in different charts.
export const useChart = <T extends Partial<T>>(
  Chart: any, // I cannot find a type for an unknown Functional Component type.
  props: T,
) => {
  // Create a ref to pass down to the incoming ForwardRef.  The ref will allow the hook to calculate the height and width and pass it back to the chart.
  const chartRef = useRef<HTMLDivElement | null>(null);

  // Store some state
  const [width, setWidth] = useState(0); // Initially 0 as we do not know what the width of each chart will be
  const [height, setHeight] = useState(500); // Initially set to 500.  Some charts default to small heights. Rather than use 0, let's default to 500 px and then height will be
  // calculated in getSvgContainerSize and handled accordinly with the biggest height found.

  // Resize the svg container, after the dom element has been created and added.
  const getSvgContainerSize = () => {
    // Occassionaly an element will have varying widths and heights.  Let's grab them here and calculate the biggest width and height below
    const {
      current: {
 offsetWidth, clientWidth, offsetHeight, clientHeight,
},
    } = chartRef;

    // normalize the width, and use the biggest width.
    let newWidth = offsetWidth > clientWidth ? offsetWidth : clientWidth;
    newWidth = newWidth > width ? newWidth : width;

    setWidth(newWidth);

    // normalize the height, and use the biggest height.
    let newHeight = offsetHeight > clientHeight ? offsetHeight : clientHeight;
    newHeight = newHeight > height ? newHeight : height;

    setHeight(newHeight);
  };
  const resizeSvContainerSize = debounce(getSvgContainerSize);

  useEffect(() => {
    // Create the resize event.  This will only be fired once on initial load and then again, if the window is resized.
    window.addEventListener('resize', resizeSvContainerSize);

    // cleanup event listener
    return () => window.removeEventListener('resize', resizeSvContainerSize);
  }, []);

  // Resize the svg container, after the dom element has been created and added and all dom mutations are complete
  useLayoutEffect(() => {
    // Only calculate if width or height are 0
    if (chartRef.current && width === 0) getSvgContainerSize();
  }, [chartRef]);

  // return a function, so it can still be used as JSX where it is consumed.  In this case, the hook.
  return function () {
  return (
    <Chart
      ref={chartRef}
      width={width}
      setWidth={setWidth}
      height={height}
      setHeight={setHeight}
      {...props}
    />
  );
};
};
