export const detChart = {
    draw() {

        this.div = document.getElementById("detChart");
        this.div.innerHTML = "";
        window.div = this.div;
        let divWidth = this.div.clientWidth;
        let divHeight = this.div.clientHeight;

        let margin = {
            top: 0.05 * divHeight,
            bottom: 0.05 * divWidth,
            right: 0.15 * divHeight,
            left: 0.15 * divWidth
        };

        let width = divWidth - margin.left - margin.right;
        let height = divHeight - margin.top - margin.bottom;

        const svg = d3.select(this.div)
            // .attr('height', '100%').attr('width', '100%')
            .append('svg')
            .attr("width", divWidth)
            .attr("height", divHeight)
            //.style('position', 'absolute').style('top', 0).style('left', 0)
            //.attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            //.attr('height', '1000px').attr('width', '1500px')
            //.attr('width', width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom)
            .append("g").attr("transform", `translate(${margin.left},${margin.top})`)
            .style('user-select', 'none')

        window.svg = svg;

        //const testsvg = d3.select('#my_dataviz').append('svg');
        //window.testsvg = testsvg;

        // Axes
        this.x0 = [0, 10];
        this.y0 = [0, 20];
        this.x = d3.scaleLinear().domain([0, 10]).range([0, width]);
        this.y = d3.scaleLinear().domain([0, 20]).range([height, 0]);
        this.xAxis = d3.axisBottom(this.x)
        this.yAxis = d3.axisLeft(this.y)

        // gridlines in x axis function
        this.gridlinesX = d3.axisTop(this.x)
            //.ticks(10)
            .tickSize(-height)
            .tickFormat("")

        // gridlines in y axis function
        this.gridlinesY = d3.axisLeft(this.y)
            //.ticks(10)
            .tickSize(-width)
            .tickFormat("")

        // add the X gridlines
        this.gridX = svg.append("g").attr("clip-path", "url(#clip)")
            .attr("class", "grid")
            //.attr("transform", `translate(0,${height})`)
            .call(this.gridlinesX)

        // add the Y gridlines
        this.gridY = svg.append("g").attr("clip-path", "url(#clip)")
            .attr("class", "grid")
            .call(this.gridlinesY)

        svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", `translate(0,${height})`).call(this.xAxis);

        svg.append("g")
            .attr("class", "axis axis--y").call(this.yAxis);

        const clip = svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", width).attr("height", height)
            .attr("x", 0).attr("y", 0);

        // Add brushing
        this.brush = d3.brush().on("end", () => this.brushended());
        this.idleDelay = 350;
        this.idleTimeout;

        this.brushGroup = svg.append("g").attr("class", "brush")


        // Lines
        this.line = d3.line().x(d => this.x(+d.time)).y(d => this.y(+d.value));
        //.attr("class", "brush").call(brush)


        // Add X axis label:
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + 50)
            .text("False Alarms");

        // Y axis label:
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("y", -50)
            .attr("x", -height / 2)
            .text("Missed Detections");

        this.svg = svg;
        //this.container = container;

    },

    brushended() {
        console.log('brushended')
        console.log(this)
        var s = d3.event.selection;
        if (!s) {
            if (!this.idleTimeout) return this.idleTimeout = setTimeout(() => this.idled(), this.idleDelay);
            this.x.domain(this.x0);
            this.y.domain(this.y0);
        } else {
            this.x.domain([s[0][0], s[1][0]].map(this.x.invert, this.x));
            this.y.domain([s[1][1], s[0][1]].map(this.y.invert, this.y));
            this.svg.select(".brush").call(this.brush.move, null);
        }
        this.zoom();
    },

    idled() {
        this.idleTimeout = null;
    },

    zoom() {
        let svg = this.svg;
        var t = svg.transition().duration(750);
        svg.select(".axis--x").transition(t).call(this.xAxis);
        svg.select(".axis--y").transition(t).call(this.yAxis);
        svg.selectAll('.data-line').select('path').transition(t)
            .attr('d', d => this.line(d.values));

        svg.selectAll('.data-points').selectAll("circle").transition(t)
            .attr("cx", d => this.x(d.time)).attr("cy", d => this.y(d.value));

        svg.selectAll('.data-labels').selectAll('text').transition(t)
            .attr("transform", d => `translate(${this.x(d.time)},${this.y(d.value)})`);

        svg.select(".axis--y").transition(t).call(this.yAxis);

        this.gridX.transition(t).call(this.gridlinesX);
        this.gridY.transition(t).call(this.gridlinesY);
    },


    async openData(data) {//

        const dataGroups = svg.selectAll('data-groups').data(data); // series
        const enteringGroup = dataGroups.enter().append('g')
            .attr("clip-path", "url(#clip)");

        enteringGroup.append('g').classed('data-line', true)
            .append('path')
            .attr('d', d => this.line(d.values))
            .attr('stroke', d => d.color).style('stroke-width', 2)
            .style('fill', 'none');

        const points = enteringGroup.append('g').classed('data-points', true)
            .style('fill', d => d.color)
            .selectAll('points').data(d => d.values);

        points.enter()
            .append('circle')
            .attr('cx', d => this.x(d.time)).attr('cy', d => this.y(d.value))
            .attr('r', 3).attr('stroke', 'white')

        const labels = enteringGroup.append('g').classed('data-labels', true)
            .selectAll('labels').data(d => d.values)

        labels.enter()
            .append('text').text(d => d.value)
            .attr("transform", d => `translate(${this.x(d.time)},${this.y(d.value)})`)
            .attr('x', 8)
            .style("font-size", 10)
        //.style("fill", '#000')

        this.brushGroup.call(this.brush);
    }

}