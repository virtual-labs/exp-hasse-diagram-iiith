//var http = require('http');
//var{edgedata} = require('./cytoscape-edgehandles.js');

//import edgedata from ./cytoscape-edgehandles.js;

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
var relation= {
    nodes: [
        [{ data: { id: '1', name: '1' } },
    { data: { id: '2', name: '2' } },
    { data: { id: '3', name: '3' } },
    { data: { id: '4', name: '4' } },
    { data: { id: '6', name: '6' } },
    { data: { id: '12', name: '12' } }],

    [{ data: { id: '1', name: '1' } },
    { data: { id: '2', name: '2' } },
    { data: { id: '3', name: '3' } },
    { data: { id: '4', name: '4' } },
    { data: { id: '5', name: '5' } }],

    [{ data: { id: '1', name: '1' } },
    { data: { id: '2', name: '2' } },
    { data: { id: '3', name: '3' } },
    { data: { id: '4', name: '4' } }],
    ],
    

    hedge:[
        ["1-2","1-3","2-4","2-6","3-6","4-12","6-12"],
        ["1-2", "2-3", "3-4", "4-5"],
        ["1-2", "2-3", "3-4"],
    ],

};
var i  = getRandomInt(relation.nodes.length);
hedges = relation.hedge[i]
const observ = document.getElementById("observations");

function validate(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    var seen = {};
    a.forEach(function(v) {
        var key = (typeof v) + v;
        if (!seen[key]) {
            seen[key] = 0;
        }
        seen[key] += 1;
    });
    return b.every(function(v) {
        var key = (typeof v) + v;
        if (seen[key]) {
            seen[key] -= 1;
            return true;
        }
    });
}



document.addEventListener('DOMContentLoaded', function(){

    var cy = window.cy = cytoscape({
    container: document.getElementById('cy'),

    layout: {
        name: 'concentric',
        concentric: function(n){ return n.id() === 'j' ? 200 : 0; },
        levelWidth: function(nodes){ return 100; },
        minNodeSpacing: 100
    },

    style: [
        {
        selector: 'node[name]',
        style: {
            'content': 'data(name)'
        }
        },

        {
        selector: 'edge',
        style: {
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle'
        }
        },

        // some style for the extension

        {
        selector: '.eh-handle',
        style: {
            'background-color': 'red',
            'width': 12,
            'height': 12,
            'shape': 'ellipse',
            'overlay-opacity': 0,
            'border-width': 12, // makes the handle easier to hit
            'border-opacity': 0
        }
        },

        {
        selector: '.eh-hover',
        style: {
            'background-color': 'red'
        }
        },

        {
        selector: '.eh-source',
        style: {
            'border-width': 2,
            'border-color': 'red'
        }
        },

        {
        selector: '.eh-target',
        style: {
            'border-width': 2,
            'border-color': 'red'
        }
        },

        {
        selector: '.eh-preview, .eh-ghost-edge',
        style: {
            'background-color': 'red',
            'line-color': 'red',
            'target-arrow-color': 'red',
            'source-arrow-color': 'red'
        }
        },

        {
        selector: '.eh-ghost-edge.eh-preview-active',
        style: {
            'opacity': 0
        }
        }
    ],

    elements: relation.nodes[i],
    
    });
    

    var eh = cy.edgehandles({
    snap: false
    });

    document.querySelector('#draw-on').addEventListener('click', function() {
    eh.enableDrawMode();
    });

    document.querySelector('#draw-off').addEventListener('click', function() {
    eh.disableDrawMode();
    });

    document.querySelector('#start').addEventListener('click', function() {
    eh.start( cy.$('node:selected') );
    });

    document.querySelector('#submit').addEventListener('click', function() {
    if(validate(hedges,edgedata)){
        observ.innerHTML = "<font size=4 color=green>" +
        "<b>Correct</b>" +
        "</font>" +
        "<br>"+"all edges are part of hasse diagram";
    }
    else{
        observ.innerHTML =  "<font size=4 color=red>" +
            "<b>WRONG</b>" +
            "</font>" +
            "<br><br>"+"Try again!"+
            "<br><br>"+"check if you have selected all hasse edges and <br> if any selected is not an hasse edge";
    }

        
        });
    

});
