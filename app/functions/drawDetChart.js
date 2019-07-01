

export default function drawDetChart(settings, data, print=false) {
    let div = document.getElementById("det-chart");
    div.innerHTML = "";
    window.div = div;
    let divWidth = div.clientWidth;
    let divHeight = div.clientHeight;

    if (print) {
        [divWidth, divHeight] = settings['img-resolution'];
        //div = document.getElementById("invisible-det-chart");
        //div.innerHTML = "";
    }

    let margin = {
        top: 0.1 * divHeight,
        bottom: 0.1 * divHeight,
        right: 0.1 * divWidth,
        left: 0.1 * divWidth
    };

    let width = divWidth - margin.left - margin.right;
    let height = divHeight - margin.top - margin.bottom;

    let svg = d3.select(div)
        // .attr('height', '100%').attr('width', '100%')
        .append('svg')
        .attr("width", divWidth)
        .attr("height", divHeight)
        //.style('position', 'absolute').style('top', 0).style('left', 0)
        //.attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        //.attr('height', '1000px').attr('width', '1500px')
        //.attr('width', width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom)
    window.svg = svg;

    svg.append("rect")
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', divWidth)
        .attr('height', divHeight)
        .attr('fill', '#fff');

    let g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)
        .style('user-select', 'none')

    //let testsvg = d3.select('#my_dataviz').append('svg');
    //window.testsvg = testsvg;

    // Axes
    let x0 = settings['x-axis-range'] ? settings['x-axis-range'] : [0, 100];
    let y0 = settings['y-axis-range'] ? settings['y-axis-range'] : [0, 100];
    let x = d3.scaleLinear().domain(x0).range([0, width]);
    let y = d3.scaleLinear().domain(y0).range([height, 0]);
    let xAxis = d3.axisBottom(x)
    let yAxis = d3.axisLeft(y)

    // gridlines in x axis function
    let gridlinesX = d3.axisTop(x)
        //.ticks(10)
        .tickSize(-height)
        .tickFormat("")

    // gridlines in y axis function
    let gridlinesY = d3.axisLeft(y)
        //.ticks(10)
        .tickSize(-width)
        .tickFormat("")

    // add the X gridlines
    let gridX = g.append("g").attr("clip-path", "url(#clip)")
        .attr("class", "grid")
        //.attr("transform", `translate(0,${height})`)
        .call(gridlinesX)

    // add the Y gridlines
    let gridY = g.append("g").attr("clip-path", "url(#clip)")
        .attr("class", "grid")
        .call(gridlinesY)

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)

    g.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis)

    let clip = g.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width).attr("height", height)
        .attr("x", 0).attr("y", 0);

    // Add brushing
    let brush = d3.brush().on("end", () => brushended());
    let idleDelay = 350;
    let idleTimeout;

    let brushGroup = g.append("g").attr("class", "brush")

    // Lines
    let line = d3.line().x(d => x(d.x)).y(d => y(d.y));
    //.attr("class", "brush").call(brush)

    // Add X axis label:
    g.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", -10)
        .text("KWS DET")
        .attr("font-family", "sans-serif")
        .attr("font-size", 20);

    // Add X axis label:
    g.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .text("FALSE ALARMS [%]")
        .attr("font-family", "sans-serif")
        .attr("font-size", 17);


    // Y axis label:
    g.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -height / 2)
        .text("MISSED DETECTIONS [%]")
        .attr("font-family", "sans-serif")
        .attr("font-size", 17);

    g.append('line')
        .classed('eer-line', true)
        .style("stroke-dasharray", 5.5)
        .attr('x1', x(0))
        .attr('y1', y(0))
        .attr('x2', x(70))
        .attr('y2', y(70))
        .attr('stroke', "gray")
        .style('stroke-width', 3)
        .attr("clip-path", "url(#clip)");



    let dataGroups = g.selectAll('data-groups').data(data); // series
    let enteringGroup = dataGroups.enter().append('g')

    enteringGroup.append('text')
        .classed('legend-text', true)
        .attr("y", (d, i) => 30 + i * 20)
        .text(d => d.name)
        .attr("font-family", "sans-serif")
        .attr("font-size", 15);
        //.attr("alignment-baseline", "middle")

    let maxTextWidth = 0;
    let textWidth = 0;
    d3.selectAll('.legend-text').nodes().forEach(node => { 
        textWidth = node.getBBox().width;
        if (textWidth > maxTextWidth) {
            maxTextWidth = textWidth;
        }
    });

    d3.selectAll('.legend-text')
        .attr("x", width - maxTextWidth - 10);

    enteringGroup.append('rect')
        .classed('legend-mark', true)
        .attr("rx", 1)
        .attr("ry", 1)
        .attr("x", width - maxTextWidth - 50)
        .attr("y", (d, i) => 20 + i * 20)
        .attr("width", 30)
        .attr("height", 4)
        .style("fill", d => d.color);

    enteringGroup.append('g')
        .attr("clip-path", "url(#clip)")
        .classed('data-line', true)
        .append('path')
        .attr('d', d => line(d.values))
        .attr('stroke', d => d.color)
        .style('stroke-width', 3)
        .style('fill', 'none')

    //let points = enteringGroup.append('g').classed('data-points', true)
    //    .style('fill', d => d.color)
    //    .selectAll('points').data(d => d.values);
//
    //points.enter()
    //    .append('circle')
    //    .attr('cx', d => x(d.time)).attr('cy', d => y(d.value))
    //    .attr('r', 3).attr('stroke', 'white')

    let labels = enteringGroup.append('g')
        .attr("clip-path", "url(#clip)")
        .classed('data-labels', true)
        .selectAll('labels')
        .data(d => d.values)

    labels.enter()
        .append('text').text(d => d.lab)
        .attr("transform", d => `translate(${x(d.x)},${y(d.y)})`)
        .attr('x', 8)
        .attr("font-size", 15)
    //.style("fill", '#000')

    brushGroup.call(brush);

    function brushended() {
        console.log('brushended')
        //console.log(this)
        var s = d3.event.selection;
        if (!s) {
            if (!idleTimeout) return idleTimeout = setTimeout(() => idled(), idleDelay);
            x.domain(x0);
            y.domain(y0);
        } else {
            let a = Math.abs(s[1][0] - s[0][0]);
            let b = Math.abs(s[1][1] - s[0][1]);
            if (a * b >= 1000) {
                x.domain([s[0][0], s[1][0]].map(x.invert, x));
                y.domain([s[1][1], s[0][1]].map(y.invert, y));
            }
            g.select(".brush").call(brush.move, null);
        }
        zoom();
    }

    function idled() {
        idleTimeout = null;
    }

    function zoom() {
        let  t = g.transition().duration(750);
        g.select(".axis--x").transition(t).call(xAxis);
        g.select(".axis--y").transition(t).call(yAxis);
        g.selectAll('.data-line').select('path').transition(t)
            .attr('d', d => line(d.values));

        // g.selectAll('.data-points').selectAll("circle").transition(t)
            // .attr("cx", d => x(d.time)).attr("cy", d => y(d.value));

        g.selectAll('.data-labels').selectAll('text').transition(t)
            .attr("transform", d => `translate(${x(d.x)},${y(d.y)})`);

        g.select(".axis--y").transition(t).call(yAxis);

        gridX.transition(t).call(gridlinesX);
        gridY.transition(t).call(gridlinesY);

        g.select('.eer-line')
            .transition(t)
            .attr('x1', x(0))
            .attr('y1', y(0))
            .attr('x2', x(70))
            .attr('y2', y(70));

            
    }
}
