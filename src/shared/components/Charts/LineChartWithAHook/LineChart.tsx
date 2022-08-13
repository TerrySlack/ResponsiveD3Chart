import {
 useRef, useEffect, forwardRef, useMemo, useCallback,
} from 'react';

import * as d3 from 'd3';

interface Dimensions {
  width: number;
  height: number;
  margins?: number;
  containerHeight?: number;
  containerWidth?: number;
}

export interface Props {
  data: any[];
  yAxisLabel?: string;
  xAxisLabel?: string;
  width: number;
  height: number;
}

/*
  Note:  The componet is exported as a forward ref.
  This allows a reference to be passed in from a parent, as per the React docs.  And will remove the buggy behaviour that can occur
  when passing in a reference, through props
*/
export const LineChart = forwardRef<HTMLDivElement | null, Props>(
  ({
 data, yAxisLabel, width, height,
}: Props, ref) => {
    // Internal Element References
    const svgRef = useRef(null);
    const tooltipRef = useRef(null);

    // NOTE:  The incoming ref is from the useChart hook and will be set on the parent div containing the svg

    // Memoize properties
    // create a date parser
    const parseDate = useMemo(() => d3.timeParse('%Y-%m-%d'), [data]);
    const dateFormatter = useMemo(() => d3.timeFormat('%B %-d, %Y'), [data]);

    // This controls the dimensions of differing parts of the svgs
    const dimensions: Dimensions = useMemo(
      () => ({
        width, // width from state
        height, // height from state
        margins: 50,
      }),
      [width, height],
    );

    // x and y accessor methods
    const xAccessor = useCallback((d: any) => parseDate(d.date), []);
    const yAccessor = useCallback(({ impressions }) => impressions, []);

    useEffect(() => {
      // Calculate width and height
      dimensions.containerWidth = dimensions.width - dimensions.margins * 2;
      dimensions.containerHeight = dimensions.height - dimensions.margins * 2;

      // Selections
      const svg = d3
        .select(svgRef.current)
        .classed('line-chart-svg', true)
        .attr('width', dimensions.width)
        .attr('height', dimensions.height);

      // clear all previous content on refresh
      svg.selectAll('*')?.remove();

      const container = svg
        .append('g')
        .classed('container', true)
        .attr(
          'transform',
          `translate(${dimensions.margins}, ${dimensions.margins})`,
        );

      const tooltip = d3.select(tooltipRef.current);
      const tooltipDot = container
        .append('circle')
        .classed('tool-tip-dot', true)
        .attr('r', 5)
        .attr('fill', '#fc8781')
        .attr('stroke', 'black')
        .attr('stroke-width', 2)
        .style('opacity', 0)
        .style('pointer-events', 'none');

      // Scales
      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, yAccessor)])
        .range([dimensions.containerHeight, 0])
        .nice();
      const xScale = d3
        .scaleTime()
        .domain(d3.extent(data, xAccessor))
        .range([0, dimensions.containerWidth]);

      // Line Generator
      const lineGenerator = d3
        .line()
        .x((d: any) => xScale(xAccessor(d)))
        .y((d: any) => yScale(yAccessor(d)));

      // Draw Line
      container
        .append('path')
        .datum(data)
        .attr('d', lineGenerator)
        .attr('fill', 'none')
        .attr('stroke', '#30475e')
        .attr('stroke-width', 2);

      // Axis
      const yAxis = d3.axisLeft(yScale).tickFormat((d: any) => `${d}`);

      const yAxisGroup = container
        .append('g')
        .classed('yAxis', true)
        .call(yAxis);

      // y-axis label
      yAxisGroup
        .append('text')
        .attr('x', -dimensions.containerHeight / 2)
        .attr('y', -dimensions.margins + 10)
        .attr('fill', 'black')
        .text(yAxisLabel)
        .style('font-size', '.8rem')
        .style('transform', 'rotate(270deg)')
        .style('text-anchor', 'middle');

      const xAxis = d3.axisBottom(xScale);

      container
        .append('g')
        .classed('xAxis', true)
        .style('transform', `translateY(${dimensions.containerHeight}px)`)
        .call(xAxis);

      // Tooltip
      container
        .append('rect')
        .classed('mouse-tracker', true)
        .attr('width', dimensions.containerWidth)
        .attr('height', dimensions.containerHeight)
        .style('opacity', 0)
        .on('touchmouse mousemove', function (event: any) {
          // @ts-ignore - There is an issue with this and Typescript.  Despite it being a regular function and not an arrow functions
          const mousePos = d3.pointer(event, this);

          // x coordinate stored in mousePos index 0
          const date = xScale.invert(mousePos[0]);

          // Custom Bisector - left, center, right
          const dateBisector = d3.bisector(xAccessor).center;

          const bisectionIndex = dateBisector(data, date);

          // math.max prevents negative index reference error
          const hoveredIndexData = data[Math.max(0, bisectionIndex)];

          // Update Image
          tooltipDot
            .style('opacity', 1)
            .attr('cx', xScale(xAccessor(hoveredIndexData)))
            .attr('cy', yScale(yAccessor(hoveredIndexData)))
            .raise();

          tooltip
            .style('display', 'block')
            .style('top', `${yScale(yAccessor(hoveredIndexData)) - 50}px`)
            .style('left', `${xScale(xAccessor(hoveredIndexData))}px`);

          tooltip.select('.data').text(`${yAccessor(hoveredIndexData)}`);

          tooltip
            .select('.date')
            .text(`${dateFormatter(xAccessor(hoveredIndexData))}`);
        })
        .on('mouseleave', () => {
          tooltipDot.style('opacity', 0);
          tooltip.style('display', 'none');
        });
    }, [data, yAxisLabel, width, height]); // redraw chart if data or dimensions change

    return (
      <div
        // Note how I set a ref.  This will prevent any race conditions when using ref in a useEffect.  This ensure the ref is always populated, before useEffect is run.
        ref={(divRef) => {
          // @ts-ignore  - There appears to be an bug with @types/React  Current is not recognized
          ref.current = divRef;
        }}
        className="line-chart"
      >
        <svg
          // Note how I set a ref.  This will prevent any race conditions when using ref in a useEffect.  This ensure the ref is always populated, before useEffect is run.
          ref={(ref) => {
            svgRef.current = ref;
          }}
        />
        <div
          // Note how I set a ref.  This will prevent any race conditions when using ref in a useEffect.  This ensure the ref is always populated, before useEffect is run.
          ref={(ref) => {
            tooltipRef.current = ref;
          }}
          className="lc-tooltip"
        >
          <div className="data" />
          <div className="date" />
        </div>
      </div>
    );
  },
);
