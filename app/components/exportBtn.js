import drawDetChart from '../functions/drawDetChart.js'
import { getSVGString, svgString2Image } from '../functions/exportSvg.js';


export const exportChartBtn = {
    init(settings, data) {
        // Set-up the export button
        d3.select('#export-btn').on('click', function () {
            drawDetChart(settings, data, true);
            let svg = d3.select('#det-chart svg');
            svg.selectAll('.grid line').style('stroke', 'lightgrey');
            var svgString = getSVGString(svg.node());
            let [resW, resH] = settings['img-resolution'];
            svgString2Image(svgString, resW, resH, 'png', save); // passes Blob and filesize String to the callback

            function save(blob, filesize) {
                let link = document.createElement('a');
                link.download = `kws-det-${new Date().toISOString().replace(/[:\.]/g, '-')}.png`;
                link.href = URL.createObjectURL(blob);
                document.body.appendChild(link); // required for firefox
                link.click();
                // delete the internal blob reference, to let the browser clear memory from it
                URL.revokeObjectURL(link.href);
                link.remove();

                drawDetChart(settings, data);
            }
        });
    }
}

