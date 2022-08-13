import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { debounce } from 'lodash';

interface Dimensions {
  width: number;
  height: number;
  margins?: number;
  containerHeight?: number;
  containerWidth?: number;
}
// Dimensions
// const dimensions: Dimensions = {
//   width: 1000,
//   height: 500,
//   margins: 50,
//   containerHeight: 0,
//   containerWidth: 0,
// };

// dimensions.containerWidth = dimensions.width - dimensions.margins * 2;
// dimensions.containerHeight = dimensions.height - dimensions.margins * 2;

interface Props {
  data: any[];
  yAxisLabel?: string;
  xAxisLabel?: string;
}

export function LineChart({ data, yAxisLabel }: Props) {
  // Element References
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const svgContainerRef = useRef(null); // The PARENT of the SVG

  // State to track width and height of SVG Container
  const [width, setWidth] = useState(1400);
  const [height, setHeight] = useState(500);

  useEffect(() => {
    // This function calculates width and height of the container
    const getSvgContainerSize = debounce(() => {
      const newWidth = svgContainerRef.current.clientWidth;
      setWidth(newWidth);
      const newHeight = svgContainerRef.current.clientHeight;
      setHeight(newHeight);
    });

    // detect 'width' and 'height' on render
    // getSvgContainerSize();
    // listen for resize changes, and detect dimensions again when they change
    window.addEventListener('resize', getSvgContainerSize);
    // cleanup event listener
    return () => window.removeEventListener('resize', getSvgContainerSize);
  }, []);

  useEffect(() => {
    // D3 Code
    // TODO:  Memoize or put in a hook
    const xAccessor = (d: any) => parseDate(d.date);
    const yAccessor = (d: any) => d.impressions;

    // create a date parser
    const parseDate = d3.timeParse('%Y-%m-%d');

    // Dimensions
    const dimensions: Dimensions = {
      width, // width from state
      height, // height from state
      margins: 50,
    };
    console.log('in useEffect and resizing');

    dimensions.containerWidth = dimensions.width - dimensions.margins * 2;
    dimensions.containerHeight = dimensions.height - dimensions.margins * 2;

    // Selections
    const svg = d3
      .select(svgRef.current)
      .classed('line-chart-svg', true)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);

    // clear all previous content on refresh
    const everything = svg.selectAll('*');
    everything.remove();

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

    const yAxisGroup = container.append('g').classed('yAxis', true).call(yAxis);

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
        // @ts-ignore
        const mousePos = d3.pointer(event, this);

        // x coordinate stored in mousePos index 0
        const date = xScale.invert(mousePos[0]);

        // Custom Bisector - left, center, right
        const dateBisector = d3.bisector(xAccessor).center;

        const bisectionIndex = dateBisector(data, date);
        // console.log(bisectionIndex);
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

        const dateFormatter = d3.timeFormat('%B %-d, %Y');

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
      ref={(ref) => {
        svgContainerRef.current = ref;
      }}
      className="line-chart"
    >
      <svg
        ref={(ref) => {
          svgRef.current = ref;
        }}
      />
      <div
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
}
