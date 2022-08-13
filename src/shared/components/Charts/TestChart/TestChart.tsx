import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

interface Dimensions {
  width: number;
  height: number;
  margins: number;
  containerHeight: number;
  containerWidth: number;
}
// Dimensions
const dimensions: Dimensions = {
  width: 1000,
  height: 500,
  margins: 50,
  containerHeight: 0,
  containerWidth: 0,
};

dimensions.containerWidth = dimensions.width - dimensions.margins * 2;
dimensions.containerHeight = dimensions.height - dimensions.margins * 2;

interface Props {
  data: number[];
}
export function TestChart({ data }: Props) {
  /* The useRef Hook creates a variable that "holds on" to a value across rendering
       passes. In this case it will hold our component's SVG DOM element. It's
       initialized null and React will assign it later (see the return statement) */
  const d3Container = useRef(null);

  /* The useEffect Hook is for running side effects outside of React,
          for instance inserting elements into the DOM using D3 */
  useEffect(
    () => {
      if (data?.length > 0) {
        const svg = d3.select(d3Container.current);

        // Bind D3 data
        const update = svg.append('g').selectAll('text').data(data);

        // Enter new D3 elements
        update
          .enter()
          .append('text')
          .attr('x', (_d: number, i: number) => i * 25)
          .attr('y', 40)
          .style('font-size', 24)
          .text((d: number) => d);

        // Update existing D3 elements
        update
          .attr('x', (_d: number, i: number) => i * 40)
          .text((d: number) => d);

        // Remove old D3 elements
        update.exit().remove();
      }
    },

    /*
               useEffect has a dependency array (below). It's a list of dependency
               variables for this useEffect block. The block will run after mount
               and whenever any of these variables change. We still have to check
               if the variables are valid, but we do not have to compare old props
               to next props to decide whether to rerender.
           */
    [data],
  );

  return (
    <svg
      className="d3-component"
      width={400}
      height={200}
      ref={(ref) => {
        d3Container.current = ref;
      }}
    />
  );
}
