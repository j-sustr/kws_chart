import loadSettings from './functions/loadSettings.js';
import loadData from './functions/loadData.js';
import drawDetChart from './functions/drawDetChart.js'
import { exportChartBtn } from './components/exportBtn.js';
import { getRandomColor } from '../lib.js/ui/color.js';

//import { controlBar } from './components/controlBar.js';


async function render() {
    //controlBar.build();
    //window.controlBar = controlBar;
    //layout.put([1, 2, 1, 1], controlBar.grid);
    let settings = await loadSettings();
    if (!settings) return;
    let chartSettings = settings['chart'];
    const dataGroups = await loadData(settings['data-dir'].path);
    window.dataGroups = dataGroups
    
    const dataReady = dataGroups.map(grp => {
        if (!grp.color.trim()) grp.color = getRandomColor();
        let nSpotWords =  grp['n-spot-words'];
        grp.df.shift();
        return {
            name: grp.name,
            color: grp.color,
            values: grp.df.map(d => { 
                return { lab: d[0], x: 100 * d[2] / nSpotWords, y: 100 * d[3] / nSpotWords }; 
                //return { lab: d[0], x: 100 * d[2] / nSpotWords, y: 100 * d[3] / nSpotWords }; 
            }),
        };
    });
    exportChartBtn.init(chartSettings, dataReady);
    window.dataReady = dataReady;
    
    drawDetChart(chartSettings, dataReady);

    var timeout;
    // Listen for resize events
    window.addEventListener('resize', function (event) {
        //console.log('no debounce');
        // If there's a timer, cancel it
        if (timeout) {
            window.cancelAnimationFrame(timeout);
        }
        // Setup the new requestAnimationFrame()
        timeout = window.requestAnimationFrame(function () {
            // Run our scroll functions
            //console.log('debounced');
            drawDetChart(chartSettings, dataReady);
        });

    }, false);


    //detChart.schemeGroups(allGrps);
}

render();


